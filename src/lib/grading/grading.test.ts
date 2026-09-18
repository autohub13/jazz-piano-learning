import { describe, expect, it } from "vitest";
import { findExercise } from "@/lib/curriculum/tree";
import { classify, scoreImprov } from "./improv";
import { freshNotes, stepAt, summarise, timedSteps } from "./timed";

describe("timed", () => {
  it("finds the step at a time, allowing an early strike", () => {
    const steps = [
      { notes: [60], beats: 1 },
      { notes: [62], beats: 1 },
      { notes: [64], beats: 2 },
    ];
    const timed = timedSteps(steps, 120); // 0.5 s a beat
    expect(stepAt(timed, -0.5)).toBe(-1);
    expect(stepAt(timed, 0)).toBe(0);
    expect(stepAt(timed, 0.45)).toBe(1); // just early for step 1
    expect(stepAt(timed, 0.85)).toBe(1);
    expect(stepAt(timed, 1.0)).toBe(2);
    expect(stepAt(timed, 2.5)).toBe(3);
  });

  it("only asks for fresh notes and summarises hits", () => {
    expect(freshNotes({ notes: [50, 53, 60], beats: 1, tied: [true, true, false] })).toEqual([60]);
    const s = summarise([
      { index: 0, hit: true, onTime: true, wrongNotes: 0 },
      { index: 1, hit: true, onTime: false, wrongNotes: 0 },
      { index: 2, hit: false, onTime: false, wrongNotes: 0 },
      { index: 3, hit: true, onTime: true, wrongNotes: 1 },
    ]);
    expect(s.accuracy).toBe(0.5);
    expect(s.timing).toBe(0.5);
  });
});

describe("improv", () => {
  const lesson = findExercise("improv-ii-v-i")!.generate("C");
  const bpm = 120;
  it("classifies notes against the chord under the clock", () => {
    // Bar one is Dm7: F is a chord tone, G is dorian, Eb is outside.
    expect(classify(lesson, 0.01, bpm, 65)?.klass).toBe("chord");
    expect(classify(lesson, 0.01, bpm, 67)?.klass).toBe("scale");
    expect(classify(lesson, 0.01, bpm, 63)?.klass).toBe("outside");
    expect(classify(lesson, 0.01, bpm, 65)?.strong).toBe(true);
    expect(classify(lesson, 0.51, bpm, 65)?.strong).toBe(false);
    // Bar two is G7: B struck on the change is a guide tone.
    const b = classify(lesson, 2.0, bpm, 71)!;
    expect(b.symbol).toBe("G7");
    expect(b.guide).toBe(true);
  });

  it("scores a line", () => {
    const line = [65, 69, 72, 64, 71, 74, 76, 72].map((midi, i) => classify(lesson, i * 0.5 + 0.01, bpm, midi)!);
    const s = scoreImprov(line);
    expect(s.notes).toBe(8);
    expect(s.inScale).toBe(1);
    expect(s.score).toBeGreaterThan(0.8);
    expect(scoreImprov([]).score).toBe(0);
  });
});
