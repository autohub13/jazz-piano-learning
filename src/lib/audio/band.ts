// A synthesized band: upright bass, rhythm guitar and a brushed kit, with a
// vibraphone and a horn section on the charts that have them.
//
// Synthesized rather than sampled on purpose. It costs nothing to download, it
// is available the instant the AudioContext exists, and it still works when the
// piano itself has fallen back to its synth because the sample CDN was slow.
// That matters here: the band is the first thing a visitor hears, so it can
// never be the thing that is still loading.
//
// Every hit is scheduled on absolute AudioContext time against the same t0 as
// the piano, which is what keeps the band locked to the keys lighting up. There
// are no timers in this file.

import type { BandChart } from "@/lib/lessons/types";
import { playedBeat, swingAnd } from "@/lib/lessons/timeline";
import { midiToFreq, type Midi } from "@/lib/music/notes";

export interface ScheduleOptions {
  /** Absolute AudioContext time of beat zero of the loop. */
  t0: number;
  bpm: number;
  /** Absolute AudioContext time to stop at. No beat on or after it is played. */
  until?: number;
}

export interface Band {
  /** Lay down one pass. Beats already in the past are skipped. */
  schedule(opts: ScheduleOptions): void;
  /** Silence and cancel everything already scheduled. */
  stop(): void;
  dispose(): void;
}

interface Voice {
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
}

export function createBand(ctx: AudioContext, chart: BandChart, destination: AudioNode): Band {
  const master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(destination);

  // Where the players stand. Bass, kick and snare stay in the middle with the
  // piano; the guitar, the horns and the crash are to the left, the ride, the
  // hi-hat and the vibes to the right.
  const place = (pan: number) => {
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(master);
    return panner;
  };
  const left = place(-0.35);
  const right = place(0.35);

  // One noise buffer, reused by every cymbal and brush hit.
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  let active: Voice[] = [];

  function track(voice: Voice) {
    active.push(voice);
    const last = voice.sources[voice.sources.length - 1];
    last.onended = () => {
      active = active.filter((v) => v !== voice);
      voice.gain.disconnect();
    };
  }

  /** Filtered noise burst. The whole kit is built from this. */
  function hit(
    t: number,
    opts: { level: number; decay: number; type: BiquadFilterType; freq: number; q?: number; out?: AudioNode },
  ) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = opts.type;
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q ?? 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.level, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.decay);

    src.connect(filter).connect(gain).connect(opts.out ?? master);
    src.start(t);
    src.stop(t + opts.decay + 0.02);
    track({ gain, sources: [src] });
  }

  /** Ride cymbal. A wash of noise with a little metallic ping on top. */
  function ride(t: number, level: number, decay: number) {
    hit(t, { level, decay, type: "bandpass", freq: 7200, q: 0.7, out: right });

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 3180;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level * 0.22, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(decay, 0.22));
    osc.connect(gain).connect(right);
    osc.start(t);
    osc.stop(t + decay + 0.02);
    track({ gain, sources: [osc] });
  }

  /** The hi-hat chick on two and four, closed with the foot. */
  function hat(t: number) {
    hit(t, { level: 0.055, decay: 0.07, type: "highpass", freq: 8000, out: right });
  }

  /** Feathered kick: felt more than heard, on the downbeat only. */
  function kick(t: number) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(115, t);
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.075, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);

    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.3);
    track({ gain, sources: [osc] });
  }

  /**
   * Upright bass. Mostly fundamental, a lowpass that opens on the attack for
   * the pluck, and a short noise transient for the finger on the string. The
   * octave above is mixed in because a laptop speaker has nothing below about
   * 150 Hz: without it the line is there on headphones and gone everywhere else.
   */
  function bass(t: number, note: Midi, dur: number) {
    const freq = midiToFreq(note);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(freq * 7, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 3, 220), t + 0.16);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.42, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    filter.connect(gain).connect(master);

    const sources: AudioScheduledSourceNode[] = [];
    for (const [type, detune, level] of [
      ["triangle", 0, 1],
      ["sine", -1200, 0.8],
      ["triangle", 1200, 0.4],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      sources.push(osc);
    }

    const pluck = ctx.createBufferSource();
    pluck.buffer = noise;
    pluck.loop = true;
    const pluckFilter = ctx.createBiquadFilter();
    pluckFilter.type = "bandpass";
    pluckFilter.frequency.value = 1400;
    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0.05, t);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    pluck.connect(pluckFilter).connect(pluckGain).connect(master);
    pluck.start(t);
    pluck.stop(t + 0.06);

    track({ gain, sources });
    track({ gain: pluckGain, sources: [pluck] });
  }

  /**
   * Rhythm guitar: a short, dull chunk on every beat. Kept quiet and brief so
   * it is felt as time and harmony without sitting on the learner's left hand.
   */
  function guitar(t: number, notes: readonly Midi[], level: number) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 1.5;
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(700, t + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    filter.connect(gain).connect(left);

    const sources: AudioScheduledSourceNode[] = [];
    notes.forEach((note, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = midiToFreq(note);
      // The pick crosses the strings: each one a few milliseconds later.
      osc.start(t + i * 0.006);
      osc.stop(t + 0.24);
      osc.connect(filter);
      sources.push(osc);
    });
    track({ gain, sources });
  }

  /** Snare, brushed: the body of the drum under a burst of wire. */
  function snare(t: number, level: number) {
    hit(t, { level, decay: 0.13, type: "bandpass", freq: 2600, q: 0.6 });
    hit(t, { level: level * 0.7, decay: 0.09, type: "bandpass", freq: 240, q: 2 });
  }

  /** Crash cymbal, for the top of the form. */
  function crash(t: number) {
    hit(t, { level: 0.11, decay: 1.6, type: "highpass", freq: 5200, out: left });
  }

  /**
   * Vibraphone: a sine with a quick bright partial two octaves up for the
   * mallet, ringing away under the slow tremolo of the motor.
   */
  function vibes(t: number, notes: readonly Midi[], dur: number) {
    const ring = Math.max(dur, 1.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.085, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + ring);

    const tremolo = ctx.createGain();
    tremolo.gain.value = 0.8;
    const motor = ctx.createOscillator();
    motor.frequency.value = 5;
    const depth = ctx.createGain();
    depth.gain.value = 0.2;
    motor.connect(depth).connect(tremolo.gain);
    gain.connect(tremolo).connect(right);

    const sources: AudioScheduledSourceNode[] = [motor];
    for (const note of notes) {
      for (const [ratio, level, decay] of [
        [1, 1, ring],
        [4, 0.3, 0.25],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = midiToFreq(note) * ratio;
        const g = ctx.createGain();
        g.gain.setValueAtTime(level, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        osc.connect(g).connect(gain);
        osc.start(t);
        osc.stop(t + ring + 0.05);
        sources.push(osc);
      }
    }
    motor.start(t);
    motor.stop(t + ring + 0.05);
    track({ gain, sources });
  }

  /**
   * Horn section: two detuned saws a note, behind a lowpass that opens as the
   * note swells, which is most of what makes a saw sound like brass.
   */
  function horns(t: number, notes: readonly Midi[], dur: number) {
    const attack = Math.min(0.07, dur / 3);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.linearRampToValueAtTime(1900, t + attack);
    filter.frequency.linearRampToValueAtTime(1200, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + attack);
    gain.gain.setValueAtTime(0.05, t + Math.max(attack, dur - 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    filter.connect(gain).connect(left);

    const sources: AudioScheduledSourceNode[] = [];
    for (const note of notes) {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = midiToFreq(note);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + dur + 0.05);
        sources.push(osc);
      }
    }
    track({ gain, sources });
  }

  return {
    schedule({ t0, bpm, until = Infinity }) {
      const spb = 60 / bpm;
      const now = ctx.currentTime;

      for (let i = 0; i < chart.bass.length; i++) {
        const t = t0 + (chart.startBeat + i) * spb;
        // A beat that has already gone by is not worth catching up on, and
        // scheduling into the past would fire it immediately, out of time.
        if (t < now - 0.005) continue;
        if (t >= until - 0.005) break;

        const posInBar = i % chart.beatsPerBar;
        const downbeat = posInBar === 0;
        // Two and four, where the swung note and the hi-hat live.
        const backbeat = posInBar === 1 || posInBar === 3;

        const note = chart.bass[i];
        if (note !== null) bass(t, note, spb * 0.92);

        const chord = chart.comp?.[i];
        if (chord) guitar(t, chord, backbeat ? 0.1 : 0.07);

        ride(t, downbeat ? 0.1 : 0.075, downbeat ? 0.5 : 0.4);
        if (backbeat) {
          ride(t + swingAnd(bpm) * spb, 0.05, 0.26);
          hat(t);
        }
        if (downbeat) kick(t);

        if (!chart.ensemble) continue;
        if (i === 0) crash(t);
        // A triplet on the snare into every fifth bar: the phrase turns over
        // and the vibes and the horns change places.
        const bar = Math.floor(i / chart.beatsPerBar);
        if (bar % 4 === 3 && posInBar === chart.beatsPerBar - 1) {
          [0.05, 0.07, 0.1].forEach((level, k) => snare(t + (k * spb) / 3, level));
        }
      }

      for (const [play, hits] of [
        [vibes, chart.ensemble?.vibes ?? []],
        [horns, chart.ensemble?.horns ?? []],
      ] as const) {
        for (const h of hits) {
          const t = t0 + playedBeat(chart.startBeat + h.beat, bpm) * spb;
          if (t < now - 0.005 || t >= until - 0.005) continue;
          play(t, h.notes, Math.min(h.beats * spb, until - t));
        }
      }
    },

    stop() {
      const now = ctx.currentTime;
      for (const voice of active) {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        for (const src of voice.sources) {
          try {
            src.stop(now + 0.06);
          } catch {
            // Already stopped. Nothing to do.
          }
        }
      }
      active = [];
    },

    dispose() {
      this.stop();
      master.disconnect();
    },
  };
}
