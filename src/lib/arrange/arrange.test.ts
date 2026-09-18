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

describe("hand textures", () => {
  const saints = tunes.find((t) => t.slug === "when-the-saints")!;
  const blues = tunes.find((t) => t.slug === "f-blues")!;
  const shell = levelVariation(2);

  /** Each step with its start in beats, its chord, and what each hand strikes. */
  function walk(lesson: ReturnType<typeof arrangeTune>) {
    let t = 0;
    return lesson.steps.map((step, i) => {
      const region = [...lesson.harmony!].reverse().find((r) => r.fromStep <= i) ?? lesson.harmony![0];
      const pick = (hand: "left" | "right", struck: boolean) =>
        step.notes.filter((_, j) => step.hands?.[j] === hand && (!struck || !step.tied?.[j]));
      const out = {
        start: t,
        chord: parseChord(region.symbol),
        regionStart: region.fromStep === i,
        left: pick("left", false),
        right: pick("right", false),
        leftStruck: pick("left", true),
        rightStruck: pick("right", true),
      };
      t += step.beats;
      return out;
    });
  }

  it("melody on top: root in the left hand, a close chord tone inversion under the tune", () => {
    for (const key of KEYS) {
      const lesson = arrangeTune(saints, key, { ...shell, texture: "melodyTop" });
      const pickup = lesson.band!.startBeat;
      let blocks = 0;
      for (const s of walk(lesson)) {
        expect(s.left.length).toBeLessThanOrEqual(1);
        if (s.start < pickup) expect(s.right).toHaveLength(1);
        if (s.left.length) expect(s.left[0] % 12).toBe(s.chord.rootPc);
        if (s.rightStruck.length > 1) {
          blocks++;
          expect(s.rightStruck).toHaveLength(4);
          expect(Math.max(...s.rightStruck) - Math.min(...s.rightStruck)).toBeLessThan(12);
          const d = s.chord.degrees;
          const tones = [d.R, d[3], d[5], d[7]].map((x) => (s.chord.rootPc + x) % 12);
          for (const n of s.rightStruck) expect(tones).toContain(n % 12);
        }
      }
      expect(blocks).toBeGreaterThan(10);
    }
  });

  it("in the gaps: the left hand plays on a change or where the tune starts nothing", () => {
    for (const key of KEYS) {
      const lesson = arrangeTune(blues, key, { ...shell, rhythm: "fill" });
      for (const s of walk(lesson)) {
        if (s.leftStruck.length && !s.regionStart) expect(s.rightStruck).toHaveLength(0);
      }
    }
  });

  it("stride: bass on one and three, root on one, chord on two and four", () => {
    for (const key of KEYS) {
      const lesson = arrangeTune(saints, key, { ...shell, texture: "stride" });
      const pickup = lesson.band!.startBeat;
      for (const s of walk(lesson)) {
        if (s.start < pickup || !Number.isInteger(s.start)) continue;
        const beat = (s.start - pickup) % 4;
        expect(s.leftStruck.length, `${key} ${s.start}`).toBe(beat % 2 === 0 ? 1 : s.leftStruck.length);
        if (beat % 2 === 1) expect(s.leftStruck.length).toBeGreaterThanOrEqual(2);
        if (beat === 0) expect(s.leftStruck[0] % 12).toBe(s.chord.rootPc);
      }
    }
  });
});
