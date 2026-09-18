import { describe, expect, it } from "vitest";
import { exercises, exercisesIn, units } from "@/lib/curriculum/tree";
import { sheetOf } from "@/lib/lessons/notation";
import { KEYS } from "@/lib/lessons/transpose";
import { inScale, parseChord } from "@/lib/music/chords";
import { etudes } from "./etudes";
import { parseTune } from "./parse";

describe("etudes", () => {
  it("closes every unit with its etude", () => {
    for (const unit of units) {
      const inUnit = exercisesIn(unit.id);
      expect(inUnit.filter((e) => e.etude).map((e) => e.id), unit.id).toEqual([etudes[unit.id].slug]);
      expect(inUnit[inUnit.length - 1].etude, unit.id).toBe(true);
    }
  });

  for (const [unit, tune] of Object.entries(etudes)) {
    it(`${unit}: the tune fills the form and stays inside its chords`, () => {
      const { bars, beatsPerBar, melody } = parseTune(tune);
      const last = melody[melody.length - 1];
      expect(last.start + last.beats).toBeLessThanOrEqual(bars.length * beatsPerBar);
      expect(last.start + last.beats).toBeGreaterThan((bars.length - 2) * beatsPerBar);

      const chordAt = (beat: number) => {
        let t = Math.floor(beat / beatsPerBar) * beatsPerBar;
        for (const c of bars[Math.floor(beat / beatsPerBar)].chords) {
          if (beat < t + c.beats) return c.symbol;
          t += c.beats;
        }
        throw new Error(`No chord at beat ${beat}`);
      };
      // A blues tune is allowed its blue notes; everything else is in the scale.
      if (tune.style === "blues") return;
      for (const note of melody) {
        const symbol = chordAt(note.start);
        expect(inScale(parseChord(symbol), note.midi), `${symbol} at beat ${note.start}`).toBe(true);
      }
    });
  }

  it("gives every etude a score and the full band in every key", () => {
    for (const e of exercises.filter((x) => x.etude)) {
      for (const key of e.keys === "all" ? KEYS : e.keys) {
        const lesson = e.generate(key);
        expect(sheetOf(lesson), `${e.id} ${key}`).not.toBeNull();
        const { vibes, horns } = lesson.band!.ensemble!;
        expect(vibes.length, `${e.id} ${key}`).toBeGreaterThan(0);
        expect(horns.length, `${e.id} ${key}`).toBeGreaterThan(0);
        const total = lesson.band!.bass.length;
        for (const h of [...vibes, ...horns]) expect(h.beat + h.beats, `${e.id} ${key}`).toBeLessThanOrEqual(total);
      }
    }
  });
});
