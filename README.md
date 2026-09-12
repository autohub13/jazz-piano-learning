# Jazz Piano Learning

A beginner jazz piano course you play in the browser. Each lesson shows a piano
keyboard, lights up the keys as they are played, then hands the keys to you.

Prototype. Beginner mode only.

## Running it

```
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
```

## How it works

Each lesson has two modes.

**Listen** schedules the whole lesson onto the Web Audio clock in one pass, then
runs a `requestAnimationFrame` loop that reads `audioContext.currentTime` to
decide which step is currently sounding. Both the audio and the highlight are
pure functions of the same clock, so they cannot drift apart. Pause suspends the
AudioContext, which freezes that clock and therefore freezes sound and picture
together with no extra bookkeeping.

**Practice** shows the target notes as ghost outlines and waits. A step is
satisfied when the held notes exactly equal the target: all of them, none extra.
Evaluation happens on key-down only, and a partial chord produces no verdict, so
a beginner rolling a chord over two seconds has unlimited time to assemble it.
After advancing, evaluation is gated until the hands have let go at least once,
otherwise leftover fingers from a shared note race through the lesson.

## Input

Mouse or touch on the on-screen keys, and the computer keyboard. The QWERTY
mapping is the standard tracker layout, keyed by physical position so it works
on non-QWERTY layouts. Arrow up and down shift the octave.

Most keyboards will not report more than a few simultaneous keys, so four-note
chords may drop a note when typed. Click those with the mouse.

## Audio

Piano samples come from `smplr` over its CDN, loaded behind an explicit Start
button because browsers require a user gesture to open an AudioContext. If the
samples cannot be reached within ten seconds, the app falls back to a
synthesized piano voice and says so in the interface.

## Layout

```
src/lib/music/       note representation, keyboard geometry, QWERTY mapping
src/lib/audio/       the piano engine, the only place smplr is imported
src/lib/lessons/     lesson schema, the curriculum, the playback timeline
src/hooks/           audio engine, listen player, practice session, key input
src/components/      keyboard, workspace, transport, legend
src/app/             routes
```

The curriculum array in `src/lib/lessons/curriculum.ts` drives the landing page,
the routes and the per-lesson metadata. Adding a lesson means adding an object
to it.

The first entry is the piece the site opens with, a two hand ii-V-I vamp. Every
entry after it carries an `ingredient` line and is one part of that piece,
ordered from the largest chunk down to the keyboard itself, which is why `order`
runs backwards through the usual syllabus. The landing page lists exactly the
lessons that have an `ingredient`.

The last lesson is a whole tune, "When the Saints Go Marching In". It is a
traditional spiritual and out of copyright; the melody and chords follow the
standard transcription, while the voicings, the bass line and the arrangement
are this site's own. Its tonic is C6 rather than Cmaj7 because the melody keeps
landing on C and a major 7th would sit a semitone under it. Step labels are the
lyrics, so the cue line sings along.

Keys are coloured by hand while they sound: brass for the right, violet for the
left. A step says which hand plays it with `hand`, or names a hand per note with
`hands` when both play at once, as in the vamp where a shell sits under a melody
note. There is no pitch split point because there cannot be one: the vamp's
melody dips below the left hand's top note. Hand colours are Listen only, since
in Practice the same colours already mean right and wrong.

A lesson with a `harmony` array can explain itself, but never while the
music is running. A chord is on screen for about two seconds at tempo and the
sentences take about twelve to read, so streaming them past is worse than
showing nothing. While it plays the panel is a position indicator: the chord
name, where you are on the map, and the hand colours. Pause, or click a chord
chip, and it becomes an explanation. Clicking a chip disables the player, which
is what silences the loop and hands back the AudioContext so that one chord can
be sounded alone and read about at reading speed.

Each region names one chord, its place in the key, and what changed on the way
into it. Degrees are worked out at runtime in
`src/lib/music/harmony.ts` from the written chord symbol rather than guessed
from the notes, because a shell voicing has no fifth and often no root on top.
Anything written in a `move` line must describe the voicing as it is actually
played, not the textbook ideal.

A lesson with a `band` gets an upright bass and a brushed kit behind Listen
mode, switchable off. Only the three that are actual pieces have one. The band
is synthesized in `src/lib/audio/band.ts` rather than sampled, so it is ready
the moment the AudioContext is and it still plays when the piano has fallen back
to its synth. The walking bass is written out one note per beat; the drums are
derived from the bar position. Both are scheduled against the same `t0` as the
piano, so the whole trio stays locked to the keys lighting up.
