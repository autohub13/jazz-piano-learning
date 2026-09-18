import { describe, expect, it } from "vitest";
import { degreeName, describeMove } from "./harmony";
import { midis } from "./notes";

describe("describeMove", () => {
  it("names the held guide tone and the half-step fall in a ii-V shell move", () => {
    const text = describeMove(
      { symbol: "Dm7", notes: midis("D3", "F3", "C4") },
      { symbol: "G7", notes: midis("G2", "F3", "B3") },
      "flat",
    );
    expect(text).toBe(
      "F holds, the b3 of Dm7 becoming the b7 of G7. C falls a half step to B, b7 to 3. D moves down to G.",
    );
  });

  it("says when every voice moves a step or less", () => {
    const text = describeMove(
      { symbol: "G7", notes: midis("F3", "A3", "B3", "E4") },
      { symbol: "Cmaj7", notes: midis("E3", "G3", "B3", "D4") },
      "flat",
    );
    expect(text?.startsWith("Every voice moves a step or less.")).toBe(true);
    expect(text).toContain("B holds, the 3 of G7 becoming the 7 of Cmaj7.");
  });

  it("spells by the chord, not the key, and tells a common tone that changes octave", () => {
    const text = describeMove(
      { symbol: "Cm7", notes: midis("C3", "Eb3", "Bb3") },
      { symbol: "F7", notes: midis("F2", "Eb3", "A3") },
      "sharp",
    );
    expect(text).toContain("Eb holds, the b3 of Cm7 becoming the b7 of F7.");
    expect(text).toContain("Bb falls a half step to A, b7 to 3.");
    const octave = describeMove(
      { symbol: "Dm7", notes: midis("D3", "F3", "C4") },
      { symbol: "G7", notes: midis("G3", "B3", "F4") },
      "flat",
    );
    expect(octave).toContain("F jumps up an octave, the b3 of Dm7 becoming the b7 of G7.");
  });

  it("names a flat 13 over a seventh chord", () => {
    expect(degreeName(7, 63, "G7b13")).toBe("b13");
  });

  it("has nothing to say about the same chord", () => {
    expect(describeMove({ symbol: "C7", notes: [60] }, { symbol: "C7", notes: [60] }, "flat")).toBeUndefined();
  });
});
