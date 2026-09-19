import { describe, expect, it } from "vitest";
import { findExercise } from "@/lib/curriculum/tree";
import { shuffledOrder } from "./ear";
import { classify, scoreImprov } from "./improv";
import { freshNotes, onTimeWindow, stepAt, summarise, timedSteps } from "./timed";

describe("timed", () => {
  it("finds the step at a time, allowing an early strike", () => {
    const steps = [
      { notes: [60], beats: 1 },
      { notes: [62], beats: 1 },
      { notes: [64], beats: 2 },
    ];
    const timed = timedSteps(steps, 120); // 0.5 s a beat
    expect(stepAt(timed, -0.5, 0.12)).toBe(-1);
    expect(stepAt(timed, 0, 0.12)).toBe(0);
    expect(stepAt(timed, 0.45, 0.12)).toBe(1); // just early for step 1
    expect(stepAt(timed, 0.85, 0.12)).toBe(1);
    expect(stepAt(timed, 1.0, 0.12)).toBe(2);
    expect(stepAt(timed, 2.5, 0.12)).toBe(3);
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

  it("narrows the window at speed and says which way the time leans", () => {
    expect(onTimeWindow(60)).toBe(0.12);
    expect(onTimeWindow(240)).toBeCloseTo(0.0625);
    const s = summarise([
      { index: 0, hit: true, onTime: false, offset: -0.2, wrongNotes: 0 },
      { index: 1, hit: true, onTime: true, offset: -0.1, wrongNotes: 0 },
      { index: 2, hit: false, onTime: false, wrongNotes: 0 },
    ]);
    expect(s.lean).toBeCloseTo(-0.15);
  });
});

describe("ear", () => {
  it("asks every prompt once, and keeps a cadence together and in order", () => {
    const steps = findExercise("ear-cadence")!.generate("C").steps;
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const order = shuffledOrder(steps, random);
    expect([...order].sort((a, b) => a - b)).toEqual(steps.map((_, i) => i));
    order.forEach((k, pos) => {
      if (pos > 0 && steps[k].label === steps[order[pos - 1]].label) expect(k).toBe(order[pos - 1] + 1);
    });
    const quality = findExercise("ear-quality")!.generate("C").steps;
    expect(shuffledOrder(quality, random)).not.toEqual(quality.map((_, i) => i));
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

  it("takes the blues scale over every chord of a blues", () => {
    const blues = findExercise("improv-f-blues")!.generate("F");
    // Bar one is F7: Ab and B are the blue notes, F# is nobody's.
    expect(classify(blues, 0.01, bpm, 68)?.klass).toBe("scale");
    expect(classify(blues, 0.01, bpm, 71)?.klass).toBe("scale");
    expect(classify(blues, 0.01, bpm, 66)?.klass).toBe("outside");
    // Not on a tune that is not a blues.
    expect(classify(lesson, 4.01, bpm, 63)?.klass).toBe("outside");
    // One pass up the blues scale and back, a note a beat, clears the bar.
    const scale = [65, 68, 70, 71, 72, 75, 77, 75, 72, 71, 70, 68];
    const line = Array.from({ length: 48 }, (_, i) => classify(blues, i * 0.5 + 0.01, bpm, scale[i % 12])!);
    expect(scoreImprov(line).inScale).toBe(1);
  });

  it("hears a half step into a chord tone as an approach, not a wrong note", () => {
    // Over Dm7: G# leads up into A, the 5th. Alone it is outside.
    const approach = [classify(lesson, 0.26, bpm, 68)!, classify(lesson, 0.51, bpm, 69)!];
    expect(approach[0].klass).toBe("outside");
    expect(scoreImprov(approach).inScale).toBe(1);
    const stranded = [classify(lesson, 0.26, bpm, 68)!, classify(lesson, 0.51, bpm, 72)!];
    expect(scoreImprov(stranded).inScale).toBe(0.5);
  });
});
