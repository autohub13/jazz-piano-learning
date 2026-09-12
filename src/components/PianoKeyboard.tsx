"use client";

import { memo, useMemo } from "react";
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

  return (
    <div className="piano" role="group" aria-label="Piano keyboard">
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
  );
}

export const PianoKeyboard = memo(PianoKeyboardImpl);
