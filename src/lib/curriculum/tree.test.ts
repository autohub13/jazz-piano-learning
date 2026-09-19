import { describe, expect, it } from "vitest";
import { KEYS } from "@/lib/lessons/transpose";
import { TEACHING } from "./teaching";
import { exercises, findExercise, units } from "./tree";

describe("skill tree", () => {
  it("has unique ids and valid prerequisites and units", () => {
    const ids = new Set(exercises.map((e) => e.id));
    expect(ids.size).toBe(exercises.length);
    for (const e of exercises) {
      expect(units.some((u) => u.id === e.unit)).toBe(true);
      for (const p of e.prerequisites) {
        const pre = findExercise(p)!;
        expect(pre, `${e.id} needs ${p}`).toBeDefined();
        expect(pre.level).toBeLessThanOrEqual(e.level);
      }
    }
  });

  it("gives every exercise teaching points, and no points to a missing exercise", () => {
    for (const e of exercises) expect(e.teachingPoints.length, e.id).toBeGreaterThanOrEqual(3);
    for (const id of Object.keys(TEACHING)) expect(findExercise(id), id).toBeDefined();
  });

  it("explains every chord it analyses, in every key", () => {
    for (const e of exercises) {
      const keys = e.keys === "all" ? KEYS : e.keys;
      for (const key of keys) {
        for (const region of e.generate(key).harmony ?? []) {
          expect(region.role, `${e.id} ${key} ${region.symbol}`).not.toBe("");
        }
      }
    }
  });

  it("gives the band whole bars that end with the lesson, guitar matching bass", () => {
    for (const e of exercises) {
      const keys = e.keys === "all" ? KEYS : e.keys;
      for (const key of keys) {
        const { band, steps } = e.generate(key);
        if (!band) continue;
        const beats = steps.reduce((sum, s) => sum + s.beats, 0);
        expect(band.startBeat + band.bass.length, `${e.id} ${key}`).toBeCloseTo(beats, 5);
        expect(band.bass.length % band.beatsPerBar, `${e.id} ${key}`).toBe(0);
        if (band.comp) expect(band.comp.length, `${e.id} ${key}`).toBe(band.bass.length);
      }
    }
  });

  it("never asks either hand for more than an octave", () => {
    for (const e of exercises) {
      for (const key of e.keys === "all" ? KEYS : e.keys) {
        for (const step of e.generate(key).steps) {
          for (const hand of ["left", "right"] as const) {
            const notes = step.notes.filter((_, j) => (step.hands?.[j] ?? step.hand ?? "right") === hand);
            if (notes.length) expect(Math.max(...notes) - Math.min(...notes), `${e.id} ${key}`).toBeLessThanOrEqual(12);
          }
        }
      }
    }
  });

  for (const e of exercises) {
    it(`${e.id} generates in every key`, () => {
      const keys = e.keys === "all" ? KEYS : e.keys;
      for (const key of keys) {
        const lesson = e.generate(key);
        expect(lesson.steps.length).toBeGreaterThan(0);
        for (const step of lesson.steps) {
          expect(step.beats).toBeGreaterThan(0);
          for (const n of step.notes) {
            expect(n, `${e.id} ${key}`).toBeGreaterThanOrEqual(lesson.range.low);
            expect(n, `${e.id} ${key}`).toBeLessThanOrEqual(lesson.range.high);
          }
          if (step.fingering) expect(step.fingering).toHaveLength(step.notes.length);
        }
        // Deterministic.
        expect(e.generate(key)).toEqual(lesson);
      }
    });
  }
});
