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
    "A shell is the root plus the 3rd and 7th. The root says which chord, the 3rd says major or minor, the 7th says maj7 or dominant. The 5th adds nothing, so it goes.",
    "Two shapes: root-3-7 and root-7-3. In a progression you pick whichever keeps the hand closest to the last chord, and that choice is the whole skill.",
    "Keep shells low. Three notes stay clear down there, where four would turn to mud.",
    "A m7b5 shell looks just like a m7 shell. The flat 5th that tells them apart is left to the bass or the right hand.",
    "Say the degrees as you play them: root, 3, 7. You are learning names for shapes, not just shapes.",
  ],
  "ii-v-i-shells": [
    "The ii sets up, the V builds tension, the I resolves it. Most standards are made of this cadence, in one key after another.",
    "The smoothest path alternates shapes: ii as root-3-7, V as root-7-3, I as root-3-7. Then the 7th of each chord falls a half step to the 3rd of the next, and the other guide tone does not move at all.",
    "Listen to the bass. It walks a note a beat and lands on the root at the top of each bar, and your chord lands with it.",
    "Say the numerals as you play. Across twelve keys the letter names change, but ii, V and I do not.",
    "The I lasts two bars. That is where a soloist finishes a phrase, so let the chord sit still.",
  ],
  "the-vamp": [
    "The left hand is the ii-V-I in shells you have just learned. It never changes.",
    "The right hand plays one note at a time, every one a chord tone or the 9th, moving mostly by step.",
    "Two hits a bar: one on the beat, one on the and of two, a swung eighth late, and let it ring. That late second hit is where the swing comes from.",
    "Over the I the tune touches the 9th. The 9th is what makes the resolution sound like jazz rather than a hymn.",
    "Loop it until it stops needing your attention. Everything after this takes one part of it further.",
  ],
  "f-blues": [
    "Twelve bars in three lines of four. I7 with a IV7 in bar two, then IV7 for two bars, I7 for two, and V7, IV7, I7, V7 to go round again.",
    "Every chord is a dominant seventh, the I included. In the blues the flat 7th is not tension waiting to resolve. It is home.",
    "The riff slides from the 3rd down to the flat 3rd, the blue note, and lands on the root. Over the IV it is the same shape a fourth higher.",
    "From I7 to IV7 in shells, the 3rd falls a half step to become the 7th and the 7th falls a half step to become the 3rd. Two fingers slide and the chord has changed.",
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
    "Keep the lowest note no lower than about the D below middle C. Any lower and the 3rd turns to mud.",
    "Alone, a rootless voicing can sound unfinished. Play the root with the right hand now and then to hear the chord it implies.",
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
    "Sixteen bars in two halves. Each sits on the I, then walks VI7, II7, V7 back home.",
    "The VI7 and II7 are not in the key. Each is the V of the chord after it, so the harmony keeps falling by fifths.",
    "The 3rd of each dominant becomes the 7th of the next, a half step lower. Follow that single line through your left hand.",
    "Near the end the II7 and V7 share a bar, two beats each. Know both shapes before you arrive.",
  ],
  "indiana-changes": [
    "Thirty-two bars in four groups of eight. The first and third are the same, so learn one and you have half the tune.",
    "Almost every chord is a dominant resolving down a fifth: VI7 to II7 to V7 to I.",
    "Bars thirteen to sixteen put a minor ii in front of two of those dominants: iii-VI7-ii-V7. Hear how the minor chord softens the approach.",
    "Comp with the Charleston and let the bass carry the harmony. You do not have to play every change on beat one.",
  ],

  // Level 4

  "minor-ii-v-i": [
    "The minor cadence: half-diminished ii, dominant with a flat 9, minor tonic.",
    "The ii is half diminished because its 5th is the flat 6th of the minor key. The V takes a flat 9 for the same reason: it is the same note.",
    "The tonic here is m6. The major 6th keeps a minor chord settled without sounding heavy.",
    "In a rootless half-diminished voicing the 9th is replaced by the 11th, because a flat 9 would grind against the root in the bass.",
    "Practise it straight after the major ii-V-I in the same key. The two differ by a handful of notes, and the ear learns them fastest side by side.",
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
  "drop2-forms": [
    "Take a four-note chord in close position and drop the second voice from the top down an octave. That is drop 2.",
    "Every chord has four drop 2 shapes, one per inversion, so each chord tone takes a turn in the top voice.",
    "The spread sounds fuller than close position without getting muddy. Guitarists and big band arrangers live on these shapes.",
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
  "autumn-changes": [
    "Two keys a minor third apart: the minor home and its relative major. The tune moves between a major ii-V-I into the relative major and a minor ii-V-i into home.",
    "Bars one to four are a ii-V-I in the relative major, then its IV. Bars five to eight are the minor ii-V-i. The whole tune is those two cadences, rearranged.",
    "The numerals are counted from the minor tonic, so the major cadence reads iv, bVII7, bIII. Read the chord panel for which key each bar is in.",
    "Drop 2 voicings with anticipations: every change lands on the and of four of the bar before.",
  ],

  // Level 5

  "scale-dorian": [
    "Dorian is the major scale started on its second note. Over a ii chord you are playing the notes of the key you are already in.",
    "Compared with the natural minor scale it has a raised 6th. That major 6th is its bright colour.",
    "The chord tones are root, flat 3rd, 5th and flat 7th. Treat them as landing points and the rest as steps between them.",
    "Sing the 6th when you reach it. It is the note that sets dorian apart from other minor sounds.",
  ],
  "scale-mixolydian": [
    "Mixolydian is the major scale started on its fifth note: a major scale with a flat 7th. It fits a dominant seventh.",
    "Handle the 4th with care over a dominant. It rubs against the 3rd, so pass through it rather than landing on it.",
    "Dorian over the ii and mixolydian over the V are the same seven notes. Over a ii-V you change which notes you aim at, not the scale.",
    "Put the 3rd and flat 7th on the beats. They are what tell the listener the chord is a dominant.",
  ],
  "scale-blues": [
    "Root, flat 3rd, 4th, flat 5th, 5th, flat 7th. Six notes that sit over every chord of a blues.",
    "The flat 5th is the blue note. Use it as a passing tone between the 4th and 5th, not a note to stop on.",
    "The flat 3rd against a chord with a major 3rd is the blues. The clash is the sound. Try crushing the flat 3rd into the 3rd as a grace note.",
    "The scale is a quarry, not a line. Cut short riffs of three or four notes from it and repeat them.",
  ],
  "scale-bebop": [
    "Mixolydian with one extra passing note, the natural 7th, between the flat 7th and the root. Eight notes instead of seven.",
    "Start on the root on a beat and run down in eighths, and the chord tones stay on the beats all the way. That is why bebop lines sound grounded at speed.",
    "Practise it descending first. Bebop lines mostly run downwards from a chord tone.",
    "The added note only passes. Never hold the natural 7th against a dominant chord.",
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

  // Level 6

  "quartal-forms": [
    "Stack fourths instead of thirds and the chord stops sounding like a triad with extras. It sounds open and modern.",
    "The m7 shape is the top four notes of the 'So What' voicing: fourths stacked from the 11th, with a major third on top.",
    "On a dominant the shape starts with a tritone, 7th to 3rd, and stacks fourths above it. On maj7 all four notes are a fourth apart: 3, 13, 9, 5, with no root and no 7th.",
    "Quartal voicings are ambiguous on purpose. The bass decides what they mean, so one shape can serve more than one chord.",
  ],
  "so-what": [
    "Two chords in thirty-two bars: the i for sixteen, a half step up for eight, back for eight. AABA, where B is the same thing moved up.",
    "The voicing is fourths stacked from the 11th with a major third on top. Moving the whole shape up a half step is the entire bridge.",
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
    "The left hand is drop 2 and arrives an eighth early. Let the anticipation ring over the bar line.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
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
  "etude-advanced": [
    "Four bars of a rhythm changes A section, two chords a bar, then its bridge at half length: III7, VI7, II7, V7, a bar each.",
    "In the first four bars the tune is two chord tones per chord. At this tempo that is all there is time for, and it is enough to spell every change.",
    "The bridge lands on the 3rd of each dominant and leaves by its flat 7th, the same thread as any cycle, only faster.",
    "The left hand is quartal. Stacked fourths are ambiguous on their own, so the bass and your tune are what say which chord it is.",
    "The vibraphone has the first four bars and the horns answer in the next four. A snare fill marks each hand-over, so you can hear where you are in the form without counting.",
  ],
};
