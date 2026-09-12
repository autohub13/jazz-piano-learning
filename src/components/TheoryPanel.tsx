"use client";

// The chord map, and what is inside whichever chord you are looking at.
//
// The one rule here: prose never appears while the music is running. At a
// hundred and eight beats a minute a chord is on screen for about two seconds,
// and the sentences below take about twelve to read, so streaming them past is
// worse than useless. While it plays this is a position indicator. The moment
// it stops, or you pick a chord, it becomes an explanation.

import { useMemo } from "react";
import type { Hand, HarmonyRegion } from "@/lib/lessons/types";
import { degreeName, rootPitchClass } from "@/lib/music/harmony";
import { pitchClassName, type Midi, type Spelling } from "@/lib/music/notes";
import { cn } from "@/lib/utils";

/** The chord covering this step, or null when nothing is sounding. */
export function findRegion(harmony: HarmonyRegion[], step: number): HarmonyRegion | null {
  if (step < 0) return null;
  let current: HarmonyRegion | null = null;
  for (const region of harmony) {
    if (region.fromStep > step) break;
    current = region;
  }
  return current;
}

/** Index of the chord covering this step, or -1. */
export function findRegionIndex(harmony: HarmonyRegion[], step: number): number {
  if (step < 0) return -1;
  let current = -1;
  for (let i = 0; i < harmony.length; i++) {
    if (harmony[i].fromStep > step) break;
    current = i;
  }
  return current;
}

export interface TheoryPanelProps {
  harmony: HarmonyRegion[];
  /** Index of the sounding step, or -1. Used when nothing is picked. */
  activeStep: number;
  /** Chord being studied. Wins over whatever is sounding. */
  selected: number | null;
  /** Show the breakdown. False while the music is running. */
  detail: boolean;
  /** The notes to name. */
  notes: readonly Midi[];
  spelling: Spelling;
  /** Colours each note the same way its key is coloured. */
  hands?: ReadonlyMap<Midi, Hand>;
  /** Omit to make the chords unclickable. */
  onSelect?: (index: number) => void;
}

export function TheoryPanel({
  harmony,
  activeStep,
  selected,
  detail,
  notes,
  spelling,
  hands,
  onSelect,
}: TheoryPanelProps) {
  const currentIndex = selected ?? findRegionIndex(harmony, activeStep);
  const region = currentIndex >= 0 ? harmony[currentIndex] : null;

  const tones = useMemo(() => {
    if (!region) return [];
    const rootPc = rootPitchClass(region.symbol);
    // Low to high, so the list reads up the keyboard the way it is played.
    return [...notes]
      .sort((a, b) => a - b)
      .map((midi) => ({
        midi,
        name: pitchClassName(midi, spelling),
        degree: degreeName(rootPc, midi, region.symbol),
        hand: hands?.get(midi) ?? null,
      }));
  }, [region, notes, spelling, hands]);

  return (
    <div className={cn("theory", !detail && "is-running")}>
      <ol className="theory__chips">
        {harmony.map((r, i) => {
          const inside = (
            <>
              <span className="theory__numeral">{r.numeral}</span>
              <span className="theory__symbol">{r.symbol}</span>
            </>
          );
          return (
            <li key={`${r.fromStep}-${r.symbol}`}>
              {onSelect ? (
                <button
                  type="button"
                  className={cn("theory__chip", i === currentIndex && "is-on")}
                  aria-pressed={i === selected}
                  onClick={() => onSelect(i)}
                >
                  {inside}
                </button>
              ) : (
                <span className={cn("theory__chip", i === currentIndex && "is-on")}>{inside}</span>
              )}
            </li>
          );
        })}
      </ol>

      {!detail ? (
        <p className="theory__idle">
          {onSelect
            ? "Stop it, or pick a chord above, to see what is inside it."
            : "Watch the keys."}
        </p>
      ) : region ? (
        <div className="theory__detail">
          <ul className="theory__notes">
            {tones.map((tone, i) => (
              <li
                key={tone.midi}
                // The top note is the melody. Marking it explains why the same
                // degree can appear twice: the tune often doubles a guide tone.
                className={cn(
                  "theory__note",
                  tone.hand && `is-${tone.hand}`,
                  i === tones.length - 1 && "is-top",
                )}
              >
                <span className="theory__pitch">{tone.name}</span>
                <span className="theory__degree">{tone.degree}</span>
                {i === tones.length - 1 && <span className="theory__top">on top</span>}
              </li>
            ))}
          </ul>
          <p className="theory__role">{region.role}</p>
          {region.move && <p className="theory__move">{region.move}</p>}
          <p className="theory__key">
            Those small numbers are the same ones printed on the keys. R is the
            root, 3 the third, 5 the fifth, 7 the seventh, 9 the ninth. A flat
            sign means the note is lowered by a half step.
          </p>
        </div>
      ) : (
        <p className="theory__idle">
          {onSelect
            ? "Pick a chord above to take it apart, or press play to hear the lot."
            : "Press play to hear it."}
        </p>
      )}
    </div>
  );
}
