"use client";

import { KEY_SPAN } from "@/lib/music/computerKeys";
import { midiToName, type Midi, type Spelling } from "@/lib/music/notes";
import type { LabelMode } from "./PianoKeyboard";
import { cn } from "@/lib/utils";

const LOWER = [
  ["Z", "C"], ["S", "C#"], ["X", "D"], ["D", "D#"], ["C", "E"],
  ["V", "F"], ["G", "F#"], ["B", "G"], ["H", "G#"], ["N", "A"], ["J", "A#"], ["M", "B"],
];
const UPPER = [
  ["Q", "C"], ["2", "C#"], ["W", "D"], ["3", "D#"], ["E", "E"],
  ["R", "F"], ["5", "F#"], ["T", "G"], ["6", "G#"], ["Y", "A"], ["7", "A#"], ["U", "B"],
];

export function KeyLegend({
  base,
  spelling,
  labelMode,
  onLabelMode,
  engineKind,
}: {
  base: Midi;
  spelling: Spelling;
  labelMode: LabelMode;
  onLabelMode(mode: LabelMode): void;
  engineKind: "sampled" | "synth";
}) {
  return (
    <div className="legend">
      <div className="legend__rows">
        <div className="legend__row">
          <span className="legend__caption">Lower octave</span>
          {LOWER.map(([key, note]) => (
            <kbd key={key} className={cn("legend__key", note.includes("#") && "is-black")}>
              {key}
            </kbd>
          ))}
        </div>
        <div className="legend__row">
          <span className="legend__caption">Upper octave</span>
          {UPPER.map(([key, note]) => (
            <kbd key={key} className={cn("legend__key", note.includes("#") && "is-black")}>
              {key}
            </kbd>
          ))}
        </div>
      </div>

      <div className="legend__meta">
        <span>
          Typing plays {midiToName(base, spelling)} to {midiToName(base + KEY_SPAN, spelling)}.
          Arrow up and down shift the octave.
        </span>
        <span>
          Most keyboards report only a few keys at once, so click the four-note chords
          with the mouse if typing them drops a note.
        </span>
        {engineKind === "synth" && (
          <span className="legend__warn">
            Piano samples could not be reached, so this is a synthesized fallback.
          </span>
        )}
        <label className="legend__toggle">
          Key names
          <select value={labelMode} onChange={(e) => onLabelMode(e.target.value as LabelMode)}>
            <option value="none">Off</option>
            <option value="c-only">C only</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
    </div>
  );
}
