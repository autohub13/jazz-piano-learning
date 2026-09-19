"use client";

// Practice mode. The user plays, the app decides whether the current step is
// satisfied, and advances.
//
// Two rules do most of the work:
//
// 1. Evaluate on note-down only, never on note-up. Otherwise lifting one finger
//    from a chord you just got right instantly demotes it back to partial.
// 2. A partial chord produces no verdict and no penalty, so a beginner who
//    rolls a chord over two seconds has unlimited time to assemble it. That is
//    why no grace-window timer appears anywhere in this file.
//
// The third rule is the non-obvious one: after advancing, ignore evaluation
// until the held set has been empty at least once. Consecutive steps share
// notes (Dm7 and G7 both contain F, all four seventh chords contain C), so
// without this gate the app races through the lesson on leftover fingers.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PianoEngine } from "@/lib/audio/pianoEngine";
import type { Lesson } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

export type PracticeStatus = "awaiting" | "partial" | "correct" | "wrong" | "finished";

export interface StepResult {
  index: number;
  attempts: number;
  firstTryCorrect: boolean;
}

const WRONG_MS = 500;
const ADVANCE_MS = 420;

const EMPTY: ReadonlySet<Midi> = new Set();

export interface PracticeSession {
  status: PracticeStatus;
  index: number;
  attempts: number;
  results: StepResult[];
  held: ReadonlySet<Midi>;
  wrongNotes: ReadonlySet<Midi>;
  hintLevel: 0 | 1 | 2;
  /** Whether a hint was showing at any point during this pass. */
  hintUsed: boolean;
  accuracy: number | null;
  noteDown(midi: Midi, velocity?: number): void;
  noteUp(midi: Midi): void;
  releaseAll(): void;
  skip(): void;
  hear(): void;
  hint(): void;
  restart(): void;
}

export function usePracticeSession(
  engine: PianoEngine | null,
  lesson: Lesson,
  enabled: boolean,
): PracticeSession {
  const [status, setStatus] = useState<PracticeStatus>("awaiting");
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState<StepResult[]>([]);
  const [held, setHeld] = useState<ReadonlySet<Midi>>(EMPTY);
  const [wrongNotes, setWrongNotes] = useState<ReadonlySet<Midi>>(EMPTY);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [hintUsed, setHintUsed] = useState(false);
  const hintLevelRef = useRef<0 | 1 | 2>(0);
  hintLevelRef.current = hintLevel;

  const heldRef = useRef<Set<Midi>>(new Set());
  const armedRef = useRef(true);
  const indexRef = useRef(0);
  const attemptsRef = useRef(0);
  const statusRef = useRef<PracticeStatus>("awaiting");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  indexRef.current = index;
  attemptsRef.current = attempts;
  statusRef.current = status;

  const stepsRef = useRef(lesson.steps);
  stepsRef.current = lesson.steps;

  const engineRef = useRef(engine);
  engineRef.current = engine;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncHeld = useCallback(() => {
    setHeld(new Set(heldRef.current));
  }, []);

  const advance = useCallback(() => {
    const next = indexRef.current + 1;
    if (next >= stepsRef.current.length) {
      setStatus("finished");
      return;
    }
    setIndex(next);
    setAttempts(0);
    setWrongNotes(EMPTY);
    // Re-arm only if the user has already let go; otherwise wait for release.
    armedRef.current = heldRef.current.size === 0;
    setStatus("awaiting");
  }, []);

  /** Held notes that do not belong to the current target. */
  const extrasStillHeld = useCallback((): ReadonlySet<Midi> => {
    const target = new Set(stepsRef.current[indexRef.current]?.notes ?? []);
    const extras = new Set<Midi>();
    for (const n of heldRef.current) if (!target.has(n)) extras.add(n);
    return extras.size > 0 ? extras : EMPTY;
  }, []);

  const evaluate = useCallback(() => {
    const step = stepsRef.current[indexRef.current];
    if (!step) return;
    const target = new Set(step.notes);
    const current = heldRef.current;

    const extra: Midi[] = [];
    for (const n of current) if (!target.has(n)) extra.push(n);

    if (extra.length > 0) {
      setWrongNotes(new Set(extra));
      setAttempts(attemptsRef.current + 1);
      setStatus("wrong");
      clearTimer();
      timerRef.current = setTimeout(() => {
        // The flash ends, but a wrong note that is still held is still wrong,
        // so it keeps its mark rather than quietly going amber under the finger.
        setWrongNotes(extrasStillHeld());
        setStatus(heldRef.current.size > 0 ? "partial" : "awaiting");
      }, WRONG_MS);
      return;
    }

    let complete = true;
    for (const n of target) {
      if (!current.has(n)) {
        complete = false;
        break;
      }
    }

    if (!complete) {
      setStatus("partial");
      return;
    }

    setResults((prev) => [
      ...prev,
      {
        index: indexRef.current,
        attempts: attemptsRef.current + 1,
        firstTryCorrect: attemptsRef.current === 0,
      },
    ]);
    setStatus("correct");
    clearTimer();
    timerRef.current = setTimeout(advance, ADVANCE_MS);
  }, [advance, clearTimer, extrasStillHeld]);

  const noteDown = useCallback(
    (midi: Midi, velocity = 96) => {
      // The user always hears themselves, right or wrong.
      engineRef.current?.start({ note: midi, velocity });
      if (heldRef.current.has(midi)) return;
      heldRef.current.add(midi);
      syncHeld();

      if (lesson.exploreOnly) return;
      if (!armedRef.current) return;
      if (statusRef.current === "correct" || statusRef.current === "finished") return;
      evaluate();
    },
    [evaluate, syncHeld, lesson.exploreOnly],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      engineRef.current?.stop(midi);
      if (!heldRef.current.delete(midi)) return;
      syncHeld();
      // Lifting a wrong note takes its mark with it. This is the one thing
      // note-up may change: it clears feedback, it never renders a verdict.
      setWrongNotes(extrasStillHeld());
      // Releasing everything is what arms the next evaluation.
      if (heldRef.current.size === 0) armedRef.current = true;
    },
    [syncHeld, extrasStillHeld],
  );

  const releaseAll = useCallback(() => {
    for (const midi of heldRef.current) engineRef.current?.stop(midi);
    heldRef.current.clear();
    syncHeld();
    armedRef.current = true;
  }, [syncHeld]);

  const skip = useCallback(() => {
    if (statusRef.current === "finished") return;
    setResults((prev) => [
      ...prev,
      { index: indexRef.current, attempts: attemptsRef.current, firstTryCorrect: false },
    ]);
    clearTimer();
    advance();
  }, [advance, clearTimer]);

  const hear = useCallback(() => {
    const step = stepsRef.current[indexRef.current];
    const eng = engineRef.current;
    if (!step || !eng) return;
    const t = eng.now() + 0.02;
    for (const note of step.notes) eng.start({ note, time: t, duration: 1.4, velocity: 80 });
  }, []);

  const hint = useCallback(() => {
    setHintLevel((h) => (h >= 2 ? 0 : ((h + 1) as 0 | 1 | 2)));
    // Pressing it from the top level turns hints off, which is not using one.
    if (hintLevelRef.current < 2) setHintUsed(true);
  }, []);

  const restart = useCallback(() => {
    clearTimer();
    releaseAll();
    setIndex(0);
    setAttempts(0);
    setResults([]);
    setWrongNotes(EMPTY);
    setStatus("awaiting");
    // A hint left on from the last pass is still a hint for this one.
    setHintUsed(hintLevelRef.current > 0);
    armedRef.current = true;
  }, [clearTimer, releaseAll]);

  // Alt-tabbing mid-chord otherwise leaves notes ringing and poisons the next
  // evaluation with phantom held notes.
  useEffect(() => {
    const onBlur = () => releaseAll();
    const onVisibility = () => {
      if (document.hidden) releaseAll();
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [releaseAll]);

  // Leaving Practice mode must silence anything still held.
  useEffect(() => {
    if (enabled) return;
    clearTimer();
    releaseAll();
  }, [enabled, clearTimer, releaseAll]);

  useEffect(() => clearTimer, [clearTimer]);

  const accuracy = useMemo(() => {
    if (results.length === 0) return null;
    return results.filter((r) => r.firstTryCorrect).length / results.length;
  }, [results]);

  return {
    status,
    index,
    attempts,
    results,
    held,
    wrongNotes,
    hintLevel,
    hintUsed,
    accuracy,
    noteDown,
    noteUp,
    releaseAll,
    skip,
    hear,
    hint,
    restart,
  };
}
