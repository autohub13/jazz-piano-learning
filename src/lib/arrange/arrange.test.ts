import { describe, expect, it } from "vitest";
import { KEYS } from "@/lib/lessons/transpose";
import { inScale, parseChord } from "@/lib/music/chords";
import { parseTune } from "@/lib/tunes/parse";
import { tunes } from "@/lib/tunes/library";
import { arrangeTune, levelVariation } from "./tune";
import { bassLine } from "./bass";

const totalBeats = (steps: { beats: number }[]) => steps.reduce((s, x) => s + x.beats, 0);

describe("parseTune", () => {
  it("expands repeats and splits bars", () => {
    const p = parseTune(tunes.find((t) => t.slug === "rhythm-changes")!);
    expect(p.bars).toHaveLength(32);
    expect(p.bars[0].chords).toEqual([
      { symbol: "Bbmaj7", beats: 2 },
      { symbol: "G7", beats: 2 },
    ]);
  });

  it("reads a pickup and lyrics", () => {
    const p = parseTune(tunes.find((t) => t.slug === "when-the-saints")!);
    expect(p.pickupBeats).toBe(3);
    expect(p.melody[0]).toEqual({ start: -3, beats: 1, midi: 60, label: "Oh" });
    const last = p.melody[p.melody.length - 1];
    expect(last.start + last.beats).toBe(64);
  });
});

describe("arrangeTune", () => {
  for (const tune of tunes) {
    it(`${tune.slug} arranges in every key at every level`, () => {
      const parsed = parseTune(tune);
      const formBeats = parsed.bars.length * parsed.beatsPerBar + parsed.pickupBeats;
      for (const key of KEYS) {
        for (const level of [2, 3, 4, 5, 6]) {
          const lesson = arrangeTune(tune, key, levelVariation(level));
          expect(totalBeats(lesson.steps)).toBeCloseTo(formBeats, 6);
          expect(lesson.band!.bass).toHaveLength(parsed.bars.length * parsed.beatsPerBar);
          for (const step of lesson.steps) {
            expect(step.beats).toBeGreaterThan(0);
            for (const n of step.notes) {
              expect(n).toBeGreaterThanOrEqual(lesson.range.low);
              expect(n).toBeLessThanOrEqual(lesson.range.high);
            }
            const left = step.notes.filter((_, j) => step.hands?.[j] === "left");
            const right = step.notes.filter((_, j) => step.hands?.[j] === "right");
            if (left.length && right.length) expect(Math.max(...left)).toBeLessThan(Math.min(...right));
          }
          const h = lesson.harmony!;
          h.forEach((r, i) => {
            if (i > 0) expect(r.fromStep).toBeGreaterThanOrEqual(h[i - 1].fromStep);
            expect(r.fromStep).toBeLessThan(lesson.steps.length);
          });
        }
      }
    });
  }

  it("names numerals in the key", () => {
    const lesson = arrangeTune(tunes.find((t) => t.slug === "f-blues")!, "F");
    expect(lesson.harmony!.map((r) => r.numeral).slice(0, 2)).toEqual(["I7", "IV7"]);
    const eb = arrangeTune(tunes.find((t) => t.slug === "f-blues")!, "Eb");
    expect(eb.harmony![0].symbol).toBe("Eb7");
  });
});

describe("bassLine", () => {
  it("puts the root on one and stays in the chord's scale", () => {
    const line = bassLine(
      [
        { symbol: "Dm7", beats: 4 },
        { symbol: "G7", beats: 4 },
        { symbol: "Cmaj7", beats: 8 },
      ],
      "swing",
      4,
    );
    expect(line).toHaveLength(16);
    expect(line[0]! % 12).toBe(2);
    expect(line[4]! % 12).toBe(7);
    expect(line[8]! % 12).toBe(0);
    // Beats two and three are chord tones.
    expect(inScale(parseChord("Dm7"), line[1]!)).toBe(true);
    expect(inScale(parseChord("Dm7"), line[2]!)).toBe(true);
    for (const n of line) {
      expect(n).toBeGreaterThanOrEqual(36);
      expect(n).toBeLessThanOrEqual(55);
    }
  });
});
