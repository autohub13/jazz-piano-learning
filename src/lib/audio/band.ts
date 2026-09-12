// A synthesized rhythm section: upright bass and a brushed kit.
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
import { midiToFreq, type Midi } from "@/lib/music/notes";

/** Where the offbeat sits inside the beat. Two thirds is a triplet swing. */
const SWING = 2 / 3;

export interface ScheduleOptions {
  /** Absolute AudioContext time of beat zero of the loop. */
  t0: number;
  bpm: number;
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

export function createBand(ctx: AudioContext, chart: BandChart): Band {
  const master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);

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
    opts: { level: number; decay: number; type: BiquadFilterType; freq: number; q?: number },
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

    src.connect(filter).connect(gain).connect(master);
    src.start(t);
    src.stop(t + opts.decay + 0.02);
    track({ gain, sources: [src] });
  }

  /** Ride cymbal. A wash of noise with a little metallic ping on top. */
  function ride(t: number, level: number, decay: number) {
    hit(t, { level, decay, type: "bandpass", freq: 7200, q: 0.7 });

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 3180;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(level * 0.22, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(decay, 0.22));
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + decay + 0.02);
    track({ gain, sources: [osc] });
  }

  /** The hi-hat chick on two and four, closed with the foot. */
  function hat(t: number) {
    hit(t, { level: 0.055, decay: 0.07, type: "highpass", freq: 8000 });
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
   * the pluck, and a short noise transient for the finger on the string.
   */
  function bass(t: number, note: Midi, dur: number) {
    const freq = midiToFreq(note);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(freq * 7, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 2, 110), t + 0.16);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.42, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    filter.connect(gain).connect(master);

    const sources: AudioScheduledSourceNode[] = [];
    for (const [type, detune, level] of [
      ["triangle", 0, 1],
      ["sine", -1200, 0.8],
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

  return {
    schedule({ t0, bpm }) {
      const spb = 60 / bpm;
      const now = ctx.currentTime;

      for (let i = 0; i < chart.bass.length; i++) {
        const t = t0 + (chart.startBeat + i) * spb;
        // A beat that has already gone by is not worth catching up on, and
        // scheduling into the past would fire it immediately, out of time.
        if (t < now - 0.005) continue;

        const posInBar = i % chart.beatsPerBar;
        const downbeat = posInBar === 0;
        // Two and four, where the swung note and the hi-hat live.
        const backbeat = posInBar === 1 || posInBar === 3;

        const note = chart.bass[i];
        if (note !== null) bass(t, note, spb * 0.92);

        ride(t, downbeat ? 0.1 : 0.075, downbeat ? 0.5 : 0.4);
        if (backbeat) {
          ride(t + SWING * spb, 0.05, 0.26);
          hat(t);
        }
        if (downbeat) kick(t);
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
