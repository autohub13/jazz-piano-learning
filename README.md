# Jazz Piano

A browser course from the first key to playing a tune at a session. Everything is generated: a tune is a chord chart, an exercise is a function of a key, and the site arranges, grades and schedules the rest. Plug in a MIDI keyboard; the computer keyboard and mouse work too.

## What it trains, every day

1. Voicings under the hands in all twelve keys: shells, rootless A and B forms, drop 2, quartal, altered dominants.
2. Ears: hearing a chord quality or a cadence and playing it back.
3. Reading and playing tunes from a lead sheet with a band, in time.
4. Improvising over changes, scored by how each note sits against the chord under it.

The fastest route is repertoire driven. A skill is drilled alone for a few minutes, used in a progression, then in a tune, cycled through the keys round the circle of fourths, and spaced out so it comes back before it is forgotten.

## The path

Six levels, each a few units, each unit a few exercises (`src/lib/curriculum/tree.ts`):

1. Foundations: the keyboard, major scales with fingering, intervals, triads, the four seventh chords.
2. Shells and the ii-V-I: shells in every key, the cadence with a walking bass, the blues, a first tune.
3. Rootless comping: A and B forms, the turnaround, Charleston rhythm, tunes with moving dominants.
4. Minor and colour: the minor ii-V-i, altered dominants, drop 2, tritone substitution.
5. Lines and improvising: chord scales, guide tone lines, enclosures, bebop scales, improvising over the cadence, the blues and a 32-bar form, ear tests.
6. The session: quartal voicings, rhythm changes, uptempo.

A card unlocks when its prerequisites are done in at least one key. A timed card is only marked done with the band on, at the tempo it names, with 70 percent of the hits on the beat.

## Pages

- `/` Today: the due reviews and the next new thing, about twenty minutes.
- `/path` The skill tree with per-key mastery dots.
- `/tunes` The repertoire.
- `/practice/[id]?key=&v=` One exercise. Modes depend on its kind: Listen, Practice (own pace), Timed (against the band), Improvise, Ear.
- `/lessons/[slug]` Old links, redirected to the matching exercise.

## How content is generated

- `src/lib/tunes/library.ts` holds the tunes as text charts: `| Dm7 | G7 | Cmaj7 | % |` plus an optional melody `C4:1:Oh E4:1:when ...`. Melodies are traditional or original; the changes of standards are given under generic names.
- `src/lib/arrange/arrange.ts` turns a chart plus options (voicing, comping rhythm, melody treatment, reharmonisation) into lesson steps, harmony regions and a band part. Voicings are chosen by voice leading (`src/lib/music/voicings.ts`), the bass line by the usual walking habits (`src/lib/arrange/bass.ts`), and generated lines stay inside each chord's scale (`src/lib/music/chords.ts`).
- `src/lib/curriculum/generators.ts` makes scale drills, chord-form drills, progression drills from degrees, guide tone etudes and ear tests, all as functions of a key.
- `src/lib/lessons/curriculum.ts` still holds the handful of authored pieces (the vamp and the orientation drills).

## Grading

- Practice: the held set must equal the target, judged on note-down only. A partial chord is never wrong.
- Timed (`src/hooks/useTimedSession.ts`): the player runs silent with the band; each step is scored when the clock leaves it. A hit within 120 ms of the beat is on time.
- Improvise (`src/hooks/useImprovSession.ts`, `src/lib/grading/improv.ts`): every note is a chord tone, a scale tone or outside. The chorus score weighs notes in the scale, chord tones on beats one and three, and 3rds or 7ths struck on a chord change.
- Ear (`src/hooks/useEarSession.ts`): a chord sounds, the learner plays it back in any octave; pitch classes are compared.

## Progress

`src/lib/progress.ts`, localStorage only. Each (exercise, key) is a card. A pass at the mastery bar schedules the next review 1, 3, 7, 14, 30 then 60 days out; a fail brings it back to tomorrow. `planToday` takes the due cards, then the next unlocked exercise in the lowest unfinished level, mixing kinds.

## Audio

Everything is scheduled on absolute AudioContext time and the highlight reads `ctx.currentTime` inside `requestAnimationFrame`, so sound and picture cannot drift. Pause suspends the context. The band (bass and drums) is synthesised; the piano is sampled with a synth fallback. `src/lib/audio/pianoEngine.ts` is the only file that imports `smplr`. A hidden tab pauses playback, since the browser stops animation frames there.

## Running

```
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

Next.js 14 App Router, TypeScript strict, Tailwind 3, Vitest.
