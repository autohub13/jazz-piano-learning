import { describe, expect, it } from "vitest";
import { parseChord, type Degree } from "./chords";
import { SHEET_CHORDS, SHEET_ROOTS, parseDegree, sheetNotes, sheetWindow } from "./chordSheet";
import { isBlackKey, pitchClass } from "./notes";

const names = (root: (typeof SHEET_ROOTS)[number], suffix: string) =>
  sheetNotes(root, SHEET_CHORDS.find((c) => c.suffix === suffix)!).map((n) => n.name);

describe("the chord sheet", () => {
  it("agrees with parseChord about every note of every chord", () => {
    for (const root of SHEET_ROOTS) {
      for (const chord of SHEET_CHORDS) {
        const parsed = parseChord(root + chord.suffix);
        for (const note of sheetNotes(root, chord)) {
          // A 6th does the 7th's job, which is where parseChord keeps it.
          const n = note.degree.replace(/[#b]/g, "");
          const key = (n === "6" ? "7" : n) as Degree;
          expect(pitchClass(note.midi - parsed.rootPc), `${root}${chord.suffix} ${note.degree}`).toBe(
            pitchClass(parsed.degrees[key]),
          );
        }
      }
    }
  });

  it("spells each note on the letter its degree asks for", () => {
    expect(names("C", "m7")).toEqual(["C", "Eb", "G", "Bb"]);
    expect(names("F#", "7")).toEqual(["F#", "A#", "C#", "E"]);
    expect(names("C", "7#11")).toEqual(["C", "E", "G", "Bb", "F#"]);
    expect(names("C", "7alt")).toEqual(["C", "E", "Gb", "Bb", "Db", "Ab"]);
    // A double flat has no key of its own: say the key under the finger.
    expect(names("C", "dim7")).toEqual(["C", "Eb", "Gb", "A"]);
  });

  it("stacks tensions above the seventh", () => {
    expect(parseDegree("b9").semitones).toBe(13);
    expect(parseDegree("#11").semitones).toBe(18);
  });

  it("keeps every note inside a window that starts and ends on a white key", () => {
    for (const root of SHEET_ROOTS) {
      const { low, high } = sheetWindow(root);
      expect(isBlackKey(low) || isBlackKey(high)).toBe(false);
      for (const chord of SHEET_CHORDS) {
        for (const { midi } of sheetNotes(root, chord)) {
          expect(midi).toBeGreaterThanOrEqual(low);
          expect(midi).toBeLessThanOrEqual(high);
        }
      }
    }
  });
});
