// The repertoire. Melodies are traditional or original; the chord charts of
// standards are not copyrightable and are given under generic names. Adding a
// tune is adding an entry here, and every key and level of it is generated.

import type { Tune } from "./types";

export const tunes: Tune[] = [
  {
    slug: "f-blues",
    title: "Blues in F",
    key: "F",
    style: "blues",
    bpm: { min: 70, default: 120, max: 200 },
    level: 2,
    blurb: "Twelve bars, three chords, one riff. The form every jazz musician knows first.",
    form: `
      | F7 | Bb7 | F7 | % |
      | Bb7 | % | F7 | % |
      | C7 | Bb7 | F7 | C7 |
    `,
    melody: `
      | A4:2 Ab4:1 F4:1 | A4:2 Ab4:1 F4:1 | A4:2 Ab4:1 F4:1 | F4:1 A4:1 C5:2 |
      | D5:2 Db5:1 Bb4:1 | D5:2 Db5:1 Bb4:1 | A4:2 Ab4:1 F4:1 | A4:2 Ab4:1 F4:1 |
      | G4:1 Bb4:1 E5:2 | F5:1 Ab4:1 Bb4:2 | A4:2 Ab4:1 F4:1 | F4:2 r:2 |
    `,
  },
  {
    slug: "when-the-saints",
    title: "When the Saints Go Marching In",
    composer: "Traditional",
    key: "C",
    style: "swing",
    bpm: { min: 80, default: 132, max: 200 },
    level: 2,
    blurb: "Sixteen bars on three roots. A whole tune built from shells.",
    form: `
      | C6 | % | % | % | % | % | G7 | % |
      | C6 | C7 | Fmaj7 | % | C6 | Fmaj7 G7 | C6 | % |
    `,
    melody: `
      C4:1:Oh E4:1:when F4:1:the
      | G4:5:saints C4:1:go E4:1:march- F4:1:ing | G4:5:in C4:1:oh E4:1:when F4:1:the |
      | G4:2:saints E4:2:go | C4:2:march- E4:2:ing | D4:5:in E4:1:I E4:1:want D4:1:to |
      | C4:4:be | E4:2:in G4:2:that | G4:1:num- F4:5:ber E4:1:when F4:1:the |
      | G4:2:saints E4:2:go | C4:2:march- D4:2:ing | C4:8:in |
    `,
  },
  {
    slug: "bb-blues",
    title: "Blues in Bb",
    key: "Bb",
    style: "blues",
    bpm: { min: 70, default: 120, max: 220 },
    level: 2,
    blurb: "The horn players' key. Same form as the F blues, new hand shapes.",
    form: `
      | Bb7 | Eb7 | Bb7 | % |
      | Eb7 | % | Bb7 | % |
      | F7 | Eb7 | Bb7 | F7 |
    `,
  },
  {
    slug: "st-louis-strain",
    title: "St. Louis strain",
    composer: "Traditional form",
    key: "G",
    style: "blues",
    bpm: { min: 70, default: 108, max: 160 },
    level: 3,
    blurb: "The twelve-bar strain of the most recorded blues of the 1920s, in G.",
    form: `
      | G7 | C7 | G7 | % |
      | C7 | % | G7 | % |
      | D7 | C7 | G7 | D7 |
    `,
  },
  {
    slug: "ja-da-changes",
    title: "Ja-Da changes",
    key: "C",
    style: "swing",
    bpm: { min: 90, default: 140, max: 200 },
    level: 3,
    blurb: "Sixteen bars that cycle through A7, D7 and G7 back home. The first cycle of dominants.",
    form: `
      | C6 | % | C6 | Dm7 G7 | C6 | A7 | D7 | G7 |
      | C6 | % | C6 | Dm7 G7 | C6 | A7 | D7 G7 | C6 |
    `,
  },
  {
    slug: "indiana-changes",
    title: "Indiana changes",
    key: "F",
    style: "swing",
    bpm: { min: 100, default: 160, max: 240 },
    level: 3,
    blurb: "Thirty-two bars of a 1917 tune that became a bebop vehicle. Dominants everywhere.",
    form: `
      | F6 | % | Bb7 | % | F6 | D7 | G7 | % |
      | C7 | % | F6 | % | Am7 | D7 | Gm7 | C7 |
      | F6 | % | Bb7 | % | F6 | D7 | G7 | % |
      | Am7 | D7 | Gm7 | C7 | F6 | Bb7 | F6 | C7 |
    `,
  },
  {
    slug: "minor-blues",
    title: "Minor blues in C",
    key: "C",
    style: "blues",
    bpm: { min: 70, default: 120, max: 200 },
    level: 4,
    blurb: "Twelve bars in C minor. The Ab7 to G7 in bars nine and ten is the sound to learn.",
    form: `
      | Cm7 | Fm7 | Cm7 | % |
      | Fm7 | % | Cm7 | % |
      | Ab7 | G7b9 | Cm7 | G7b9 |
    `,
  },
  {
    slug: "autumn-changes",
    title: "Autumn changes",
    key: "G",
    style: "swing",
    bpm: { min: 90, default: 140, max: 220 },
    level: 4,
    blurb: "The minor ii-V-i and its relative major, in the form every jam session calls.",
    form: `
      | Cm7 | F7 | Bbmaj7 | Ebmaj7 | Am7b5 | D7b9 | Gm6 | % |
      | Cm7 | F7 | Bbmaj7 | Ebmaj7 | Am7b5 | D7b9 | Gm6 | % |
      | Am7b5 | D7b9 | Gm6 | % | Cm7 | F7 | Bbmaj7 | Ebmaj7 |
      | Am7b5 | D7b9 | Gm7 C7 | Fm7 Bb7 | Ebmaj7 | Am7b5 D7b9 | Gm6 | % |
    `,
  },
  {
    slug: "jazz-blues-f",
    title: "Jazz blues in F",
    key: "F",
    style: "blues",
    bpm: { min: 90, default: 140, max: 240 },
    level: 5,
    blurb: "The blues with every substitution a bebop player adds: the ii-V in bar four, the diminished in bar six, the turnaround.",
    form: `
      | F7 | Bb7 | F7 | Cm7 F7 |
      | Bb7 | Bdim7 | F7 | Am7 D7 |
      | Gm7 | C7 | F7 D7 | Gm7 C7 |
    `,
  },
  {
    slug: "rhythm-changes",
    title: "Rhythm changes",
    key: "Bb",
    style: "swing",
    bpm: { min: 120, default: 180, max: 280 },
    level: 6,
    blurb: "The second most played form in jazz. Two chords a bar, a bridge of dominants, and a tempo that keeps rising.",
    form: `
      | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 Bb7 | Ebmaj7 Ebm6 | Dm7 G7 | Cm7 F7 |
      | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 Bb7 | Ebmaj7 Ebm6 | Cm7 F7 | Bbmaj7 |
      | D7 | % | G7 | % | C7 | % | F7 | % |
      | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 G7 | Cm7 F7 | Bbmaj7 Bb7 | Ebmaj7 Ebm6 | Cm7 F7 | Bbmaj7 |
    `,
  },
];

export function findTune(slug: string): Tune | undefined {
  return tunes.find((t) => t.slug === slug);
}
