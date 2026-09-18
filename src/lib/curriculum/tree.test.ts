import { describe, expect, it } from "vitest";
import { KEYS } from "@/lib/lessons/transpose";
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
