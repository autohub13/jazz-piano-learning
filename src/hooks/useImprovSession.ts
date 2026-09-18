"use client";

// Improvising. The band and the comping loop; every note the learner plays is
// classified against the chord under it at that moment. Nothing is wrong,
// some things are better, and the score says which.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PianoEngine } from "@/lib/audio/pianoEngine";
import { classify, scoreImprov, type ImprovScore, type PlayedNote } from "@/lib/grading/improv";
import type { Lesson } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

const EMPTY: ReadonlySet<Midi> = new Set();

export interface ImprovSession {
  held: ReadonlySet<Midi>;
  /** The most recent note's class, for the meter. */
  last: PlayedNote | null;
  /** This chorus so far. */
  chorus: ImprovScore;
  /** Every completed chorus. */
  choruses: ImprovScore[];
  noteDown(midi: Midi, velocity?: number): void;
  noteUp(midi: Midi): void;
  releaseAll(): void;
  reset(): void;
}

export function useImprovSession(
  engine: PianoEngine | null,
  lesson: Lesson,
  bpm: number,
  enabled: boolean,
  position: () => number | null,
): ImprovSession {
  const [held, setHeld] = useState<ReadonlySet<Midi>>(EMPTY);
  const [last, setLast] = useState<PlayedNote | null>(null);
  const [played, setPlayed] = useState<PlayedNote[]>([]);
  const [choruses, setChoruses] = useState<ImprovScore[]>([]);

  const heldRef = useRef<Set<Midi>>(new Set());
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const lastSecRef = useRef(0);
  const playedRef = useRef<PlayedNote[]>([]);

  const syncHeld = useCallback(() => setHeld(new Set(heldRef.current)), []);

  // A chorus ends when the clock wraps. Checked on each note rather than in a
  // loop, since a chorus with no notes in it has nothing to score anyway.
  const noteDown = useCallback(
    (midi: Midi, velocity = 96) => {
      engineRef.current?.start({ note: midi, velocity });
      if (heldRef.current.has(midi)) return;
      heldRef.current.add(midi);
      syncHeld();
      const sec = position();
      if (sec === null) return;
      if (sec < lastSecRef.current - 1 && playedRef.current.length > 0) {
        setChoruses((prev) => [...prev, scoreImprov(playedRef.current)]);
        playedRef.current = [];
      }
      lastSecRef.current = sec;
      const note = classify(lesson, sec, bpm, midi);
      if (!note) return;
      playedRef.current = [...playedRef.current, note];
      setPlayed(playedRef.current);
      setLast(note);
    },
    [position, lesson, bpm, syncHeld],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      engineRef.current?.stop(midi);
      if (heldRef.current.delete(midi)) syncHeld();
    },
    [syncHeld],
  );

  const releaseAll = useCallback(() => {
    for (const midi of heldRef.current) engineRef.current?.stop(midi);
    heldRef.current.clear();
    syncHeld();
  }, [syncHeld]);

  const reset = useCallback(() => {
    playedRef.current = [];
    lastSecRef.current = 0;
    setPlayed([]);
    setChoruses([]);
    setLast(null);
  }, []);

  useEffect(() => {
    if (enabled) return;
    releaseAll();
    reset();
  }, [enabled, releaseAll, reset]);

  const chorus = useMemo(() => scoreImprov(played), [played]);

  return { held, last, chorus, choruses, noteDown, noteUp, releaseAll, reset };
}
