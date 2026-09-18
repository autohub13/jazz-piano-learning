"use client";

// Listen mode. Audio is scheduled onto the AudioContext clock in one pass, and
// the visual highlight is derived from ctx.currentTime inside requestAnimationFrame.
//
// That single decision is what keeps sound and picture together. Web Audio's
// scheduled time is sample accurate, while setTimeout jitters by tens of
// milliseconds, is clamped in background tabs, and runs off a different
// oscillator than the audio hardware, so a timer-driven highlight visibly drifts
// within about twenty seconds. Making both a pure function of one clock makes
// drift structurally impossible: worst case the highlight is one frame late.
//
// The rAF loop is a reader. It never triggers audio.

import { useCallback, useEffect, useRef, useState } from "react";
import { createBand, type Band } from "@/lib/audio/band";
import type { PianoEngine } from "@/lib/audio/pianoEngine";
import { buildTimeline, type TimedStep } from "@/lib/lessons/timeline";
import type { BandChart, LessonStep } from "@/lib/lessons/types";
import type { Midi } from "@/lib/music/notes";

export type ListenStatus = "idle" | "playing" | "paused" | "finished";

/** Headroom so the first scheduled note is never already in the past. */
const LEAD_IN = 0.15;

export interface ListenPlayer {
  status: ListenStatus;
  /** Index of the sounding step, or -1 during the lead-in and after the tail. */
  activeIndex: number;
  loop: boolean;
  play(): void;
  pause(): void;
  restart(): void;
  /** Back to idle: silence, no clock, nothing scheduled. */
  stop(): void;
  toggleLoop(): void;
  /** Seconds into the current pass, or null when nothing is running. */
  position(): number | null;
}

export interface ListenOptions {
  initialLoop?: boolean;
  /** The rhythm section's part, when this lesson has one. */
  chart?: BandChart | null;
  /** Whether the band is currently switched on. */
  bandOn?: boolean;
  /** Band and clock only: the piano part is not sounded. Timed practice and
   *  improvising run on this, with the learner supplying the piano. */
  silent?: boolean;
}

export function useListenPlayer(
  engine: PianoEngine | null,
  steps: LessonStep[],
  bpm: number,
  enabled: boolean,
  { initialLoop = false, chart = null, bandOn = true, silent = false }: ListenOptions = {},
): ListenPlayer {
  const [status, setStatus] = useState<ListenStatus>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loop, setLoop] = useState(initialLoop);

  // Per-frame values stay in refs. Only activeIndex reaches React, and only
  // when it actually changes, so this renders once per step and not 60 times
  // a second.
  const timelineRef = useRef<TimedStep[]>([]);
  const totalSecRef = useRef(0);
  const t0Ref = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastIndexRef = useRef(-1);
  const loopRef = useRef(loop);
  loopRef.current = loop;

  // The band lives as long as the engine it shares an AudioContext with.
  const bandRef = useRef<Band | null>(null);
  const bandOnRef = useRef(bandOn);
  bandOnRef.current = bandOn;
  const statusRef = useRef(status);
  statusRef.current = status;
  const silentRef = useRef(silent);
  silentRef.current = silent;

  useEffect(() => {
    if (!engine || !chart) return;
    const band = createBand(engine.ctx, chart);
    bandRef.current = band;
    return () => {
      band.dispose();
      bandRef.current = null;
    };
  }, [engine, chart]);

  const stopBand = useCallback(() => bandRef.current?.stop(), []);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Schedules the pass that started at `t0`, from `fromSec` into it. A note
  // tied over from the step before is struck once, where its chain begins, and
  // held to where the chain ends. Starting part way through a step strikes
  // whatever that step has sounding, so the music can pick up anywhere.
  const schedulePass = useCallback(
    (t0: number, fromSec: number) => {
      if (!engine) return;
      const { timed, totalSec } = buildTimeline(steps, bpm);
      timelineRef.current = timed;
      totalSecRef.current = totalSec;
      t0Ref.current = t0;

      // Only a note that really is in the step before can carry on from it.
      const tiedAt = (k: number, note: Midi) => {
        const step = steps[k];
        const j = step?.notes.indexOf(note) ?? -1;
        return j >= 0 && step.tied?.[j] === true && steps[k - 1]?.notes.includes(note) === true;
      };

      // Beginner lessons are under a hundred steps and under two minutes, so
      // scheduling the whole thing in one pass is exact and simple. A rolling
      // look-ahead scheduler only earns its complexity with long or looping
      // content.
      const earliest = engine.now() + 0.02;
      for (let i = 0; i < timed.length && !silentRef.current; i++) {
        const s = timed[i];
        if (s.endSec <= fromSec) continue;
        const first = s.startSec <= fromSec;
        for (const note of s.notes) {
          if (!first && tiedAt(i, note)) continue;
          let last = i;
          while (last + 1 < timed.length && tiedAt(last + 1, note)) last++;
          const start = Math.max(t0 + s.startSec, earliest);
          const tail = (timed[last].endSec - timed[last].startSec) * 0.05;
          engine.start({
            note,
            time: start,
            duration: Math.max(0.05, t0 + timed[last].endSec - start - tail),
            velocity: 82,
          });
        }
      }

      // Same t0, same clock. The band skips any beat already behind us, so
      // this is also how it joins a pass that is already under way.
      if (bandOnRef.current) bandRef.current?.schedule({ t0, bpm });
    },
    [engine, steps, bpm],
  );

  // `at` is an absolute AudioContext time for the first step. Looping passes
  // the exact end of the previous pass so the seam lands on the grid instead
  // of a lead-in later.
  const scheduleFrom = useCallback(
    (fromIndex: number, at?: number) => {
      if (!engine) return;
      const offset = buildTimeline(steps, bpm).timed[fromIndex]?.startSec ?? 0;
      schedulePass((at ?? engine.now() + LEAD_IN) - offset, offset);
    },
    [engine, steps, bpm, schedulePass],
  );

  // The rAF loop keeps calling the tick it started with, so the loop seam has
  // to reach the current schedule through a ref. Otherwise a tempo or a
  // variation changed mid-loop would revert at the next pass.
  const scheduleRef = useRef(scheduleFrom);
  scheduleRef.current = scheduleFrom;

  const tick = useCallback(() => {
    if (!engine) return;

    // Wrap before deriving the index, not after. Rescheduling moves t0, and
    // reading the index against the old t0 would report "past the end" for one
    // frame, which blinks the step strip and the cue off on every loop.
    if (engine.now() - t0Ref.current >= totalSecRef.current) {
      if (loopRef.current) {
        // Seamless unless the main thread stalled long enough that the seam
        // is already well in the past, in which case fall back to a lead-in.
        const at = t0Ref.current + totalSecRef.current;
        scheduleRef.current(0, at > engine.now() - 0.25 ? at : undefined);
      } else {
        cancelRaf();
        lastIndexRef.current = -1;
        setActiveIndex(-1);
        setStatus("finished");
        return;
      }
    }

    const elapsed = engine.now() - t0Ref.current;
    const timed = timelineRef.current;

    let index = -1;
    for (let k = 0; k < timed.length; k++) {
      if (elapsed >= timed[k].startSec && elapsed < timed[k].endSec) {
        index = k;
        break;
      }
    }
    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      setActiveIndex(index);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [engine, cancelRaf]);

  const startLoop = useCallback(() => {
    cancelRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, cancelRaf]);

  const play = useCallback(() => {
    if (!engine) return;
    if (status === "paused") {
      void engine.resume();
      setStatus("playing");
      startLoop();
      return;
    }
    engine.stop();
    stopBand();
    void engine.resume();
    lastIndexRef.current = -1;
    setActiveIndex(-1);
    scheduleFrom(0);
    setStatus("playing");
    startLoop();
  }, [engine, status, scheduleFrom, startLoop, stopBand]);

  const pause = useCallback(() => {
    if (!engine) return;
    // Suspending freezes ctx.currentTime, which freezes the elapsed time the
    // highlight is derived from, which freezes the already-scheduled audio.
    // All three stop together with no bookkeeping and nothing to reschedule.
    void engine.suspend();
    cancelRaf();
    setStatus("paused");
  }, [engine, cancelRaf]);

  const restart = useCallback(() => {
    if (!engine) return;
    engine.stop();
    stopBand();
    void engine.resume();
    lastIndexRef.current = -1;
    setActiveIndex(-1);
    scheduleFrom(0);
    setStatus("playing");
    startLoop();
  }, [engine, scheduleFrom, startLoop, stopBand]);

  const stop = useCallback(() => {
    cancelRaf();
    lastIndexRef.current = -1;
    setActiveIndex(-1);
    setStatus("idle");
    stopBand();
    if (engine) {
      engine.stop();
      void engine.resume();
    }
  }, [engine, cancelRaf, stopBand]);

  const toggleLoop = useCallback(() => setLoop((v) => !v), []);

  const position = useCallback(() => {
    if (!engine || (statusRef.current !== "playing" && statusRef.current !== "paused")) return null;
    return engine.now() - t0Ref.current;
  }, [engine]);

  // A tempo change while playing means cancelling and rescheduling, which is
  // the price of one-pass scheduling. Resume from the step that is sounding.
  const bpmRef = useRef(bpm);
  useEffect(() => {
    if (bpmRef.current === bpm) return;
    bpmRef.current = bpm;
    if (status !== "playing" || !engine) return;
    engine.stop();
    stopBand();
    scheduleFrom(Math.max(0, lastIndexRef.current));
  }, [bpm, status, engine, scheduleFrom, stopBand]);

  // New notes for the same piece, as when a variation is picked, swap in where
  // the music is rather than starting over. The pass keeps its t0, so the grid
  // and the band carry on and only what is sounding changes. This has to run
  // before the effect further down that silences a disabled player.
  const stepsRef = useRef(steps);
  useEffect(() => {
    if (stepsRef.current === steps) return;
    stepsRef.current = steps;
    if (!engine || !enabled) return;
    if (statusRef.current !== "playing" && statusRef.current !== "paused") return;
    engine.stop();
    stopBand();
    schedulePass(t0Ref.current, Math.max(0, engine.now() - t0Ref.current));
  }, [steps, engine, enabled, schedulePass, stopBand]);

  // Switching the band on mid-pass drops it in on the next beat rather than
  // restarting the piece, which is the point of having a switch at all.
  const prevBandOn = useRef(bandOn);
  useEffect(() => {
    if (prevBandOn.current === bandOn) return;
    prevBandOn.current = bandOn;
    stopBand();
    if (bandOn && statusRef.current === "playing") {
      bandRef.current?.schedule({ t0: t0Ref.current, bpm });
    }
  }, [bandOn, bpm, stopBand]);

  // Audio playing into a hidden tab is obnoxious, and rAF stops there anyway.
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && status === "playing") pause();
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [status, pause]);

  // Leaving Listen mode, or unmounting, must silence everything. Without the
  // resume, a mode switch while paused would leave the context suspended and
  // Practice mode would appear to be broken.
  useEffect(() => {
    if (enabled) return;
    cancelRaf();
    lastIndexRef.current = -1;
    setActiveIndex(-1);
    setStatus("idle");
    stopBand();
    if (engine) {
      engine.stop();
      void engine.resume();
    }
  }, [enabled, engine, cancelRaf, stopBand]);

  useEffect(() => cancelRaf, [cancelRaf]);

  return { status, activeIndex, loop, play, pause, restart, stop, toggleLoop, position };
}
