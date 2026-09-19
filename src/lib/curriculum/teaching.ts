// What to listen for and why, per exercise. Written in degrees and numerals,
// never in note names, because every exercise is played in twelve keys and the
// page does not know which one is on the stand. The one exception is the
// keyboard orientation, which only exists in C.

export const TEACHING: Record<string, string[]> = {
  // Level 1

  "meet-the-keyboard": [
    "The black keys come in groups of two and three. That pattern repeats every octave, and it is your map.",
    "C is the white key immediately to the left of every group of two black keys.",
    "F is the white key immediately to the left of every group of three.",
    "Middle C is C4, near the centre of the piano. Every register in this course is measured from it.",
  ],
  "major-scale": [
    "Whole, whole, half, whole, whole, whole, half. That pattern of steps is the major scale in every key. Only which keys are black changes.",
    "Each letter appears exactly once. In a flat key every black key is a flat, in a sharp key every one is a sharp.",
    "The fingering shown keeps the thumb off the black keys and tucks it under once per group of three or four fingers.",
    "Every chord in this course comes from this scale. Take every other note from the root and you have the 3rd, 5th, 7th and 9th.",
    "Evenness before speed. A click on every note shows up the thumb tuck, which is where the scale usually stumbles.",
  ],
  intervals: [
    "An interval is a distance counted in half steps. Every neighbouring key, black or white, is one.",
    "A minor 3rd is three half steps, a major 3rd is four. That one half step is the difference between a minor chord and a major one.",
    "The perfect 5th, seven half steps, is stable and nearly colourless. It is the note jazz pianists leave out first.",
    "The flat 7th, ten half steps, is restless and bluesy: the sound of a dominant chord. The major 7th, eleven, sits a half step under the octave and sounds bright and suspended.",
    "Play each interval, then sing the top note. What you can sing you will start to hear on records.",
  ],
  "ear-intervals": [
    "The lower note is always the tonic. Only the upper note is in question, and there are five answers: minor 3rd, major 3rd, 5th, flat 7th, major 7th.",
    "Sing the top note before you look for it. If you can sing it, your ear already knows it and your hand only has to find it.",
    "Learn each one by its feel. The 5th is hollow. The 3rds are sweet, major bright and minor dark. The flat 7th leans. The major 7th glows and nearly hurts.",
    "The order changes every time, so there is nothing to memorise. Ears are trained a few minutes a day, every day, from the first week.",
  ],
  "ear-triads": [
    "Two questions each time. Where is the bottom note: the 1st, 4th or 5th of the key? Then is the chord major or minor?",
    "Sing the lowest note and find it on the keys first. A chord is much easier to name once its root is under your finger.",
    "Then listen to the middle note only. Major and minor differ by that one half step, and everything else in the chord is the same.",
  ],
  triads: [
    "A triad is root, 3rd and 5th, each a third apart. Fingers 1, 3 and 5.",
    "Major to minor moves one note: the 3rd drops a half step. The root and 5th stay put.",
    "The drill plays the triads on I, then i, ii and V. The ii and V are the bottom half of the ii-V-I you meet in level two.",
    "Drop into the keys from a loose wrist with a curved hand, so all three notes sound as one.",
  ],
  "seventh-chords": [
    "Stack one more third on a triad and you have a seventh chord. Four notes, and the unit jazz harmony is built from.",
    "maj7 is a major triad with a major 7th. Bright and at rest: the I chord.",
    "m7 is a minor triad with a flat 7th. Warm and open: the ii chord.",
    "7 is a major triad with a flat 7th. Its 3rd and 7th are a tritone apart, and that tension is why it wants to resolve. It is the V chord, and the sound of the blues.",
    "m7b5, half diminished, has a minor 3rd, a flat 5th and a flat 7th. It is the ii of a minor key.",
    "Each chord differs from the one before by one or two notes. Find which ones moved.",
  ],

  // Level 2

  shells: [
    "A shell is the root with one guide tone above it: the 7th or the 3rd. The 3rd says major or minor, the 7th says maj7 or dominant, and the 5th adds nothing, so it goes.",
    "Two shapes: root-7 and root-3. Two notes fit any hand, which is why Bud Powell could play them at any tempo. In a progression you pick whichever keeps the top note closest to the last one, and that choice is the whole skill.",
    "The guide tone you leave out is rarely missed. The tune or the band usually has it, and the ear fills in the rest.",
    "A hand that reaches a tenth can hold all three notes, root-3-7 or root-7-3. The voicing menu has them as full shells. They are an extra, not a requirement.",
    "Keep the root-3 shape at the C below middle C or higher. Any lower and the 3rd turns to mud. Root-7 can go lower.",
    "A m7b5 shell looks just like a m7 shell. The flat 5th that tells them apart is left to the bass or the right hand.",
    "Say the degrees as you play them: root, 3, 7. You are learning names for shapes, not just shapes.",
  ],
  "ear-sevenths": [
    "Four qualities on one root. Listen to the 3rd first: major or minor. That splits them into two pairs.",
    "Then the 7th. With a major 3rd, a major 7th is maj7 and a flat 7th is dominant. With a minor 3rd, listen to the 5th: a flat 5th makes it half diminished.",
    "The dominant is the restless one, because its 3rd and 7th are a tritone apart. Learn that sound above all the others. It is what makes harmony move.",
    "Play back all four notes. Hearing a chord as a colour is a start. Hearing the notes inside it is the skill.",
  ],
  "ii-v-i-shells": [
    "The ii sets up, the V builds tension, the I resolves it. Most standards are made of this cadence, in one key after another.",
    "The smoothest path alternates shapes: the ii as root-7, the V as root-3, the I as root-7, or the other way round. The 7th of the ii falls a half step to the 3rd of the V, and that note then stays put and becomes the 7th of the I. The top of your hand barely moves while the root walks.",
    "Listen to the bass. It walks a note a beat and lands on the root at the top of each bar, and your chord lands with it.",
    "Say the numerals as you play. Across twelve keys the letter names change, but ii, V and I do not.",
    "The I lasts two bars. That is where a soloist finishes a phrase, so let the chord sit still.",
  ],
  "arpeggios-ii-v-i": [
    "Root, 3rd, 5th, 7th, a note a beat, over each chord of the cadence. On the I, which lasts two bars, the arpeggio comes back down.",
    "Chord tones are where a jazz line lands. Learn them before any scale, because a scale with no targets in it is only a run.",
    "Say the degree of every note as you play it. In a solo you will need to find the 3rd of a chord without thinking, and this is where that starts.",
    "The 7th at the top of the ii is a half step above the 3rd of the V. Hear that pull even though the arpeggio starts again from the root.",
  ],
  "the-vamp": [
    "The left hand is the ii-V-I as full shells, root, 3rd and 7th. Each spans a seventh, inside an octave, and it never changes. The two-note shells you have just learned are these with one note left out.",
    "The right hand plays one note at a time, every one a chord tone or the 9th, moving mostly by step.",
    "Two hits a bar: one on the beat, one on the and of two, a swung eighth late, and let it ring. That late second hit is where the swing comes from.",
    "Over the I the tune touches the 9th. The 9th is what makes the resolution sound like jazz rather than a hymn.",
    "Loop it until it stops needing your attention. Everything after this takes one part of it further.",
  ],
  "f-blues": [
    "Twelve bars in three lines of four. I7 with a IV7 in bar two, then IV7 for two bars, I7 for two, and V7, IV7, I7, V7 to go round again.",
    "Every chord is a dominant seventh, the I included. In the blues the flat 7th is not tension waiting to resolve. It is home.",
    "The riff slides from the 3rd down to the flat 3rd, the blue note, and lands on the root. Over the IV it is the same shape a fourth higher.",
    "From I7 to IV7 the guide tones trade places: the 7th of the I7 falls a half step to the 3rd of the IV7, and the 3rd of the I7 falls a half step to its 7th. Your shell holds one of the pair. Follow it down a half step and back.",
    "Count bars out loud the first few times. Losing the form is the commonest blues mistake, and the band will not wait.",
  ],
  "when-the-saints": [
    "Sixteen bars on three roots, I, IV and V, and the first six bars never leave home. The form is the easy part.",
    "The tune uses the first five notes of the scale under one hand, with no thumb tuck.",
    "The tonic is a 6 chord, not maj7, because the tune keeps landing on the root and a major 7th a half step under it would grind.",
    "In bar ten the I becomes I7: the 6th rises a half step to the flat 7th, and the chord starts pointing at the IV.",
    "Three pickup notes come before bar one, alone. The band arrives with you on the downbeat.",
  ],
  inversions: [
    "A seventh chord has four notes, so it can stand four ways up. Root position has the root at the bottom and the 7th on top.",
    "Move the lowest note up an octave and you have the next inversion. Keep going and each chord tone takes its turn on top: 7th, root, 3rd, 5th.",
    "All four notes stay inside one octave, so the hand keeps the same shape. Only which note is highest changes.",
    "The top note is the one the ear follows. When a melody note is in the chord, the inversion with that note on top is the chord that goes under it.",
    "Say the degree on top out loud as you play each shape. That is the question the tunes will ask.",
  ],
  "melody-on-top": [
    "The top line is the 3rd or the 7th of each chord. Put it on top, fill the other three chord tones in close underneath, and you have the inversion.",
    "Work down from the melody, not up from the root. Find the top note first, then the chord tones directly below it.",
    "The left hand plays just the root, low. The chord has its floor there, and the right hand is free to sit wherever the melody is.",
    "From chord to chord most notes in the right hand hold or move a step. If the hand is jumping, look again at which inversion you chose.",
  ],
  "saints-melody-chords": [
    "The left hand plays the root, low, at the start of every bar and on every change. The right hand plays the tune and fills the chord in under it.",
    "Not every note gets a chord. Fill in under a note on beat one or three, on a chord change, or held two beats or more. Play the notes in between alone.",
    "A tune note that is not the root, 3rd, 5th or 7th is a passing note. Play it alone and let it lead to the next chord tone.",
    "The pickup is the tune alone. The chords start on the downbeat of bar one.",
    "The tune must stay on top of the sound. Lean the weight of the hand towards the little finger and keep the notes under it softer.",
  ],
  "blues-fill": [
    "When the tune moves, the left hand waits. When the tune holds or rests, the left hand plays. Most accompanying comes down to that rule.",
    "The left hand always plays on a chord change, even under a tune note, so the new chord is heard when it arrives.",
    "Each riff starts on a beat and holds. The left hand answers on the next beat where the tune starts nothing, once per hole.",
    "Think of it as call and response: the riff calls, the left hand replies. Two voices taking turns sound fuller than two playing at once.",
  ],
  "saints-stride": [
    "Stride splits the left hand in two: a low bass note on beats one and three, a chord in the middle of the keyboard on two and four.",
    "The bass on three is the 5th when the chord has not changed, so the hand swings between root and 5th. When the chord changes on three, it plays the new root.",
    "The chord on two and four is a shell, kept under the tune. Short and light: the bass carries the weight and the chord is the backbeat.",
    "The leap is the hard part. Look at where the hand is going before it leaves, and practise the left hand alone, slowly, until the jump needs no looking.",
    "Stride is how a solo pianist is the whole band: bass, chords and tune at once.",
  ],

  // Level 3

  "rootless-forms": [
    "The bass has the root, so your left hand drops it and plays a colour note instead: the 9th. That is a rootless voicing.",
    "Form A is 3-5-7-9 from the bottom up. Form B is 7-9-3-5: the same four notes with the lower pair moved up an octave.",
    "On a dominant the 5th becomes the 13th: 3-13-7-9 and 7-9-3-13. That 13th is much of what makes a dominant sound like jazz.",
    "The half-diminished chord is the exception. It has no usable 9th, so its forms take the root in that place: 3-5-7-root and 7-root-3-5.",
    "Keep the lowest note no lower than about the D below middle C. Any lower and the 3rd turns to mud.",
    "Alone, a rootless voicing can sound unfinished. Play the root with the right hand now and then to hear the chord it implies.",
  ],
  "arpeggios-3-to-9": [
    "The same four notes your left hand is holding, 3, 5, 7, 9, played one at a time an octave up. A voicing is an arpeggio you have not broken yet.",
    "Starting on the 3rd and ending on the 9th is the most used arpeggio in bebop. It says the chord's quality at once and finishes on its colour.",
    "On a dominant the left hand swaps the 5th for the 13th. The line keeps the plain 5th, so the two hands differ by that one note.",
    "Once it is easy, start each arpeggio a beat late, or play only three of its four notes. You are already improvising.",
  ],
  "ii-v-i-rootless": [
    "Start the ii in one form and the V in the other. From ii to V only one note moves: the 7th of the ii falls a half step to become the 3rd of the V.",
    "Into the I every voice moves a step or less. This is why rootless voicings are the standard comping language: the hand stays put and the harmony changes under it.",
    "The voicings only make sense because the bass is playing roots. Listen to it under you.",
    "Learn these until the hand finds them without looking. They are how most jazz pianists comp.",
  ],
  turnaround: [
    "I-vi-ii-V, two chords a bar. It fills the last two bars of a tune and turns the form back to the top.",
    "The Charleston rhythm: one hit on beat one and one on the and of two. It is the oldest comping rhythm there is and still the most useful.",
    "The chord changes every two beats now, so find the next shape while the current one rings, not after.",
    "The vi shares three notes with the I. Hear it as a darker shade of home.",
  ],
  "improv-turnaround": [
    "Four chords, two beats each. Start with one note per chord, always a 3rd. Four notes, and the whole turnaround can be heard in them.",
    "Then two notes per chord: the 3rd and one other chord tone. Leave scales out for now. Chord tones alone make complete, musical lines.",
    "The I and the vi share three notes. When the changes go by this fast, think of two sounds, home and away, not of four chords.",
    "Rest for a whole bar now and then. A solo over a loop needs air more than it needs notes.",
  ],
  "bb-blues": [
    "The same twelve bars, now comped with rootless voicings. It is written in Bb because that is the blues key horn players call most.",
    "Comping is rhythm as much as notes. Play short and leave space. Chords held under a soloist sound like an organ, not a band.",
    "Between I7 and IV7 every voice moves a step or less. Let the hand stay where it is.",
    "Place your hits against the ride cymbal, not the bass. The drummer owns the time.",
  ],
  "blues-cycle": [
    "In bar eight the blues turns to the VI7, then the II7 in bar nine and the V7 in bar ten, each a dominant falling a fifth into the next.",
    "None of those dominants belongs to the key. Each is the V of the chord after it, borrowed. That is what a secondary dominant is.",
    "The 3rd of each dominant falls a half step to the 7th of the next, and the 7th falls a half step to the next 3rd. Two voices, walking down by half steps.",
    "Bars eleven and twelve run the same cycle twice as fast to turn the form round.",
  ],
  "a-train": [
    "Thirty-two bars, AABA. Learn the eight-bar A and you have three quarters of the tune.",
    "Bars three and four are the II7 with a #11. The #11 is the one note outside the key, and it is the sound everyone remembers from this tune.",
    "The II7 does not resolve down a fifth as a dominant usually does. It relaxes into the ii on the same root: the 3rd falls a half step and the chord turns minor.",
    "The bridge goes to the IV for four bars, then climbs back through II7, ii and V. Count the four bars of IV. Everyone rushes them.",
  ],
  "all-of-me": [
    "Thirty-two bars in four lines of eight: the first and third lines match, so there are three lines to learn.",
    "III7 to VI7 to ii in the first line: each dominant is the V of the chord after it, the same chain as Ja-Da with one more link.",
    "Most chords last two bars, so there is time to find each shape. Use it to look ahead, not to rest.",
    "In the last line the IV turns minor: the iv with a major 6th. Its flat 3rd is the flat 6th of the key, and it falls a half step on the way home.",
  ],
  "ja-da-changes": [
    "Sixteen bars in two halves. Each opens on the I and goes straight to the VI7, then II7 and V7 back home.",
    "The VI7 and II7 are not in the key. Each is the V of the chord after it, so the harmony keeps falling by fifths.",
    "The 3rd of each dominant becomes the 7th of the next, a half step lower. Follow that single line through your left hand.",
    "In bars ten to twelve the I turns into I7 and falls to the IV, then a diminished chord a half step above the IV lifts the harmony back to the I. Bar six of the jazz blues makes the same move.",
    "In bars three and fifteen the II7 and V7 share a bar, two beats each. Know both shapes before you arrive.",
  ],
  "improv-ja-da": [
    "The VI7, II7 and V7 each have a 3rd from outside the key. Land on it as the chord arrives and the listener hears the change without the band.",
    "From the 3rd of one dominant, fall a half step to the 7th of the next, then on to its 3rd a half step lower. One line of half steps runs through the whole cycle.",
    "Over the I, relax. Any note of the key works there. The work is in the bars with dominants in them.",
    "In bar ten, mark the I7 with its flat 7th. It is one note, and it tells everyone the IV is coming.",
  ],
  "indiana-changes": [
    "Thirty-two bars in four groups of eight. The first and third open the same way: I, then VI7, then two bars of II7.",
    "The first eight is dominants resolving down a fifth, VI7 to II7 to V7 to I, and its last bar is a ii-V aimed at the IV.",
    "Bars nine and ten are the IV and then the minor iv. Its flat 3rd is the flat 6th of the key, and it falls a half step on the way back to the I.",
    "The third eight swerves: III7 for two bars, into the relative minor. In the last eight a diminished chord a half step under the iii pushes up into iii-VI7-ii-V7, and home.",
    "Comp with the Charleston and let the bass carry the harmony. You do not have to play every change on beat one.",
  ],

  // Level 4

  "minor-ii-v-i": [
    "The minor cadence: half-diminished ii, dominant with a flat 9, minor tonic.",
    "The ii is half diminished because its 5th is the flat 6th of the minor key. The V takes a flat 9 for the same reason: it is the same note.",
    "The tonic here is m6. The major 6th keeps a minor chord settled without sounding heavy.",
    "In a rootless half-diminished voicing the 9th is replaced by the root, because a flat 9 would grind and a natural 9 is outside the key. The shape is the same as a m6 chord a minor third up.",
    "Practise it straight after the major ii-V-I in the same key. The two differ by a handful of notes, and the ear learns them fastest side by side.",
  ],
  "scale-melodic-minor": [
    "A major scale with its 3rd lowered a half step, and nothing else changed. In jazz it is played the same going up and coming down.",
    "It is the scale of a minor tonic. Its major 6th is the 6th of your m6 chord, and its major 7th is the leading note that the minor V7 borrows.",
    "Compare it with dorian: one note differs, the 7th. Dorian's flat 7th belongs to a ii chord on its way somewhere. The major 7th belongs to a minor chord that is home.",
    "The melodic minor scale a half step above the root of a dominant is that dominant's altered scale. You do not need that yet. Know only that this scale will come back.",
  ],
  "altered-dominants": [
    "The same rootless dominant three ways: plain, with a flat 9, with a flat 13. The 3rd and 7th never change. Only the notes above them do.",
    "Plain to b9 moves two notes, the 9th and the 13th, each down a half step. b9 to b13 puts the 9th back. Find which fingers move.",
    "The b9 is the flat 6th of the key the dominant resolves to, and the b13 is its flat 3rd. Both belong to the minor key, which is why altered dominants lead so strongly to minor chords.",
    "Use the plain dominant before a major chord and an altered one before a minor chord. Then try altered before major and hear the extra pull.",
  ],
  "minor-blues": [
    "Twelve bars in minor: the i for four bars, the iv for two, the i for two, then bVI7 to V7 and home.",
    "The bVI7 to V7 in bars nine and ten is a tritone substitute sliding down a half step. It is the signature sound of the minor blues.",
    "From i to iv the flat 3rd of the i stays put and becomes the flat 7th of the iv. The other guide tone falls a whole step.",
    "The V is a 7b9. Its flat 9 is the flat 6th of the minor key and wants to fall a half step to the 5th.",
  ],
  "improv-minor-blues": [
    "The tonic's blues scale works over all twelve bars, as it did in the major blues. Start there, and play riffs, not runs.",
    "In bars nine and ten, step outside it. The flat VI7 and the V7 are a half step apart, so one short idea played twice, a half step lower the second time, fits both.",
    "The 3rd of the V7 is the leading note, a half step under the tonic. It is not in the blues scale, and it is the strongest note you can play in bar ten.",
    "Over the iv in bars five and six, lean on its 3rd, the flat 6th of the key. It is the one note that says the chord has changed.",
  ],
  "drop2-forms": [
    "Take a four-note chord in close position and drop the second voice from the top down an octave. That is drop 2.",
    "Every chord has four drop 2 shapes, one per inversion, so each chord tone takes a turn in the top voice.",
    "The spread is a ninth or a tenth, more than one hand holds. The left hand takes the dropped voice and the right hand the three above it.",
    "It sounds fuller than close position without getting muddy. Guitarists and big band arrangers live on these shapes.",
    "Watch which degree is on top. In a tune the top of the voicing is what the listener hears as melody.",
  ],
  "tritone-sub": [
    "The V7 and the dominant a tritone away share the same 3rd and 7th, swapped. That is why one can stand in for the other.",
    "Over ii-bII7-I the bass walks down by half steps: 2, flat 2, 1. That line is the sound of the substitution.",
    "The substitute is written with a #11 because its #11 is the root of the V it replaced.",
    "Anticipation: each chord arrives on the and of the beat before the bar and rings across the barline. It pushes the music forward.",
  ],
  "satin-doll": [
    "The A section is ii-Vs that never resolve: one on the ii, the same thing a step higher, then one aimed at the V.",
    "Bar six is a ii-V a half step above home. Its dominant is the tritone substitute for the V, sliding down a half step into the I.",
    "Each ii-V is played twice. The second time is your chance to fix the first.",
    "The bridge is a ii-V-I into the IV, then a ii-V that lands on the V of the home key and waits there for two bars.",
  ],
  "improv-satin-doll": [
    "Each ii-V is played twice. Play an idea the first time and answer it the second.",
    "Bars three and four are bars one and two a whole step higher. Move your idea up with them. A sequence in the chords asks for a sequence in the line.",
    "Bar six is a ii-V a half step above home. Everything you played over the home ii-V fits it a half step up, and then it slides back down.",
    "The bridge starts with four bars aimed at one key, the IV. After all that motion, slow down: fewer notes, longer ones.",
  ],
  "autumn-changes": [
    "Two keys a minor third apart: the minor home and its relative major. The tune moves between a major ii-V-I into the relative major and a minor ii-V-i into home.",
    "Bars one to four are a ii-V-I in the relative major, then its IV. Bars five to eight are the minor ii-V-i. The whole tune is those two cadences, rearranged.",
    "The numerals are counted from the minor tonic, so the major cadence reads iv, bVII7, bIII. Read the chord panel for which key each bar is in.",
    "Drop 2 voicings in two hands, with anticipations: every change lands on the and of four of the bar before.",
  ],
  misty: [
    "A ballad is slow, so every chord is heard for a long time. Play all four notes of a voicing at exactly the same moment and hold them for their full length.",
    "The bass plays only on one and three. There is far less to hide behind than at a medium tempo, and the time is yours to keep through every held chord.",
    "Bar two is a ii-V into the IV. It makes the IV sound like home for a moment.",
    "Bar four is the back door: a ii-V built on the minor iv, whose dominant is the flat VII. It comes home from a whole step below, and it sounds softer than the V.",
    "The bridge goes to the IV, then leaves the key with a ii-V a tritone away from home. A minor ii-V and a major one bring it back.",
  ],
  "improv-misty": [
    "At a ballad tempo one chord tone held for two beats is a phrase. Start there: the 3rd or the 7th of each chord, and nothing else.",
    "Leave space. Play two bars, rest for two, and let the chords ring in the gap.",
    "Over the back door in bar four aim for the flat 7th of the key, which is the root of the flat VII chord. It is the note that says the harmony went somewhere else.",
    "When you add eighth notes, keep them even and unhurried. Swing barely applies at this tempo.",
    "Sing what you are about to play. A ballad is where a solo most needs to sound like a song.",
  ],
  "someday-my-prince": [
    "Three beats to the bar. The band walks in three, so count it before you play and keep counting through the long chords.",
    "The left hand comps on one and on the and of two. That is the Charleston rhythm fitted into a waltz bar.",
    "Bars two and four are dominants with a b13: the III7, which slips up a half step into the IV, and the VI7, which is the V of the ii. The b13 of the VI7 is the flat 3rd of the ii it resolves to.",
    "In the second eight a diminished chord a half step above the ii slides down into it. Hear the bass walk iii, flat iii, ii.",
    "Near the end a diminished chord a half step above the IV lifts the harmony back up to the I.",
  ],
  "improv-someday": [
    "Think in two bar phrases: six beats, then breathe. A phrase that ignores the barline sounds lost in three far sooner than it does in four.",
    "A dotted half note fills the bar. Start with one note a bar, a 3rd or a 7th, to hear the harmony go by.",
    "Over the dominants with a b13, hold the b13. It is already a note of the chord that follows, the 5th of the IV or the flat 3rd of the ii, so it can ring across the barline.",
    "Try three even quarter notes, then a bar's rest. Then try placing a note on beat two, which is where a jazz waltz lifts.",
    "The form is thirty-two bars, as it is in four. Only the bars are shorter, so it goes by quickly.",
  ],

  // Level 5

  "scale-dorian": [
    "Dorian is the major scale started on its second note. Over a ii chord you are playing the notes of the key you are already in.",
    "Compared with the natural minor scale it has a raised 6th. That major 6th is its bright colour.",
    "The chord tones are root, flat 3rd, 5th and flat 7th. Treat them as landing points and the rest as steps between them.",
    "Sing the 6th when you reach it. It is the note that sets dorian apart from other minor sounds.",
    "It is written in swung eighths, the way you will use it: up a bar to the octave, down a bar to the root. Long, short, long, short, with the short note on the last third of the beat.",
  ],
  "scale-mixolydian": [
    "Mixolydian is the major scale started on its fifth note: a major scale with a flat 7th. It fits a dominant seventh.",
    "Handle the 4th with care over a dominant. It rubs against the 3rd, so pass through it rather than landing on it.",
    "Dorian over the ii and mixolydian over the V are the same seven notes. Over a ii-V you change which notes you aim at, not the scale.",
    "Put the 3rd and flat 7th on the beats. They are what tell the listener the chord is a dominant.",
    "Going up in eighths from the root, the beats fall on the root, 3rd, 5th and flat 7th. Start a descending run on the root instead and every chord tone falls between the beats. The next drill fixes that with one extra note.",
  ],
  "scale-blues": [
    "Root, flat 3rd, 4th, flat 5th, 5th, flat 7th. Six notes that sit over every chord of a blues.",
    "The flat 5th is the blue note. Use it as a passing tone between the 4th and 5th, not a note to stop on.",
    "The flat 3rd against a chord with a major 3rd is the blues. The clash is the sound. Try crushing the flat 3rd into the 3rd as a grace note.",
    "The scale is a quarry, not a line. Cut short riffs of three or four notes from it and repeat them.",
  ],
  "scale-bebop": [
    "Mixolydian with one extra passing note, the natural 7th, between the flat 7th and the root. Eight notes instead of seven.",
    "Start on the root on a beat and run in eighths, and the chord tones stay on the beats all the way, down and up. Eight notes fill a bar exactly, so the root comes round on the next downbeat. That is why bebop lines sound grounded at speed.",
    "The drill descends first. Bebop lines mostly run downwards from a chord tone.",
    "The added note only passes. Never hold the natural 7th against a dominant chord.",
  ],
  "scale-lydian-dominant": [
    "Mixolydian with one note raised: the 4th becomes a #4, which a chord symbol calls the #11. Every other note is the same.",
    "The plain 4th is the one note of mixolydian that fights the chord, because it sits a half step above the 3rd. Raising it removes the clash, so every note of this scale can be held.",
    "It is the melodic minor scale starting from its 4th note. Play melodic minor from the 5th of the chord and you are playing this scale.",
    "Use it on a dominant that does not resolve down a fifth: the II7 of Take the A Train, the tritone substitute, the IV7 of a blues.",
    "The band plays a 7#11 under you. Hold the #11 against it and hear that it floats where the plain 4th would grind.",
  ],
  "scale-altered": [
    "A dominant keeps its root, 3rd and flat 7th, and everything else is bent: b9, #9, b5, b13. There is no plain 5th, 9th or 13th left.",
    "It is melodic minor from a half step above the root. If you know melodic minor you already know this scale. Only the starting note is new.",
    "Every altered note is a half step from a note of the chord the V resolves to. That is the point of it: the most tension possible, then release by the shortest move.",
    "Use it on a V that resolves down a fifth, to a major chord or a minor one. It does not suit a dominant that stays put.",
    "The band plays a 7alt under you. The scale makes no sense alone, so listen to each note against the root in the bass.",
  ],
  "scale-diminished": [
    "Half step, whole step, half step, whole step, all the way up. Eight notes, and the pattern repeats every minor 3rd.",
    "Over a dominant it gives the b9, #9, #11 and the natural 13th, and it keeps the plain 5th. The natural 13th is how to tell it from the altered scale, which has a b13.",
    "Because it repeats every minor 3rd there are only three of these scales. Whatever you learn over one dominant also fits the dominants a minor 3rd, a tritone and a major 6th away.",
    "Eight notes fill a bar of eighths, so as with the bebop scale the root comes round on the downbeat. Every note on a beat is a note of the diminished seventh chord on the root.",
    "It is the scale for a 7b9 heading to a major chord, and for a diminished seventh chord if you start it with the whole step.",
  ],
  "guide-tones": [
    "The 3rd and 7th of each chord are its guide tones. They define the chord's quality, and they move the least from one chord to the next.",
    "This line holds one guide tone per chord, always the nearer one, so it moves by a half step or not at all.",
    "Sing it before you play it. If you can sing a guide tone line through a tune, you know the changes.",
    "Good solo lines pass through these notes at the changes. The rest of this unit hangs decoration on them.",
  ],
  enclosures: [
    "An enclosure surrounds a target: the scale step above, the half step below, then the target itself.",
    "The target lands on the chord change. The two notes before it arrive as a quick triplet at the end of the bar.",
    "Enclosures make a line sound deliberate. The ear hears the notes around the target and knows where the line is going before it gets there.",
    "Keep the target on a guide tone. Decoration is only as good as the note it points at.",
  ],
  "bebop-lines": [
    "Scale runs in swung eighths join the guide tones through a cycle of dominants, each resolving down a fifth into the next.",
    "The run is aimed. It turns round rather than overshooting, so the guide tone still lands on the change.",
    "The scale changes when the chord does. Hear the one note that moves between each dominant's scale and the next.",
    "Swing the eighths: long then short, the second of each pair on the last third of the beat.",
  ],
  "altered-lines": [
    "Bar one goes up the ii from its 3rd to its 9th, then back down the scale to its 5th. Bar two starts a whole step above that, on the 3rd of the V.",
    "Bar two is the altered scale straight down for an octave, from the 3rd of the V to the 3rd of the V. On the way it passes the #9, b9, root, flat 7th, b13 and b5.",
    "The line ends on the 3rd of the V, which is a half step under the root of the I, and resolves up into it. A whole bar of tension lets go by the smallest move there is.",
    "The left hand holds the rootless altered voicing: the 3rd, b13, flat 7th and b9, in one order or the other. Play it alone against the bass and then add the line.",
    "Once it is under the fingers, change where it lands: stop the run one note early and resolve down a half step to the 5th of the I.",
  ],
  "improv-ii-v-i": [
    "The band loops the ii-V-I and you are scored on chord tones landing on the beats. Everything between the beats is yours.",
    "Start with one note a bar, a guide tone. Then two. Only add notes once the ones you have land.",
    "Leave space. Play a phrase, then rest for as long as the phrase lasted. The silence is where the listener hears what you played.",
    "Borrow from the last unit: aim for the 3rd of each chord on beat one, and enclose it when you are ready.",
  ],
  "improv-so-what": [
    "Sixteen bars on one minor seventh chord, eight bars a half step higher, eight bars back. Dorian on each root is all you need.",
    "With no chord changes to chase, rhythm and space are the whole solo. Play a short idea, leave a bar empty, answer it.",
    "When the harmony moves up a half step, move your idea up a half step too. The listener hears the form through you.",
    "Lean on the 6th and the 9th. They are the colours that make dorian sound like this record and not like a minor scale exercise.",
  ],
  "improv-f-blues": [
    "The band plays bass, guitar and drums. The piano is all yours, and nothing you play from the scale is wrong.",
    "Start with the blues scale on the tonic for all twelve bars. It works over every chord. That is its gift.",
    "Then add the 3rd of each chord as it arrives. The major 3rd against the scale's flat 3rd is the blues.",
    "Call and response: a short riff, a rest, then an answer that changes one thing about it.",
    "Know where you are in the form. A phrase that starts at bar one or bar five sounds like it means it.",
  ],
  "improv-jazz-blues": [
    "The same twelve bars with the changes a bebop player adds: a ii-V into the IV in bar four, a diminished chord in bar six, and a turnaround at the end.",
    "The blues scale still works, but the new chords want their own notes. Aim for the 3rd of each new chord as it arrives.",
    "The diminished chord in bar six sits a half step above the IV. Every one of its notes is a half step or less from a note of the I7 that follows.",
    "Mix the two languages: bluesy riffs through bars one to four, then a line that follows the changes from bar eight.",
  ],
  "improv-autumn": [
    "Two keys to hear: the relative major for its ii-V-I, and the minor home for its ii-V-i.",
    "The minor key and its relative major share their notes, apart from the leading tone the minor V7 borrows. That is why this tune is a first standard for so many players.",
    "Play one chorus of nothing but 3rds and 7ths before you add anything else.",
    "Thirty-two bars is a long form. Plan phrases in four-bar blocks, one cadence each.",
  ],
  "improv-blue-bossa": [
    "Sixteen bars in three places: the minor home for eight, a major key a half step above it for four, and home again.",
    "Over the i, play dorian. When the iv arrives one note changes: the 6th of the key drops a half step and becomes the iv's 3rd. The V7b9 then asks for its own 3rd, the leading tone.",
    "Bars nine to twelve are a ii-V-I a half step up. Nothing carries over from the home key, so have the new scale under your hand a bar early.",
    "Play the same short idea in bar one and in bar nine, moved up a half step. The listener hears the key change through you.",
  ],
  "improv-tune-up": [
    "Three ii-V-Is, each a whole step below the last. Each I chord turns minor and becomes the next ii.",
    "Make one four-bar phrase and play it three times, a whole step lower each time. It is a sequence, and sequences are what make a solo sound composed.",
    "In bars thirteen and fourteen the ii of the home key goes to a dominant a half step above it, which falls a fifth into the bVI. Aim for the 3rd of that dominant.",
    "Start every phrase on the 3rd of the ii until you can do it without thinking. Then start on the 7th.",
  ],
  "ear-quality": [
    "Listen for the 3rd first: major or minor. Then the 7th: major, flat, or a 6th instead. That narrows it to one chord.",
    "maj7 is bright and still, m7 soft, 7 restless, m7b5 dark and unresolved, dim7 all tension, and the 6 chords sweet and settled.",
    "Sing the lowest note, then the highest. Hearing the outside of a voicing comes before hearing inside it.",
  ],
  "ear-cadence": [
    "Three cadences in one key. The major ii-V-I resolves bright, the minor one resolves dark, and the tritone one resolves with the bass sliding down by half steps.",
    "Listen to the bass first. Down a fifth twice is a ii-V-I. Down a half step twice is the tritone substitute.",
    "Listen to the last chord last. Whether home is major or minor decides between the other two.",
  ],
  "walking-bass": [
    "The band's bass and guitar sit out. The drummer keeps time, and the bass line is in your left hand, one note on every beat.",
    "Beat one of each chord is its root. The beats after it are chord tones, the 3rd and the 5th. The last beat before a change is an approach note, a half step above or below the next root, or that chord's 5th.",
    "The right hand holds the rootless voicing for the whole chord. It sits higher than you are used to, above the bass line, around middle C.",
    "Quarter notes are not swung. Play four even beats, each held for its full length, and lean a little on two and four.",
    "Practise the left hand alone until you do not have to think about it. It is the part that cannot stop.",
  ],
  "walking-turnaround": [
    "With two chords in a bar each one gets two beats: its root, then one approach note into the next root.",
    "Most approach notes are outside the key. That is correct. A note a half step from its target sounds right whatever the key signature says.",
    "The right hand plays the Charleston, on one and on the and of two, against four even beats in the left. The and of two falls between two bass notes. Do not let it pull the bass early.",
    "Say the roots aloud as the left hand reaches them: I, vi, ii, V. If you lose the form, the roots on beats one and three will find it for you.",
  ],
  "blues-walk": [
    "Two parts, one player: the riff in the right hand and a walking line in the left.",
    "The riff repeats while the line underneath keeps changing. Let the left hand lead and hang the riff on it.",
    "Where the chord lasts two bars the line keeps moving through chord tones. Only the first beat of a new chord has to be its root.",
    "The band's bass and guitar are out. If the form falls apart, stop the riff and keep the left hand going until you find bar one again.",
    "Start well under tempo. A walking line only works when it is steady.",
  ],
  "saints-walk": [
    "You know this tune, and that is why it is here. The right hand can run on memory while you attend to the left.",
    "The tune starts with three notes alone. The bass line comes in on bar one, on the root.",
    "The first six bars sit on one chord. The line moves between its root, 3rd and 5th. It does not need to go anywhere, only to keep walking.",
    "When the harmony does move, listen for the last beat before each change: a half step into the new root, or its 5th.",
  ],
  "bb-blues-walk": [
    "No tune this time. The left hand walks and the right hand comps, so you are the whole rhythm section.",
    "The right hand plays the Charleston, short and light. The bass line carries the time and the chords only mark it.",
    "Between the I7 and the IV7 the right hand's voicing moves by a half step or not at all, while the left hand travels. Keep the right hand still and let the left hand move.",
    "This is what a pianist plays behind a horn player when there is no bassist. Hum a blues head over it to hear it work.",
  ],
  "autumn-walk": [
    "Thirty-two bars, one chord a bar for most of it, so the line has four beats on each: root, 3rd, 5th, approach.",
    "The chords fall by fifths, so the approach notes often come from a half step above. Hear the bass lean into each new root.",
    "The right hand holds each voicing for its full length. Hear the 7th of each chord fall to the 3rd of the next while the bass moves underneath.",
    "In the last eight some bars have two chords. There the line shrinks to a root and an approach for each, as it did in the turnaround.",
    "Play the form twice without stopping. Solo piano is mostly a matter of keeping the line going.",
  ],

  // Level 6

  "quartal-forms": [
    "Stack fourths instead of thirds and the chord stops sounding like a triad with extras. It sounds open and modern.",
    "The m7 shape is two fourths stacked from the 11th: 11, flat 7, flat 3. It is the middle of the 'So What' voicing, whose five notes take two hands.",
    "On a dominant the shape is a tritone, 7th to 3rd, with a fourth on top: the 13th. On maj7 it is 3, 13, 9, all fourths, with no root and no 7th.",
    "Three notes, not four. A fourth voice would stretch the hand past a ninth, and the left hand has to be able to move these quickly.",
    "Quartal voicings are ambiguous on purpose. The bass decides what they mean, so one shape can serve more than one chord.",
  ],
  "so-what": [
    "Two chords in thirty-two bars: the i for sixteen, a half step up for eight, back for eight. AABA, where B is the same thing moved up.",
    "The voicing is two fourths stacked from the 11th. Moving the whole shape up a half step is the entire bridge.",
    "With one chord for sixteen bars, comping is all rhythm. Vary where the second hit of the Charleston falls, and leave whole bars empty.",
    "Count the form in eights. With no changes to mark the sections, the count is the only map you have.",
  ],
  "iii-vi-ii-v": [
    "Two ii-Vs in a row. The iii and VI7 are a ii-V into the ii, which starts the second ii-V into the V.",
    "The VI7 takes a b9 because it is heading for a minor chord. The V takes a b13 for colour on the way back to the top.",
    "This is bars seven and eight of every rhythm changes A section, and the end of countless other tunes.",
    "Quartal shapes with the Charleston: keep the top voice moving by step and let the bass do the work.",
  ],
  "rhythm-changes": [
    "Thirty-two bars, AABA. The A sections are I-VI-ii-V turnarounds with a trip to the IV in bars five and six. The bridge is four dominants, two bars each, falling by fifths.",
    "Bar six goes from the IV to the minor iv. The flat 6th of the key inside the minor iv falls a half step back towards home.",
    "At this tempo think in two-bar shapes, not single chords. An A section is I-VI-ii-V said four times with one detour.",
    "Keep the left hand light and short. At two hundred and up, held chords drag the band.",
  ],
  "improv-rhythm-changes": [
    "Over the A sections many players play the key rather than every chord, and aim for the root or 3rd at the bar lines. Start there.",
    "Over the bridge a guide tone line falls by half steps, one note per dominant: 3rd, 7th, 3rd, 7th, two bars each.",
    "Use short rhythmic motifs and repeat them. At fast tempos a clear rhythm carries further than a long line.",
    "Breathe at the end of each eight. The form is four clear sections, so let your solo show them.",
  ],
  "uptempo-blues": [
    "At this speed the blues is felt in four-bar phrases, not bars. Know where the IV and the turnaround fall without counting.",
    "Voice-lead so the hand barely moves. At this tempo any leap costs you the next chord.",
    "Relax. Tension in the forearm is what caps your tempo. Play lighter, not harder.",
    "Raise the tempo about ten beats a minute at a time, and only once the last tempo feels easy.",
  ],

  // Etudes

  "etude-keyboard": [
    "Every note is a step of the major scale you have just learned, and nearly every move is to the note next door.",
    "The right hand plays alone. The band has the chords: I, vi, ii, V, the four that most of this course is built from.",
    "Bars one to four rise and fall twice. Bars five to eight start a 3rd higher and then walk home. A tune is a shape repeated and changed.",
    "The drop to the 7th at the end of bar seven leads a half step up into home. That half step is the strongest pull in the scale.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-chords": [
    "Each bar is one seventh chord, a note a beat: root, 3rd, 5th, 7th going up, or the same four coming down.",
    "The chords are Imaj7, vi m7, ii m7 and V7, so three of the four qualities from the last drill are here, each doing its job in a key.",
    "Listen to the bass under your arpeggio. It plays the root on beat one, and your notes are the same chord an octave or two higher.",
    "In bar five the arpeggio starts on the 3rd, not the root. Any chord tone can start a line, and the 3rd is the one that tells major from minor.",
  ],
  "etude-shells": [
    "The left hand is shells throughout: maj7, 7, m7 and m7b5 all appear, so every shape from the drill is used.",
    "The tune leans on 3rds and 7ths, the same two notes the shell holds. When your right hand doubles a left-hand note an octave up, that is a guide tone.",
    "Bar five is a m7b5 and a dominant: a minor ii-V, borrowed for one bar to point at the ii chord. You meet it properly in level four.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-cadence": [
    "Three ii-V-Is: at home, into the IV, and home again. The second is the first moved up a fourth, tune and all.",
    "The ii of the new key is a minor chord on the V of the old one. One root, two jobs.",
    "In bar twelve a VI7 replaces the vi. Its 3rd is the one note from outside the key, and it pulls up a half step into the ii.",
    "The 7th of each chord falls a half step to the 3rd of the next in the left hand. Find those pairs.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-first-tunes": [
    "Every note of the tune is from the blues scale of the key: root, flat 3rd, 4th, flat 5th, 5th, flat 7th. Nothing else.",
    "The form is AAB, the oldest in the blues: a four-bar statement, the statement again over the IV, then an answer. Bars five and six are note for note bars one and two, and the chord change is what makes them sound new.",
    "The flat 5th only ever passes between the 4th and the 5th. It is a colour on the way somewhere, never a place to stop.",
    "The last two beats are a pickup into the next chorus. Loop it, and then go and improvise with the same six notes.",
  ],
  "etude-accompaniment": [
    "Every melody note is the root, 3rd, 5th or 7th of its chord, so the right hand can fill the whole chord in under every one of them.",
    "The note on top chooses the inversion. The last note of bar one is held into bar two over a new chord: the notes under it change, and it becomes a different degree.",
    "The left hand has only the root. Between your two hands and the bass the chord is complete, which is how a pianist accompanies a singer.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-rootless": [
    "The left hand never plays a root. Listen for the bass landing on it at the top of each bar, under your 3-5-7-9 or 7-9-3-5.",
    "The tune opens on the 9th of the ii and begins the next bar on the 9th of the V. The 9th is the note these voicings add, and it is what makes them sound modern.",
    "Bars five to seven are the same ii-V-I a minor third higher, in a key the piece never settles in. Standards do this constantly.",
    "From ii to V only one or two notes of the voicing move, each by a step. If your whole hand jumped, look for the other form.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-comping": [
    "The tune is long notes on purpose. All the motion is in the left hand: on one, and on the and of two.",
    "The horns play the same Charleston figure in bar eight. Comping is a horn section's job done by one hand.",
    "Keep the second hit late. It sits on the last third of the beat, with the ride cymbal's skip note.",
    "With two chords a bar the left hand plays three times: on one, on the and of two, and the new chord on three.",
  ],
  "etude-changes": [
    "III7, VI7, II7, V7, I: four dominants, each the V of the next, falling by fifths until they reach home.",
    "Bars two and three land on the 3rd of the chord, the note from outside the key. It is what tells the ear the chord has changed.",
    "Bars four and five land on the flat 7th, which is the 3rd of the chord before fallen a half step. That falling line is the thread through any cycle of dominants.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-minor": [
    "ii, V, i in minor: half diminished, a dominant with a flat 9th, and a minor 6th chord to come home to.",
    "The tune holds one note from the ii into the V. Over the ii it is the flat 5th, over the V it is the flat 9th, and from there it falls a half step.",
    "Home is a m6, and bar four puts the major 6th in the tune. It is the brightest note in the piece, and the reason a minor tonic does not have to sound heavy.",
    "The last bar's V has the major 7th of the key in the tune, the leading note. Minor keys borrow it so that the V is a real dominant.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-colour": [
    "The V is replaced by the dominant a tritone away, so the bass walks ii, flat II, I by half steps.",
    "Over the substitute the tune holds its #11, which is the root of the V it replaced, and then its 3rd, which is that V's flat 7th. The two chords share their tritone, and the tune sits on it.",
    "The voicing is drop 2 with the tune as its top voice. The right hand holds three notes and the left hand takes the dropped one, an octave down.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-ballads": [
    "Three beats to the bar. Count one, two, three with the weight on one, and let two and three be lighter.",
    "The left hand plays once a bar, on one, and holds for all three beats. In a waltz the downbeat is where the harmony speaks.",
    "The tune moves in three shapes: a long note and a short one, one note for the whole bar, or three even beats. Feel where each bar puts its weight before you play it.",
    "Bar six is a V with a b9 pulling to the ii, and the tune plays its 3rd and its b9. In bar twelve the IV turns minor, and the tune holds its flat 3rd for the whole bar.",
    "The ride cymbal is on every beat and the hi-hat is on two. Lock the second beat of each bar to the hi-hat and the waltz will swing.",
  ],
  "etude-lines": [
    "Until the last two bars, beats one and three are the 3rd or the 7th of the chord. Those are the written notes, and everything between them is a run along the chord's scale to the next one.",
    "A run never arrives early. If it would reach the target before the beat, it goes one step past and comes back, which is how a bebop line circles a note.",
    "Take the eighths away and a half-note line of guide tones is left. The solo is the half notes. The eighths are how you travel.",
    "Over the VI7 the run uses that chord's scale, with its major 3rd. One note changes, and the line says the chord without any help.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-improv": [
    "This is a solo written down, to be learned and then thrown away. Bar one is a motif: 3rd, 5th, flat 7th.",
    "Bar two answers it on the IV. Bar three repeats it with one note added. Bar four stops and breathes. Repeat, change, breathe: that is most of what makes a solo sound intended.",
    "Bars five to eight move the motif onto the IV and back, then a VI7 sets up the ii-V. Its 3rd is on the downbeat so you hear the change.",
    "Nearly every note on a beat is a chord tone. The Improvise exercises score exactly that.",
    "Learn it, then open an Improvise exercise and keep the rhythm while you change the notes.",
  ],
  "etude-ears": [
    "The tune falls by half steps, a bar a note, and each step changes the chord's quality. Major 7th to flat 7th turns the I into a dominant. Major 3rd to minor 3rd turns the IV minor.",
    "Sing the line while you play the left hand. It is the fastest way to learn what a quality sounds like, because only one note is doing the work.",
    "This falling line is inside a great many standards. Once you can hear it here you will start hearing it on records.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
  "etude-solo": [
    "There is no bass player and no guitar. The drummer keeps time and everything with a pitch comes from you.",
    "The left hand plays a note on every beat: the root when a chord arrives, chord tones after it, and on the last beat of the chord a note a half step from the next root, or that chord's 5th.",
    "The tune is written in long notes on purpose. Two busy hands are too much at first, so the right hand sings while the left hand walks.",
    "Bars thirteen and fourteen have two chords each. Each gets only a root and one note that leads onwards.",
    "Learn the left hand alone first, until it runs without attention. Then add the tune. A walking line that hesitates is worse than a simple one that does not.",
  ],
  "etude-advanced": [
    "Four bars of a rhythm changes A section, two chords a bar, then its bridge at half length: III7, VI7, II7, V7, a bar each.",
    "In the first four bars the tune is two chord tones per chord. At this tempo that is all there is time for, and it is enough to spell every change.",
    "The bridge lands on the 3rd of each dominant and leaves by its flat 7th, the same thread as any cycle, only faster.",
    "The left hand is quartal. Stacked fourths are ambiguous on their own, so the bass and your tune are what say which chord it is.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
};

/**
 * A point as a headline and the rest. The headline is the opening sentence,
 * or the first two when the opener is too short to stand alone ("Then the 7th.").
 */
export function splitTip(point: string): { head: string; rest: string } {
  const ends = [...point.matchAll(/[.?!](?=\s)/g)].map((m) => m.index + 1);
  const cut = ends.find((end) => point.slice(0, end).split(" ").length >= 5) ?? point.length;
  return { head: point.slice(0, cut), rest: point.slice(cut).trim() };
}
