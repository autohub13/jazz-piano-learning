// The beginner curriculum. This one array drives the landing page, the routes
// and the per-lesson metadata, the same way motion-arcade's games registry does.
//
// The first entry is the piece the site opens with. Everything after it is one
// ingredient of that piece, ordered from the largest chunk down to the keyboard
// itself, which is why `order` runs backwards through the traditional syllabus.
//
// Lessons are authored with note names and converted to MIDI once at module
// load, so the content stays readable and the runtime stays numeric.

import { midis, nameToMidi, type Midi } from "@/lib/music/notes";
import type { Finger, Hand, Lesson, LessonStep } from "./types";

const C3 = 48;
const C6 = 84;
const FULL_RANGE = { low: C3, high: C6 };

/** One note per step, all the same length. */
function melody(
  names: string[],
  opts: { beats?: number; fingering?: Finger[]; hand?: Hand; labels?: string[] } = {},
): LessonStep[] {
  const { beats = 1, fingering, hand = "right", labels } = opts;
  return midis(...names).map((note, i) => ({
    notes: [note],
    beats,
    label: labels?.[i],
    fingering: fingering ? [fingering[i]] : undefined,
    hand,
  }));
}

function chord(
  names: string[],
  label: string,
  opts: { beats?: number; fingering?: Finger[]; hand?: Hand; hands?: Hand[] } = {},
): LessonStep {
  const { beats = 4, fingering, hand = "right", hands } = opts;
  return { notes: midis(...names), beats, label, fingering, hand, hands };
}

/**
 * A walking bass line, one note per beat. Bar lines are decoration and a dot
 * is a rest, so the line reads on the page the way it sounds.
 */
function walk(line: string): (Midi | null)[] {
  return line
    .split(/\s+/)
    .filter((token) => token.length > 0 && token !== "|")
    .map((token) => (token === "." ? null : nameToMidi(token)));
}

/** Swung eighths: the offbeat lands on the triplet, not halfway. */
const HIT = 5 / 3;
const HOLD = 7 / 3;

/** Three notes of shell under one note of tune. Matches the vamp's steps. */
const SHELL_UNDER_MELODY: Hand[] = ["left", "left", "left", "right"];

// The piece the whole site is built backwards from. Its left hand is exactly
// the three shells of the ii-V-I lesson, so "the left hand of the vamp is that
// lesson" is literally true.
const DM7_SHELL = ["D3", "F3", "C4"];
const G7_SHELL = ["G3", "B3", "F4"];
const CMAJ7_SHELL = ["C3", "E3", "B3"];

export const theVamp: Lesson = {
  slug: "the-vamp",
  title: "The Vamp",
  topic: "piece",
  order: 1,
  tagline: "Two hands, three chords, one loop. The whole course in eight seconds",
  teachingPoints: [
    "The left hand is Dm7, G7, Cmaj7 as three note shells. It never changes.",
    "The right hand plays one note at a time. Every note is a chord tone or the 9th, and it moves by step apart from two small leaps.",
    "Two hits a bar: one on the beat, one late on the and of two, then let it ring. Landing that second hit late is what swings.",
    "The D over Cmaj7 near the end is the 9th. It is the note that makes this sound like jazz and not like a hymn.",
    "Loop it. The lessons that follow take this apart, one piece at a time.",
  ],
  spelling: "flat",
  defaultBpm: 108,
  bpmRange: [60, 150],
  range: { low: 48, high: 72 },
  keyboardBase: 48,
  steps: [
    chord([...DM7_SHELL, "F4"], "Dm7, F on top", { beats: HIT, fingering: [5, 3, 1, 1], hands: SHELL_UNDER_MELODY }),
    chord([...DM7_SHELL, "A4"], "Dm7, A on top", { beats: HOLD, fingering: [5, 3, 1, 3], hands: SHELL_UNDER_MELODY }),
    chord([...G7_SHELL, "B4"], "G7, B on top", { beats: HIT, fingering: [5, 3, 1, 4], hands: SHELL_UNDER_MELODY }),
    chord([...G7_SHELL, "A4"], "G7, A on top", { beats: HOLD, fingering: [5, 3, 1, 3], hands: SHELL_UNDER_MELODY }),
    chord([...CMAJ7_SHELL, "G4"], "Cmaj7, G on top", { beats: HIT, fingering: [5, 3, 1, 2], hands: SHELL_UNDER_MELODY }),
    chord([...CMAJ7_SHELL, "E4"], "Cmaj7, E on top", { beats: HOLD, fingering: [5, 3, 1, 1], hands: SHELL_UNDER_MELODY }),
    chord([...CMAJ7_SHELL, "D4"], "Cmaj7, D on top  (the 9th)", { beats: HIT, fingering: [5, 3, 1, 1], hands: SHELL_UNDER_MELODY }),
    chord([...CMAJ7_SHELL, "E4"], "Cmaj7, E on top", { beats: HOLD, fingering: [5, 3, 1, 2], hands: SHELL_UNDER_MELODY }),
  ],
  band: {
    startBeat: 0,
    beatsPerBar: 4,
    // Roots and chord tones, with a chromatic note at the end of each bar
    // leaning into the next root. The last bar leans back into D, which is
    // what makes the loop pull round again.
    bass: walk(`
      D2 F2 A2 F#2 |
      G2 B2 D3 Db3 |
      C3 B2 A2 G2  |
      E2 G2 B2 C#2
    `),
  },
  // Every `move` below describes these voicings as they are actually played,
  // not the textbook ideal. Where a note only keeps its pitch class rather
  // than its key, it says so.
  harmony: [
    {
      fromStep: 0,
      symbol: "Dm7",
      numeral: "ii",
      role: "The setup. It belongs to C major and it leans towards the V without any tension of its own.",
      move: "Coming round from Cmaj7 every voice moves by a step or less. The B rises a half step to C, the E a half step to F, the root a whole step to D.",
    },
    {
      fromStep: 2,
      symbol: "G7",
      numeral: "V",
      role: "The tension. A major third with a flat seventh, and the only chord here that wants to go somewhere.",
      move: "The C falls a half step to B. The F belongs to both chords, but it was the third of Dm7 and here it is the seventh.",
    },
    {
      fromStep: 4,
      symbol: "Cmaj7",
      numeral: "I",
      role: "Home. Nothing in it wants to move, which is why the phrase can sit on it for two bars.",
      move: "The B does not move at all, the same key in both chords, and turns from the third of G7 into the seventh of Cmaj7. The F gives way to E.",
    },
  ],
};

const meetTheKeyboard: Lesson = {
  slug: "meet-the-keyboard",
  title: "Meet the Keyboard",
  topic: "orientation",
  order: 8,
  tagline: "Find C, and never get lost again",
  ingredient: "Where C3, D3 and G3 live, so the left hand finds its shells without looking.",
  teachingPoints: [
    "The black keys come in groups of two and three. That pattern repeats every octave.",
    "C is the white key immediately to the left of every group of two black keys.",
    "F is the white key immediately to the left of every group of three.",
    "Middle C is C4, near the centre of a full piano. It is the reference for everything else.",
  ],
  spelling: "sharp",
  defaultBpm: 60,
  bpmRange: [40, 100],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    ...melody(["C3", "C4", "C5", "C6"], {
      beats: 2,
      labels: ["C3", "C4  (middle C)", "C5", "C6"],
    }),
    ...melody(["C#4", "D#4"], { beats: 2, labels: ["the group of two", "the group of two"] }),
    ...melody(["F#4", "G#4", "A#4"], {
      beats: 2,
      labels: ["the group of three", "the group of three", "the group of three"],
    }),
    ...melody(["C4", "F4"], { beats: 2, labels: ["C, left of the two", "F, left of the three"] }),
  ],
};

const cMajorScale: Lesson = {
  slug: "c-major-scale",
  title: "The C Major Scale",
  topic: "scale",
  order: 7,
  tagline: "Seven white keys, and the thumb tuck that gets you there",
  ingredient: "Every right-hand note in the vamp comes from these seven white keys.",
  teachingPoints: [
    "All white keys. This is why almost every piano method starts in C.",
    "Right hand going up: 1 2 3, tuck the thumb under after E, then 1 2 3 4 5.",
    "Coming down, cross the third finger over the thumb after F.",
    "Play it slowly and evenly. Speed is a side effect of accuracy, not a goal.",
  ],
  spelling: "sharp",
  defaultBpm: 72,
  bpmRange: [40, 140],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    ...melody(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], {
      fingering: [1, 2, 3, 1, 2, 3, 4, 5],
      labels: ["C", "D", "E", "F", "G", "A", "B", "C"],
    }),
    ...melody(["B4", "A4", "G4", "F4", "E4", "D4", "C4"], {
      fingering: [4, 3, 2, 1, 3, 2, 1],
      labels: ["B", "A", "G", "F", "E", "D", "C"],
    }),
  ],
};

const intervals: Lesson = {
  slug: "intervals",
  title: "Intervals from C",
  topic: "interval",
  order: 6,
  tagline: "Thirds and sevenths are what make a chord sound like jazz",
  ingredient: "Thirds and sevenths, the two distances every shell in the vamp is built from.",
  teachingPoints: [
    "An interval is the distance between two notes. Play both together and listen.",
    "The 3rd decides major or minor. A major 3rd is four half steps, a minor 3rd is three.",
    "The 5th is the neutral note. It is the first one jazz pianists throw away.",
    "The 7th is the colour. A major 7th is dreamy, a flat 7th wants to move somewhere.",
  ],
  spelling: "flat",
  defaultBpm: 54,
  bpmRange: [40, 90],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    chord(["C4", "Eb4"], "minor 3rd  (C + Eb)", { fingering: [1, 3] }),
    chord(["C4", "E4"], "major 3rd  (C + E)", { fingering: [1, 3] }),
    chord(["C4", "G4"], "perfect 5th  (C + G)", { fingering: [1, 5] }),
    chord(["C4", "Bb4"], "flat 7th  (C + Bb)", { fingering: [1, 5] }),
    chord(["C4", "B4"], "major 7th  (C + B)", { fingering: [1, 5] }),
  ],
};

const triads: Lesson = {
  slug: "triads",
  title: "Major and Minor Triads",
  topic: "triad",
  order: 5,
  tagline: "Three notes, and the one that changes everything",
  ingredient: "The three notes under every seventh chord. Dm and G are both in the vamp.",
  teachingPoints: [
    "A triad is root, 3rd and 5th. Fingers 1, 3 and 5, with a gap under 2 and 4.",
    "Only the middle note moves between major and minor. Everything else stays put.",
    "C, Dm and G are the triads underneath the three chords of the vamp. Add a 7th to each and you have the piece.",
    "Keep the hand shape relaxed and curved. Drop into the keys, do not push them.",
  ],
  spelling: "flat",
  defaultBpm: 56,
  bpmRange: [40, 100],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    chord(["C4", "E4", "G4"], "C major", { fingering: [1, 3, 5] }),
    chord(["C4", "Eb4", "G4"], "C minor", { fingering: [1, 3, 5] }),
    chord(["D4", "F4", "A4"], "D minor", { fingering: [1, 3, 5] }),
    chord(["G4", "B4", "D5"], "G major", { fingering: [1, 3, 5] }),
  ],
};

const seventhChords: Lesson = {
  slug: "seventh-chords",
  title: "The Four Seventh Chords",
  topic: "seventh",
  order: 4,
  tagline: "The whole beginner jazz vocabulary, all rooted on C",
  ingredient: "Where Dm7, G7 and Cmaj7 come from. Three of the four families.",
  teachingPoints: [
    "Jazz is built on four-note chords. Add a 7th on top of a triad and you are there.",
    "Cmaj7 is C E G B. Bright and restful. The 7th sits a half step under the root.",
    "Cm7 is C Eb G Bb. Flatten the 3rd and the 7th. Warm and neutral.",
    "C7 is C E G Bb. Major 3rd, flat 7th. This is the sound of the blues.",
    "Cm7b5 is C Eb Gb Bb, also called half diminished. It opens the minor ii-V-I.",
  ],
  spelling: "flat",
  defaultBpm: 50,
  bpmRange: [40, 90],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    chord(["C4", "E4", "G4", "B4"], "Cmaj7", { fingering: [1, 2, 3, 5] }),
    chord(["C4", "Eb4", "G4", "Bb4"], "Cm7", { fingering: [1, 2, 3, 5] }),
    chord(["C4", "E4", "G4", "Bb4"], "C7", { fingering: [1, 2, 3, 5] }),
    chord(["C4", "Eb4", "Gb4", "Bb4"], "Cm7b5", { fingering: [1, 2, 3, 5] }),
  ],
};

const shellVoicings: Lesson = {
  slug: "shell-voicings",
  title: "Shell Voicings",
  topic: "voicing",
  order: 3,
  tagline: "Root, third, seventh. Drop the rest",
  ingredient: "Why each of those chords is only three notes. Root, third, seventh.",
  teachingPoints: [
    "The root says which chord it is. The 3rd and 7th say what kind of chord it is.",
    "The 5th says almost nothing, so jazz pianists leave it out. That is a shell.",
    "Three notes leave room for a bass player and for your own right hand.",
    "Play these low, around C3. Four-note chords get muddy down there. Shells do not.",
  ],
  spelling: "flat",
  defaultBpm: 50,
  bpmRange: [40, 90],
  range: FULL_RANGE,
  keyboardBase: 48,
  steps: [
    chord(["C3", "E3", "B3"], "Cmaj7 shell  (C E B)", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "Eb3", "Bb3"], "Cm7 shell  (C Eb Bb)", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "C7 shell  (C E Bb)", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "Eb3", "Gb3"], "Cm7b5 shell  (C Eb Gb)", { fingering: [5, 3, 1], hand: "left" }),
  ],
};

const iiViI: Lesson = {
  slug: "ii-v-i",
  title: "ii - V - I in C",
  topic: "progression",
  order: 2,
  tagline: "The most important three chords in jazz",
  ingredient: "The whole left hand of the vamp. Dm7, G7, Cmaj7, and nothing else.",
  teachingPoints: [
    "In C major the chords are Dm7, G7 and Cmaj7. Almost every standard is built from this.",
    "Dm7 to G7: the C falls a half step to B. The F is in both chords, but it was the 3rd of Dm7 and here it is the 7th.",
    "G7 to Cmaj7: the B does not move at all, the same key in both chords, and turns from the 3rd of G7 into the 7th of Cmaj7. The F gives way to E.",
    "That is voice leading. The 3rd and the 7th swap jobs: one note belongs to both chords, the other slides a half step.",
    "Between G7 and Cmaj7 the B stays under the same finger. Between Dm7 and G7 the shared F jumps an octave instead, which a tighter voicing would avoid.",
    "Loop it until your hand finds the shapes without looking.",
  ],
  spelling: "flat",
  defaultBpm: 52,
  bpmRange: [40, 100],
  range: FULL_RANGE,
  keyboardBase: 48,
  steps: [
    chord(["D3", "F3", "C4"], "Dm7  (D F C)", { fingering: [5, 3, 1], hand: "left" }),
    chord(["G3", "B3", "F4"], "G7  (G B F)", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "B3"], "Cmaj7  (C E B)", { beats: 8, fingering: [5, 3, 1], hand: "left" }),
  ],
  band: {
    startBeat: 0,
    beatsPerBar: 4,
    // Four bars: one on the ii, one on the V, two on the I. The last bar
    // settles on the root rather than leaning away, because this one is meant
    // to be heard stopping as well as looping.
    bass: walk(`
      D2 F2 A2 F#2 |
      G2 B2 D3 Db3 |
      C3 B2 A2 G2  |
      E2 G2 B2 C3
    `),
  },
  harmony: [
    {
      fromStep: 0,
      symbol: "Dm7",
      numeral: "ii",
      role: "The setup. Built on the second note of the C major scale, and it leans towards the V.",
      move: "Three notes: the root, the flat third and the flat seventh. The fifth is missing, and you will not miss it.",
    },
    {
      fromStep: 1,
      symbol: "G7",
      numeral: "V",
      role: "The tension. A major third with a flat seventh, which is what makes a chord want to resolve.",
      move: "The C falls a half step to B. The F is in both chords, but it was the third of Dm7 and here it is the seventh.",
    },
    {
      fromStep: 2,
      symbol: "Cmaj7",
      numeral: "I",
      role: "Home. The tension is gone and the phrase can stop here.",
      move: "The B does not move at all, the same key in both chords, and turns from the third of G7 into the seventh of Cmaj7. The F gives way to E.",
    },
  ],
};

const blues: Lesson = {
  slug: "blues-in-c",
  title: "The Blues Scale and Twelve Bars",
  topic: "blues",
  order: 9,
  tagline: "Six notes and three chords you can improvise with today",
  ingredient: "Not in the vamp. The same left-hand shells driving a twelve bar blues, for when the vamp is easy.",
  teachingPoints: [
    "The C blues scale is C Eb F Gb G Bb. Six notes, and every one of them works.",
    "Gb is the blue note. Pass through it quickly on the way to G and it sings.",
    "The twelve bar form uses three dominant chords: C7, F7 and G7, played as shells.",
    "Play the shells with your left hand and improvise the scale with your right.",
  ],
  spelling: "flat",
  defaultBpm: 84,
  bpmRange: [50, 160],
  range: FULL_RANGE,
  keyboardBase: 60,
  steps: [
    ...melody(["C4", "Eb4", "F4", "Gb4", "G4", "Bb4", "C5"], {
      fingering: [1, 2, 3, 4, 1, 2, 3],
      labels: ["C", "Eb", "F", "Gb  (blue note)", "G", "Bb", "C"],
    }),
    ...melody(["Bb4", "G4", "Gb4", "F4", "Eb4", "C4"], {
      fingering: [3, 2, 1, 3, 2, 1],
      labels: ["Bb", "G", "Gb", "F", "Eb", "C"],
    }),
    // One shell per bar of a twelve bar chorus in C.
    chord(["C3", "E3", "Bb3"], "Bar 1  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["F3", "A3", "Eb4"], "Bar 2  F7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "Bar 3  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "Bar 4  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["F3", "A3", "Eb4"], "Bar 5  F7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["F3", "A3", "Eb4"], "Bar 6  F7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "Bar 7  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "Bar 8  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["G3", "B3", "F4"], "Bar 9  G7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["F3", "A3", "Eb4"], "Bar 10  F7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["C3", "E3", "Bb3"], "Bar 11  C7", { fingering: [5, 3, 1], hand: "left" }),
    chord(["G3", "B3", "F4"], "Bar 12  G7", { fingering: [5, 3, 1], hand: "left" }),
  ],
  band: {
    // The first thirteen beats are the scale, played alone. The band waits and
    // comes in on bar one of the chorus.
    startBeat: 13,
    beatsPerBar: 4,
    bass: walk(`
      C2  E2  G2  E2  |
      F2  A2  C3  A2  |
      C2  E2  G2  A2  |
      C3  Bb2 A2  Gb2 |
      F2  A2  C3  Eb3 |
      F2  Ab2 A2  B2  |
      C3  B2  A2  G2  |
      E2  G2  A2  F#2 |
      G2  A2  B2  C3  |
      F2  A2  C3  B2  |
      C3  Bb2 A2  Ab2 |
      G2  F2  E2  Db2
    `),
  },
};

// A traditional spiritual, out of copyright, and the tune everybody already
// knows. Melody and chords follow the standard transcription; the voicings and
// the bass line are this site's arrangement.
//
// The tonic is C6 rather than Cmaj7 on purpose: the melody lands on C again and
// again, and a major 7th would sit a semitone underneath it and grind.
const C6_SHELL = ["C3", "E3", "A3"];
const C7_SHELL = ["C3", "E3", "Bb3"];
const F_SHELL = ["F2", "E3", "A3"];
const G7_LOW_SHELL = ["G2", "F3", "B3"];

const theSaints: Lesson = {
  slug: "when-the-saints",
  title: "When the Saints Go Marching In",
  topic: "song",
  order: 10,
  tagline: "A whole tune, sixteen bars, built from the shells you already have",
  teachingPoints: [
    "Sixteen bars built on three roots, C, F and G, and the first six bars never leave home. The form is the easy part.",
    "The melody is five notes, C D E F G, under one hand with no thumb tucks. Steps and small thirds, apart from two drops of a fifth where the phrase starts over.",
    "The left hand is the same three note shells as the vamp: the root, and the two notes that say what kind of chord it is.",
    "Between C and F the top two notes of the shell do not move at all. Only the root travels.",
    "The tune starts before the bar does. Count one, play the three pickup notes, and the band arrives with you on 'saints'.",
  ],
  spelling: "flat",
  defaultBpm: 132,
  bpmRange: [80, 176],
  range: { low: 36, high: 72 },
  keyboardBase: 41,
  // Labels are the words, so the cue line sings along. The left hand strikes
  // only on beats one and three; the pickup runs are melody alone.
  steps: [
    chord(["C4"], "Oh", { beats: 1 }),
    chord(["E4"], "when", { beats: 1 }),
    chord(["F4"], "the", { beats: 1 }),
    chord([...C6_SHELL, "G4"], "saints", { beats: 5, hands: SHELL_UNDER_MELODY }),
    chord(["C4"], "go", { beats: 1 }),
    chord(["E4"], "march-", { beats: 1 }),
    chord(["F4"], "ing", { beats: 1 }),
    chord([...C6_SHELL, "G4"], "in", { beats: 5, hands: SHELL_UNDER_MELODY }),
    chord(["C4"], "oh", { beats: 1 }),
    chord(["E4"], "when", { beats: 1 }),
    chord(["F4"], "the", { beats: 1 }),
    chord([...C6_SHELL, "G4"], "saints", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C6_SHELL, "E4"], "go", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C6_SHELL, "C4"], "march-", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C6_SHELL, "E4"], "ing", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...G7_LOW_SHELL, "D4"], "in", { beats: 5, hands: SHELL_UNDER_MELODY }),
    chord(["E4"], "I", { beats: 1 }),
    chord([...G7_LOW_SHELL, "E4"], "want", { beats: 1, hands: SHELL_UNDER_MELODY }),
    chord(["D4"], "to", { beats: 1 }),
    chord([...C6_SHELL, "C4"], "be", { beats: 4, hands: SHELL_UNDER_MELODY }),
    chord([...C7_SHELL, "E4"], "in", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C7_SHELL, "G4"], "that", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...F_SHELL, "G4"], "num-", { beats: 1, hands: SHELL_UNDER_MELODY }),
    chord(["F4"], "ber", { beats: 5 }),
    chord([...F_SHELL, "E4"], "when", { beats: 1, hands: SHELL_UNDER_MELODY }),
    chord(["F4"], "the", { beats: 1 }),
    chord([...C6_SHELL, "G4"], "saints", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C6_SHELL, "E4"], "go", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...F_SHELL, "C4"], "march-", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...G7_LOW_SHELL, "D4"], "ing", { beats: 2, hands: SHELL_UNDER_MELODY }),
    chord([...C6_SHELL, "C4"], "in", { beats: 8, hands: SHELL_UNDER_MELODY }),
  ],
  band: {
    // Three beats of pickup are unaccompanied; the band lands on bar one.
    startBeat: 3,
    beatsPerBar: 4,
    bass: walk(`
      C2  E2  G2  A2  |
      G2  E2  C2  D2  |
      C2  E2  G2  A2  |
      G2  E2  C2  D2  |
      C2  E2  G2  A2  |
      G2  E2  F2  F#2 |
      G2  B2  D3  B2  |
      G2  F2  E2  D2  |
      C2  E2  G2  A2  |
      C3  Bb2 A2  G2  |
      F2  A2  C3  D3  |
      C3  A2  F2  B2  |
      C3  B2  A2  G2  |
      F2  A2  G2  B2  |
      C3  G2  E2  G2  |
      C3  A2  G2  E2
    `),
  },
  harmony: [
    {
      fromStep: 0,
      symbol: "C6",
      numeral: "I",
      role: "Home, and the tune stays here for six straight bars. That is why anyone can sing it back after one hearing.",
    },
    {
      fromStep: 15,
      symbol: "G7",
      numeral: "V",
      role: "The first real tension, seven bars in. A major third with a flat seventh.",
      move: "The E rises a half step to F and the A a whole step to B. Two small moves and the chord has changed.",
    },
    {
      fromStep: 19,
      symbol: "C6",
      numeral: "I",
      role: "Home again, halfway through the tune.",
      move: "The F falls back to E and the B back to A. The same two notes, travelling the other way.",
    },
    {
      fromStep: 20,
      symbol: "C7",
      numeral: "I7",
      role: "The same chord turns into a dominant seventh. It stops sounding like home and starts pointing at F.",
      move: "One note moves. The A rises a half step to Bb, and that is the whole trick.",
    },
    {
      fromStep: 22,
      symbol: "Fmaj7",
      numeral: "IV",
      role: "One step away from home. The sound of a hymn, and of every brass band that ever played this tune.",
      move: "The Bb falls back to A, the E stays put, and the root drops from C to F.",
    },
    {
      fromStep: 26,
      symbol: "C6",
      numeral: "I",
      role: "Home for the last phrase.",
      move: "The top two notes do not move at all. The 7th and 3rd of F become the 3rd and 6th of C, and only the root travels.",
    },
    {
      fromStep: 28,
      symbol: "Fmaj7",
      numeral: "IV",
      role: "One last step away, for half a bar.",
      move: "Only the root moves again, C back down to F.",
    },
    {
      fromStep: 29,
      symbol: "G7",
      numeral: "V",
      role: "Two beats of tension, and then it is over.",
      move: "The E rises to F and the A to B. The same move as the first time round.",
    },
    {
      fromStep: 30,
      symbol: "C6",
      numeral: "I",
      role: "Home. The melody lands on the root and the tune stops.",
      move: "The F falls to E, the B to A, and nothing wants to move any more.",
    },
  ],
};

export const lessons: Lesson[] = [
  theVamp,
  theSaints,
  meetTheKeyboard,
  cMajorScale,
  intervals,
  triads,
  seventhChords,
  shellVoicings,
  iiViI,
  blues,
].sort((a, b) => a.order - b.order);

export function getLesson(slug: string): Lesson {
  const lesson = lessons.find((l) => l.slug === slug);
  if (!lesson) throw new Error(`Unknown lesson slug: ${slug}`);
  return lesson;
}

/** Non-throwing lookup, for routes that should render a 404 instead. */
export function findLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
