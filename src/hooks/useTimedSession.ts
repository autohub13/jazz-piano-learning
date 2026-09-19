"use client";

// Timed practice. The listen player runs silent, so the band plays and the
// clock moves, and the learner plays the piano part. Each step is scored when
// the clock leaves it: hit or missed, and on time, early or late. The rAF loop here
// only reads the clock; grading happens on note-down.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PianoEngine } from "@/lib/audio/pianoEngine";
import { freshNotes, onTimeWindow, stepAt, summarise, timedSteps, type TimedResult } from "@/lib/grading/timed";
import type { TimedStep } from "@/lib/lessons/timeline";
import type { Lesson } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

const EMPTY: ReadonlySet<Midi> = new Set();

export interface TimedSession {
  /** The step the clock is on, or -1 before the first. */
  index: number;
  held: ReadonlySet<Midi>;
  wrongNotes: ReadonlySet<Midi>;
  /** The last verdict, for the cue border. */
  last: "hit" | "early" | "late" | "miss" | "wrong" | null;
  results: TimedResult[];
  accuracy: number;
  timing: number;
  /** Mean offset of the clean hits in seconds. Negative is rushing. */
  lean: number;
  finished: boolean;
  noteDown(midi: Midi, velocity?: number): void;
  noteUp(midi: Midi): void;
  releaseAll(): void;
  reset(): void;
}

export function useTimedSession(
  engine: PianoEngine | null,
  lesson: Lesson,
  bpm: number,
  enabled: boolean,
  position: () => number | null,
): TimedSession {
  const [index, setIndex] = useState(-1);
  const [held, setHeld] = useState<ReadonlySet<Midi>>(EMPTY);
  const [wrongNotes, setWrongNotes] = useState<ReadonlySet<Midi>>(EMPTY);
  const [last, setLast] = useState<TimedSession["last"]>(null);
  const [results, setResults] = useState<TimedResult[]>([]);
  const [finished, setFinished] = useState(false);

  const timed = useMemo<TimedStep[]>(() => timedSteps(lesson.steps, bpm), [lesson.steps, bpm]);
  const timedRef = useRef(timed);
  timedRef.current = timed;
  const windowRef = useRef(onTimeWindow(bpm));
  windowRef.current = onTimeWindow(bpm);
  const stepsRef = useRef(lesson.steps);
  stepsRef.current = lesson.steps;

  const heldRef = useRef<Set<Midi>>(new Set());
  const indexRef = useRef(-1);
  // Per current step: which fresh notes have been struck, when the first
  // landed, and how many wrong notes came in.
  const struckRef = useRef<Set<Midi>>(new Set());
  const firstSecRef = useRef<number | null>(null);
  const wrongCountRef = useRef(0);
  const scoredRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const engineRef = useRef(engine);
  engineRef.current = engine;

  const syncHeld = useCallback(() => setHeld(new Set(heldRef.current)), []);

  const closeStep = useCallback((k: number) => {
    if (k < 0 || k >= stepsRef.current.length || scoredRef.current.has(k)) return;
    scoredRef.current.add(k);
    const need = freshNotes(stepsRef.current[k]);
    const hit = need.every((n) => struckRef.current.has(n));
    const start = timedRef.current[k].startSec;
    const offset = hit && firstSecRef.current !== null ? firstSecRef.current - start : undefined;
    const onTime = offset !== undefined && Math.abs(offset) <= windowRef.current;
    const result: TimedResult = { index: k, hit, onTime, offset, wrongNotes: wrongCountRef.current };
    setResults((prev) => [...prev, result]);
    if (need.length > 0) {
      setLast(!hit ? "miss" : wrongCountRef.current > 0 ? "wrong" : onTime ? "hit" : (offset ?? 0) < 0 ? "early" : "late");
    }
  }, []);

  const openStep = useCallback(() => {
    struckRef.current = new Set();
    firstSecRef.current = null;
    wrongCountRef.current = 0;
    setWrongNotes(EMPTY);
  }, []);

  const reset = useCallback(() => {
    indexRef.current = -1;
    scoredRef.current = new Set();
    openStep();
    setIndex(-1);
    setResults([]);
    setLast(null);
    setFinished(false);
  }, [openStep]);

  // Follow the clock. When it moves to a new step, score the one it left.
  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      const sec = position();
      if (sec !== null) {
        const k = stepAt(timedRef.current, sec, windowRef.current);
        if (k !== indexRef.current) {
          // A loop seam: the clock jumped back to the start.
          if (k < indexRef.current) {
            closeStep(indexRef.current);
            scoredRef.current = new Set();
          } else {
            for (let j = indexRef.current; j < k; j++) closeStep(j);
          }
          indexRef.current = k;
          openStep();
          setIndex(k);
          if (k >= timedRef.current.length) setFinished(true);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, position, closeStep, openStep]);

  const noteDown = useCallback(
    (midi: Midi, velocity = 96) => {
      engineRef.current?.start({ note: midi, velocity });
      if (heldRef.current.has(midi)) return;
      heldRef.current.add(midi);
      syncHeld();
      const sec = position();
      if (sec === null) return;
      const k = stepAt(timedRef.current, sec, windowRef.current);
      const step = stepsRef.current[k];
      if (!step) return;
      const need = freshNotes(step);
      if (need.includes(midi) || step.notes.includes(midi)) {
        if (need.includes(midi) && !struckRef.current.has(midi)) {
          struckRef.current.add(midi);
          if (firstSecRef.current === null) firstSecRef.current = sec;
        }
        return;
      }
      wrongCountRef.current++;
      setWrongNotes((prev) => new Set([...prev, midi]));
    },
    [position, syncHeld],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      engineRef.current?.stop(midi);
      if (!heldRef.current.delete(midi)) return;
      syncHeld();
      setWrongNotes((prev) => {
        if (!prev.has(midi)) return prev;
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    },
    [syncHeld],
  );

  const releaseAll = useCallback(() => {
    for (const midi of heldRef.current) engineRef.current?.stop(midi);
    heldRef.current.clear();
    syncHeld();
  }, [syncHeld]);

  useEffect(() => {
    if (enabled) return;
    releaseAll();
    reset();
  }, [enabled, releaseAll, reset]);

  const { accuracy, timing, lean } = useMemo(() => summarise(results), [results]);

  return { index, held, wrongNotes, last, results, accuracy, timing, lean, finished, noteDown, noteUp, releaseAll, reset };
}
