"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { Midi } from "@/lib/music/notes";

export interface PianoKeyProps {
  midi: Midi;
  isBlack: boolean;
  leftPct: number;
  widthPct: number;
  heightPct: number;
  /** Spelled note name, e.g. "Eb4". The key's accessible name. */
  name: string;
  label: string | null;
  finger: number | null;
  /** What this note is doing in the sounding chord, e.g. "R", "3", "b7". */
  degree: string | null;
  /** Which hand plays it. Only tints the key while it is sounding. */
  hand: "left" | "right" | null;
  isActive: boolean;
  isTarget: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onDown(midi: Midi): void;
  onUp(midi: Midi): void;
}

/**
 * Memoized and given primitives only. The parent does the Set lookups inside
 * its map and passes booleans, so a key re-renders only when its own state
 * flips: three to five of thirty-seven keys per step, not all of them.
 */
function PianoKeyImpl({
  midi,
  isBlack,
  leftPct,
  widthPct,
  heightPct,
  name,
  label,
  finger,
  degree,
  hand,
  isActive,
  isTarget,
  isCorrect,
  isWrong,
  onDown,
  onUp,
}: PianoKeyProps) {
  return (
    <button
      type="button"
      aria-label={name}
      aria-pressed={isActive}
      data-midi={midi}
      className={cn("piano-key", isBlack ? "piano-key--black" : "piano-key--white", {
        "is-active": isActive,
        "is-target": isTarget,
        "is-correct": isCorrect,
        "is-wrong": isWrong,
        "is-left": hand === "left",
        "is-right": hand === "right",
      })}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        zIndex: isBlack ? 2 : 1,
      }}
      onPointerDown={(e) => {
        // Capture makes a press-and-drag off the key release correctly instead
        // of leaving the note stuck on.
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown(midi);
      }}
      onPointerUp={() => onUp(midi)}
      onPointerCancel={() => onUp(midi)}
    >
      {degree !== null && <span className="piano-key__degree">{degree}</span>}
      {finger !== null && <span className="piano-key__finger">{finger}</span>}
      {label !== null && <span className="piano-key__label">{label}</span>}
    </button>
  );
}

export const PianoKey = memo(PianoKeyImpl);
