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
  toggleLoop(): void;
}

export interface ListenOptions {
  initialLoop?: boolean;
  /** The rhythm section's part, when this lesson has one. */
  chart?: BandChart | null;
  /** Whether the band is currently switched on. */
  bandOn?: boolean;
}

export function useListenPlayer(
  engine: PianoEngine | null,
  steps: LessonStep[],
  bpm: number,
  enabled: boolean,
  { initialLoop = false, chart = null, bandOn = true }: ListenOptions = {},
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

  // `at` is an absolute AudioContext time for the first step. Looping passes
  // the exact end of the previous pass so the seam lands on the grid instead
  // of a lead-in later.
  const scheduleFrom = useCallback(
    (fromIndex: number, at?: number) => {
      if (!engine) return;
      const { timed, totalSec } = buildTimeline(steps, bpm);
      timelineRef.current = timed;
      totalSecRef.current = totalSec;

      const offset = timed[fromIndex]?.startSec ?? 0;
      const t0 = (at ?? engine.now() + LEAD_IN) - offset;
      t0Ref.current = t0;

      // Beginner lessons are under a hundred steps and under two minutes, so
      // scheduling the whole thing in one pass is exact and simple. A rolling
      // look-ahead scheduler only earns its complexity with long or looping
      // content.
      for (let i = fromIndex; i < timed.length; i++) {
        const s = timed[i];
        for (const note of s.notes) {
          engine.start({
            note,
            time: t0 + s.startSec,
            duration: (s.endSec - s.startSec) * 0.95,
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
        scheduleFrom(0, at > engine.now() - 0.25 ? at : undefined);
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
  }, [engine, scheduleFrom, cancelRaf]);

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

  const toggleLoop = useCallback(() => setLoop((v) => !v), []);

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

  return { status, activeIndex, loop, play, pause, restart, toggleLoop };
}
