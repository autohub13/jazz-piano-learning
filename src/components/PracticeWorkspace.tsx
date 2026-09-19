"use client";

// One exercise, in one key, in whichever mode its kind allows. Listen plays
// it; Practice grades it at your own pace; Timed grades it against the band;
// Improvise scores a line over it; Ear plays a chord and waits for it back.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drum, Ear, Hand, Loader2, Mic2, Pause, Play, RotateCcw, Repeat, SkipForward, Timer, Volume2 } from "lucide-react";
import { PianoKeyboard, NO_HIGHLIGHTS, type Highlights, type LabelMode } from "./PianoKeyboard";
import { KeyLegend } from "./KeyLegend";
import { StepStrip } from "./StepStrip";
import { TheoryPanel, findRegion } from "./TheoryPanel";
import { HandLegend } from "./HandLegend";
import { KeyPicker } from "./KeyPicker";
import { VariationPicker } from "./VariationPicker";
import { SheetMusic } from "./SheetMusic";
import { ImprovMeter } from "./ImprovMeter";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useComputerKeyboard } from "@/hooks/useComputerKeyboard";
import { useEarSession } from "@/hooks/useEarSession";
import { useImprovSession } from "@/hooks/useImprovSession";
import { useListenPlayer } from "@/hooks/useListenPlayer";
import { useMidiInput } from "@/hooks/useMidiInput";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { useProgress } from "@/hooks/useProgress";
import { useTimedSession } from "@/hooks/useTimedSession";
import type { Exercise } from "@/lib/curriculum/types";
import { freshNotes } from "@/lib/grading/timed";
import { handMap, handsUsed } from "@/lib/lessons/hands";
import { barBeats } from "@/lib/lessons/notation";
import { parseKey, type KeyName } from "@/lib/lessons/transpose";
import { applyVariation, formatVariation, parseVariation, type Variation } from "@/lib/lessons/variation";
import { isChordTone, parseChord } from "@/lib/music/chords";
import { degreeMap } from "@/lib/music/harmony";
import { midiToName, type Midi } from "@/lib/music/notes";
import { keysFor, masteredKeys, meetsMastery, recordAttempt, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Mode = "listen" | "practice" | "timed" | "improv" | "ear";

const MODES: Record<Exercise["kind"], Mode[]> = {
  drill: ["listen", "practice", "timed"],
  progression: ["listen", "practice", "timed"],
  tune: ["listen", "practice", "timed"],
  improv: ["listen", "improv"],
  ear: ["ear"],
};

const MODE_LABEL: Record<Mode, string> = {
  listen: "Listen",
  practice: "Practice",
  timed: "Timed",
  improv: "Improvise",
  ear: "Ear",
};

const EMPTY_FINGERING: ReadonlyMap<Midi, number> = new Map();
const EMPTY_NOTES: readonly Midi[] = [];

export default function PracticeWorkspace({ exercise }: { exercise: Exercise }) {
  const params = new URLSearchParams(window.location.search);
  const keys = keysFor(exercise);
  const [keyName, setKeyName] = useState<KeyName>(() => {
    const k = parseKey(params.get("key"));
    return keys.includes(k) ? k : keys[0];
  });
  const [variation, setVariation] = useState<Variation>(() => parseVariation(params.get("v")));
  const [mode, setMode] = useState<Mode>(MODES[exercise.kind][0]);

  const generated = useMemo(() => exercise.generate(keyName), [exercise, keyName]);
  const lesson = useMemo(() => applyVariation(generated, variation), [generated, variation]);
  const varied = exercise.kind !== "drill" && exercise.kind !== "ear" && !!generated.harmony;

  const [bpm, setBpm] = useState(lesson.defaultBpm);
  const [base, setBase] = useState(lesson.keyboardBase);
  const [labelMode, setLabelMode] = useState<LabelMode>(exercise.id === "meet-the-keyboard" ? "all" : "c-only");
  const [bandOn, setBandOn] = useState(true);
  const [studying, setStudying] = useState<number | null>(null);

  const { engine, status: engineStatus, progress, start: startAudio } = useAudioEngine();
  const ready = engine !== null;

  const clocked = mode === "listen" || mode === "timed" || mode === "improv";
  const listen = useListenPlayer(engine, lesson.steps, bpm, clocked && studying === null, {
    chart: lesson.band,
    bandOn,
    silent: mode !== "listen",
    initialLoop: exercise.kind === "improv",
  });
  const practice = usePracticeSession(engine, lesson, mode === "practice");
  const timed = useTimedSession(engine, lesson, bpm, mode === "timed", listen.position);
  const improv = useImprovSession(engine, lesson, bpm, mode === "improv", listen.position);
  const ear = useEarSession(engine, lesson, mode === "ear");

  const { store, refresh } = useProgress();
  const doneKeys = useMemo(() => (store ? masteredKeys(store, exercise.id) : new Set<KeyName>()), [store, exercise.id]);

  // Recording. Each mode has one moment that is "a pass finished".
  const [verdict, setVerdict] = useState<string | null>(null);
  const record = useCallback(
    (attempt: Attempt, note = "") => {
      recordAttempt(exercise, keyName, attempt, new Date());
      refresh();
      const passed = meetsMastery(attempt, exercise.mastery);
      const pct = Math.round(attempt.accuracy * 100);
      setVerdict(
        (passed
          ? `${pct} percent. ${keyName} is done${keys.length > 1 ? ", pick the next key" : ""}.`
          : !attempt.clean
            ? `${pct} percent with hints showing. Run it once without them to mark it done.`
            : exercise.mastery.bpm && (!attempt.timed || (attempt.bpm ?? 0) < exercise.mastery.bpm)
              ? `${pct} percent. This one is marked done in Timed mode at ${exercise.mastery.bpm} or faster.`
              : `${pct} percent. ${Math.round(exercise.mastery.accuracy * 100)} first try marks it done.`) + note,
      );
    },
    [exercise, keyName, keys.length, refresh],
  );

  const recordedRef = useRef(false);
  useEffect(() => {
    if (practice.status !== "finished") {
      recordedRef.current = false;
      return;
    }
    if (recordedRef.current) return;
    recordedRef.current = true;
    record({ accuracy: practice.accuracy ?? 0, timed: false, clean: !practice.hintUsed });
  }, [practice.status, practice.accuracy, practice.hintUsed, record]);

  const timedRecordedRef = useRef(false);
  useEffect(() => {
    if (!timed.finished) {
      timedRecordedRef.current = false;
      return;
    }
    if (timedRecordedRef.current) return;
    timedRecordedRef.current = true;
    // Which way the time leans. Rushing is the usual fault, and it is only
    // fixable once it is named.
    const ms = Math.round(Math.abs(timed.lean) * 1000);
    const lean = ms < 30 ? "" : ` On average ${ms} ms ${timed.lean < 0 ? "early: you are rushing" : "late: you are dragging"}.`;
    record({ accuracy: timed.accuracy, timing: timed.timing, bpm, timed: true, clean: true }, lean);
  }, [timed.finished, timed.accuracy, timed.timing, timed.lean, bpm, record]);

  const chorusCountRef = useRef(0);
  useEffect(() => {
    if (improv.choruses.length <= chorusCountRef.current) {
      chorusCountRef.current = improv.choruses.length;
      return;
    }
    chorusCountRef.current = improv.choruses.length;
    const last = improv.choruses[improv.choruses.length - 1];
    record({ accuracy: last.score, timing: 1, bpm, timed: true, clean: true });
  }, [improv.choruses, bpm, record]);

  const earRecordedRef = useRef(false);
  useEffect(() => {
    if (ear.status !== "finished") {
      earRecordedRef.current = false;
      return;
    }
    if (earRecordedRef.current) return;
    earRecordedRef.current = true;
    record({ accuracy: ear.accuracy ?? 0, timed: false, clean: !ear.hintUsed });
  }, [ear.status, ear.accuracy, ear.hintUsed, record]);

  // First click: create the engine and start playing.
  const [autoPlay, setAutoPlay] = useState(false);
  const startAndPlay = useCallback(() => {
    setAutoPlay(true);
    startAudio();
  }, [startAudio]);
  useEffect(() => {
    if (!autoPlay || !engine) return;
    setAutoPlay(false);
    if (mode === "listen") listen.play();
  }, [autoPlay, engine, mode, listen]);

  // Free play in Listen: hear the note, light the key, no grading.
  const freeHeldRef = useRef<Set<Midi>>(new Set());
  const [freeHeld, setFreeHeld] = useState<ReadonlySet<Midi>>(new Set());

  const noteDown = useCallback(
    (midi: Midi, velocity = 96) => {
      if (!engine) return;
      switch (mode) {
        case "practice":
          return practice.noteDown(midi, velocity);
        case "timed":
          return timed.noteDown(midi, velocity);
        case "improv":
          return improv.noteDown(midi, velocity);
        case "ear":
          return ear.noteDown(midi, velocity);
        default:
          engine.start({ note: midi, velocity });
          freeHeldRef.current.add(midi);
          setFreeHeld(new Set(freeHeldRef.current));
      }
    },
    [engine, mode, practice, timed, improv, ear],
  );

  const noteUp = useCallback(
    (midi: Midi) => {
      if (!engine) return;
      switch (mode) {
        case "practice":
          return practice.noteUp(midi);
        case "timed":
          return timed.noteUp(midi);
        case "improv":
          return improv.noteUp(midi);
        case "ear":
          return ear.noteUp(midi);
        default:
          engine.stop(midi);
          freeHeldRef.current.delete(midi);
          setFreeHeld(new Set(freeHeldRef.current));
      }
    },
    [engine, mode, practice, timed, improv, ear],
  );

  useComputerKeyboard({ base, enabled: ready, onNoteDown: noteDown, onNoteUp: noteUp, onBaseChange: setBase });
  const midi = useMidiInput({ enabled: ready, onNoteDown: noteDown, onNoteUp: noteUp });

  // In Listen, a bar of the score is a button that plays just that bar.
  const bars = useMemo(() => barBeats(lesson), [lesson]);
  const { playBar } = listen;
  const onBar = useCallback(
    (bar: number) => {
      if (bars[bar + 1] === undefined) return;
      setStudying(null);
      setVerdict(null);
      playBar(bars[bar], bars[bar + 1]);
    },
    [bars, playBar],
  );

  const studyRegion = mode === "listen" && studying !== null ? lesson.harmony?.[studying] ?? null : null;

  const activeIndex =
    mode === "listen"
      ? studyRegion
        ? studyRegion.fromStep
        : listen.activeIndex
      : mode === "practice"
        ? practice.index
        : mode === "timed"
          ? timed.index
          : mode === "improv"
            ? listen.activeIndex
            : ear.stepIndex;
  const currentStep = lesson.steps[activeIndex] ?? null;

  // In an ear drill the strip counts prompts. It must not name them.
  const earStrip = useMemo(() => lesson.steps.map((s) => ({ ...s, label: undefined })), [lesson.steps]);

  const held = mode === "practice" ? practice.held : mode === "timed" ? timed.held : mode === "improv" ? improv.held : mode === "ear" ? ear.held : freeHeld;

  const highlights = useMemo<Highlights>(() => {
    if (mode === "listen") {
      const sounding = currentStep?.notes ?? [];
      return { ...NO_HIGHLIGHTS, active: new Set([...sounding, ...held]) };
    }
    if (mode === "practice") {
      const target = lesson.exploreOnly ? [] : currentStep?.notes ?? [];
      return {
        active: practice.held,
        target: new Set(target),
        correct: practice.status === "correct" ? new Set(target) : NO_HIGHLIGHTS.correct,
        wrong: practice.wrongNotes,
      };
    }
    if (mode === "timed") {
      return {
        active: timed.held,
        target: new Set(currentStep ? freshNotes(currentStep) : []),
        correct: NO_HIGHLIGHTS.correct,
        wrong: timed.wrongNotes,
      };
    }
    if (mode === "improv") {
      // Ghost every chord tone of the chord under the band, as a map.
      const region = lesson.harmony ? findRegion(lesson.harmony, activeIndex) : null;
      const target = new Set<Midi>();
      if (region) {
        const chord = parseChord(region.symbol);
        for (let m = lesson.range.low; m <= lesson.range.high; m++) if (isChordTone(chord, m)) target.add(m);
      }
      return { active: improv.held, target, correct: NO_HIGHLIGHTS.correct, wrong: NO_HIGHLIGHTS.wrong };
    }
    const answer = ear.revealed || ear.status === "correct" ? new Set(currentStep?.notes ?? []) : NO_HIGHLIGHTS.target;
    return {
      active: ear.held,
      target: answer,
      correct: ear.status === "correct" ? answer : NO_HIGHLIGHTS.correct,
      wrong: NO_HIGHLIGHTS.wrong,
    };
  }, [mode, currentStep, held, lesson, practice, timed, improv, ear, activeIndex]);

  const fingering = useMemo<ReadonlyMap<Midi, number>>(() => {
    if (mode !== "practice" || practice.hintLevel < 2 || !currentStep?.fingering) return EMPTY_FINGERING;
    const map = new Map<Midi, number>();
    currentStep.notes.forEach((n, i) => {
      const f = currentStep.fingering?.[i];
      if (f !== undefined) map.set(n, f);
    });
    return map;
  }, [mode, practice.hintLevel, currentStep]);

  const degrees = useMemo<ReadonlyMap<Midi, string> | undefined>(() => {
    if (!lesson.harmony || (mode !== "listen" && mode !== "improv")) return undefined;
    const region = studyRegion ?? findRegion(lesson.harmony, activeIndex);
    if (!region) return undefined;
    if (mode === "improv") {
      const notes: Midi[] = [];
      for (let m = lesson.range.low; m <= lesson.range.high; m++) if (highlights.target.has(m)) notes.push(m);
      return degreeMap(region.symbol, notes);
    }
    return currentStep ? degreeMap(region.symbol, currentStep.notes) : undefined;
  }, [mode, lesson, currentStep, studyRegion, activeIndex, highlights.target]);

  const hands = useMemo(() => (mode === "listen" || mode === "timed" ? handMap(currentStep) : undefined), [mode, currentStep]);
  const lessonHands = useMemo(() => handsUsed(lesson), [lesson]);

  const targetNames =
    currentStep && mode === "practice" && practice.hintLevel >= 1
      ? currentStep.notes.map((n) => midiToName(n, lesson.spelling)).join("  ")
      : null;

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    listen.stop();
    engine?.stop();
    freeHeldRef.current.clear();
    setFreeHeld(new Set());
    setStudying(null);
    setVerdict(null);
    setMode(next);
  };

  const changeKey = (next: KeyName) => {
    if (next === keyName) return;
    engine?.stop();
    freeHeldRef.current.clear();
    setFreeHeld(new Set());
    setStudying(null);
    setVerdict(null);
    practice.restart();
    ear.restart();
    setBase(exercise.generate(next).keyboardBase);
    setKeyName(next);
    const url = new URL(window.location.href);
    url.searchParams.set("key", next);
    window.history.replaceState(window.history.state, "", url);
  };

  const changeVariation = (next: Variation) => {
    setStudying(null);
    setVariation(next);
    const url = new URL(window.location.href);
    const v = formatVariation(next);
    if (v === null) url.searchParams.delete("v");
    else url.searchParams.set("v", v);
    window.history.replaceState(window.history.state, "", url);
  };

  const resume = () => {
    setStudying(null);
    setVerdict(null);
    if (mode === "timed") timed.reset();
    listen.play();
  };

  useEffect(() => {
    if (!studyRegion || !engine) return;
    engine.stop();
    const at = engine.now() + 0.03;
    for (const note of lesson.steps[studyRegion.fromStep].notes) engine.start({ note, time: at, duration: 2.6, velocity: 78 });
  }, [studyRegion, engine, lesson.steps]);

  // A key change restarts a running pass; a variation change swaps in place.
  const listenRef = useRef(listen);
  listenRef.current = listen;
  useEffect(() => {
    const player = listenRef.current;
    if (player.status === "playing" || player.status === "paused") player.restart();
  }, [generated]);

  if (!ready) return <AudioGate status={engineStatus} progress={progress} onStart={startAndPlay} />;

  const cueTone =
    mode === "practice"
      ? practice.status === "correct" || practice.status === "finished"
        ? "correct"
        : practice.wrongNotes.size > 0
          ? "wrong"
          : "awaiting"
      : mode === "timed"
        ? timed.last === "hit"
          ? "correct"
          : timed.last === "miss" || timed.last === "wrong"
            ? "wrong"
            : timed.last === "late" || timed.last === "early"
              ? "partial"
              : "awaiting"
        : mode === "ear"
          ? ear.status === "correct" || ear.status === "finished"
            ? "correct"
            : ear.status === "wrong"
              ? "wrong"
              : "awaiting"
          : "awaiting";

  const running = listen.status === "playing";
  const showsChart = exercise.kind !== "ear";

  return (
    <div className="workspace">
      <div className="workspace__bar">
        <div className="mode-tabs" role="tablist" aria-label="Mode">
          {MODES[exercise.kind].map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} className={cn("mode-tab", mode === m && "is-on")} onClick={() => switchMode(m)}>
              {m === "listen" ? <Ear size={15} aria-hidden /> : m === "practice" ? <Hand size={15} aria-hidden /> : m === "timed" ? <Timer size={15} aria-hidden /> : m === "improv" ? <Mic2 size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}{" "}
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        {clocked ? (
          <div className="transport">
            <button type="button" className="btn btn--primary" onClick={running ? listen.pause : resume}>
              {running ? (
                <>
                  <Pause size={15} aria-hidden /> Pause
                </>
              ) : (
                <>
                  <Play size={15} aria-hidden /> {listen.status === "paused" ? "Resume" : mode === "listen" ? "Play" : "Start"}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setStudying(null);
                setVerdict(null);
                if (mode === "timed") timed.reset();
                if (mode === "improv") improv.reset();
                listen.restart();
              }}
            >
              <RotateCcw size={15} aria-hidden /> Restart
            </button>
            {mode !== "timed" && (
              <button type="button" className={cn("btn", listen.loop && "is-on")} onClick={listen.toggleLoop} aria-pressed={listen.loop}>
                <Repeat size={15} aria-hidden /> Loop
              </button>
            )}
            {lesson.band && (
              <button type="button" className={cn("btn", bandOn && "is-on")} onClick={() => setBandOn((on) => !on)} aria-pressed={bandOn}>
                <Drum size={15} aria-hidden /> Band
              </button>
            )}
            <label className="tempo">
              <span className="tempo__label">Tempo</span>
              <input type="range" min={lesson.bpmRange[0]} max={lesson.bpmRange[1]} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
              <span className="tempo__value">{bpm}</span>
            </label>
          </div>
        ) : mode === "practice" ? (
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
        ) : (
          <div className="transport">
            <button type="button" className="btn btn--primary" onClick={ear.play}>
              <Volume2 size={15} aria-hidden /> {ear.status === "listen" ? "Play it" : "Play again"}
            </button>
            <button type="button" className="btn" onClick={ear.reveal} disabled={ear.revealed}>
              Show it
            </button>
            <button type="button" className="btn" onClick={ear.restart}>
              <RotateCcw size={15} aria-hidden /> Restart
            </button>
          </div>
        )}
      </div>

      <div className={cn("cue", mode !== "listen" && `cue--${cueTone}`)}>
        {verdict ? (
          <>
            <span className="cue__label">Pass finished</span>
            <span className="cue__hint">{verdict}</span>
          </>
        ) : mode === "listen" ? (
          <>
            <span className="cue__label">{currentStep?.label ?? lesson.tagline}</span>
            <span className="cue__hint">{running ? "Watch the keys, then try it yourself." : "Press Play to hear it."}</span>
          </>
        ) : mode === "practice" ? (
          <>
            <span className="cue__label">{currentStep?.label ?? "Play the outlined keys"}</span>
            <span className="cue__hint">
              {practice.status === "correct" ? "That is it." : practice.wrongNotes.size > 0 ? "The red keys are not in this step. Lift them and try again." : targetNames ?? "Hold every outlined key at the same time."}
            </span>
          </>
        ) : mode === "timed" ? (
          <>
            <span className="cue__label">{currentStep?.label ?? (running ? "Count in" : "Timed")}</span>
            <span className="cue__hint">
              {!running
                ? `Press Start. The band plays, the steps light up, you play them on the beat. ${exercise.mastery.bpm ? `Done at ${exercise.mastery.bpm} or faster.` : ""}`
                : timed.last === "early"
                  ? "Right notes, a little early. Let the beat come to you."
                  : timed.last === "late"
                    ? "Right notes, a little late."
                  : timed.last === "miss"
                    ? "Missed that one. Keep going."
                    : timed.last === "wrong"
                      ? "A wrong note in there."
                      : "On the beat."}
            </span>
          </>
        ) : mode === "improv" ? (
          <>
            <span className="cue__label">{lesson.harmony ? findRegion(lesson.harmony, activeIndex)?.symbol ?? lesson.title : lesson.title}</span>
            <span className="cue__hint">{running ? "The outlined keys are this chord's tones." : "Press Start and play over the band."}</span>
          </>
        ) : (
          <>
            <span className="cue__label">{ear.status === "finished" ? "Done" : `Chord ${ear.index + 1} of ${lesson.steps.length}`}</span>
            <span className="cue__hint">
              {ear.status === "listen"
                ? "Press Play it, then play the chord back in any octave."
                : ear.status === "correct"
                  ? "That is the one."
                  : ear.status === "wrong"
                    ? "Not that note. Lift and try again."
                    : ear.status === "finished"
                      ? "All of them."
                      : "Play it back. Any octave counts."}
            </span>
          </>
        )}
      </div>

      {mode === "improv" ? (
        <ImprovMeter session={improv} target={exercise.mastery.accuracy} />
      ) : (
        <StepStrip steps={mode === "ear" ? earStrip : lesson.steps} activeIndex={mode === "ear" ? ear.index : activeIndex} completed={mode === "practice" ? practice.results.length : mode === "timed" ? timed.results.length : mode === "ear" ? ear.results.length : 0} />
      )}

      {showsChart && <SheetMusic lesson={lesson} activeIndex={activeIndex} onBar={mode === "listen" ? onBar : undefined} />}

      <PianoKeyboard low={lesson.range.low} high={lesson.range.high} spelling={lesson.spelling} labelMode={labelMode} highlights={highlights} fingering={fingering} degrees={degrees} hands={hands} onNoteDown={noteDown} onNoteUp={noteUp} />

      {(mode === "listen" || mode === "timed") && <HandLegend hands={lessonHands} />}

      {keys.length > 1 && <KeyPicker current={keyName} done={doneKeys} onChange={changeKey} keys={keys} />}

      {lesson.harmony && mode === "listen" && (
        <TheoryPanel harmony={lesson.harmony} activeStep={activeIndex} selected={studying} detail={!running} notes={currentStep?.notes ?? EMPTY_NOTES} spelling={lesson.spelling} hands={hands} onSelect={setStudying} />
      )}

      {varied && mode !== "practice" && <VariationPicker value={variation} onChange={changeVariation} />}

      <KeyLegend base={base} spelling={lesson.spelling} labelMode={labelMode} onLabelMode={setLabelMode} engineKind={engine.kind} midi={midi} />
    </div>
  );
}

function AudioGate({ status, progress, onStart }: { status: string; progress: { loaded: number; total: number }; onStart(): void }) {
  const loading = status === "loading";
  const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
  return (
    <div className="gate">
      <h2 className="gate__title">Hear this exercise</h2>
      <p className="gate__body">The piano loads on your first click, then plays straight away. Browsers only allow sound after a click.</p>
      <button type="button" className="btn btn--primary btn--lg" onClick={onStart} disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="spin" aria-hidden /> Loading piano {pct > 0 ? `${pct}%` : ""}
          </>
        ) : (
          <>
            <Play size={16} aria-hidden /> Start
          </>
        )}
      </button>
    </div>
  );
}
