import { describe, expect, it } from "vitest";
import { inScale, parseChord, snapToChord } from "./chords";
import { movement, voice, type VoicingStyle } from "./voicings";

describe("parseChord", () => {
  it.each([
    ["Dm7", 2, "m7"],
    ["G7", 7, "7"],
    ["Cmaj7", 0, "maj7"],
    ["C6", 0, "6"],
    ["F#m7b5", 6, "m7b5"],
    ["C#dim7", 1, "dim7"],
    ["Db7#11", 1, "7"],
    ["A7b9", 9, "7"],
    ["Bb", 10, "6"],
  ])("%s", (symbol, rootPc, quality) => {
    const c = parseChord(symbol);
    expect(c.rootPc).toBe(rootPc);
    expect(c.quality).toBe(quality);
  });

  it("reads alterations into the degrees and the scale", () => {
    expect(parseChord("A7b9").degrees[9]).toBe(1);
    expect(parseChord("Db7#11").scale).toContain(6);
  });
});

describe("snapToChord", () => {
  it("leaves scale notes alone and prefers a chord tone", () => {
    const db7 = parseChord("Db7#11");
    expect(snapToChord(db7, 71)).toBe(71); // B is the b7
    const snapped = snapToChord(db7, 69); // A is outside Db lydian dominant
    expect(inScale(db7, snapped)).toBe(true);
    expect(snapped).toBe(68); // Ab, the 5th
  });
});

describe("voice", () => {
  const range = { low: 48, high: 72, ceiling: 64 };
  const styles: VoicingStyle[] = ["shell", "shell3", "rootless", "drop2", "quartal"];

  it.each(styles)("%s leads through ii-V-I without leaping", (style) => {
    let prev: number[] | null = null;
    for (const symbol of ["Dm7", "G7", "Cmaj7"]) {
      const notes = voice(parseChord(symbol), style, { prev, ...range });
      expect(notes.length).toBeGreaterThanOrEqual(2);
      for (const n of notes) {
        expect(n).toBeGreaterThanOrEqual(range.low);
        expect(n).toBeLessThanOrEqual(range.ceiling);
      }
      // Each voice to its nearest neighbour and back: a shell's root moves a
      // fourth or fifth, everything else should barely move.
      if (prev) expect(movement(prev, notes)).toBeLessThanOrEqual(style === "shell3" ? 16 : 12);
      prev = notes;
    }
  });
});
