"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drum, Ear, Hand, Loader2, Pause, Play, RotateCcw, Repeat, SkipForward, Volume2 } from "lucide-react";
import { PianoKeyboard, NO_HIGHLIGHTS, type Highlights, type LabelMode } from "./PianoKeyboard";
import { KeyLegend } from "./KeyLegend";
import { StepStrip } from "./StepStrip";
import { TheoryPanel, findRegion } from "./TheoryPanel";
import { HandLegend } from "./HandLegend";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useComputerKeyboard } from "@/hooks/useComputerKeyboard";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { handMap, handsUsed } from "@/lib/lessons/hands";
import type { Lesson } from "@/lib/lessons/types";
import { degreeMap } from "@/lib/music/harmony";
import { midiToName, type Midi } from "@/lib/music/notes";
import { cn } from "@/lib/utils";

type Mode = "listen" | "practice";

const EMPTY_FINGERING: ReadonlyMap<Midi, number> = new Map();
const EMPTY_NOTES: readonly Midi[] = [];

export default function LessonWorkspace({ lesson }: { lesson: Lesson }) {
  const [mode, setMode] = useState<Mode>("listen");
  const [bpm, setBpm] = useState(lesson.defaultBpm);
  const [base, setBase] = useState(lesson.keyboardBase);
  const [labelMode, setLabelMode] = useState<LabelMode>(
    lesson.topic === "orientation" ? "all" : "c-only",
  );

  const { engine, status: engineStatus, progress, start: startAudio } = useAudioEngine();
  const ready = engine !== null;

  const [bandOn, setBandOn] = useState(true);

  // The chord being taken apart in Listen mode. Disabling the player while one
  // is picked silences everything and hands back the AudioContext, so the chord
  // can be sounded alone and read about at reading speed rather than at tempo.
  const [studying, setStudying] = useState<number | null>(null);

  const listen = useListenPlayer(engine, lesson.steps, bpm, mode === "listen" && studying === null, {
    chart: lesson.band,
    bandOn,
  });
  const practice = usePracticeSession(engine, lesson, mode === "practice");

  // The first click should be musical: it creates the engine, and the lesson
  // starts playing as soon as the samples land rather than waiting for a
  // second press.
  const [autoPlay, setAutoPlay] = useState(false);
  const startAndPlay = useCallback(() => {
    setAutoPlay(true);
    startAudio();
  }, [startAudio]);

  useEffect(() => {
    if (!autoPlay || !engine || mode !== "listen") return;
    setAutoPlay(false);
    listen.play();
  }, [autoPlay, engine, mode, listen]);

  // Free play outside practice: click or type and you hear a note, with no
  // validation. Kept in a ref-backed set so the keyboard still lights up.
  const freeHeldRef = useRef<Set<Midi>>(new Set());
  const [freeHeld, setFreeHeld] = useState<ReadonlySet<Midi>>(new Set());

  const noteDown = useCallback(
    (midi: Midi) => {
      if (!engine) return;
      if (mode === "practice") {
        practice.noteDown(midi);
        return;
      }
      engine.start({ note: midi, velocity: 96 });
      freeHeldRef.current.add(midi);
      setFreeHeld(new Set(freeHeldRef.current));
    },
    [engine, mode, practice],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      if (!engine) return;
      if (mode === "practice") {
        practice.noteUp(midi);
        return;
      }
      engine.stop(midi);
      freeHeldRef.current.delete(midi);
      setFreeHeld(new Set(freeHeldRef.current));
    },
    [engine, mode, practice],
  );

  useComputerKeyboard({
    base,
    enabled: ready,
    onNoteDown: noteDown,
    onNoteUp: noteUp,
    onBaseChange: setBase,
  });

  const studyRegion =
    mode === "listen" && studying !== null ? lesson.harmony?.[studying] ?? null : null;

  const currentStep =
    mode === "listen"
      ? studyRegion
        ? lesson.steps[studyRegion.fromStep]
        : listen.activeIndex >= 0
          ? lesson.steps[listen.activeIndex]
          : null
      : lesson.steps[practice.index] ?? null;

  const highlights = useMemo<Highlights>(() => {
    if (mode === "listen") {
      // A picked chord holds the keys still; otherwise they follow the music.
      const sounding = studyRegion
        ? lesson.steps[studyRegion.fromStep]?.notes ?? []
        : listen.activeIndex >= 0
          ? lesson.steps[listen.activeIndex]?.notes ?? []
          : [];
      return {
        ...NO_HIGHLIGHTS,
        active: new Set([...sounding, ...freeHeld]),
      };
    }
    const target = lesson.exploreOnly ? [] : lesson.steps[practice.index]?.notes ?? [];
    return {
      active: practice.held,
      target: new Set(target),
      correct: practice.status === "correct" ? new Set(target) : NO_HIGHLIGHTS.correct,
      wrong: practice.wrongNotes,
    };
  }, [
    mode,
    studyRegion,
    listen.activeIndex,
    lesson.steps,
    lesson.exploreOnly,
    freeHeld,
    practice.held,
    practice.index,
    practice.status,
    practice.wrongNotes,
  ]);

  const fingering = useMemo<ReadonlyMap<Midi, number>>(() => {
    if (mode !== "practice" || practice.hintLevel < 2) return EMPTY_FINGERING;
    const step = lesson.steps[practice.index];
    if (!step?.fingering) return EMPTY_FINGERING;
    const map = new Map<Midi, number>();
    step.notes.forEach((n, i) => {
      const f = step.fingering?.[i];
      if (f !== undefined) map.set(n, f);
    });
    return map;
  }, [mode, practice.hintLevel, practice.index, lesson.steps]);

  // The step the analysis is describing: what is sounding in Listen, what is
  // being asked for in Practice.
  const theoryIndex = mode === "listen" ? listen.activeIndex : practice.index;

  // Degrees go on the keys in Listen only. In Practice the same corner of the
  // key is already carrying the fingering hint.
  const degrees = useMemo<ReadonlyMap<Midi, string> | undefined>(() => {
    if (mode !== "listen" || !lesson.harmony || !currentStep) return undefined;
    const region = studyRegion ?? findRegion(lesson.harmony, theoryIndex);
    if (!region) return undefined;
    return degreeMap(region.symbol, currentStep.notes);
  }, [mode, lesson.harmony, currentStep, studyRegion, theoryIndex]);

  // Listen only. In Practice the key colours already mean right and wrong, and
  // a third meaning on the same surface would just muddy both.
  const hands = useMemo(
    () => (mode === "listen" ? handMap(currentStep) : undefined),
    [mode, currentStep],
  );
  const lessonHands = useMemo(() => handsUsed(lesson), [lesson]);

  const targetNames =
    currentStep && mode === "practice" && practice.hintLevel >= 1
      ? currentStep.notes.map((n) => midiToName(n, lesson.spelling)).join("  ")
      : null;

  // The cue border follows the wrong notes rather than the transient flash, so
  // it stays red for as long as a wrong note is actually held down.
  const cueTone =
    practice.status === "correct" || practice.status === "finished"
      ? "correct"
      : practice.wrongNotes.size > 0
        ? "wrong"
        : "awaiting";

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    engine?.stop();
    freeHeldRef.current.clear();
    setFreeHeld(new Set());
    setStudying(null);
    setMode(next);
  };

  // Leaving a picked chord re-enables the player. play() does not read
  // `enabled`, so it is safe to call in the same handler.
  const resume = () => {
    setStudying(null);
    listen.play();
  };

  // Sounding the picked chord happens here rather than in the click handler,
  // because the player's own teardown runs first and would cancel it.
  useEffect(() => {
    if (!studyRegion || !engine) return;
    engine.stop();
    const at = engine.now() + 0.03;
    for (const note of lesson.steps[studyRegion.fromStep].notes) {
      engine.start({ note, time: at, duration: 2.6, velocity: 78 });
    }
  }, [studyRegion, engine, lesson.steps]);

  if (!ready) {
    return (
      <AudioGate status={engineStatus} progress={progress} onStart={startAndPlay} />
    );
  }

  return (
    <div className="workspace">
      <div className="workspace__bar">
        <div className="mode-tabs" role="tablist" aria-label="Practice mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "listen"}
            className={cn("mode-tab", mode === "listen" && "is-on")}
            onClick={() => switchMode("listen")}
          >
            <Ear size={15} aria-hidden /> Listen
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "practice"}
            className={cn("mode-tab", mode === "practice" && "is-on")}
            onClick={() => switchMode("practice")}
          >
            <Hand size={15} aria-hidden /> Practice
          </button>
        </div>

        {mode === "listen" ? (
          <div className="transport">
            <button
              type="button"
              className="btn btn--primary"
              onClick={listen.status === "playing" ? listen.pause : resume}
            >
              {listen.status === "playing" ? (
                <>
                  <Pause size={15} aria-hidden /> Pause
                </>
              ) : (
                <>
                  <Play size={15} aria-hidden /> {listen.status === "paused" ? "Resume" : "Play"}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setStudying(null);
                listen.restart();
              }}
            >
              <RotateCcw size={15} aria-hidden /> Restart
            </button>
            <button
              type="button"
              className={cn("btn", listen.loop && "is-on")}
              onClick={listen.toggleLoop}
              aria-pressed={listen.loop}
            >
              <Repeat size={15} aria-hidden /> Loop
            </button>
            {lesson.band && (
              <button
                type="button"
                className={cn("btn", bandOn && "is-on")}
                onClick={() => setBandOn((on) => !on)}
                aria-pressed={bandOn}
              >
                <Drum size={15} aria-hidden /> Band
              </button>
            )}
            <label className="tempo">
              <span className="tempo__label">Tempo</span>
              <input
                type="range"
                min={lesson.bpmRange[0]}
                max={lesson.bpmRange[1]}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
              />
              <span className="tempo__value">{bpm}</span>
            </label>
          </div>
        ) : (
          <div className="transport">
            <button type="button" className="btn btn--primary" onClick={practice.hear}>
              <Volume2 size={15} aria-hidden /> Hear it
            </button>
            <button type="button" className="btn" onClick={practice.hint}>
              Hint {practice.hintLevel > 0 ? `(${practice.hintLevel}/2)` : ""}
            </button>
            <button type="button" className="btn" onClick={practice.skip}>
              <SkipForward size={15} aria-hidden /> Skip
            </button>
            <button type="button" className="btn" onClick={practice.restart}>
              <RotateCcw size={15} aria-hidden /> Restart
            </button>
          </div>
        )}
      </div>

      <div className={cn("cue", mode === "practice" && `cue--${cueTone}`)}>
        {mode === "listen" ? (
          <>
            <span className="cue__label">{currentStep?.label ?? lesson.tagline}</span>
            <span className="cue__hint">
              {listen.status === "playing"
                ? "Watch the keys light up, then try it yourself."
                : "Press Play to hear the lesson."}
            </span>
          </>
        ) : practice.status === "finished" ? (
          <>
            <span className="cue__label">Lesson complete</span>
            <span className="cue__hint">
              {practice.accuracy !== null
                ? `${Math.round(practice.accuracy * 100)} percent first try. Run it again, or move on.`
                : "Nicely done."}
            </span>
          </>
        ) : (
          <>
            <span className="cue__label">{currentStep?.label ?? "Play the highlighted keys"}</span>
            <span className="cue__hint">
              {practice.status === "correct"
                ? "That is it."
                : practice.wrongNotes.size > 0
                  ? "The red keys are not in this chord. Lift them and try again."
                  : targetNames ?? "Hold every outlined key at the same time."}
            </span>
          </>
        )}
      </div>

      <StepStrip
        steps={lesson.steps}
        activeIndex={mode === "listen" ? listen.activeIndex : practice.index}
        completed={mode === "practice" ? practice.results.length : 0}
      />

      <PianoKeyboard
        low={lesson.range.low}
        high={lesson.range.high}
        spelling={lesson.spelling}
        labelMode={labelMode}
        highlights={highlights}
        fingering={fingering}
        degrees={degrees}
        hands={hands}
        onNoteDown={noteDown}
        onNoteUp={noteUp}
      />

      {mode === "listen" && <HandLegend hands={lessonHands} />}

      {lesson.harmony && (
        <TheoryPanel
          harmony={lesson.harmony}
          activeStep={theoryIndex}
          selected={mode === "listen" ? studying : null}
          // Practice is never "running", so the breakdown always shows there.
          detail={listen.status !== "playing"}
          notes={currentStep?.notes ?? EMPTY_NOTES}
          spelling={lesson.spelling}
          hands={hands}
          onSelect={mode === "listen" ? setStudying : undefined}
        />
      )}

      <KeyLegend
        base={base}
        spelling={lesson.spelling}
        labelMode={labelMode}
        onLabelMode={setLabelMode}
        engineKind={engine.kind}
      />
    </div>
  );
}

function AudioGate({
  status,
  progress,
  onStart,
}: {
  status: string;
  progress: { loaded: number; total: number };
  onStart(): void;
}) {
  const loading = status === "loading";
  const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  return (
    <div className="gate">
      <h2 className="gate__title">Hear this lesson</h2>
      <p className="gate__body">
        The piano loads on your first click, then plays the lesson straight away.
        Browsers only allow sound after a click, and this takes a few seconds the
        first time.
      </p>
      <button type="button" className="btn btn--primary btn--lg" onClick={onStart} disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="spin" aria-hidden /> Loading piano {pct > 0 ? `${pct}%` : ""}
          </>
        ) : (
          <>
            <Play size={16} aria-hidden /> Play the lesson
          </>
        )}
      </button>
    </div>
  );
}
