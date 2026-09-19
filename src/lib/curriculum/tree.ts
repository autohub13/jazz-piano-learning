// The path from the first key press to playing a tune at a jam session. Six
// levels; each unit is one skill drilled alone, then used in a progression,
// then in a tune. Everything is generated in all twelve keys unless the skill
// is about where the keys are.

import type { Variation } from "@/lib/arrange/arrange";
import { arrangeTune } from "@/lib/arrange/tune";
import { transposeLesson, type KeyName } from "@/lib/lessons/transpose";
import { getLesson } from "@/lib/lessons/curriculum";
import type { Lesson } from "@/lib/lessons/types";
import { etudes } from "@/lib/tunes/etudes";
import { findTune } from "@/lib/tunes/library";
import { songs } from "@/lib/tunes/songs";
import { KEY_ORDER } from "@/lib/progress";
import {
  chordDrill,
  earLesson,
  guideToneEtude,
  inversionDrill,
  progressionDrill,
  PROGRESSIONS,
  scaleDrill,
  tuneLesson,
} from "./generators";
import { TEACHING } from "./teaching";
import type { Exercise, Level, Unit } from "./types";

export const units: Unit[] = [
  { id: "keyboard", level: 1, title: "The keyboard", blurb: "Where the notes are, and the first scale." },
  { id: "chords", level: 1, title: "Chords", blurb: "Intervals, triads, and the four seventh chords." },
  { id: "shells", level: 2, title: "Shells", blurb: "The root and one guide tone. The smallest voicing that sounds like the chord." },
  { id: "cadence", level: 2, title: "The ii-V-I", blurb: "The three chords most tunes are made of, in every key." },
  { id: "first-tunes", level: 2, title: "First tunes", blurb: "The blues, a sixteen-bar tune, and your first solo, with the band." },
  { id: "accompaniment", level: 2, title: "Accompaniment", blurb: "Which hand plays what, and which inversion the melody asks for." },
  { id: "rootless", level: 3, title: "Rootless voicings", blurb: "The bass has the root. Your left hand plays 3, 5, 7, 9." },
  { id: "comping", level: 3, title: "Comping", blurb: "Charleston, anticipations, and the turnaround." },
  { id: "changes", level: 3, title: "Playing changes", blurb: "Tunes with dominants that move." },
  { id: "minor", level: 4, title: "Minor", blurb: "The minor ii-V-i and altered dominants." },
  { id: "colour", level: 4, title: "Colour", blurb: "Drop 2, tritone substitution, and the tunes that use them." },
  { id: "lines", level: 5, title: "Lines", blurb: "Chord scales, guide tones, and how bebop connects them." },
  { id: "improv", level: 5, title: "Improvising", blurb: "The band plays the form. You play what you hear." },
  { id: "ears", level: 5, title: "Ears", blurb: "Hear a chord and play it back." },
  { id: "advanced", level: 6, title: "The session", blurb: "Rhythm changes, quartal voicings, tempo." },
];

const ALL_ACC = 0.9;

function authored(slug: string): (key: KeyName) => Lesson {
  return (key) => transposeLesson(getLesson(slug), key);
}

function tune(slug: string, level: number): (key: KeyName) => Lesson {
  const t = findTune(slug);
  if (!t) throw new Error(`No tune ${slug}`);
  return (key) => tuneLesson(t, key, level);
}

const ROOTLESS_HELD = { voicing: "rootless", reharm: "written", melody: "written", rhythm: "held", texture: "written" } as const;
const ROOTLESS_CHARLESTON = { voicing: "rootless", reharm: "written", melody: "written", rhythm: "charleston", texture: "written" } as const;
const SHELL_HELD = { voicing: "shell", reharm: "written", melody: "written", rhythm: "held", texture: "written" } as const;
const DROP2_ANTICIPATE = { voicing: "drop2", reharm: "written", melody: "written", rhythm: "anticipate", texture: "written" } as const;
const QUARTAL = { voicing: "quartal", reharm: "written", melody: "written", rhythm: "charleston", texture: "written" } as const;
const MELODY_TOP = { ...SHELL_HELD, texture: "melodyTop" } as const;
const FILL = { ...SHELL_HELD, rhythm: "fill" } as const;
const STRIDE = { ...SHELL_HELD, texture: "stride" } as const;
const SOLO = { ...SHELL_HELD, texture: "solo" } as const;

function ex(
  partial: Omit<Exercise, "mastery" | "prerequisites" | "minutes" | "keys" | "tune" | "teachingPoints"> &
    Partial<Pick<Exercise, "mastery" | "prerequisites" | "minutes" | "keys" | "tune" | "etude">>,
): Exercise {
  return {
    keys: "all",
    mastery: { accuracy: ALL_ACC },
    prerequisites: [],
    minutes: 3,
    teachingPoints: TEACHING[partial.id] ?? [],
    ...partial,
  };
}

/** A unit's etude: its piece from the etude book, arranged the way the unit plays. */
function etude(
  partial: Pick<Exercise, "unit" | "level" | "prerequisites" | "mastery" | "minutes"> & Partial<Pick<Exercise, "keys">> & { variation: Variation },
): Exercise {
  const { variation, ...rest } = partial;
  const t = etudes[partial.unit];
  return ex({
    ...rest,
    id: t.slug,
    title: `Etude: ${t.title}`,
    kind: "tune",
    blurb: t.blurb,
    etude: true,
    generate: (key) => arrangeTune(t, key, variation),
  });
}

const core: Exercise[] = [
  // Level 1
  ex({ id: "meet-the-keyboard", title: "Meet the keyboard", kind: "drill", level: 1, unit: "keyboard", keys: ["C"], blurb: "Find C and F by the black key groups.", generate: authored("meet-the-keyboard"), minutes: 2 }),
  ex({ id: "major-scale", title: "Major scale", kind: "drill", level: 1, unit: "keyboard", blurb: "One octave up and down with the right fingering.", generate: (k) => scaleDrill("major", k), mastery: { accuracy: ALL_ACC, bpm: 100 } }),
  etude({ unit: "keyboard", level: 1, keys: ["C", "F", "G"], variation: SOLO, prerequisites: ["major-scale"], mastery: { accuracy: ALL_ACC, bpm: 80 }, minutes: 3 }),
  ex({ id: "intervals", title: "Intervals", kind: "drill", level: 1, unit: "chords", blurb: "Thirds, fifths and sevenths from the root.", generate: authored("intervals"), }),
  ex({ id: "triads", title: "Triads", kind: "drill", level: 1, unit: "chords", blurb: "Major and minor. Only the middle note moves.", generate: authored("triads"), prerequisites: ["intervals"] }),
  ex({ id: "seventh-chords", title: "Seventh chords", kind: "drill", level: 1, unit: "chords", blurb: "maj7, m7, 7 and m7b5 on one root.", generate: authored("seventh-chords"), prerequisites: ["triads"] }),
  etude({ unit: "chords", level: 1, variation: SOLO, prerequisites: ["seventh-chords"], mastery: { accuracy: ALL_ACC, bpm: 84 }, minutes: 3 }),

  // Level 2
  ex({ id: "shells", title: "Shell voicings", kind: "drill", level: 2, unit: "shells", blurb: "Root and 7th, then root and 3rd, for each quality.", generate: (k) => chordDrill(["maj7", "m7", "7", "m7b5"], "shell", k), prerequisites: ["seventh-chords"] }),
  etude({ unit: "shells", level: 2, variation: SHELL_HELD, prerequisites: ["shells"], mastery: { accuracy: ALL_ACC, bpm: 90 }, minutes: 4 }),
  ex({ id: "ii-v-i-shells", title: "ii-V-I in shells", kind: "progression", level: 2, unit: "cadence", blurb: "Three chords, the bass walking underneath.", generate: (k) => progressionDrill(PROGRESSIONS["ii-v-i"], k, SHELL_HELD), prerequisites: ["shells"], mastery: { accuracy: ALL_ACC, bpm: 100 }, minutes: 4 }),
  ex({ id: "the-vamp", title: "The vamp", kind: "tune", level: 2, unit: "cadence", blurb: "Two hands over the ii-V-I. The site's first piece.", generate: authored("the-vamp"), prerequisites: ["ii-v-i-shells"], mastery: { accuracy: ALL_ACC, bpm: 108 }, minutes: 5 }),
  etude({ unit: "cadence", level: 2, variation: SHELL_HELD, prerequisites: ["ii-v-i-shells"], mastery: { accuracy: ALL_ACC, bpm: 100 }, minutes: 5 }),
  ex({ id: "f-blues", title: "Blues in F", kind: "tune", level: 2, unit: "first-tunes", blurb: "Twelve bars with a riff on top.", tune: "f-blues", generate: tune("f-blues", 2), prerequisites: ["shells"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 5 }),
  ex({ id: "when-the-saints", title: "When the Saints", kind: "tune", level: 2, unit: "first-tunes", blurb: "Sixteen bars, three roots, one melody hand.", tune: "when-the-saints", generate: tune("when-the-saints", 2), prerequisites: ["shells"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 6 }),
  ex({ id: "scale-blues", title: "Blues scale", kind: "drill", level: 2, unit: "first-tunes", blurb: "Six notes that work over the whole blues, with the band under you.", generate: (k) => scaleDrill("blues", k), prerequisites: ["major-scale"], mastery: { accuracy: ALL_ACC, bpm: 100 } }),
  ex({ id: "improv-f-blues", title: "Improvise over the blues", kind: "improv", level: 2, unit: "first-tunes", blurb: "Your first solo. The band plays twelve bars and the blues scale does the rest.", tune: "f-blues", generate: tune("f-blues", 2), prerequisites: ["scale-blues", "f-blues"], mastery: { accuracy: 0.8, bpm: 100 }, minutes: 6 }),
  etude({ unit: "first-tunes", level: 2, variation: SHELL_HELD, prerequisites: ["scale-blues", "f-blues"], mastery: { accuracy: ALL_ACC, bpm: 100 }, minutes: 5 }),
  ex({ id: "inversions", title: "Inversions", kind: "drill", level: 2, unit: "accompaniment", blurb: "The ii-V-I in close position, each chord tone taking its turn on top.", generate: inversionDrill, prerequisites: ["seventh-chords"] }),
  ex({ id: "melody-on-top", title: "Melody on top", kind: "progression", level: 2, unit: "accompaniment", blurb: "The melody note picks the inversion. The left hand plays the root.", generate: (k) => guideToneEtude(PROGRESSIONS.turnaround, k, MELODY_TOP), prerequisites: ["inversions", "ii-v-i-shells"], mastery: { accuracy: ALL_ACC, bpm: 90 }, minutes: 4 }),
  ex({ id: "saints-melody-chords", title: "When the Saints, two hands", kind: "tune", level: 2, unit: "accompaniment", blurb: "Root in the left hand, the chord filled in under the tune on the notes that carry it.", tune: "when-the-saints", generate: (k) => arrangeTune(findTune("when-the-saints")!, k, MELODY_TOP), prerequisites: ["melody-on-top", "when-the-saints"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 6 }),
  ex({ id: "blues-fill", title: "Blues in F, in the gaps", kind: "tune", level: 2, unit: "accompaniment", blurb: "The left hand plays on the changes and where the riff is still.", tune: "f-blues", generate: (k) => arrangeTune(findTune("f-blues")!, k, FILL), prerequisites: ["f-blues"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 5 }),
  ex({ id: "saints-stride", title: "When the Saints, stride", kind: "tune", level: 2, unit: "accompaniment", blurb: "Bass on one and three, chord on two and four, tune on top.", tune: "when-the-saints", generate: (k) => arrangeTune(findTune("when-the-saints")!, k, STRIDE), prerequisites: ["saints-melody-chords"], mastery: { accuracy: ALL_ACC, bpm: 90 }, minutes: 6 }),
  etude({ unit: "accompaniment", level: 2, variation: MELODY_TOP, prerequisites: ["melody-on-top"], mastery: { accuracy: ALL_ACC, bpm: 80 }, minutes: 4 }),

  // Level 3
  ex({ id: "rootless-forms", title: "Rootless A and B forms", kind: "drill", level: 3, unit: "rootless", blurb: "3-5-7-9 and 7-9-3-5 for each quality.", generate: (k) => chordDrill(["maj7", "m7", "7", "m7b5"], "rootless", k), prerequisites: ["ii-v-i-shells"] }),
  ex({ id: "ii-v-i-rootless", title: "ii-V-I rootless", kind: "progression", level: 3, unit: "rootless", blurb: "The cadence with the forms that barely move.", generate: (k) => progressionDrill(PROGRESSIONS["ii-v-i"], k, ROOTLESS_HELD), prerequisites: ["rootless-forms"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  etude({ unit: "rootless", level: 3, variation: ROOTLESS_HELD, prerequisites: ["ii-v-i-rootless"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 4 }),
  ex({ id: "turnaround", title: "Turnaround", kind: "progression", level: 3, unit: "comping", blurb: "I-vi-ii-V with a Charleston rhythm.", generate: (k) => progressionDrill(PROGRESSIONS.turnaround, k, ROOTLESS_CHARLESTON), prerequisites: ["ii-v-i-rootless"], mastery: { accuracy: ALL_ACC, bpm: 130 }, minutes: 4 }),
  ex({ id: "bb-blues", title: "Blues in Bb, comping", kind: "tune", level: 3, unit: "comping", blurb: "Rootless comping through the blues.", tune: "bb-blues", generate: tune("bb-blues", 3), prerequisites: ["rootless-forms", "f-blues"], mastery: { accuracy: ALL_ACC, bpm: 130 }, minutes: 5 }),
  etude({ unit: "comping", level: 3, variation: ROOTLESS_CHARLESTON, prerequisites: ["turnaround"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  ex({ id: "blues-cycle", title: "Blues with a cycle", kind: "tune", level: 3, unit: "changes", blurb: "VI7, II7, V7, each falling a fifth into the next.", tune: "blues-cycle", generate: tune("blues-cycle", 3), prerequisites: ["bb-blues"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 5 }),
  ex({ id: "a-train", title: "Take the A Train", kind: "tune", level: 3, unit: "changes", blurb: "Home, then the II7 with a #11, then a ii-V back.", tune: "a-train", generate: tune("a-train", 3), prerequisites: ["turnaround"], mastery: { accuracy: ALL_ACC, bpm: 140 }, minutes: 7 }),
  ex({ id: "ja-da-changes", title: "Ja-Da", kind: "tune", level: 3, unit: "changes", blurb: "A7 D7 G7, the first cycle of dominants.", tune: "ja-da-changes", generate: tune("ja-da-changes", 3), prerequisites: ["turnaround"], mastery: { accuracy: ALL_ACC, bpm: 140 }, minutes: 5 }),
  ex({ id: "all-of-me", title: "All of Me", kind: "tune", level: 3, unit: "changes", blurb: "Two bars a chord, dominants falling by fifths. The tune every session knows.", tune: "all-of-me", generate: tune("all-of-me", 3), prerequisites: ["ja-da-changes"], mastery: { accuracy: ALL_ACC, bpm: 140 }, minutes: 7 }),
  ex({ id: "indiana-changes", title: "Back Home Again in Indiana", kind: "tune", level: 3, unit: "changes", blurb: "Thirty-two bars of moving dominants.", tune: "indiana-changes", generate: tune("indiana-changes", 3), prerequisites: ["ja-da-changes"], mastery: { accuracy: ALL_ACC, bpm: 150 }, minutes: 7 }),
  etude({ unit: "changes", level: 3, variation: ROOTLESS_CHARLESTON, prerequisites: ["ja-da-changes"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),

  // Level 4
  ex({ id: "minor-ii-v-i", title: "Minor ii-V-i", kind: "progression", level: 4, unit: "minor", blurb: "m7b5, 7b9, m6.", generate: (k) => progressionDrill(PROGRESSIONS["minor-ii-v-i"], k, ROOTLESS_HELD), prerequisites: ["ii-v-i-rootless"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  ex({ id: "altered-dominants", title: "Altered dominants", kind: "drill", level: 4, unit: "minor", blurb: "The rootless dominant plain, with a b9, and with a b13.", generate: (k) => chordDrill(["7", "7b9", "7b13"], "rootless", k), prerequisites: ["minor-ii-v-i"] }),
  ex({ id: "minor-blues", title: "Mr. P.C.", kind: "tune", level: 4, unit: "minor", blurb: "Coltrane's minor blues: twelve bars, with the bVI7 sliding to V7.", tune: "minor-blues", generate: tune("minor-blues", 4), prerequisites: ["minor-ii-v-i"], mastery: { accuracy: ALL_ACC, bpm: 130 }, minutes: 5 }),
  etude({ unit: "minor", level: 4, variation: ROOTLESS_HELD, prerequisites: ["minor-ii-v-i"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 4 }),
  ex({ id: "drop2-forms", title: "Drop 2 voicings", kind: "drill", level: 4, unit: "colour", blurb: "Four inversions, one voice dropped an octave.", generate: (k) => chordDrill(["maj7", "m7", "7"], "drop2", k), prerequisites: ["rootless-forms"] }),
  ex({ id: "tritone-sub", title: "Tritone substitution", kind: "progression", level: 4, unit: "colour", blurb: "ii-bII7-I. Same 3rd and 7th, bass a half step above.", generate: (k) => progressionDrill(PROGRESSIONS["tritone-ii-v-i"], k, DROP2_ANTICIPATE), prerequisites: ["drop2-forms"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  ex({ id: "satin-doll", title: "Satin Doll", kind: "tune", level: 4, unit: "colour", blurb: "ii-Vs climbing by step, and a tritone substitute you can hum.", tune: "satin-doll", generate: tune("satin-doll", 4), prerequisites: ["tritone-sub"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 7 }),
  ex({ id: "autumn-changes", title: "Autumn Leaves", kind: "tune", level: 4, unit: "colour", blurb: "Major and minor ii-V-I side by side.", tune: "autumn-changes", generate: tune("autumn-changes", 4), prerequisites: ["minor-ii-v-i", "drop2-forms"], mastery: { accuracy: ALL_ACC, bpm: 140 }, minutes: 8 }),
  etude({ unit: "colour", level: 4, variation: DROP2_ANTICIPATE, prerequisites: ["tritone-sub"], mastery: { accuracy: ALL_ACC, bpm: 110 }, minutes: 4 }),

  // Level 5
  ex({ id: "scale-dorian", title: "Dorian", kind: "drill", level: 5, unit: "lines", blurb: "The scale over a m7 chord.", generate: (k) => scaleDrill("dorian", k), prerequisites: ["major-scale"], mastery: { accuracy: ALL_ACC, bpm: 120 } }),
  ex({ id: "scale-mixolydian", title: "Mixolydian", kind: "drill", level: 5, unit: "lines", blurb: "The scale over a 7 chord.", generate: (k) => scaleDrill("mixolydian", k), prerequisites: ["major-scale"], mastery: { accuracy: ALL_ACC, bpm: 120 } }),
  ex({ id: "scale-bebop", title: "Bebop scale", kind: "drill", level: 5, unit: "lines", blurb: "Mixolydian plus a passing 7th, so the chord tones land on the beats.", generate: (k) => scaleDrill("bebop", k), prerequisites: ["scale-mixolydian"], mastery: { accuracy: ALL_ACC, bpm: 140 } }),
  ex({ id: "guide-tones", title: "Guide tone line", kind: "tune", level: 5, unit: "lines", blurb: "The 3rd or 7th of each chord, one note each, over the ii-V-I.", generate: (k) => guideToneEtude(PROGRESSIONS["ii-v-i"], k, ROOTLESS_HELD), prerequisites: ["ii-v-i-rootless"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  ex({ id: "enclosures", title: "Enclosures", kind: "tune", level: 5, unit: "lines", blurb: "Each guide tone approached from above and below.", generate: (k) => guideToneEtude(PROGRESSIONS["ii-v-i"], k, { ...ROOTLESS_HELD, melody: "enclosure" }), prerequisites: ["guide-tones"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 4 }),
  ex({ id: "bebop-lines", title: "Lines through the cycle", kind: "tune", level: 5, unit: "lines", blurb: "Scale runs between guide tones through the cycle of dominants.", generate: (k) => guideToneEtude(PROGRESSIONS["cycle-of-dominants"], k, { ...ROOTLESS_CHARLESTON, melody: "scaleRun" }), prerequisites: ["enclosures", "scale-bebop"], mastery: { accuracy: ALL_ACC, bpm: 140 }, minutes: 5 }),
  etude({ unit: "lines", level: 5, variation: { ...ROOTLESS_HELD, melody: "scaleRun" }, prerequisites: ["enclosures"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 5 }),
  ex({ id: "improv-ii-v-i", title: "Improvise over the ii-V-I", kind: "improv", level: 5, unit: "improv", blurb: "The band loops the cadence. Play chord tones on the beat.", generate: (k) => progressionDrill(PROGRESSIONS["ii-v-i"], k, ROOTLESS_CHARLESTON), prerequisites: ["guide-tones"], mastery: { accuracy: 0.8, bpm: 120 }, minutes: 5 }),
  ex({ id: "improv-so-what", title: "Improvise over So What", kind: "improv", level: 5, unit: "improv", blurb: "One dorian scale for sixteen bars, then the same thing a half step up.", tune: "so-what", generate: tune("so-what", 5), prerequisites: ["scale-dorian"], mastery: { accuracy: 0.8, bpm: 130 }, minutes: 6 }),
  ex({ id: "improv-jazz-blues", title: "Improvise over the jazz blues", kind: "improv", level: 5, unit: "improv", blurb: "Every substitution a bebop player adds.", tune: "jazz-blues-f", generate: tune("jazz-blues-f", 5), prerequisites: ["improv-f-blues"], mastery: { accuracy: 0.8, bpm: 150 }, minutes: 6 }),
  ex({ id: "improv-autumn", title: "Improvise over Autumn Leaves", kind: "improv", level: 5, unit: "improv", blurb: "Thirty-two bars, major and minor.", tune: "autumn-changes", generate: tune("autumn-changes", 5), prerequisites: ["improv-jazz-blues", "autumn-changes"], mastery: { accuracy: 0.8, bpm: 150 }, minutes: 8 }),
  ex({ id: "improv-blue-bossa", title: "Improvise over Blue Bossa", kind: "improv", level: 5, unit: "improv", blurb: "Sixteen bars in minor, with four bars a half step above home in the middle.", tune: "blue-bossa", generate: tune("blue-bossa", 5), prerequisites: ["improv-ii-v-i", "minor-ii-v-i"], mastery: { accuracy: 0.8, bpm: 130 }, minutes: 6 }),
  ex({ id: "improv-tune-up", title: "Improvise over Tune Up", kind: "improv", level: 5, unit: "improv", blurb: "Three ii-V-Is, each a whole step below the last. One idea, moved.", tune: "tune-up", generate: tune("tune-up", 5), prerequisites: ["improv-ii-v-i"], mastery: { accuracy: 0.8, bpm: 150 }, minutes: 6 }),
  etude({ unit: "improv", level: 5, variation: ROOTLESS_CHARLESTON, prerequisites: ["improv-ii-v-i"], mastery: { accuracy: ALL_ACC, bpm: 120 }, minutes: 5 }),
  ex({ id: "ear-quality", title: "Hear the quality", kind: "ear", level: 5, unit: "ears", blurb: "A seventh chord is played. Play it back.", generate: (k) => earLesson("quality", k), prerequisites: ["rootless-forms"], mastery: { accuracy: 0.85 }, minutes: 4 }),
  ex({ id: "ear-cadence", title: "Hear the cadence", kind: "ear", level: 5, unit: "ears", blurb: "Major, minor or tritone ii-V-I. Play what you heard.", generate: (k) => earLesson("cadence", k), prerequisites: ["ear-quality", "minor-ii-v-i"], mastery: { accuracy: 0.85 }, minutes: 5 }),
  etude({ unit: "ears", level: 5, variation: ROOTLESS_HELD, prerequisites: ["ear-quality"], mastery: { accuracy: ALL_ACC, bpm: 80 }, minutes: 4 }),

  // Level 6
  ex({ id: "quartal-forms", title: "Quartal voicings", kind: "drill", level: 6, unit: "advanced", blurb: "Stacked fourths. The modern sound.", generate: (k) => chordDrill(["m7", "7", "maj7"], "quartal", k), prerequisites: ["drop2-forms"] }),
  ex({ id: "iii-vi-ii-v", title: "iii-VI7-ii-V7", kind: "progression", level: 6, unit: "advanced", blurb: "The turnaround at the end of each rhythm changes A section, with altered dominants.", generate: (k) => progressionDrill(PROGRESSIONS["iii-vi-ii-v"], k, QUARTAL), prerequisites: ["quartal-forms", "altered-dominants"], mastery: { accuracy: ALL_ACC, bpm: 160 }, minutes: 4 }),
  ex({ id: "so-what", title: "So What", kind: "tune", level: 6, unit: "advanced", blurb: "The quartal voicings where they come from: two chords, thirty-two bars.", tune: "so-what", generate: (k) => arrangeTune(findTune("so-what")!, k, QUARTAL), prerequisites: ["quartal-forms"], mastery: { accuracy: ALL_ACC, bpm: 136 }, minutes: 6 }),
  ex({ id: "rhythm-changes", title: "I Got Rhythm", kind: "tune", level: 6, unit: "advanced", blurb: "Rhythm changes: two chords a bar at tempo.", tune: "rhythm-changes", generate: tune("rhythm-changes", 6), prerequisites: ["iii-vi-ii-v", "indiana-changes"], mastery: { accuracy: ALL_ACC, bpm: 200 }, minutes: 8 }),
  ex({ id: "improv-rhythm-changes", title: "Improvise over I Got Rhythm", kind: "improv", level: 6, unit: "advanced", blurb: "The bridge is four dominants. The A sections move every two beats.", tune: "rhythm-changes", generate: tune("rhythm-changes", 6), prerequisites: ["rhythm-changes", "improv-autumn"], mastery: { accuracy: 0.8, bpm: 200 }, minutes: 8 }),
  ex({ id: "uptempo-blues", title: "Uptempo jazz blues", kind: "tune", level: 6, unit: "advanced", blurb: "The jazz blues at 220 and above.", tune: "jazz-blues-f", generate: tune("jazz-blues-f", 6), prerequisites: ["improv-jazz-blues"], mastery: { accuracy: ALL_ACC, bpm: 220 }, minutes: 5 }),
  etude({ unit: "advanced", level: 6, variation: QUARTAL, prerequisites: ["iii-vi-ii-v"], mastery: { accuracy: ALL_ACC, bpm: 160 }, minutes: 4 }),
];

/** The drill a unit's songs put to work, unless a song names its own. */
const SONG_NEEDS: Record<string, string[]> = {
  keyboard: ["major-scale"],
  chords: ["seventh-chords"],
  shells: ["shells"],
  cadence: ["ii-v-i-shells"],
  "first-tunes": ["shells"],
  accompaniment: ["melody-on-top"],
  rootless: ["ii-v-i-rootless"],
  comping: ["turnaround"],
  minor: ["minor-ii-v-i"],
  colour: ["tritone-sub"],
  lines: ["guide-tones"],
  ears: ["ear-quality"],
  advanced: ["quartal-forms"],
};

/**
 * A unit's songs from the song book. A song counts in four keys, its own and
 * the next three round the circle of fourths, because that is how tunes are
 * really learned; the first unit keeps to C, F and G.
 */
function songsFor(unit: Unit): Exercise[] {
  return (songs[unit.id] ?? []).map((s) => {
    const home = KEY_ORDER.indexOf(s.tune.key);
    const bars = s.tune.form.split("|").filter((b) => b.trim()).length;
    return {
      ...ex({
        id: s.tune.slug,
        title: s.tune.title,
        kind: "tune",
        level: unit.level,
        unit: unit.id,
        blurb: s.tune.blurb,
        keys: unit.id === "keyboard" ? ["C", "F", "G"] : [0, 1, 2, 3].map((i) => KEY_ORDER[(home + i) % 12]),
        generate: (key) => arrangeTune(s.tune, key, s.variation),
        prerequisites: s.needs ?? SONG_NEEDS[unit.id],
        mastery: { accuracy: ALL_ACC, bpm: s.masteryBpm },
        minutes: bars > 8 ? 4 : 3,
      }),
      teachingPoints: s.points,
    };
  });
}

/** Each unit's songs sit just before the etude that closes it. */
export const exercises: Exercise[] = core.flatMap((e) =>
  e.etude ? [...songsFor(units.find((u) => u.id === e.unit)!), e] : [e],
);

export function findExercise(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function exercisesIn(unit: string): Exercise[] {
  return exercises.filter((e) => e.unit === unit);
}

export function unitsAt(level: Level): Unit[] {
  return units.filter((u) => u.level === level);
}

export const LEVEL_TITLES: Record<Level, string> = {
  1: "Foundations",
  2: "Shells and the ii-V-I",
  3: "Rootless comping",
  4: "Minor and colour",
  5: "Lines and improvising",
  6: "The session",
};
