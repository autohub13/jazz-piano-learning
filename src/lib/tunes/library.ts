// The repertoire. Melodies are traditional or original; the chord charts of
// standards are not copyrightable, and are given without their melodies. Adding a
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
    blurb: "The horn players' key, and the changes under Tenor Madness and Sonnymoon for Two. Same form as the F blues, new hand shapes.",
    form: `
      | Bb7 | Eb7 | Bb7 | % |
      | Eb7 | % | Bb7 | % |
      | F7 | Eb7 | Bb7 | F7 |
    `,
  },
  {
    slug: "blues-cycle",
    title: "Blues with a cycle",
    key: "G",
    style: "blues",
    bpm: { min: 70, default: 108, max: 160 },
    level: 3,
    blurb: "Twelve bars in G where E7, A7 and D7 fall by fifths back home. The blues with dominants that move.",
    form: `
      | G7 | C7 | G7 | % |
      | C7 | % | G7 | E7 |
      | A7 | D7 | G7 E7 | A7 D7 |
    `,
  },
  {
    slug: "ja-da-changes",
    title: "Ja-Da",
    composer: "Bob Carleton",
    year: 1918,
    key: "C",
    style: "swing",
    bpm: { min: 90, default: 140, max: 200 },
    level: 3,
    blurb: "Sixteen bars that cycle through A7, D7 and G7 back home, with a trip to the IV in the middle. Sonny Rollins wrote Doxy over these changes.",
    form: `
      | C6 | A7 | D7 G7 | C6 | C6 | A7 | D7 | G7 |
      | C6 | C7 | F6 | F#dim7 | C6 | A7 | D7 G7 | C6 |
    `,
  },
  {
    slug: "indiana-changes",
    title: "Back Home Again in Indiana",
    composer: "James F. Hanley",
    year: 1917,
    key: "F",
    style: "swing",
    bpm: { min: 100, default: 160, max: 240 },
    level: 3,
    blurb: "Thirty-two bars of a 1917 tune that became a bebop vehicle: Donna Lee is written over these changes. Dominants everywhere.",
    form: `
      | F6 | D7 | G7 | % | C7 | % | F6 | Cm7 F7 |
      | Bbmaj7 | Bbm6 | F6 | D7 | G7 | % | Gm7 | C7 |
      | F6 | D7 | G7 | % | A7 | % | Dm7 | A7 |
      | Dm7 | A7 | Dm7 | Abdim7 | Am7 D7 | Gm7 C7 | F6 | Gm7 C7 |
    `,
  },
  {
    slug: "a-train",
    title: "Take the A Train",
    composer: "Billy Strayhorn",
    year: 1939,
    key: "C",
    style: "swing",
    bpm: { min: 90, default: 150, max: 220 },
    level: 3,
    blurb: "The Ellington band's theme. Thirty-two bars, AABA, and the II7 with a #11 in bar three is the whole personality of the tune.",
    form: `
      | C6 | % | D7#11 | % | Dm7 | G7 | C6 | Dm7 G7 |
      | C6 | % | D7#11 | % | Dm7 | G7 | C6 | % |
      | Fmaj7 | % | % | % | D7 | % | Dm7 | G7 |
      | C6 | % | D7#11 | % | Dm7 | G7 | C6 | Dm7 G7 |
    `,
  },
  {
    slug: "all-of-me",
    title: "All of Me",
    composer: "Gerald Marks and Seymour Simons",
    year: 1931,
    key: "C",
    style: "swing",
    bpm: { min: 90, default: 140, max: 220 },
    level: 3,
    blurb: "The jam session standby. Two bars a chord, and nearly every one is a dominant falling a fifth into the next.",
    form: `
      | C6 | % | E7 | % | A7 | % | Dm7 | % |
      | E7 | % | Am7 | % | D7 | % | Dm7 | G7 |
      | C6 | % | E7 | % | A7 | % | Dm7 | % |
      | Fmaj7 | Fm6 | C6 Em7 | A7 | Dm7 | G7 | C6 | Dm7 G7 |
    `,
  },
  {
    slug: "satin-doll",
    title: "Satin Doll",
    composer: "Duke Ellington and Billy Strayhorn",
    year: 1953,
    key: "C",
    style: "swing",
    bpm: { min: 80, default: 120, max: 180 },
    level: 4,
    blurb: "ii-Vs that climb a step at a time, then Abm7 Db7 sliding into C: a tritone substitute you can hum.",
    form: `
      | Dm7 G7 | % | Em7 A7 | % | Am7 D7 | Abm7 Db7 | Cmaj7 | Em7 A7 |
      | Dm7 G7 | % | Em7 A7 | % | Am7 D7 | Abm7 Db7 | Cmaj7 | % |
      | Gm7 C7 | % | Fmaj7 | % | Am7 D7 | % | G7 | % |
      | Dm7 G7 | % | Em7 A7 | % | Am7 D7 | Abm7 Db7 | Cmaj7 | Em7 A7 |
    `,
  },
  {
    slug: "misty",
    title: "Misty",
    composer: "Erroll Garner",
    year: 1954,
    key: "Eb",
    style: "ballad",
    bpm: { min: 46, default: 66, max: 120 },
    level: 4,
    blurb: "The ballad every pianist is asked for. A ii-V into the IV, then Abm7 Db7, the back door home, and a bridge that leaves the key twice.",
    form: `
      | Ebmaj7 | Bbm7 Eb7 | Abmaj7 | Abm7 Db7 | Ebmaj7 Cm7 | Fm7 Bb7 | Gm7 C7 | Fm7 Bb7 |
      | Ebmaj7 | Bbm7 Eb7 | Abmaj7 | Abm7 Db7 | Ebmaj7 Cm7 | Fm7 Bb7 | Eb6 | % |
      | Bbm7 | Eb7b9 | Abmaj7 | % | Am7 | D7 | Gm7b5 C7b9 | Fm7 Bb7 |
      | Ebmaj7 | Bbm7 Eb7 | Abmaj7 | Abm7 Db7 | Ebmaj7 Cm7 | Fm7 Bb7 | Eb6 | Fm7 Bb7 |
    `,
  },
  {
    slug: "someday-my-prince",
    title: "Someday My Prince Will Come",
    composer: "Frank Churchill",
    year: 1937,
    key: "Bb",
    style: "swing",
    meter: 3,
    bpm: { min: 80, default: 132, max: 200 },
    level: 4,
    blurb: "The jazz waltz, from a Disney film by way of Bill Evans and Miles Davis. Three beats to the bar, and dominants with a b13 pulling to the IV and the ii.",
    form: `
      | Bbmaj7 | D7b13 | Ebmaj7 | G7b13 | Cm7 | G7b13 | Cm7 | F7 |
      | Dm7 | Dbdim7 | Cm7 | F7 | Dm7 | Dbdim7 | Cm7 | F7 |
      | Bbmaj7 | D7b13 | Ebmaj7 | G7b13 | Cm7 | G7b13 | Cm7 | F7 |
      | Fm7 | Bb7 | Ebmaj7 | Edim7 | Bbmaj7 | F7 | Bbmaj7 | F7 |
    `,
  },
  {
    slug: "so-what",
    title: "So What",
    composer: "Miles Davis",
    year: 1959,
    key: "D",
    style: "swing",
    bpm: { min: 90, default: 136, max: 220 },
    level: 5,
    blurb: "Sixteen bars of one chord, eight a half step up, eight back. One scale at a time, and all the room in the world.",
    form: `
      | Dm7 | % | % | % | % | % | % | % |
      | Dm7 | % | % | % | % | % | % | % |
      | Ebm7 | % | % | % | % | % | % | % |
      | Dm7 | % | % | % | % | % | % | % |
    `,
  },
  {
    slug: "minor-blues",
    title: "Mr. P.C.",
    composer: "John Coltrane",
    year: 1959,
    key: "C",
    style: "blues",
    bpm: { min: 70, default: 120, max: 240 },
    level: 4,
    blurb: "Coltrane's minor blues in C. The Ab7 to G7 in bars nine and ten is the sound to learn.",
    form: `
      | Cm7 | % | % | % |
      | Fm7 | % | Cm7 | % |
      | Ab7 | G7b9 | Cm7 | G7b9 |
    `,
  },
  {
    slug: "autumn-changes",
    title: "Autumn Leaves",
    composer: "Joseph Kosma",
    year: 1945,
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
    blurb: "The changes under Billie's Bounce and Now's the Time. The blues with every substitution a bebop player adds: the ii-V in bar four, the diminished in bar six, the turnaround.",
    form: `
      | F7 | Bb7 | F7 | Cm7 F7 |
      | Bb7 | Bdim7 | F7 | Am7 D7 |
      | Gm7 | C7 | F7 D7 | Gm7 C7 |
    `,
  },
  {
    slug: "blue-bossa",
    title: "Blue Bossa",
    composer: "Kenny Dorham",
    year: 1963,
    key: "C",
    minor: true,
    style: "swing",
    bpm: { min: 80, default: 132, max: 200 },
    level: 5,
    blurb: "Sixteen bars: the minor home, its iv, a minor ii-V, and a major ii-V-I a half step up. Played here as medium swing.",
    form: `
      | Cm7 | % | Fm7 | % | Dm7b5 | G7b9 | Cm7 | % |
      | Ebm7 | Ab7 | Dbmaj7 | % | Dm7b5 | G7b9 | Cm7 | Dm7b5 G7b9 |
    `,
  },
  {
    slug: "tune-up",
    title: "Tune Up",
    composer: "Miles Davis",
    year: 1953,
    key: "D",
    style: "swing",
    bpm: { min: 90, default: 150, max: 240 },
    level: 5,
    blurb: "ii-V-I in D, then in C, then in Bb. The standard workout for moving one idea through three keys.",
    form: `
      | Em7 | A7 | Dmaj7 | % | Dm7 | G7 | Cmaj7 | % |
      | Cm7 | F7 | Bbmaj7 | Ebmaj7 | Em7 | F7 | Bbmaj7 | Em7 A7 |
    `,
  },
  {
    slug: "rhythm-changes",
    title: "I Got Rhythm",
    composer: "George Gershwin",
    year: 1930,
    key: "Bb",
    style: "swing",
    bpm: { min: 120, default: 180, max: 280 },
    level: 6,
    blurb: "Rhythm changes: the second most played form in jazz, under Oleo, Anthropology and The Flintstones theme. Two chords a bar, a bridge of dominants, and a tempo that keeps rising.",
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
