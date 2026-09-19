import { describe, expect, it } from "vitest";
import { exercises, findExercise } from "@/lib/curriculum/tree";
import {
  applyAttempt,
  currentStreak,
  dayKey,
  exerciseStatus,
  isUnlocked,
  meetsMastery,
  planToday,
  type ProgressStore,
} from "./progress";

const empty = (): ProgressStore => ({ version: 2, exercises: {}, streak: { count: 0, lastDay: null } });
const day = (d: number) => new Date(2026, 8, d, 12);
const pass = { accuracy: 1, timed: true, bpm: 200, timing: 1, clean: true };
const fail = { accuracy: 0.5, timed: false, clean: true };

describe("meetsMastery", () => {
  const timed = findExercise("ii-v-i-shells")!;
  it("needs the clock on and the tempo up when a bpm is set", () => {
    expect(meetsMastery({ accuracy: 1, timed: false, clean: true }, timed.mastery)).toBe(false);
    expect(meetsMastery({ accuracy: 1, timed: true, bpm: 90, timing: 1, clean: true }, timed.mastery)).toBe(false);
    expect(meetsMastery({ accuracy: 1, timed: true, bpm: 100, timing: 0.8, clean: true }, timed.mastery)).toBe(true);
    expect(meetsMastery({ accuracy: 1, timed: true, bpm: 100, timing: 0.5, clean: true }, timed.mastery)).toBe(false);
  });
  it("ignores tempo for untimed drills, and never passes a hinted pass", () => {
    const drill = findExercise("shells")!;
    expect(meetsMastery({ accuracy: 0.9, timed: false, clean: true }, drill.mastery)).toBe(true);
    expect(meetsMastery({ accuracy: 1, timed: false, clean: false }, drill.mastery)).toBe(false);
  });
});

describe("applyAttempt", () => {
  const ex = findExercise("meet-the-keyboard")!;
  it("spaces reviews out on passes and pulls them in on a fail", () => {
    let s = applyAttempt(empty(), ex, "C", pass, day(1));
    expect(s.exercises[ex.id]!.C!.due).toBe(dayKey(day(2)));
    s = applyAttempt(s, ex, "C", pass, day(2));
    expect(s.exercises[ex.id]!.C!.due).toBe(dayKey(day(5)));
    s = applyAttempt(s, ex, "C", pass, day(5));
    expect(s.exercises[ex.id]!.C!.due).toBe(dayKey(day(12)));
    s = applyAttempt(s, ex, "C", fail, day(12));
    expect(s.exercises[ex.id]!.C!.due).toBe(dayKey(day(13)));
    expect(s.exercises[ex.id]!.C!.mastered).toBe(true);
    expect(s.exercises[ex.id]!.C!.streak).toBe(0);
  });
  it("keeps a daily streak", () => {
    let s = applyAttempt(empty(), ex, "C", fail, day(1));
    s = applyAttempt(s, ex, "C", fail, day(2));
    expect(currentStreak(s, day(2))).toBe(2);
    expect(currentStreak(s, day(4))).toBe(0);
    s = applyAttempt(s, ex, "C", fail, day(4));
    expect(currentStreak(s, day(4))).toBe(1);
  });
});

describe("planToday", () => {
  it("starts a beginner at the keyboard and mixes kinds", () => {
    const q = planToday(empty(), exercises, day(1));
    expect(q[0].exercise.id).toBe("meet-the-keyboard");
    expect(q.every((i) => i.reason === "new")).toBe(true);
    const kinds = q.map((i) => i.exercise.kind);
    for (const k of new Set(kinds)) expect(kinds.filter((x) => x === k).length).toBeLessThanOrEqual(2);
  });

  it("unlocks the next exercise and puts reviews first", () => {
    const keyboard = findExercise("meet-the-keyboard")!;
    let s = applyAttempt(empty(), keyboard, "C", pass, day(1));
    expect(exerciseStatus(s, keyboard, exercises)).toBe("done");
    expect(isUnlocked(s, findExercise("major-scale")!, exercises)).toBe(true);
    const scale = findExercise("major-scale")!;
    s = applyAttempt(s, scale, "C", pass, day(1));
    const q1 = planToday(s, exercises, day(1));
    expect(q1.find((i) => i.exercise.id === "major-scale")?.key).toBe("F");
    expect(q1.find((i) => i.exercise.id === "major-scale")?.reason).toBe("next-key");
    // Two days later the keyboard card is due for review.
    const q2 = planToday(s, exercises, day(3));
    expect(q2[0]).toMatchObject({ exercise: { id: "meet-the-keyboard" }, key: "C", reason: "review" });
  });
});
