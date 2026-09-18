import { describe, expect, it } from "vitest";
import { exercises, findExercise } from "@/lib/curriculum/tree";
import { KEYS } from "./transpose";
import { barBeats, sheetOf } from "./notation";

describe("sheetOf", () => {
  it("writes the Saints with its pickup, and ties the long note over the barline", () => {
    const sheet = sheetOf(findExercise("when-the-saints")!.generate("C"))!;
    expect(sheet.pickup).toBe(true);
    expect(sheet.bars).toBe(17);
    // C E F in the pickup bar, on beats two, three and four.
    expect(sheet.events.slice(0, 3).map((e) => [e.bar, e.pos, e.notes[0].midi])).toEqual([
      [0, 1, 60],
      [0, 2, 64],
      [0, 3, 65],
    ]);
    // "saints" lasts five beats: a whole note tied to a quarter.
    expect(sheet.events.slice(3, 5).map((e) => [e.bar, e.glyph, e.tied])).toEqual([
      [1, "whole", true],
      [2, "quarter", false],
    ]);
    expect(sheet.events[3].fromStep).toBe(sheet.events[4].fromStep);
  });

  it("writes a flat once a bar and a natural when the line goes back", () => {
    const sheet = sheetOf(findExercise("f-blues")!.generate("F"))!;
    // Bar one of the riff: A, Ab, F. Bar two starts on A again.
    const signs = sheet.events.filter((e) => e.bar <= 1).map((e) => e.notes[0].sign);
    expect(signs).toEqual([null, "b", null, null, "b", null]);
  });

  it("spells a note by the chord under it, not by the key", () => {
    // Two Doors in C reads in sharps, but the Bb over Gm7 and C7 is a flat.
    const lesson = findExercise("etude-cadence")!.generate("C");
    const sheet = sheetOf(lesson)!;
    const flats = sheet.events.filter((e) => e.bar === 4 || e.bar === 5).flatMap((e) => e.notes).filter((n) => n.midi === 70);
    expect(flats.map((n) => [n.step, n.sign])).toEqual([
      [34, "b"],
      [34, "b"],
    ]);
    expect(lesson.steps.some((s) => s.label?.includes("A#"))).toBe(false);
  });

  it("has nothing to write for a left hand alone", () => {
    expect(sheetOf(findExercise("bb-blues")!.generate("Bb"))).toBeNull();
  });

  it("keeps every event inside its bar, in every exercise and key", () => {
    for (const e of exercises) {
      for (const key of e.keys === "all" ? KEYS : e.keys) {
        const sheet = sheetOf(e.generate(key));
        for (const event of sheet?.events ?? []) {
          expect(event.pos, `${e.id} ${key}`).toBeGreaterThanOrEqual(0);
          expect(event.pos + event.beats, `${e.id} ${key}`).toBeLessThanOrEqual(sheet!.beatsPerBar + 1e-6);
          expect(event.bar, `${e.id} ${key}`).toBeLessThan(sheet!.bars);
        }
      }
    }
  });
});

describe("barBeats", () => {
  it("makes the Saints pickup three beats and every bar after it four", () => {
    const starts = barBeats(findExercise("when-the-saints")!.generate("C"));
    expect(starts.slice(0, 4)).toEqual([0, 3, 7, 11]);
  });

  it("has a span for every bar the staff draws", () => {
    for (const e of exercises) {
      const lesson = e.generate(e.keys === "all" ? "C" : e.keys[0]);
      const spans = barBeats(lesson).length - 1;
      const sheet = sheetOf(lesson);
      if (sheet) expect(spans, e.id).toBe(sheet.bars);
    }
  });
});
