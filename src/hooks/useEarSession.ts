"use client";

// Ear training. A chord sounds, the learner plays it back. Only pitch classes
// count, so a voicing heard low and played high is still right: the ear is
// being tested, not the octave. The prompts come in a new order every run, so
// the answers cannot be learned by position.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PianoEngine } from "@/lib/audio/pianoEngine";
import type { Lesson } from "@/lib/lessons/types";
import { shuffledOrder } from "@/lib/grading/ear";
import { pitchClass, type Midi } from "@/lib/music/notes";

const EMPTY: ReadonlySet<Midi> = new Set();
const ADVANCE_MS = 700;

export interface EarSession {
  /** How many prompts have gone by. */
  index: number;
  /** The step of the lesson being asked now. */
  stepIndex: number;
  held: ReadonlySet<Midi>;
  status: "listen" | "answering" | "correct" | "wrong" | "finished";
  /** How many wrong answers on this prompt. */
  attempts: number;
  /** The answer is showing on the keys. Counts as a hint. */
  revealed: boolean;
  hintUsed: boolean;
  results: { index: number; firstTry: boolean }[];
  accuracy: number | null;
  play(): void;
  reveal(): void;
  noteDown(midi: Midi, velocity?: number): void;
  noteUp(midi: Midi): void;
  releaseAll(): void;
  restart(): void;
}

export function useEarSession(engine: PianoEngine | null, lesson: Lesson, enabled: boolean): EarSession {
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>(() => shuffledOrder(lesson.steps));
  const orderRef = useRef(order);
  orderRef.current = order;
  const [held, setHeld] = useState<ReadonlySet<Midi>>(EMPTY);
  const [status, setStatus] = useState<EarSession["status"]>("listen");
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [results, setResults] = useState<{ index: number; firstTry: boolean }[]>([]);

  const heldRef = useRef<Set<Midi>>(new Set());
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const indexRef = useRef(0);
  indexRef.current = index;
  const attemptsRef = useRef(0);
  attemptsRef.current = attempts;
  const statusRef = useRef(status);
  statusRef.current = status;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncHeld = useCallback(() => setHeld(new Set(heldRef.current)), []);

  const play = useCallback(() => {
    const step = lesson.steps[orderRef.current[indexRef.current]];
    const eng = engineRef.current;
    if (!step || !eng) return;
    eng.stop();
    const t = eng.now() + 0.03;
    for (const note of step.notes) eng.start({ note, time: t, duration: 2.2, velocity: 78 });
    if (statusRef.current === "listen") setStatus("answering");
  }, [lesson.steps]);

  const reveal = useCallback(() => {
    setRevealed(true);
    setHintUsed(true);
  }, []);

  const advance = useCallback(() => {
    const next = indexRef.current + 1;
    setRevealed(false);
    setAttempts(0);
    if (next >= lesson.steps.length) {
      setStatus("finished");
      return;
    }
    setIndex(next);
    setStatus("listen");
  }, [lesson.steps.length]);

  const noteDown = useCallback(
    (midi: Midi, velocity = 96) => {
      engineRef.current?.start({ note: midi, velocity });
      if (heldRef.current.has(midi)) return;
      heldRef.current.add(midi);
      syncHeld();
      if (statusRef.current !== "answering" && statusRef.current !== "wrong") return;
      const step = lesson.steps[orderRef.current[indexRef.current]];
      if (!step) return;
      const target = new Set(step.notes.map(pitchClass));
      const have = new Set([...heldRef.current].map(pitchClass));
      if (!target.has(pitchClass(midi))) {
        setAttempts(attemptsRef.current + 1);
        setStatus("wrong");
        return;
      }
      if ([...target].every((pc) => have.has(pc))) {
        setResults((prev) => [...prev, { index: indexRef.current, firstTry: attemptsRef.current === 0 }]);
        setStatus("correct");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(advance, ADVANCE_MS);
      }
    },
    [lesson.steps, syncHeld, advance],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      engineRef.current?.stop(midi);
      if (heldRef.current.delete(midi)) syncHeld();
      if (statusRef.current === "wrong" && heldRef.current.size === 0) setStatus("answering");
    },
    [syncHeld],
  );

  const releaseAll = useCallback(() => {
    for (const midi of heldRef.current) engineRef.current?.stop(midi);
    heldRef.current.clear();
    syncHeld();
  }, [syncHeld]);

  const restart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    releaseAll();
    setOrder(shuffledOrder(lesson.steps));
    setIndex(0);
    setAttempts(0);
    setResults([]);
    setRevealed(false);
    setHintUsed(false);
    setStatus("listen");
  }, [releaseAll, lesson.steps]);

  // A new key is a new lesson: deal again.
  useEffect(() => {
    setOrder(shuffledOrder(lesson.steps));
  }, [lesson.steps]);

  useEffect(() => {
    if (enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    releaseAll();
  }, [enabled, releaseAll]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const accuracy = useMemo(
    () => (results.length === 0 ? null : results.filter((r) => r.firstTry).length / results.length),
    [results],
  );

  const stepIndex = order[index] ?? index;

  return { index, stepIndex, held, status, attempts, revealed, hintUsed, results, accuracy, play, reveal, noteDown, noteUp, releaseAll, restart };
}
