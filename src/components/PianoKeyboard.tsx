"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PianoKey } from "./PianoKey";
import { BLACK_H_RATIO, buildKeyboardLayout } from "@/lib/music/keyboardLayout";
import type { Hand } from "@/lib/lessons/types";
import { midiToDualName, midiToName, pitchClass, type Midi, type Spelling } from "@/lib/music/notes";

export type LabelMode = "none" | "c-only" | "all";

export interface Highlights {
  /** Sounding now: the playing step in Listen, the held notes in Practice. */
  active: ReadonlySet<Midi>;
  /** Ghost outline of what to play next. */
  target: ReadonlySet<Midi>;
  correct: ReadonlySet<Midi>;
  wrong: ReadonlySet<Midi>;
}

export const NO_HIGHLIGHTS: Highlights = {
  active: new Set(),
  target: new Set(),
  correct: new Set(),
  wrong: new Set(),
};

export interface PianoKeyboardProps {
  low: Midi;
  high: Midi;
  spelling: Spelling;
  labelMode: LabelMode;
  highlights: Highlights;
  /** MIDI number to finger number, for the current target step. */
  fingering: ReadonlyMap<Midi, number>;
  /** MIDI number to chord degree, for the sounding chord. Omit for none. */
  degrees?: ReadonlyMap<Midi, string>;
  /** MIDI number to the hand playing it. Omit to leave every key one colour. */
  hands?: ReadonlyMap<Midi, Hand>;
  onNoteDown(midi: Midi): void;
  onNoteUp(midi: Midi): void;
}

function labelFor(midi: Midi, mode: LabelMode, spelling: Spelling): string | null {
  if (mode === "none") return null;
  if (mode === "c-only") return pitchClass(midi) === 0 ? midiToName(midi, spelling) : null;
  return midiToDualName(midi);
}

function PianoKeyboardImpl({
  low,
  high,
  spelling,
  labelMode,
  highlights,
  fingering,
  degrees,
  hands,
  onNoteDown,
  onNoteUp,
}: PianoKeyboardProps) {
  const layout = useMemo(() => buildKeyboardLayout(low, high), [low, high]);

  // On a phone the keys keep a size a finger can hit, so the keyboard is wider
  // than the screen and scrolls. A touch on a key has to play it, not pan, so
  // the slider above the keys is what moves along, and the view follows the
  // music on its own.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [position, setPosition] = useState(0);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const room = el.scrollWidth - el.clientWidth;
    setOverflows(room > 1);
    setPosition(room > 1 ? el.scrollLeft / room : 0);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, layout]);

  // What to keep in view: the notes asked for, or else the notes sounding.
  const focus = highlights.target.size > 0 ? highlights.target : highlights.active;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth - el.clientWidth <= 1) return;
    const keys = layout.keys.filter((k) => focus.has(k.midi));
    // Nothing lit yet: start around middle C, where most lessons begin.
    const shown = keys.length > 0 ? keys : layout.keys.filter((k) => k.midi === 60);
    if (shown.length === 0) return;
    const left = (Math.min(...shown.map((k) => k.leftPct)) / 100) * el.scrollWidth;
    const right = (Math.max(...shown.map((k) => k.leftPct + k.widthPct)) / 100) * el.scrollWidth;
    const margin = 24;
    if (left >= el.scrollLeft + margin && right <= el.scrollLeft + el.clientWidth - margin) return;
    el.scrollTo({ left: (left + right) / 2 - el.clientWidth / 2, behavior: "smooth" });
  }, [focus, layout, overflows]);

  return (
    <div className="piano-wrap">
      {overflows && (
        <input
          type="range"
          className="piano-map"
          aria-label="Move along the keyboard"
          min={0}
          max={1000}
          value={Math.round(position * 1000)}
          onChange={(e) => {
            const el = scrollRef.current;
            if (el) el.scrollLeft = (Number(e.target.value) / 1000) * (el.scrollWidth - el.clientWidth);
          }}
        />
      )}
      <div className="piano-scroll" ref={scrollRef} onScroll={measure}>
        <div
          className="piano"
          role="group"
          aria-label="Piano keyboard"
          style={{ "--whites": layout.whiteCount } as CSSProperties}
        >
          {layout.keys.map((k) => (
            <PianoKey
              key={k.midi}
              midi={k.midi}
              isBlack={k.isBlack}
              leftPct={k.leftPct}
              widthPct={k.widthPct}
              heightPct={k.isBlack ? BLACK_H_RATIO * 100 : 100}
              name={midiToName(k.midi, spelling)}
              label={labelFor(k.midi, labelMode, spelling)}
              finger={fingering.get(k.midi) ?? null}
              degree={degrees?.get(k.midi) ?? null}
              hand={hands?.get(k.midi) ?? null}
              isActive={highlights.active.has(k.midi)}
              isTarget={highlights.target.has(k.midi)}
              isCorrect={highlights.correct.has(k.midi)}
              isWrong={highlights.wrong.has(k.midi)}
              onDown={onNoteDown}
              onUp={onNoteUp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const PianoKeyboard = memo(PianoKeyboardImpl);
