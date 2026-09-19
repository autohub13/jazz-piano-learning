import { describe, expect, it } from "vitest";
import { exercisesIn, findExercise, units } from "@/lib/curriculum/tree";
import { sheetOf } from "@/lib/lessons/notation";
import { inScale, parseChord } from "@/lib/music/chords";
import { parseTune } from "./parse";
import { songs } from "./songs";

describe("song book", () => {
  it("gives every unit at least five songs to play", () => {
    for (const unit of units) {
      // The vamp is an authored piece, so it has no library tune behind it.
      const played = exercisesIn(unit.id).filter(
        (e) => e.tune || e.etude || e.id.startsWith("song-") || e.id === "the-vamp",
      );
      expect(played.length, unit.id).toBeGreaterThanOrEqual(5);
    }
  });

  it("only has songs for units that exist, under unique names", () => {
    const slugs = Object.values(songs).flatMap((list) => list.map((s) => s.tune.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const unit of Object.keys(songs)) expect(units.some((u) => u.id === unit), unit).toBe(true);
  });

  for (const [unit, list] of Object.entries(songs)) {
    for (const { tune, points } of list) {
      it(`${unit}: ${tune.slug} fills its form, stays inside its chords, and engraves`, () => {
        expect(points.length).toBeGreaterThanOrEqual(3);
        const { bars, beatsPerBar, melody } = parseTune(tune);
        const last = melody[melody.length - 1];
        expect(last.start + last.beats).toBeLessThanOrEqual(bars.length * beatsPerBar);
        expect(last.start + last.beats).toBeGreaterThan((bars.length - 2) * beatsPerBar);

        const chordAt = (beat: number) => {
          const bar = bars[Math.max(0, Math.floor(beat / beatsPerBar))];
          let t = Math.floor(beat / beatsPerBar) * beatsPerBar;
          for (const c of bar.chords) {
            if (beat < t + c.beats) return c.symbol;
            t += c.beats;
          }
          throw new Error(`No chord at beat ${beat}`);
        };
        // A blues tune is allowed its blue notes, and a pickup has no chord yet.
        if (tune.style !== "blues") {
          for (const note of melody.filter((n) => n.start >= 0)) {
            const symbol = chordAt(note.start);
            expect(inScale(parseChord(symbol), note.midi), `${symbol} at beat ${note.start}`).toBe(true);
          }
        }

        const exercise = findExercise(tune.slug)!;
        expect(exercise.keys).toContain(tune.key);
        for (const key of exercise.keys) expect(sheetOf(exercise.generate(key as never)), key).not.toBeNull();
      });
    }
  }
});
