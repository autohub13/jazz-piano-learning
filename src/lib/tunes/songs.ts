// The song book: practice songs for each unit, so a skill is played as music
// several times over before the unit's etude closes it. Traditional tunes where
// one fits the skill, short originals where none does. Like the etudes they
// are tunes like any other, and the arranger gives each one its left hand, its
// sheet music and its band in every key it is asked for.
//
// Melodies are written a note a beat or longer. A tune whose original moves in
// eighths is written in doubled values and played at a faster tempo.

import type { Variation } from "@/lib/arrange/arrange";
import type { Tune } from "./types";

export interface Song {
  tune: Tune;
  /** How the unit plays it. */
  variation: Variation;
  /** Tempo at which a clean pass marks the key done. */
  masteryBpm: number;
  /** What to listen for, in degrees and numerals so it holds in every key. */
  points: string[];
  /** Exercise ids to have met first, when the unit's own drill is not it. */
  needs?: string[];
}

function v(part: Partial<Variation>): Variation {
  return { voicing: "written", reharm: "written", melody: "written", rhythm: "written", texture: "written", ...part };
}

const SOLO = v({ voicing: "shell", rhythm: "held", texture: "solo" });
const SHELLS = v({ voicing: "shell", rhythm: "held" });
const MELODY_TOP = v({ voicing: "shell", rhythm: "held", texture: "melodyTop" });
const ROOTLESS = v({ voicing: "rootless", rhythm: "held" });
const CHARLESTON = v({ voicing: "rootless", rhythm: "charleston" });
const DROP2 = v({ voicing: "drop2", rhythm: "held" });
const QUARTAL = v({ voicing: "quartal", rhythm: "charleston" });

export const songs: Record<string, Song[]> = {
  keyboard: [
    {
      variation: SOLO,
      masteryBpm: 80,
      tune: {
        slug: "song-ode-to-joy",
        title: "Ode to Joy",
        composer: "Ludwig van Beethoven",
        year: 1824,
        key: "C",
        style: "swing",
        bpm: { min: 50, default: 88, max: 150 },
        level: 1,
        blurb: "Five notes under five fingers, and the hand never moves.",
        form: `| C6 | G7 | C6 | G7 | C6 | G7 | C6 | G7 C6 |`,
        melody: `
          | E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | E4:2 D4:1 D4:1 |
          | E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:2 C4:1 C4:1 |
        `,
      },
      points: [
        "The whole tune sits on the first five notes of the scale. Thumb on the 1st, little finger on the 5th, and no finger ever leaves its key.",
        "Every move is a step or a repeat. Say the scale degrees as you play: 3, 3, 4, 5, 5, 4, 3, 2.",
        "The two halves are the same until the last bar. The first ends on the 2nd and sounds unfinished. The second ends on the 1st and sounds like home.",
        "The band plays I and V under you. Hear how the 2nd of the scale belongs to the V chord and the 1st to the I.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 84,
      tune: {
        slug: "song-aunt-rhody",
        title: "Go Tell Aunt Rhody",
        composer: "Traditional",
        key: "C",
        style: "swing",
        bpm: { min: 50, default: 92, max: 150 },
        level: 1,
        blurb: "Steps, one skip, and the first long notes to hold for their full length.",
        form: `| C6 | % | G7 | C6 | C6 | % | G7 | C6 |`,
        melody: `
          | E4:2 E4:1 D4:1 | C4:2 C4:2 | D4:2 D4:1 F4:1 | E4:1 D4:1 C4:2 |
          | G4:2 G4:1 F4:1 | E4:2 E4:2 | D4:1 C4:1 D4:1 E4:1 | C4:4 |
        `,
      },
      points: [
        "Still one hand position, thumb on the 1st. The only skip is in bar three, from the 2nd up to the 4th.",
        "Half notes last two beats. Count them, and let the bass walk underneath while you hold.",
        "Bar three is over the V chord, and its notes, the 2nd and 4th of the scale, are the 5th and 7th of that chord. The tune and the harmony are the same notes seen two ways.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 120,
      tune: {
        slug: "song-frere-jacques",
        title: "Frère Jacques",
        composer: "Traditional",
        key: "C",
        style: "swing",
        bpm: { min: 70, default: 132, max: 200 },
        level: 1,
        blurb: "Four two-bar ideas, each said twice. The first tune to reach past five notes.",
        form: `
          | C6 | % | % | % | C6 | % | % | % |
          | C6 | % | C6 | % | C6 G7 | C6 | C6 G7 | C6 |
        `,
        melody: `
          | C4:2 D4:2 | E4:2 C4:2 | C4:2 D4:2 | E4:2 C4:2 |
          | E4:2 F4:2 | G4:4 | E4:2 F4:2 | G4:4 |
          | G4:1 A4:1 G4:1 F4:1 | E4:2 C4:2 | G4:1 A4:1 G4:1 F4:1 | E4:2 C4:2 |
          | C4:2 G3:2 | C4:4 | C4:2 G3:2 | C4:4 |
        `,
      },
      points: [
        "Every idea is two bars long and is played twice. Hearing a phrase and its repeat is the first step to hearing a form.",
        "Bar nine reaches the 6th, one note above the five-finger position. Stretch the little finger to it and come straight back.",
        "The last idea drops to the 5th below the tonic. It is the root of the V chord, and the band plays the V under it.",
        "It is written in long notes and played fast. Feel two beats in a bar, not four.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 126,
      tune: {
        slug: "song-oh-susanna",
        title: "Oh! Susanna",
        composer: "Stephen Foster",
        year: 1848,
        key: "C",
        style: "swing",
        bpm: { min: 70, default: 138, max: 200 },
        level: 1,
        blurb: "A pickup, a long-short rhythm, and sixteen bars in two matching halves.",
        form: `
          | C6 | % | % | % | C6 | % | G7 | % |
          | C6 | % | % | % | C6 | G7 | C6 | % |
        `,
        melody: `
          C4:1 D4:1
          | E4:2 G4:2 | G4:3 A4:1 | G4:2 E4:2 | C4:3 D4:1 | E4:2 E4:2 | D4:2 C4:2 | D4:6 C4:1 D4:1 |
          | E4:2 G4:2 | G4:3 A4:1 | G4:2 E4:2 | C4:3 D4:1 | E4:2 E4:2 | D4:2 D4:2 | C4:4 | r:4 |
        `,
      },
      points: [
        "The tune starts before bar one, with two pickup notes played alone. The band comes in with you on the downbeat.",
        "The tune is pentatonic: the 1st, 2nd, 3rd, 5th and 6th of the scale and nothing else. Those five notes never clash with the I chord.",
        "A three-beat note followed by a one-beat note is the rhythm of the whole song. Hold the long one for its full length.",
        "The first half ends on the 2nd, over the V, and asks a question. The second half ends on the 1st and answers it.",
      ],
    },
  ],

  chords: [
    {
      variation: SOLO,
      masteryBpm: 88,
      tune: {
        slug: "song-skip-to-my-lou",
        title: "Skip to My Lou",
        composer: "Traditional",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 100, max: 170 },
        level: 1,
        blurb: "A folk tune that is two triads and nothing else: the I, then the V.",
        form: `| C6 | % | G7 | % | C6 | % | G7 | C6 |`,
        melody: `
          | E4:1 E4:1 C4:1 C4:1 | E4:1 E4:1 G4:2 | D4:1 D4:1 B3:1 B3:1 | D4:1 D4:1 F4:2 |
          | E4:1 E4:1 C4:1 C4:1 | E4:1 E4:1 G4:2 | D4:1 E4:1 F4:1 D4:1 | C4:2 C4:2 |
        `,
      },
      points: [
        "Bars one and two are the I triad, 3rd, root, 5th. Bars three and four are the same shape one step lower: the 5th, 3rd and 7th of the V chord.",
        "Tunes are made of chords. When you can see the triad inside a melody you can find its harmony without being told.",
        "In bar four the tune reaches the 4th of the scale. Over the V chord that note is the flat 7th, the note that makes it a dominant.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 84,
      tune: {
        slug: "song-broken-chords",
        title: "Broken Chords",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 96, max: 160 },
        level: 1,
        blurb: "Seventh chords a note at a time through I, vi, ii, V and a visit to the IV.",
        form: `| Fmaj7 | Dm7 | Gm7 | C7 | Fmaj7 | Bbmaj7 | Gm7 C7 | F6 |`,
        melody: `
          | F4:1 A4:1 C5:1 E5:1 | D5:1 C5:1 A4:1 F4:1 | G4:1 Bb4:1 D5:1 F5:1 | E5:1 C5:1 Bb4:1 G4:1 |
          | A4:1 C5:1 E5:1 C5:1 | D5:1 Bb4:1 A4:1 F4:1 | G4:1 Bb4:1 G4:1 E4:1 | F4:4 |
        `,
      },
      points: [
        "Every note is a chord tone: root, 3rd, 5th or 7th of the chord in that bar. Name the degree of each note as you play it.",
        "The I and the vi share three notes. Going from bar one to bar two only one note is new.",
        "Bar six is the IV, a maj7 like the I. Same quality, different job: the I is home, the IV is a step away from it.",
        "In bar seven two chords share the bar, two notes each. Two notes are enough to say a chord if they are the right two.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 84,
      tune: {
        slug: "song-falling-thirds",
        title: "Falling Thirds",
        key: "G",
        style: "swing",
        bpm: { min: 60, default: 96, max: 160 },
        level: 1,
        blurb: "Arpeggios that come down as often as they go up, through the iii and the vi.",
        form: `| Gmaj7 | Em7 | Am7 | D7 | Bm7 | Em7 | Am7 D7 | G6 |`,
        melody: `
          | D5:1 B4:1 G4:1 F#4:1 | E4:1 G4:1 B4:1 D5:1 | C5:1 A4:1 G4:1 E4:1 | F#4:1 A4:1 C5:1 D5:1 |
          | D5:1 B4:1 A4:1 F#4:1 | G4:1 B4:1 D5:1 B4:1 | C5:1 A4:1 F#4:1 A4:1 | G4:4 |
        `,
      },
      points: [
        "Most players only practise arpeggios upwards. Half of these come down, from the 5th or the 7th, which is how a melody usually uses them.",
        "Three of the chords are m7: the vi, the ii and the iii. One quality, three places in the key.",
        "The last note of each bar is a step or less from the first note of the next. That is what makes a string of arpeggios sound like one line.",
      ],
    },
    {
      variation: SOLO,
      masteryBpm: 84,
      tune: {
        slug: "song-six-and-seven",
        title: "Six and Seven",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 96, max: 160 },
        level: 1,
        blurb: "One root, three qualities: a 6 chord, a dominant, and the IV turning minor.",
        form: `| C6 | C7 | F6 | Fm6 | C6 | A7 | Dm7 G7 | C6 |`,
        melody: `
          | C4:1 E4:1 G4:1 A4:1 | Bb4:1 G4:1 E4:1 C4:1 | F4:1 A4:1 C5:1 D5:1 | D5:1 C5:1 Ab4:1 F4:1 |
          | G4:1 E4:1 C4:1 E4:1 | E4:1 G4:1 A4:1 C#5:1 | D5:1 A4:1 B4:1 G4:1 | C5:4 |
        `,
      },
      points: [
        "Bar one tops the triad with the 6th. Bar two tops the same triad with the flat 7th, a half step higher. One note, and home turns into a chord that wants to move.",
        "Bars three and four do it again on the IV: the major 3rd drops a half step and the chord turns minor.",
        "The 6 chord is a tonic. It is what jazz players mean when the chart says just the letter.",
        "In bar six the 3rd of the VI7 is the one note from outside the key. It pulls up a half step into the root of the ii.",
      ],
    },
  ],

  shells: [
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-jingle-bells",
        title: "Jingle Bells",
        composer: "James Lord Pierpont",
        year: 1857,
        key: "C",
        style: "swing",
        bpm: { min: 70, default: 120, max: 200 },
        level: 2,
        blurb: "A tune everyone can sing, over shells on I, IV, II7 and V7.",
        form: `
          | Cmaj7 | % | % | % | Fmaj7 | Cmaj7 | D7 | G7 |
          | Cmaj7 | % | % | % | Fmaj7 | Cmaj7 | Dm7 G7 | C6 |
        `,
        melody: `
          | E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1 D4:1 | E4:4 |
          | F4:1 F4:1 F4:1 F4:1 | F4:1 E4:1 E4:1 E4:1 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2 |
          | E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1 D4:1 | E4:4 |
          | F4:1 F4:1 F4:1 F4:1 | F4:1 E4:1 E4:1 E4:1 | G4:1 G4:1 F4:1 D4:1 | C4:4 |
        `,
      },
      points: [
        "The tune sits on the 3rd of the I chord for four bars. With the 3rd in the tune, a root-7 shell under it completes the chord: three notes between two hands, and nothing missing.",
        "Bar seven is the II7, a dominant borrowed from outside the key. Its 3rd is the raised 4th of the scale, the one note that tells the ear the harmony has left home.",
        "The second time round, the II7 and V7 become a ii-V sharing one bar. Same destination, smoother road.",
        "The first four bars are one chord. Hold the shell and let the tune do the work.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 110,
      tune: {
        slug: "song-auld-lang-syne",
        title: "Auld Lang Syne",
        composer: "Traditional",
        key: "F",
        style: "swing",
        bpm: { min: 70, default: 126, max: 200 },
        level: 2,
        blurb: "A pentatonic melody over I, V7, I7 and IV: the I7 is the door into the IV.",
        form: `
          | F6 | % | C7 | % | F6 | F7 | Bbmaj7 | % |
          | F6 | % | C7 | % | Dm7 | Gm7 C7 | F6 | % |
        `,
        melody: `
          C4:2
          | F4:3 E4:1 | F4:2 A4:2 | G4:3 F4:1 | G4:2 A4:2 | F4:3 F4:1 | A4:2 C5:2 | D5:6 D5:2 |
          | C5:3 A4:1 | A4:2 F4:2 | G4:3 F4:1 | G4:2 A4:2 | F4:3 D4:1 | D4:2 C4:2 | F4:4 | r:4 |
        `,
      },
      points: [
        "In bar six the I becomes I7. In the shell only one note moves: the 6th rises a half step to the flat 7th, and the chord points at the IV.",
        "The tune is nearly pentatonic. It avoids the 4th and barely touches the 7th, which is why it sits easily over every chord here.",
        "Bars thirteen and fourteen replace a bar of I and a bar of V with vi, ii, V. The melody does not change. The harmony under a tune is a choice.",
        "The top of the tune is the 3rd of the IV, held for six beats. Let the left hand's shell ring under it.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 96,
      tune: {
        slug: "song-guide-lines",
        title: "Guide Lines",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 108, max: 180 },
        level: 2,
        blurb: "A tune made only of 3rds and 7ths, the same guide tones the shells are built from.",
        form: `| Cmaj7 | Fmaj7 | Em7 | A7 | Dm7 | G7 | Cmaj7 | G7 |`,
        melody: `
          | E4:2 B4:2 | A4:2 E5:2 | D5:2 G4:2 | G4:2 C#5:2 |
          | C5:2 F4:2 | F4:2 B4:2 | E4:2 G4:2 | F4:2 D4:2 |
        `,
      },
      points: [
        "Until the last two bars every note is the 3rd or the 7th of its chord. Often your left hand has one guide tone and the tune has the other, and between them the chord is complete.",
        "From bar three the chords fall by fifths: iii, VI7, ii, V7, I. Over falling fifths the 7th of one chord is a step or less from the 3rd of the next.",
        "Hold one note across a bar line in your ear: the last note of bar five and the first of bar six are the same pitch. It is the 3rd of the ii and then the 7th of the V.",
        "The tune ends on the V so that it loops. The last bar is the question and bar one is its answer.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-seventh-heaven",
        title: "Seventh Heaven",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 2,
        blurb: "I, VI7, ii, V7 and again through the iii. Two dominants, two shells to find fast.",
        form: `| Fmaj7 | D7 | Gm7 | C7 | Am7 | D7 | Gm7 C7 | F6 |`,
        melody: `
          | A4:2 C5:1 E5:1 | D5:1 C5:1 A4:1 F#4:1 | Bb4:2 D5:2 | E5:1 D5:1 Bb4:2 |
          | C5:2 G4:2 | F#4:2 A4:1 C5:1 | Bb4:1 D5:1 C5:1 E4:1 | F4:4 |
        `,
      },
      points: [
        "The VI7 in bar two is the V of the ii. Its 3rd is the tonic raised a half step, and the tune lands on it at the end of the bar so you hear the key bend.",
        "Alternate your shell shapes. Going down a fifth, root-7 to root-3 moves the top note a half step, and root-3 to root-7 does not move it at all.",
        "Bar five swaps the I for the iii. They share three notes, so the iii is home with its root taken away.",
      ],
    },
  ],

  cadence: [
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-there-and-back",
        title: "There and Back",
        key: "Bb",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 2,
        blurb: "A ii-V-I at home, one into the IV, and a iii-VI7-ii-V7 to come back.",
        form: `
          | Cm7 | F7 | Bbmaj7 | % | Fm7 | Bb7 | Ebmaj7 | % |
          | Cm7 | F7 | Dm7 | G7 | Cm7 | F7 | Bb6 | % |
        `,
        melody: `
          | Eb4:2 G4:2 | A4:1 G4:1 Eb4:2 | D4:3 F4:1 | A4:2 F4:2 |
          | Ab4:2 C5:2 | D5:1 C5:1 Ab4:2 | G4:3 Bb4:1 | D5:2 Bb4:2 |
          | Eb5:2 C5:1 G4:1 | A4:2 C5:1 Eb5:1 | D5:2 A4:1 F4:1 | B4:2 G4:2 |
          | Bb4:2 G4:1 Eb4:1 | A4:2 F4:1 Eb4:1 | D4:4 | r:4 |
        `,
      },
      points: [
        "Bars five to eight are bars one to four moved up a fourth, tune and all. A ii-V-I is one shape that you move.",
        "In bar ten the V does not resolve. It slips to the iii, which starts a second, longer road home: iii, VI7, ii, V7, I.",
        "Each phrase starts on the 3rd of the ii and lands on the 3rd of the I. Learn to hear the 3rd of a chord as its centre.",
        "Say the numerals aloud. In this key or any other, it is ii, V, I.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-step-down",
        title: "Step Down",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 2,
        blurb: "The same ii-V-I three times, each a whole step lower. One phrase, three keys.",
        form: `
          | Dm7 | G7 | Cmaj7 | % | Cm7 | F7 | Bbmaj7 | % |
          | Bbm7 | Eb7 | Abmaj7 | % | Dm7 | G7 | C6 | % |
        `,
        melody: `
          | A4:2 F4:2 | B4:1 A4:1 G4:1 F4:1 | E4:4 | r:2 G4:1 E4:1 |
          | G4:2 Eb4:2 | A4:1 G4:1 F4:1 Eb4:1 | D4:4 | r:2 F4:1 D4:1 |
          | F4:2 Db4:2 | G4:1 F4:1 Eb4:1 Db4:1 | C4:4 | r:2 C4:1 G4:1 |
          | A4:2 F4:1 D4:1 | B3:1 D4:1 F4:1 A4:1 | G4:4 | r:4 |
        `,
      },
      points: [
        "Each I chord turns minor and becomes the ii of a new key a whole step down. The root stays, the 3rd and 7th drop a half step, and you are somewhere else.",
        "The phrase is identical each time: 5th and 3rd of the ii, a run down from the 3rd of the V, and the 3rd of the I. Play it once, then move your hand.",
        "This is why the cadence is drilled in twelve keys. Tunes change key without warning, and the ii-V-I is how they do it.",
        "The last four bars go straight home. After three keys, hear how settled the real tonic sounds.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-afternoon-light",
        title: "Afternoon Light",
        key: "G",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 2,
        blurb: "Eight bars: a ii-V-I that rests on the vi, and one that comes home.",
        form: `| Am7 | D7 | Gmaj7 | Em7 | Am7 | D7 | Gmaj7 | % |`,
        melody: `
          | C5:2 E5:2 | D5:1 C5:1 A4:2 | B4:2 D5:1 B4:1 | G4:2 B4:2 |
          | C5:1 B4:1 A4:1 G4:1 | F#4:2 A4:1 C5:1 | B4:4 | r:4 |
        `,
      },
      points: [
        "Both phrases land on the 3rd of the I. The first gets there from above and moves on to the vi. The second comes up from the 3rd of the V and stays.",
        "The tune starts on the 3rd of the ii, the note that will become the 7th of the V. It is the guide tone you have been playing in your left hand.",
        "In bar six the line climbs the V chord, 3rd, 5th, flat 7th, and the flat 7th falls a half step into the 3rd of the I. That half step is the cadence.",
      ],
    },
  ],

  "first-tunes": [
    {
      variation: SHELLS,
      masteryBpm: 100,
      tune: {
        slug: "song-two-note-blues",
        title: "Riff Blues in C",
        key: "C",
        style: "blues",
        bpm: { min: 60, default: 112, max: 190 },
        level: 2,
        blurb: "A second twelve-bar blues, in a new key, on a three-note riff.",
        form: `
          | C7 | F7 | C7 | % |
          | F7 | % | C7 | % |
          | G7 | F7 | C7 | G7 |
        `,
        melody: `
          | G4:1 Bb4:1 C5:2 | G4:1 Bb4:1 C5:2 | G4:1 Bb4:1 C5:1 Eb5:1 | C5:2 r:2 |
          | A4:1 C5:1 Eb5:2 | A4:1 C5:1 Eb5:2 | G4:1 Bb4:1 C5:1 Eb5:1 | C5:2 r:2 |
          | D5:2 B4:2 | C5:2 A4:2 | G4:1 Bb4:1 C5:2 | r:4 |
        `,
      },
      points: [
        "The riff is the 5th, flat 7th and root of the I7. In bar two the chord changes to the IV7 and the riff does not: the same three notes are now its 9th, 11th and 5th.",
        "A riff that stays put while the chords move under it is the oldest device in the blues. Count Basie's band built whole arrangements on it.",
        "Bars five and six move the riff onto the IV7: its 3rd, 5th and flat 7th.",
        "Bars nine and ten play the 5th and 3rd of the V7, then the same thing a step lower on the IV7. Bar twelve is empty. Leave it empty.",
      ],
    },
    {
      variation: SHELLS,
      masteryBpm: 110,
      tune: {
        slug: "song-sixteen-easy",
        title: "Sixteen Easy",
        key: "G",
        style: "swing",
        bpm: { min: 70, default: 124, max: 190 },
        level: 2,
        blurb: "Sixteen bars like the old New Orleans tunes: I, IV, a II7 to the V7, and the minor iv near the end.",
        form: `
          | G6 | % | C6 | G6 | G6 | Em7 | A7 | D7 |
          | G6 | G7 | C6 | Cm6 | G6 | D7 | G6 | % |
        `,
        melody: `
          | B4:2 D5:2 | B4:1 A4:1 G4:2 | C5:2 E5:2 | D5:4 |
          | B4:2 D5:2 | B4:1 A4:1 G4:2 | C#5:2 E5:2 | D5:1 C5:1 A4:2 |
          | B4:2 D5:2 | F5:2 D5:2 | E5:2 C5:1 A4:1 | Eb5:2 C5:2 |
          | D5:2 B4:2 | C5:1 A4:1 F#4:1 A4:1 | G4:4 | r:4 |
        `,
      },
      points: [
        "Three lines begin with the same two notes, the 3rd and 5th of the I. What follows is different each time. That is how a sixteen-bar tune holds together.",
        "In bar seven the tune plays the 3rd of the II7, the raised 4th of the key. It is the note that tells you the harmony has left home.",
        "In bar ten the I becomes I7 and the tune plays its flat 7th. In bar twelve the IV turns minor and the tune plays its flat 3rd. Both notes fall a half step on the way home.",
        "This I, I7, IV, iv ending is in When the Saints, in All of Me and in hundreds of other tunes. Learn to hear it coming.",
      ],
    },
  ],

  accompaniment: [
    {
      variation: MELODY_TOP,
      masteryBpm: 90,
      tune: {
        slug: "song-twinkle",
        title: "Twinkle, Twinkle, Little Star",
        composer: "Traditional",
        key: "C",
        style: "swing",
        bpm: { min: 50, default: 100, max: 160 },
        level: 2,
        blurb: "A nursery tune with a chord under every melody note, the way a pianist dresses any song.",
        form: `
          | Cmaj7 | Fmaj7 Cmaj7 | Dm7 Cmaj7 | G7 C6 |
          | Cmaj7 Dm7 | Cmaj7 G7 | Cmaj7 Dm7 | Cmaj7 G7 |
          | Cmaj7 | Fmaj7 Cmaj7 | Dm7 Cmaj7 | G7 C6 |
        `,
        melody: `
          | C5:1 C5:1 G5:1 G5:1 | A5:1 A5:1 G5:2 | F5:1 F5:1 E5:1 E5:1 | D5:1 D5:1 C5:2 |
          | G5:1 G5:1 F5:1 F5:1 | E5:1 E5:1 D5:2 | G5:1 G5:1 F5:1 F5:1 | E5:1 E5:1 D5:2 |
          | C5:1 C5:1 G5:1 G5:1 | A5:1 A5:1 G5:2 | F5:1 F5:1 E5:1 E5:1 | D5:1 D5:1 C5:2 |
        `,
      },
      points: [
        "Every melody note here is the root, 3rd or 5th of its chord, so every strong note can carry the full chord under it. The note on top picks the inversion.",
        "The harmony changes twice a bar so that each new melody note is a chord tone. Choosing chords that make the melody a chord tone is the start of harmonising a tune yourself.",
        "The left hand has the root alone. Keep it low and quiet. It is a floor, not a second tune.",
        "A simple tune is the best test of this skill. If the melody stops sounding like Twinkle, the top note is being buried: lean the hand towards the little finger.",
      ],
    },
  ],

  rootless: [
    {
      variation: ROOTLESS,
      masteryBpm: 104,
      tune: {
        slug: "song-ninth-street",
        title: "Ninth Street",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 116, max: 190 },
        level: 3,
        blurb: "A tune that opens every bar on the 9th, the note a rootless voicing adds.",
        form: `| Gm7 | C7 | Fmaj7 | Dm7 | Gm7 | C7 | Fmaj7 | % |`,
        melody: `
          | A4:2 D5:2 | D5:2 Bb4:1 A4:1 | G4:2 C5:2 | E5:2 C5:1 A4:1 |
          | Bb4:1 D5:1 F5:2 | E5:1 D5:1 Bb4:2 | A4:4 | r:4 |
        `,
      },
      points: [
        "Bars one to four each begin on the 9th of the chord. It is the same note that sits on top of your form A voicing, an octave higher.",
        "The 9th is not in the seventh chord, and it is not tense either. It is colour. Hear how the tune sounds open rather than unresolved.",
        "In bar two the tune ends on the 13th of the V7, the note that replaced the 5th in your dominant voicing.",
        "Your left hand has no root anywhere in this tune. Listen to the bass: it lands on every root for you.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 104,
      tune: {
        slug: "song-b-flat-on-top",
        title: "B Flat on Top",
        key: "Bb",
        style: "swing",
        bpm: { min: 60, default: 116, max: 190 },
        level: 3,
        blurb: "The horn players' key: a ii-V-I, a VI7 to turn it round, and the forms that barely move.",
        form: `| Cm7 | F7 | Bbmaj7 | G7 | Cm7 | F7 | Bb6 | % |`,
        melody: `
          | G4:2 Bb4:1 D5:1 | D5:2 C5:1 A4:1 | A4:2 C5:2 | B4:2 D5:1 F5:1 |
          | Eb5:2 D5:1 C5:1 | A4:2 C5:1 Eb5:1 | D5:4 | r:4 |
        `,
      },
      points: [
        "Start the ii in form A and the V in form B. Between them one note moves, the 7th of the ii falling a half step to the 3rd of the V.",
        "The VI7 in bar four is a dominant, so its voicing takes the 13th. Its 3rd is the one note outside the key, and the tune starts the bar on it.",
        "Most horn tunes are in flat keys. A pianist who only knows these voicings in C will be lost on the first tune of the night.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 104,
      tune: {
        slug: "song-pale-blue",
        title: "Pale Blue",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 116, max: 190 },
        level: 3,
        blurb: "Sixteen bars in three phrases: a turnaround, a iii-VI7-ii-V7, and a trip to the IV.",
        form: `
          | Cmaj7 | Am7 | Dm7 | G7 | Em7 | A7 | Dm7 | G7 |
          | Gm7 | C7 | Fmaj7 | % | Dm7 | G7 | C6 | % |
        `,
        melody: `
          | D5:2 B4:2 | B4:2 G4:2 | E5:2 C5:2 | A4:2 B4:2 |
          | G4:2 B4:1 D5:1 | C#5:2 B4:1 G4:1 | A4:2 C5:1 E5:1 | D5:2 B4:2 |
          | Bb4:2 D5:2 | E5:1 D5:1 Bb4:2 | A4:3 C5:1 | E5:2 C5:2 |
          | F5:2 E5:1 C5:1 | B4:2 A4:1 G4:1 | C5:4 | r:4 |
        `,
      },
      points: [
        "Bars one to four open on the 9th of each chord in turn. Four different chords, and the top of the voicing names the tune each time.",
        "Bar nine turns the V of the key into a minor chord: the ii of the IV. The flat 3rd in the tune is the note that tells you.",
        "Sixteen bars of changes, and the left hand should never move more than a step at a time. If it jumps, you picked the wrong form.",
        "With one chord a bar, there is time to look ahead. Know the next shape before the bar line.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 104,
      tune: {
        slug: "song-the-bass-has-it",
        title: "The Bass Has It",
        key: "G",
        style: "swing",
        bpm: { min: 60, default: 116, max: 190 },
        level: 3,
        blurb: "Chords falling by fifths through the whole key, ending on the relative minor.",
        form: `| Am7 | D7 | Gmaj7 | Cmaj7 | F#m7b5 | B7 | Em7 | % |`,
        melody: `
          | C5:2 E5:2 | D5:1 C5:1 A4:1 F#4:1 | B4:2 D5:2 | C5:1 B4:1 G4:1 E4:1 |
          | A4:2 C5:2 | B4:1 A4:1 F#4:1 D#4:1 | G4:4 | r:2 B4:1 D5:1 |
        `,
      },
      points: [
        "Every root is a fifth below the last: ii, V, I, IV, then vii, III7 and vi. It is the most common chord movement in all of jazz, and the bass spells it out for you.",
        "Falling by fifths, forms A and B alternate all the way down. The hand drifts lower a step at a time and never leaps.",
        "The half-diminished chord in bar five has no usable 9th, so its voicing takes the root in that place. It is the ii of the relative minor, and you meet it properly in level four.",
        "The tune is a two-bar shape played three times, each a step lower: 3rd and 5th of one chord, then root, 7th, 5th, 3rd down the next. A sequence in the melody over a sequence in the chords.",
      ],
    },
  ],

  comping: [
    {
      variation: CHARLESTON,
      masteryBpm: 110,
      tune: {
        slug: "song-whole-notes",
        title: "Whole Notes",
        key: "F",
        style: "swing",
        bpm: { min: 70, default: 124, max: 200 },
        level: 3,
        blurb: "Two chords a bar under a tune that barely moves. All the rhythm is in the left hand.",
        form: `| Fmaj7 Dm7 | Gm7 C7 | Am7 D7 | Gm7 C7 | Fmaj7 Dm7 | Gm7 C7 | F6 | Gm7 C7 |`,
        melody: `
          | A4:4 | Bb4:3 A4:1 | C5:4 | Bb4:2 G4:2 |
          | C5:2 D5:2 | D5:2 E5:2 | F5:4 | r:4 |
        `,
      },
      points: [
        "One held note sits over two chords. In bar one it is the 3rd of the I and then the 5th of the vi. The note stays and its meaning changes.",
        "With two chords a bar the left hand plays three times: on one, on the and of two, and the new chord on three.",
        "Keep the hits short and the tune long. The contrast is what makes it sound like two players.",
        "Bar three swaps I-vi for iii-VI7. The turnaround has many spellings, and the rhythm of your comping does not care which one it is.",
      ],
    },
    {
      variation: CHARLESTON,
      masteryBpm: 116,
      tune: {
        slug: "song-leave-room",
        title: "Leave Room",
        key: "C",
        style: "swing",
        bpm: { min: 70, default: 128, max: 200 },
        level: 3,
        blurb: "Sixteen bars of long melody notes, so the Charleston has nowhere to hide.",
        form: `
          | Cmaj7 | % | Fmaj7 | % | Dm7 | G7 | Cmaj7 | A7 |
          | Dm7 | G7 | Em7 | A7 | Dm7 | G7 | C6 | % |
        `,
        melody: `
          | G4:3 A4:1 | G4:4 | A4:3 C5:1 | A4:4 |
          | A4:4 | B4:4 | E5:4 | C#5:2 A4:2 |
          | D5:4 | D5:2 B4:2 | B4:4 | A4:2 G4:2 |
          | F5:3 E5:1 | D5:2 B4:2 | C5:4 | r:4 |
        `,
      },
      points: [
        "Two bars on one chord is where comping gets tested. Play the Charleston in the first bar and leave the second almost empty.",
        "The second hit lands on the and of two, the last third of the beat. Sing the ride cymbal and put the chord on its skip note.",
        "A soloist would be playing where this tune is. Your job is to answer the long notes, not to fill every hole.",
        "Press the keys down together and let go together. A comping chord is a drum hit with pitches.",
      ],
    },
    {
      variation: CHARLESTON,
      masteryBpm: 116,
      tune: {
        slug: "song-short-hits",
        title: "Short Hits",
        key: "G",
        style: "blues",
        bpm: { min: 70, default: 128, max: 210 },
        level: 3,
        blurb: "A blues in G with the VI7 and the ii-V a jazz player adds, and a tune that stays out of the way.",
        form: `
          | G7 | C7 | G7 | % |
          | C7 | % | G7 | E7 |
          | Am7 | D7 | G7 E7 | Am7 D7 |
        `,
        melody: `
          | D5:4 | E5:2 D5:2 | D5:4 | r:4 |
          | E5:4 | G5:2 E5:2 | D5:4 | B4:2 G#4:2 |
          | C5:4 | C5:2 A4:2 | B4:2 G#4:2 | A4:2 F#4:2 |
        `,
      },
      points: [
        "Bars nine and ten are a ii-V where the plain blues had V7 and IV7. It is the first change a jazz player makes to the form.",
        "Bar eight is the VI7 that sets the ii up. Its 3rd is in the tune, the tonic raised a half step.",
        "Between I7 and IV7 every voice of a rootless voicing moves a step or less. Let the hand stay where it is.",
        "The turnaround in the last two bars goes by at two chords a bar. Play each one once, short, and get out.",
      ],
    },
  ],

  minor: [
    {
      variation: ROOTLESS,
      masteryBpm: 100,
      tune: {
        slug: "song-dusk",
        title: "Dusk",
        key: "C",
        minor: true,
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 4,
        blurb: "Home in minor, the ii-V that leads back to it, and a visit to the iv.",
        form: `| Cm6 | % | Dm7b5 | G7b9 | Cm6 | Fm7 | Dm7b5 G7b9 | Cm6 |`,
        melody: `
          | G4:2 Eb5:2 | D5:1 C5:1 A4:2 | Ab4:2 F5:2 | Eb5:1 D5:1 B4:1 Ab4:1 |
          | G4:2 C5:2 | Ab4:1 C5:1 Eb5:2 | D5:1 Ab4:1 B4:1 D5:1 | C5:4 |
        `,
      },
      points: [
        "Bar two ends on the major 6th of the tonic. It is the note that makes this a m6 and not a m7: a minor chord that is at rest.",
        "Bar three opens on the flat 5th of the ii. The same pitch is the flat 9th of the V in the next bar, and from there it falls a half step to the 5th of the tonic.",
        "Bar four runs down the V7b9: flat 13th, 5th, 3rd, flat 9th. Every altered note in it belongs to the minor key.",
        "The 3rd of the V is the leading note, a half step under the tonic. Minor keys borrow it, and it is the one note of the tune not in the natural minor scale.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 104,
      tune: {
        slug: "song-relative-minor",
        title: "Relatives",
        key: "A",
        minor: true,
        style: "swing",
        bpm: { min: 60, default: 116, max: 190 },
        level: 4,
        blurb: "A minor ii-V-i, the major ii-V-I a third above it, and back. Two keys that share their notes.",
        form: `
          | Bm7b5 | E7b9 | Am6 | % | Dm7 | G7 | Cmaj7 | Fmaj7 |
          | Bm7b5 | E7b9 | Am6 | % | Bm7b5 | E7b9 | Am6 | % |
        `,
        melody: `
          | D5:2 F5:2 | E5:1 D5:1 B4:1 G#4:1 | A4:2 C5:1 E5:1 | F#5:2 E5:2 |
          | F5:2 D5:1 A4:1 | B4:2 D5:1 F5:1 | E5:2 C5:1 G4:1 | A4:2 C5:1 E5:1 |
          | D5:2 B4:1 A4:1 | G#4:2 B4:1 D5:1 | C5:4 | r:2 E5:1 C5:1 |
          | F5:2 D5:2 | F5:1 E5:1 D5:1 B4:1 | A4:4 | r:4 |
        `,
      },
      points: [
        "The minor key and its relative major use the same seven notes. Only two notes here come from outside: the 3rd of the minor V, and the major 6th on the minor tonic.",
        "Bars five to eight are a major ii-V-I a minor third up, then its IV. From that IV to the half-diminished ii the bass moves a tritone, the one odd step in a circle of fifths that otherwise never breaks.",
        "Hear the two cadences back to back. The major one opens out. The minor one closes in.",
        "Many standards are built on exactly this plan. Learn to feel which of the two keys you are in at any moment.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 110,
      tune: {
        slug: "song-low-light",
        title: "Low Light",
        key: "G",
        minor: true,
        style: "blues",
        bpm: { min: 60, default: 120, max: 200 },
        level: 4,
        blurb: "A minor blues with a minor ii-V in every gap, including one aimed at the iv.",
        form: `
          | Gm6 | Am7b5 D7b9 | Gm6 | Dm7b5 G7b9 |
          | Cm7 | % | Gm6 | % |
          | Am7b5 | D7b9 | Gm6 | Am7b5 D7b9 |
        `,
        melody: `
          | D5:2 Bb4:2 | A4:2 F#4:2 | G4:3 Bb4:1 | Ab4:2 B4:2 |
          | C5:2 Eb5:2 | D5:1 C5:1 Bb4:2 | D5:2 E5:2 | D5:4 |
          | Eb5:2 C5:2 | Eb5:1 D5:1 C5:1 A4:1 | G4:4 | r:4 |
        `,
      },
      points: [
        "Bar four is a minor ii-V into the iv, with its ii built on the 5th of the key. The tune plays its flat 5th and then the 3rd of the dominant, and both lead by a half step into the iv.",
        "A minor ii-V can point at any minor chord. Find the target, go up a whole step for the ii and up a fourth from there for the V.",
        "Bars nine and ten are the cadence at full length, a bar each. Bar twelve is the same two chords at double speed.",
        "In bar seven the tune rises to the major 6th of the tonic. It is the brightest moment in the chorus.",
      ],
    },
  ],

  colour: [
    {
      variation: DROP2,
      masteryBpm: 96,
      tune: {
        slug: "song-half-step-home",
        title: "Half Step Home",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 108, max: 170 },
        level: 4,
        blurb: "ii, flat II7, I, harmonised in drop 2 with the tune on top.",
        form: `| Gm7 | Gb7#11 | Fmaj7 | D7 | Gm7 | Gb7#11 | F6 | % |`,
        melody: `
          | D5:2 Bb4:2 | C5:2 Bb4:2 | A4:2 C5:2 | C5:2 A4:2 |
          | Bb4:2 D5:1 F5:1 | E5:2 Db5:2 | C5:4 | r:4 |
        `,
      },
      points: [
        "The right hand holds three notes with the tune on top. The left hand takes the fourth, the voice that was second from the top, an octave down.",
        "Over the substitute the tune first holds the #11, which is the root of the V it replaced, and that note is played alone. Then it moves to the 3rd and the full voicing comes in.",
        "The substitute's root is a tritone from the V it replaces, and yet every voice moves into the I by a half step. That is the whole appeal.",
        "Keep the top note strongest. In a drop 2 voicing the melody and the dropped voice are the outside of the sound, and the ear follows both.",
      ],
    },
    {
      variation: DROP2,
      masteryBpm: 96,
      tune: {
        slug: "song-borrowed-chords",
        title: "Side Slipping",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 108, max: 170 },
        level: 4,
        blurb: "iii, flat III7, ii, flat II7, I. Two tritone substitutes, and the bass walks down by half steps the whole way.",
        form: `| Em7 | Eb7#11 | Dm7 | Db7#11 | Cmaj7 | A7 | Dm7 Db7#11 | C6 |`,
        melody: `
          | B4:2 G4:2 | G4:2 Bb4:2 | A4:2 C5:2 | B4:2 Ab4:2 |
          | G4:2 E5:2 | E5:2 C#5:2 | D5:1 A4:1 Ab4:1 F4:1 | G4:4 |
        `,
      },
      points: [
        "iii, VI7, ii, V7, I with both dominants replaced by the one a tritone away. The roots now fall by half steps: 3, flat 3, 2, flat 2, 1.",
        "The flat III7 stands in for the VI7. They share a 3rd and 7th, swapped. Find the two shared notes in your voicing.",
        "The tune holds a common tone from bar one into bar two: the 3rd of the iii is the 3rd of the flat III7 too. The chord slides and the melody does not need to.",
        "Every melody note is a chord tone, so every one that carries the harmony gets a full drop 2 voicing. Watch which degree is on top each time.",
      ],
    },
  ],

  lines: [
    {
      variation: v({ voicing: "rootless", rhythm: "held", melody: "scaleRun" }),
      masteryBpm: 108,
      tune: {
        slug: "song-downhill",
        title: "Downhill",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 116, max: 200 },
        level: 5,
        blurb: "3rds and 7ths on one and three, with scale runs joining them.",
        form: `| Gm7 | C7 | Fmaj7 | D7 | Gm7 | C7 | F6 | % |`,
        melody: `
          | Bb4:2 F5:2 | E5:2 Bb4:2 | A4:2 E5:2 | C5:2 F#4:2 |
          | Bb4:2 F5:2 | E5:2 Bb4:2 | A4:2 C5:2 | A4:2 r:2 |
        `,
      },
      points: [
        "The written notes are half notes: the 3rd and 7th of each chord, on beats one and three. The eighths between them are a scale run to the next one.",
        "Take the eighths away and you should still hear the changes. If you can, the line is sound.",
        "Over the VI7 in bar four the run uses that chord's scale, with its major 3rd. One note is different from the key, and it says the chord for you.",
        "Play the skeleton alone first. Then add the runs. It is the order a solo is built in too.",
      ],
    },
    {
      variation: v({ voicing: "rootless", rhythm: "held", melody: "enclosure" }),
      masteryBpm: 108,
      needs: ["enclosures"],
      tune: {
        slug: "song-surrounded",
        title: "Surrounded",
        key: "Bb",
        style: "swing",
        bpm: { min: 60, default: 116, max: 200 },
        level: 5,
        blurb: "One guide tone per chord, each approached from above and below.",
        form: `| Cm7 | F7 | Bbmaj7 | G7 | Cm7 | F7 | Bb6 | % |`,
        melody: `
          | Bb4:4 | A4:4 | A4:2 D5:2 | B4:4 |
          | Bb4:4 | A4:2 Eb5:2 | D5:4 | r:4 |
        `,
      },
      points: [
        "Each long note is a guide tone. Before the next one arrives, a quick pair of notes surrounds it: the scale step above, then the half step below.",
        "The note from below is often outside the key. It is a half step from its target and gone in an instant, and that is why it sounds right.",
        "From the ii to the V the guide tone falls a half step, 7th to 3rd. The enclosure makes that small move sound like an event.",
        "The target must land on the beat. The decoration is early. The arrival is on time.",
      ],
    },
    {
      variation: v({ voicing: "rootless", rhythm: "held", melody: "arpeggio" }),
      masteryBpm: 108,
      tune: {
        slug: "song-up-the-chord",
        title: "Up the Chord",
        key: "G",
        style: "swing",
        bpm: { min: 60, default: 116, max: 200 },
        level: 5,
        blurb: "The same guide tones, joined by arpeggios in place of scales.",
        form: `| Am7 | D7 | Gmaj7 | Em7 | Am7 | D7 | G6 | % |`,
        melody: `
          | C5:2 G4:2 | F#4:2 C5:2 | B4:2 F#4:2 | G4:2 D5:2 |
          | C5:2 G4:2 | F#4:2 C5:2 | B4:4 | r:4 |
        `,
      },
      points: [
        "Between the written notes the line moves through chord tones only: root, 3rd, 5th, 7th and 9th. It leaps where a scale run would step.",
        "From the 3rd of a chord up through the 5th, 7th and 9th is the most used arpeggio in bebop. Listen for it.",
        "Arpeggios spell the harmony more plainly than scales. A line of only chord tones can be followed with no band at all.",
        "Real lines mix the two: a leap up the chord, then steps back down the scale.",
      ],
    },
    {
      variation: v({ voicing: "rootless", rhythm: "charleston", melody: "scaleRun" }),
      masteryBpm: 116,
      needs: ["enclosures", "scale-bebop"],
      tune: {
        slug: "song-long-thread",
        title: "Long Thread",
        key: "C",
        style: "swing",
        bpm: { min: 70, default: 126, max: 210 },
        level: 5,
        blurb: "Sixteen bars of changes, one unbroken line, and the left hand comping under it.",
        form: `
          | Cmaj7 | A7 | Dm7 | G7 | Em7 | A7 | Dm7 | G7 |
          | Gm7 | C7 | Fmaj7 | Fm6 | Em7 | A7 | Dm7 G7 | C6 |
        `,
        melody: `
          | E5:2 B4:2 | C#5:2 G4:2 | F4:2 C5:2 | B4:2 F4:2 |
          | G4:2 D5:2 | C#5:2 G4:2 | F4:2 C5:2 | B4:2 F5:2 |
          | F5:2 Bb4:2 | E5:2 Bb4:2 | A4:2 E5:2 | Ab4:2 D5:2 |
          | G4:2 D5:2 | C#5:2 G4:2 | C5:2 B4:2 | E5:4 |
        `,
      },
      points: [
        "The skeleton is two guide tones a bar, all the way through. At the bar lines the 7th of one chord falls to the 3rd of the next, or the 3rd stays and becomes the 7th.",
        "The left hand is comping now, on one and the and of two. The two hands have different rhythms, and that independence is the hard part.",
        "Bars nine to twelve go to the IV and turn it minor. Follow the one note that changes: the 3rd of the IV drops a half step.",
        "Learn it in four-bar pieces. Each piece is one cadence, and a long line is only short ones joined.",
      ],
    },
  ],

  ears: [
    {
      variation: ROOTLESS,
      masteryBpm: 80,
      tune: {
        slug: "song-bright-then-dark",
        title: "Bright Then Dark",
        key: "C",
        style: "ballad",
        bpm: { min: 50, default: 88, max: 140 },
        level: 5,
        blurb: "Major then minor on the same root, three times over. The tune is the one note that changes.",
        form: `| Cmaj7 | Cm7 | Bbmaj7 | Bbm7 | Abmaj7 | G7 | Cmaj7 | % |`,
        melody: `
          | E5:4 | Eb5:4 | D5:4 | Db5:4 |
          | C5:4 | B4:2 D5:2 | E5:4 | r:4 |
        `,
      },
      points: [
        "Each pair of bars is one root with its 3rd lowered a half step. The tune is that 3rd. Major to minor is one note moving one key.",
        "Sing the melody while you play the left hand. Then sing it with no piano at all and check the last note.",
        "The line falls by half steps for five bars, and every note of it is the 3rd of its chord. A chromatic line can be completely inside the harmony.",
        "Each minor chord stands where the ii of the next key would, a whole step above it. You are hearing quality change and key change together.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 88,
      tune: {
        slug: "song-same-tune-twice",
        title: "Same Tune Twice",
        key: "C",
        style: "swing",
        bpm: { min: 50, default: 100, max: 160 },
        level: 5,
        blurb: "One phrase over the major ii-V-I, then over the minor one. Three notes change.",
        form: `| Dm7 | G7 | Cmaj7 | % | Dm7b5 | G7b9 | Cm6 | % |`,
        melody: `
          | A4:2 F5:2 | E5:2 D5:1 B4:1 | E5:4 | r:2 G4:2 |
          | Ab4:2 F5:2 | Eb5:2 D5:1 B4:1 | Eb5:4 | r:4 |
        `,
      },
      points: [
        "The second phrase is the first with three notes lowered a half step: the 5th of the ii, the 13th of the V, the 3rd of the I. Those three notes are the difference between major and minor.",
        "Close your eyes on the fifth bar. Can you hear that the ii has changed before the tune tells you? The flat 5th is in your left hand.",
        "The run down from the 5th to the 3rd of the V is identical both times. The V chord's core does not change between major and minor. Only its colours do.",
        "This is the Hear the cadence exercise as a tune. Play it, then go and take the test.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 100,
      tune: {
        slug: "song-major-turns-minor",
        title: "Trapdoor",
        key: "F",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 5,
        blurb: "Each new key's I chord turns minor and becomes the ii of the next. Four keys in sixteen bars.",
        form: `
          | Fmaj7 | % | Fm7 | Bb7 | Ebmaj7 | % | Ebm7 | Ab7 |
          | Dbmaj7 | % | Gm7 | C7 | Fmaj7 | % | Gm7 | C7 |
        `,
        melody: `
          | A4:2 C5:2 | E5:4 | Ab4:2 C5:2 | D5:4 |
          | G4:2 Bb4:2 | D5:4 | Gb4:2 Bb4:2 | C5:4 |
          | F4:2 Ab4:2 | C5:4 | Bb4:2 D5:2 | E5:2 Bb4:2 |
          | A4:2 C5:2 | E5:4 | D5:2 Bb4:2 | G4:2 E5:2 |
        `,
      },
      points: [
        "Bars one and three start the same phrase on the same root: 3rd, then 5th. The first 3rd is major and the second is minor, and the floor drops away.",
        "The long note ending each phrase is a 7th or a 3rd. In bars two, six and ten it is the major 7th of a I chord: bright, still, and a half step under the root.",
        "A maj7 turning into a m7 on the same root is one of the commonest key changes in standards. Knowing the sound saves you reading the chart.",
        "Sing the roots while you play: down a whole step, down a whole step. Then hear the last four bars walk back home.",
      ],
    },
    {
      variation: ROOTLESS,
      masteryBpm: 100,
      tune: {
        slug: "song-diminished-door",
        title: "Passing Through",
        key: "C",
        style: "swing",
        bpm: { min: 60, default: 112, max: 180 },
        level: 5,
        blurb: "I to ii to iii with a diminished chord between each pair, pushing the bass up by half steps.",
        form: `| Cmaj7 | C#dim7 | Dm7 | D#dim7 | Em7 | A7 | Dm7 G7 | C6 |`,
        melody: `
          | G4:2 E5:2 | E5:2 Bb4:2 | A4:2 F5:2 | F#5:2 C5:2 |
          | B4:2 G4:2 | C#5:2 E5:2 | F5:1 D5:1 B4:1 G4:1 | C5:4 |
        `,
      },
      points: [
        "A diminished seventh is minor thirds stacked: all tension, no centre. Here each one sits a half step under the chord it leads to and pushes up into it.",
        "Listen to the bass: 1, sharp 1, 2, sharp 2, 3. A chromatic bass line under a tune is nearly always passing diminished chords.",
        "In bar two the tune holds the 3rd of the I over the new chord, where it is still a chord tone. Then it drops a tritone, the interval a diminished chord is made of.",
        "Each diminished chord is the V7b9 of the next chord with its root left out. The pull you hear is a dominant's pull.",
      ],
    },
  ],

  advanced: [
    {
      variation: QUARTAL,
      masteryBpm: 140,
      tune: {
        slug: "song-drunken-sailor",
        title: "Drunken Sailor",
        composer: "Traditional",
        key: "G",
        minor: true,
        style: "swing",
        bpm: { min: 90, default: 152, max: 240 },
        level: 6,
        blurb: "A sea shanty in the dorian mode, two chords a whole step apart. Modal jazz, a century early.",
        form: `
          | Gm7 | % | % | % | F6 | % | % | % |
          | Gm7 | % | % | % | Gm7 | F6 | Gm7 | % |
        `,
        melody: `
          | D5:2 D5:1 D5:1 | D5:2 D5:1 D5:1 | D5:2 G4:2 | Bb4:2 D5:2 |
          | C5:2 C5:1 C5:1 | C5:2 C5:1 C5:1 | C5:2 F4:2 | A4:2 C5:2 |
          | D5:2 D5:1 D5:1 | D5:2 D5:1 D5:1 | D5:2 E5:2 | F5:2 G5:2 |
          | F5:2 D5:2 | C5:2 A4:2 | G4:4 | G4:4 |
        `,
      },
      points: [
        "The tune is dorian: a minor scale with a major 6th. The 6th arrives in bar eleven, on the way up to the top note. It is what keeps the tune from sounding sad.",
        "There are two chords, the i and the major chord a whole step below it. Four bars of each, like So What, except that the second chord is a whole step down and not a half step up.",
        "The second phrase is the first moved down a step, note for note. Moving one shape to a new level is the basic move of modal playing.",
        "The quartal voicings do not spell either chord fully. The bass and the tune decide what they mean, and the left hand is free to be rhythm.",
      ],
    },
  ],
  ballads: [
    {
      variation: DROP2,
      masteryBpm: 60,
      needs: ["drop2-forms"],
      tune: {
        slug: "song-last-call",
        title: "Last Call",
        key: "F",
        style: "ballad",
        bpm: { min: 44, default: 60, max: 100 },
        level: 4,
        blurb: "Eight slow bars. Every long note is a chord tone, so every one of them carries a whole drop 2 chord underneath.",
        form: `| Fmaj7 | Em7b5 A7b9 | Dm7 | Cm7 F7 | Bbmaj7 Bbm6 | Am7 D7b9 | Gm7 C7 | F6 |`,
        melody: `
          | A4:2 C5:2 | D5:2 C#5:2 | D5:1 C5:1 A4:2 | G4:2 A4:2 |
          | Bb4:1 D5:1 Db5:2 | E5:1 C5:1 Eb5:1 C5:1 | Bb4:2 G4:1 E4:1 | F4:4 |
        `,
      },
      points: [
        "A ballad is slow enough that every voice is heard. Play the four notes of each chord at exactly the same moment and let them ring for their full length.",
        "The tune is the top voice of each drop 2 chord. Lean the right hand towards its little finger so the top note sings above the other three.",
        "Bar two is a minor ii-V into the vi, and bar four a ii-V into the IV. The tune marks each arrival with the 3rd of the dominant rising a half step to the new root.",
        "In bar five the IV turns minor under the tune: its 3rd falls a half step to the flat 3rd, and that one note is the whole change of colour.",
        "The bass plays only on one and three, so the time is yours to keep. Count four slow beats through every held note.",
      ],
    },
  ],
};
