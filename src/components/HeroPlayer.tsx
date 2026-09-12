"use client";

// The landing page hook. One click has to do three things at once: create the
// AudioContext inside the user gesture, wait for the samples, and then play.
// That is the whole reason the lesson pages' separate "start the piano" gate
// does not appear here.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drum, Loader2, Pause, Play } from "lucide-react";
import { PianoKeyboard, NO_HIGHLIGHTS, type Highlights } from "./PianoKeyboard";
import { TheoryPanel, findRegion } from "./TheoryPanel";
import { HandLegend } from "./HandLegend";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import { handMap, handsUsed } from "@/lib/lessons/hands";
import type { Lesson } from "@/lib/lessons/types";
import { degreeMap } from "@/lib/music/harmony";
import type { Midi } from "@/lib/music/notes";
import { cn } from "@/lib/utils";

const EMPTY_FINGERING: ReadonlyMap<Midi, number> = new Map();
const EMPTY_NOTES: readonly Midi[] = [];

export default function HeroPlayer({ lesson }: { lesson: Lesson }) {
  const { engine, status: engineStatus, progress, start } = useAudioEngine();
  const [bandOn, setBandOn] = useState(true);

  // The chord being taken apart. Disabling the player while one is picked is
  // what silences everything and hands the AudioContext back, so the chord can
  // be sounded on its own and read about in peace.
  const [studying, setStudying] = useState<number | null>(null);

  const listen = useListenPlayer(engine, lesson.steps, lesson.defaultBpm, studying === null, {
    initialLoop: true,
    chart: lesson.band,
    bandOn,
  });

  // Clicked Play before the engine existed. The engine resolves a second or
  // two later, and this is what remembers that the click meant "play".
  const [armed, setArmed] = useState(false);

  // Free play, mouse and touch only. Typing on a landing page should not make
  // noise, so there is no computer-keyboard binding here.
  const heldRef = useRef<Set<Midi>>(new Set());
  const [held, setHeld] = useState<ReadonlySet<Midi>>(new Set());

  const playing = listen.status === "playing";

  const onPlay = useCallback(() => {
    if (!engine) {
      setArmed(true);
      start();
      return;
    }
    if (playing) {
      listen.pause();
      return;
    }
    // Leaving study mode re-enables the player. play() does not read `enabled`,
    // so it is safe to call in the same handler.
    setStudying(null);
    listen.play();
  }, [engine, start, playing, listen]);

  // Picking a chord is a user gesture, so it can start the piano too. The
  // effect below re-runs once the engine lands and sounds the chord then.
  const study = useCallback(
    (index: number) => {
      setStudying(index);
      if (!engine) start();
    },
    [engine, start],
  );

  // Sounding the picked chord happens here rather than in the click handler,
  // because the player's own teardown runs first and would cancel it.
  useEffect(() => {
    if (studying === null || !engine) return;
    const region = lesson.harmony?.[studying];
    if (!region) return;
    engine.stop();
    const at = engine.now() + 0.03;
    for (const note of lesson.steps[region.fromStep].notes) {
      engine.start({ note, time: at, duration: 2.6, velocity: 78 });
    }
  }, [studying, engine, lesson.harmony, lesson.steps]);

  useEffect(() => {
    if (!armed || !engine) return;
    setArmed(false);
    listen.play();
  }, [armed, engine, listen]);

  const noteDown = useCallback(
    (midi: Midi) => {
      if (!engine) return;
      engine.start({ note: midi, velocity: 96 });
      heldRef.current.add(midi);
      setHeld(new Set(heldRef.current));
    },
    [engine],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      if (!engine) return;
      engine.stop(midi);
      heldRef.current.delete(midi);
      setHeld(new Set(heldRef.current));
    },
    [engine],
  );

  const playingStep = listen.activeIndex >= 0 ? lesson.steps[listen.activeIndex] : null;
  const studyRegion = studying !== null ? lesson.harmony?.[studying] ?? null : null;
  // A picked chord holds the keyboard still; otherwise it follows the music.
  const shownStep = studyRegion ? lesson.steps[studyRegion.fromStep] : playingStep;

  const highlights = useMemo<Highlights>(
    () => ({
      ...NO_HIGHLIGHTS,
      active: new Set([...(shownStep?.notes ?? []), ...held]),
    }),
    [shownStep, held],
  );

  // What each shown key is doing in the chord, printed on the key itself.
  const degrees = useMemo<ReadonlyMap<Midi, string> | undefined>(() => {
    if (!lesson.harmony || !shownStep) return undefined;
    const region = studyRegion ?? findRegion(lesson.harmony, listen.activeIndex);
    if (!region) return undefined;
    return degreeMap(region.symbol, shownStep.notes);
  }, [lesson.harmony, shownStep, studyRegion, listen.activeIndex]);

  const hands = useMemo(() => handMap(shownStep), [shownStep]);
  const lessonHands = useMemo(() => handsUsed(lesson), [lesson]);

  const loading = engineStatus === "loading";
  const failed = engineStatus === "error";
  const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  return (
    <div className={cn("stage", playing && "is-playing")}>
      <div className="stage__cue">
        <span className="stage__label">
          {shownStep?.label ?? "ii - V - I in C. Two hands, four bars."}
        </span>
        <span className="stage__hint">
          {engineStatus === "fallback"
            ? "Synth fallback. The piano samples were unreachable."
            : studyRegion
              ? "Held still. Press play to hear it back in time."
              : playing
                ? "Loops until you stop it. Click the keys to join in."
                : "Piano, bass and drums. Loops until you stop it."}
        </span>
      </div>

      <div className="stage__keys">
        <PianoKeyboard
          low={lesson.range.low}
          high={lesson.range.high}
          spelling={lesson.spelling}
          labelMode="c-only"
          highlights={highlights}
          fingering={EMPTY_FINGERING}
          degrees={degrees}
          hands={hands}
          onNoteDown={noteDown}
          onNoteUp={noteUp}
        />
        {/* A picked chord must stay visible, so the overlay steps aside for it. */}
        {!playing && !studyRegion && (
          <div className="stage__overlay">
            <button
              type="button"
              className="stage__play"
              onClick={onPlay}
              disabled={loading || failed}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" aria-hidden /> Loading piano{" "}
                  {pct > 0 ? `${pct}%` : ""}
                </>
              ) : failed ? (
                "Sound unavailable"
              ) : (
                <>
                  <Play size={18} aria-hidden /> {listen.status === "paused" ? "Resume" : "Play it"}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {lesson.harmony && (
        <TheoryPanel
          harmony={lesson.harmony}
          activeStep={listen.activeIndex}
          selected={studying}
          detail={!playing}
          notes={shownStep?.notes ?? EMPTY_NOTES}
          spelling={lesson.spelling}
          hands={hands}
          onSelect={study}
        />
      )}

      <div className="stage__bar">
        <HandLegend hands={lessonHands} />
        {lesson.band && (
          <button
            type="button"
            className={cn("btn", bandOn && "is-on")}
            onClick={() => setBandOn((on) => !on)}
            aria-pressed={bandOn}
          >
            <Drum size={15} aria-hidden /> Bass and drums
          </button>
        )}
        {/* While a chord is picked the big overlay button is gone, so the way
            back to the music lives here. */}
        {(playing || studyRegion) && (
          <button type="button" className="btn" onClick={onPlay}>
            {playing ? (
              <>
                <Pause size={15} aria-hidden /> Pause
              </>
            ) : (
              <>
                <Play size={15} aria-hidden /> Play it
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
