import type { Midi, Spelling } from "@/lib/music/notes";

export type Finger = 1 | 2 | 3 | 4 | 5;
export type Hand = "left" | "right";

export type LessonTopic =
  | "orientation"
  | "scale"
  | "interval"
  | "triad"
  | "seventh"
  | "voicing"
  | "progression"
  | "blues"
  | "piece"
  | "song";

export interface LessonStep {
  /** Notes sounding together. Length 1 is a single note, more is a chord. */
  notes: Midi[];
  /** Duration in beats. Real seconds are beats * 60 / bpm, so the tempo
   *  slider is a pure re-derivation and never touches the content. */
  beats: number;
  /** Shown in the step strip and above the keyboard, e.g. "Dm7". */
  label?: string;
  /** Index-aligned with notes. 1 is the thumb, 5 the little finger. */
  fingering?: Finger[];
  /** Which hand plays the whole step. Both hands share one on-screen keyboard,
   *  so this is what colours the keys. */
  hand?: Hand;
  /** Per note, index aligned with `notes`, for a step both hands play at once.
   *  Wins over `hand`. A shell under a melody note cannot be described by a
   *  single hand, which is why this exists. */
  hands?: Hand[];
  /** Per note, index aligned with `notes`: true when the note carries on from
   *  the step before rather than being struck again. Generated variations use
   *  it to hold a chord under a moving tune. */
  tied?: boolean[];
}

/** A chord for one of the band's other instruments, in beats from startBeat. */
export interface BandHit {
  beat: number;
  beats: number;
  notes: Midi[];
}

/**
 * The rhythm section's part. Bass is written out because a walking line is
 * composed, not generated; the drums are a pattern and are derived from the
 * bar position, so they are not stored here.
 */
export interface BandChart {
  /** Beat of the lesson at which the band comes in. */
  startBeat: number;
  /** One bass note per beat from startBeat onwards. null is a rest. */
  bass: (Midi | null)[];
  /** Bar length in beats, counted from startBeat. */
  beatsPerBar: number;
  /** Rhythm guitar, one chord per beat alongside the bass. It is the only
   *  harmony the learner hears while improvising, when the piano is theirs. */
  comp?: (Midi[] | null)[];
  /** Vibraphone and horn section, trading four-bar phrases over the rhythm
   *  section. With it the kit also plays fills and marks the top of the form. */
  ensemble?: { vibes: BandHit[]; horns: BandHit[] };
}

/**
 * One chord of a piece, and what it is doing there. Regions are keyed by step
 * rather than by beat so that whatever is lighting up on the keyboard and
 * whatever the analysis says are always the same thing.
 */
export interface HarmonyRegion {
  /** First step of this chord. Regions run until the next one starts. */
  fromStep: number;
  /** Written symbol, e.g. "Dm7". The root is read off the front of it. */
  symbol: string;
  /** Its place in the key, e.g. "ii". */
  numeral: string;
  /** One line: what this chord is for. */
  role: string;
  /** What actually changed on the way into this chord. Must describe the
   *  voicing as played, not the textbook ideal. */
  move?: string;
}

export interface Lesson {
  slug: string;
  title: string;
  topic: LessonTopic;
  order: number;
  tagline: string;
  /** Bullets shown in the side panel. */
  teachingPoints: string[];
  spelling: Spelling;
  defaultBpm: number;
  bpmRange: [number, number];
  /** Keyboard window to render. Both ends must be white keys. */
  range: { low: Midi; high: Midi };
  /** Lowest note of the QWERTY mapping for this lesson. */
  keyboardBase: Midi;
  /** Free exploration: no targets, no validation. */
  exploreOnly?: boolean;
  /** One line on the landing page: what this lesson is inside the vamp.
   *  Absent on the piece itself. */
  ingredient?: string;
  /** Bass and drums behind Listen mode. Only the pieces have one; a drill
   *  like the C major scale would fight a walking bass, not sit on it. */
  band?: BandChart;
  /** Pitch class of the tonic when the form is a blues. A solo may then use
   *  the tonic's blues scale over every chord, which is what the blues is. */
  bluesTonicPc?: number;
  /** Chord by chord analysis, shown as the piece plays. */
  harmony?: HarmonyRegion[];
  steps: LessonStep[];
}
