import { describe, expect, it } from "vitest";
import { buildTimeline, playedBeat, swingAnd } from "./timeline";

describe("swing", () => {
  it("is a triplet at a medium tempo and evens out as the tempo rises", () => {
    expect(swingAnd(100)).toBeCloseTo(2 / 3);
    expect(swingAnd(140)).toBeCloseTo(2 / 3);
    expect(swingAnd(200)).toBeLessThan(swingAnd(140));
    expect(swingAnd(200)).toBeGreaterThan(swingAnd(260));
    expect(swingAnd(260)).toBeCloseTo(0.56);
    expect(swingAnd(320)).toBeCloseTo(0.56);
  });

  it("leaves whole beats alone and moves only the and", () => {
    for (const bpm of [80, 180, 260]) {
      expect(playedBeat(0, bpm)).toBeCloseTo(0);
      expect(playedBeat(7, bpm)).toBeCloseTo(7);
      expect(playedBeat(3 + 2 / 3, bpm)).toBeCloseTo(3 + swingAnd(bpm));
      let last = -1;
      for (let b = 0; b <= 4; b += 1 / 12) {
        expect(playedBeat(b, bpm)).toBeGreaterThan(last);
        last = playedBeat(b, bpm);
      }
    }
  });

  it("times a swung pair by the tempo, and keeps the bar the same length", () => {
    const steps = [
      { notes: [60], beats: 2 / 3 },
      { notes: [62], beats: 1 / 3 },
      { notes: [64], beats: 3 },
    ];
    const slow = buildTimeline(steps, 120);
    expect(slow.timed[1].startSec).toBeCloseTo((2 / 3) * 0.5);
    expect(slow.totalSec).toBeCloseTo(2);
    const fast = buildTimeline(steps, 240);
    expect(fast.timed[1].startSec).toBeCloseTo(swingAnd(240) * 0.25);
    expect(fast.timed[2].startSec).toBeCloseTo(0.25);
    expect(fast.totalSec).toBeCloseTo(1);
  });
});
