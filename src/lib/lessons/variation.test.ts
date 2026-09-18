import { describe, expect, it } from "vitest";
import { lessons } from "./curriculum";
import { inScale, parseChord } from "@/lib/music/chords";
import { AS_WRITTEN, CHOICES, applyVariation, parseVariation, formatVariation, type Variation } from "./variation";
import type { Lesson } from "./types";

const pieces = lessons.filter((l) => l.harmony && l.harmony.length > 0);

function every(): Variation[] {
  const out: Variation[] = [];
  for (const voicing of CHOICES.voicing)
    for (const reharm of CHOICES.reharm)
      for (const melody of CHOICES.melody)
        for (const rhythm of CHOICES.rhythm) out.push({ voicing, reharm, melody, rhythm });
  return out;
}

const totalBeats = (l: Lesson) => l.steps.reduce((sum, s) => sum + s.beats, 0);

describe("applyVariation", () => {
  it("finds the three pieces with harmony", () => {
    expect(pieces.map((p) => p.slug).sort()).toEqual(["ii-v-i", "the-vamp", "when-the-saints"]);
  });

  it("returns the lesson untouched when everything is as written", () => {
    for (const p of pieces) expect(applyVariation(p, AS_WRITTEN)).toBe(p);
  });

  for (const piece of pieces) {
    describe(piece.slug, () => {
      it.each(every().map((v) => [formatVariation(v) ?? "written", v] as const))("%s", (_, v) => {
        const out = applyVariation(piece, v);

        // The form never changes length, so the band stays on the grid.
        expect(totalBeats(out)).toBeCloseTo(totalBeats(piece), 6);
        expect(out.band?.bass.length).toBe(piece.band?.bass.length);

        const harmony = out.harmony!;
        harmony.forEach((r, i) => {
          expect(r.fromStep).toBeGreaterThanOrEqual(0);
          expect(r.fromStep).toBeLessThan(out.steps.length);
          if (i > 0) expect(r.fromStep).toBeGreaterThan(harmony[i - 1].fromStep);
        });

        out.steps.forEach((step, i) => {
          expect(step.beats).toBeGreaterThan(0);
          for (const n of step.notes) {
            expect(n).toBeGreaterThanOrEqual(piece.range.low);
            expect(n).toBeLessThanOrEqual(piece.range.high);
          }
          // A tied note must have been sounding in the step before.
          step.tied?.forEach((t, j) => {
            if (t) expect(out.steps[i - 1].notes).toContain(step.notes[j]);
          });
          // The left hand stays under the tune.
          const left = step.notes.filter((_, j) => step.hands?.[j] === "left");
          const right = step.notes.filter((_, j) => step.hands?.[j] === "right");
          if (v.voicing !== "written" && left.length && right.length) {
            expect(Math.max(...left)).toBeLessThan(Math.min(...right));
          }
          // Generated lines stay inside the chord's scale. Enclosures borrow a
          // chromatic note below the target on purpose, and an anticipated
          // chord arrives while the old tune note is still in the air.
          if ((v.melody === "arpeggio" || v.melody === "scaleRun") && v.rhythm !== "anticipate") {
            const region = [...harmony].reverse().find((r) => r.fromStep <= i)!;
            const chord = parseChord(region.symbol);
            step.notes.forEach((n, j) => {
              if (step.hands?.[j] === "right" && !step.tied?.[j]) expect(inScale(chord, n)).toBe(true);
            });
          }
        });
      });
    });
  }

  it("reharmonises the vamp the way a player would", () => {
    const vamp = pieces.find((p) => p.slug === "the-vamp")!;
    const symbols = (reharm: Variation["reharm"]) =>
      applyVariation(vamp, { ...AS_WRITTEN, reharm }).harmony!.map((r) => r.symbol);
    expect(symbols("tritone")).toEqual(["Dm7", "Db7#11", "Cmaj7"]);
    expect(symbols("secondary")).toEqual(["Dm7", "D7", "G7", "Cmaj7"]);
    expect(symbols("passingDim")).toEqual(["Dm7", "F#dim7", "G7", "Bdim7", "Cmaj7"]);
  });
});

describe("parseVariation", () => {
  it("round trips and forgives junk", () => {
    const v: Variation = { voicing: "rootless", reharm: "tritone", melody: "written", rhythm: "charleston" };
    expect(parseVariation(formatVariation(v))).toEqual(v);
    expect(parseVariation("nonsense.x")).toEqual(AS_WRITTEN);
    expect(parseVariation(null)).toEqual(AS_WRITTEN);
  });
});
