// One etude per unit: a short original piece that puts the unit's theory to
// work as music. They are tunes like any other, so the arranger gives each one
// its left hand, its sheet music and its band in every key. They are kept out
// of the library because they are studies, not repertoire.

import type { Tune } from "./types";

const TURNAROUND = "| Cmaj7 Am7 | Dm7 G7 |";

export const etudes: Record<string, Tune> = {
  keyboard: {
    slug: "etude-keyboard",
    title: "Up the Hill",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 92, max: 160 },
    level: 1,
    blurb: "The major scale as a tune: steps up, steps down, and home.",
    form: `| C6 | Am7 | Dm7 | G7 | C6 | Am7 | Dm7 G7 | C6 |`,
    melody: `
      | C4:1 D4:1 E4:2 | E4:1 D4:1 C4:2 | D4:1 E4:1 F4:2 | F4:1 E4:1 D4:2 |
      | E4:1 F4:1 G4:2 | A4:1 G4:1 E4:2 | F4:1 E4:1 D4:1 B3:1 | C4:4 |
    `,
  },
  chords: {
    slug: "etude-chords",
    title: "Stacking Thirds",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 96, max: 160 },
    level: 1,
    blurb: "Seventh chords one note at a time, up one and down the next.",
    form: `| Cmaj7 | Am7 | Dm7 | G7 | Cmaj7 | Am7 | Dm7 G7 | C6 |`,
    melody: `
      | C4:1 E4:1 G4:1 B4:1 | A4:1 G4:1 E4:1 C4:1 | D4:1 F4:1 A4:1 C5:1 | B4:1 G4:1 F4:1 D4:1 |
      | E4:1 G4:1 B4:1 C5:1 | C5:1 A4:1 G4:1 E4:1 | F4:1 A4:1 G4:1 B3:1 | C4:4 |
    `,
  },
  shells: {
    slug: "etude-shells",
    title: "Shell Game",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 100, max: 170 },
    level: 2,
    blurb: "All four qualities in shells, under a tune that leans on their 3rds and 7ths.",
    form: `| Cmaj7 | A7 | Dm7 | G7 | Em7b5 A7 | Dm7 G7 | C6 | % |`,
    melody: `
      | E4:2 G4:2 | G4:1 E4:1 C#4:2 | F4:2 A4:2 | B4:2 F4:2 |
      | G4:1 Bb4:1 A4:1 G4:1 | F4:2 F4:1 D4:1 | E4:3 G4:1 | A4:2 G4:2 |
    `,
  },
  cadence: {
    slug: "etude-cadence",
    title: "Two Doors",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 108, max: 180 },
    level: 2,
    blurb: "The ii-V-I at home, then the same cadence into the IV, and back.",
    form: `
      | Dm7 | G7 | Cmaj7 | % | Gm7 | C7 | Fmaj7 | % |
      | Dm7 | G7 | Cmaj7 | A7 | Dm7 | G7 | C6 | % |
    `,
    melody: `
      | F4:2 A4:2 | G4:1 F4:1 D4:2 | E4:3 G4:1 | B4:2 G4:2 |
      | Bb4:2 D5:2 | C5:1 Bb4:1 G4:2 | A4:3 C5:1 | E5:2 C5:2 |
      | A4:1 C5:1 F4:2 | B4:1 A4:1 G4:1 F4:1 | E4:2 G4:2 | C#4:1 E4:1 G4:2 |
      | F4:2 A4:1 C5:1 | B4:2 D5:1 B4:1 | C5:4 | r:4 |
    `,
  },
  "first-tunes": {
    slug: "etude-first-tunes",
    title: "Blue Steps",
    key: "F",
    style: "blues",
    bpm: { min: 60, default: 104, max: 180 },
    level: 2,
    blurb: "A twelve-bar head from the blues scale alone: say it, say it again, answer it.",
    form: `
      | F7 | Bb7 | F7 | % |
      | Bb7 | % | F7 | % |
      | C7 | Bb7 | F7 | C7 |
    `,
    melody: `
      | F4:1 Ab4:1 Bb4:2 | C5:1 Bb4:1 Ab4:2 | Bb4:1 B4:1 C5:2 | Eb5:2 C5:2 |
      | F4:1 Ab4:1 Bb4:2 | C5:1 Bb4:1 Ab4:2 | Bb4:1 B4:1 C5:2 | Ab4:1 F4:3 |
      | C5:2 Eb5:2 | C5:1 Bb4:1 Ab4:2 | F4:1 Ab4:1 F4:2 | r:2 C4:1 Eb4:1 |
    `,
  },
  accompaniment: {
    slug: "etude-accompaniment",
    title: "Top Note",
    key: "C",
    style: "swing",
    bpm: { min: 50, default: 88, max: 150 },
    level: 2,
    blurb: "Every melody note is a chord tone, so every one picks an inversion.",
    form: `${TURNAROUND} ${TURNAROUND} Fmaj7 | Em7 A7 | Dm7 G7 | C6 |`,
    melody: `
      | G4:2 A4:2 | A4:2 G4:2 | E5:2 C5:2 | D5:2 B4:2 |
      | C5:2 A4:2 | B4:2 A4:2 | A4:2 B4:2 | C5:4 |
    `,
  },
  rootless: {
    slug: "etude-rootless",
    title: "No Roots",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 112, max: 180 },
    level: 3,
    blurb: "A ii-V-I at home and one a minor third up, with the 9th of each chord in the tune.",
    form: `| Dm7 | G7 | Cmaj7 | % | Fm7 | Bb7 | Ebmaj7 | Dm7 G7 |`,
    melody: `
      | E4:2 F4:1 A4:1 | A4:2 G4:1 F4:1 | E4:1 G4:1 D5:2 | B4:2 G4:2 |
      | G4:2 Ab4:1 C5:1 | C5:2 Bb4:1 Ab4:1 | G4:1 Bb4:1 F5:2 | F5:1 D5:1 B4:1 G4:1 |
    `,
  },
  comping: {
    slug: "etude-comping",
    title: "Charleston Street",
    key: "C",
    style: "swing",
    bpm: { min: 70, default: 120, max: 190 },
    level: 3,
    blurb: "Long notes on top, so the left hand's rhythm is what moves.",
    form: `${TURNAROUND} Em7 A7 | Dm7 G7 ${TURNAROUND} C6 | Dm7 G7 |`,
    melody: `
      | G4:4 | A4:3 B4:1 | B4:4 | A4:2 G4:2 |
      | E5:4 | D5:3 B4:1 | C5:4 | r:4 |
    `,
  },
  changes: {
    slug: "etude-changes",
    title: "Falling Fifths",
    key: "C",
    style: "swing",
    bpm: { min: 70, default: 126, max: 200 },
    level: 3,
    blurb: "III7, VI7, II7, V7. The tune leans on the 3rd of each, the note from outside the key.",
    form: `| C6 | E7 | A7 | D7 | G7 | % | C6 | Dm7 G7 |`,
    melody: `
      | G4:2 E4:2 | G#4:2 B4:1 D5:1 | C#5:2 A4:2 | C5:2 A4:1 F#4:1 |
      | F4:2 D4:1 B3:1 | D4:1 F4:1 A4:1 B4:1 | C5:4 | A4:1 F4:1 D4:1 B3:1 |
    `,
  },
  minor: {
    slug: "etude-minor",
    title: "After Dark",
    key: "C",
    minor: true,
    style: "swing",
    bpm: { min: 60, default: 112, max: 180 },
    level: 4,
    blurb: "The minor ii-V-i, with the flat 9th in the tune where it resolves.",
    form: `| Dm7b5 | G7b9 | Cm6 | % | Fm7 | Dm7b5 G7b9 | Cm6 | G7b9 |`,
    melody: `
      | F4:2 Ab4:2 | Ab4:1 G4:1 F4:1 D4:1 | Eb4:3 G4:1 | A4:2 G4:2 |
      | C5:2 Ab4:2 | Ab4:1 F4:1 Ab4:1 B4:1 | C5:4 | r:2 D5:1 B4:1 |
    `,
  },
  colour: {
    slug: "etude-colour",
    title: "Side Door",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 112, max: 180 },
    level: 4,
    blurb: "The tritone substitute in drop 2, and a tune on the notes it shares with the V.",
    form: `| Dm7 | Db7#11 | Cmaj7 | A7 | Dm7 | Db7#11 | C6 | % |`,
    melody: `
      | A4:2 F4:2 | G4:2 F4:1 Eb4:1 | E4:3 G4:1 | A4:1 C#5:1 E5:2 |
      | F5:2 D5:1 A4:1 | B4:2 Ab4:1 F4:1 | E4:4 | r:4 |
    `,
  },
  lines: {
    slug: "etude-lines",
    title: "Thread",
    key: "C",
    style: "swing",
    bpm: { min: 60, default: 116, max: 200 },
    level: 5,
    blurb: "3rds and 7ths on the strong beats, and scale runs threading one to the next.",
    form: `| Dm7 | G7 | Cmaj7 | A7 | Dm7 | G7 | C6 | % |`,
    melody: `
      | F4:2 C5:2 | B4:2 F4:2 | E4:2 B4:2 | C#5:2 G4:2 |
      | F4:2 C5:2 | B4:2 F4:2 | E4:2 G4:2 | C5:2 r:2 |
    `,
  },
  improv: {
    slug: "etude-improv",
    title: "A Chorus Written Down",
    key: "F",
    style: "blues",
    bpm: { min: 70, default: 120, max: 200 },
    level: 5,
    blurb: "One chorus of blues the way a solo is built: a motif, the motif moved, then an answer.",
    form: `
      | F7 | Bb7 | F7 | % |
      | Bb7 | % | F7 | D7 |
      | Gm7 | C7 | F7 | C7 |
    `,
    melody: `
      | A4:1 C5:1 Eb5:2 | D5:1 Bb4:1 Ab4:2 | A4:1 C5:1 Eb5:1 D5:1 | C5:2 r:2 |
      | Ab4:1 Bb4:1 D5:2 | F5:1 D5:1 Bb4:2 | A4:1 C5:1 F5:2 | F#5:1 D5:1 C5:1 A4:1 |
      | Bb4:2 D5:1 F5:1 | E5:1 C5:1 Bb4:1 G4:1 | A4:2 F4:2 | r:4 |
    `,
  },
  ears: {
    slug: "etude-ears",
    title: "Four Colours",
    key: "C",
    style: "ballad",
    bpm: { min: 50, default: 84, max: 140 },
    level: 5,
    blurb: "One line falling by half steps, and each step changes the quality of the chord.",
    form: `| Cmaj7 | C7 | Fmaj7 | Fm6 | Em7 | A7 | Dm7 G7 | C6 |`,
    melody: `
      | B4:4 | Bb4:4 | A4:4 | Ab4:4 |
      | G4:4 | G4:2 C#5:2 | C5:2 B4:2 | C5:4 |
    `,
  },
  advanced: {
    slug: "etude-advanced",
    title: "Eight Bar Rhythm",
    key: "C",
    style: "swing",
    bpm: { min: 90, default: 152, max: 260 },
    level: 6,
    blurb: "Rhythm changes in miniature: four bars of two-beat changes, then the bridge's dominants.",
    form: `| Cmaj7 A7 | Dm7 G7 | Em7 A7 | Dm7 G7 | E7 | A7 | D7 | G7 |`,
    melody: `
      | E4:1 G4:1 C#5:1 A4:1 | F4:1 A4:1 B4:1 G4:1 | G4:1 B4:1 C#5:1 E5:1 | D5:1 A4:1 B4:1 G4:1 |
      | G#4:2 B4:1 D5:1 | C#5:2 A4:1 G4:1 | F#4:2 A4:1 C5:1 | B4:2 G4:1 F4:1 |
    `,
  },
};
