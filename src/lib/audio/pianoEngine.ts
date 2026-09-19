// The only module that imports smplr. Everything else talks to the PianoEngine
// interface, which is what lets a slow or unreachable sample CDN degrade into a
// synthesized fallback instead of a dead app.
//
// The AudioContext must be constructed inside a user gesture (browser autoplay
// policy), so creation is deferred until the Start button is pressed.

import { Reverb, SplendidGrandPiano } from "smplr";
import { midiToFreq, type Midi } from "@/lib/music/notes";

export type EngineStatus = "idle" | "loading" | "ready" | "fallback" | "error";

export interface StartOptions {
  note: Midi;
  /** Absolute AudioContext time. Omit to play immediately. */
  time?: number;
  /** Seconds. Omit for a note that rings until stop() releases it. */
  duration?: number;
  velocity?: number;
}

export interface PianoEngine {
  readonly ctx: AudioContext;
  readonly kind: "sampled" | "synth";
  /** Where anything that should share the piano's room connects: the band. */
  readonly output: AudioNode;
  start(opts: StartOptions): () => void;
  /** Release one note, or every sounding note when omitted. */
  stop(note?: Midi): void;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  now(): number;
  dispose(): void;
}

/** Samples stream from a CDN; past this we stop waiting and use the synth. */
const LOAD_TIMEOUT_MS = 10_000;

/**
 * The one bus the piano and the band both play into: straight through to the
 * speakers, plus a send to a small, dark room. Dry instruments are most of
 * what makes a web page sound like a web page. The send is cut below the
 * bass's range, because a bass line in a reverb is mud.
 */
function createOutputBus(ctx: AudioContext): AudioNode {
  const input = ctx.createGain();
  input.connect(ctx.destination);

  // Wet only, and it connects itself to ctx.destination.
  const reverb = Reverb(ctx);
  const lowCut = ctx.createBiquadFilter();
  lowCut.type = "highpass";
  lowCut.frequency.value = 220;
  const send = ctx.createGain();
  send.gain.value = 0.32;
  input.connect(lowCut).connect(send).connect(reverb.input);

  reverb
    .ready()
    .then(() => {
      const set = (name: Parameters<typeof reverb.getParam>[0], value: number) => {
        const param = reverb.getParam(name);
        if (param) param.value = value;
      };
      // In samples, not seconds.
      set("preDelay", Math.round(ctx.sampleRate * 0.018));
      set("decay", 0.55);
      // The default is close to undamped, which rings like a tin on the cymbals.
      set("damping", 0.35);
    })
    // The reverb runs in an AudioWorklet. Where that cannot load, the dry path
    // above is already connected and everything still plays, just without a room.
    .catch(() => {});

  return input;
}

/**
 * A plain-oscillator piano-ish voice used when samples are unavailable. Two
 * detuned triangles plus a sine sub, with a fast attack and a long exponential
 * decay, which is close enough in shape to be musically usable.
 */
function createFallbackSynth(ctx: AudioContext, output: AudioNode): PianoEngine {
  const master = ctx.createGain();
  master.gain.value = 0.25;
  master.connect(output);

  const sounding = new Map<Midi, (() => void)[]>();
  // Notes booked for the future. Kept apart from `sounding` so that lifting a
  // finger off one key cannot cancel a scheduled note of the same pitch, while
  // stop() with no argument can still clear the whole booking.
  let scheduled: (() => void)[] = [];

  const start = ({ note, time, duration, velocity = 90 }: StartOptions) => {
    const t = time ?? ctx.currentTime;
    const freq = midiToFreq(note);
    const level = (velocity / 127) * 0.5;

    const voice = ctx.createGain();
    voice.gain.setValueAtTime(0.0001, t);
    voice.gain.exponentialRampToValueAtTime(level, t + 0.006);
    // Higher notes decay faster, as on a real piano.
    const decay = Math.max(0.9, 5 - (note - 36) * 0.055);
    voice.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    voice.connect(master);

    const oscs: OscillatorNode[] = [];
    for (const [type, detune, gain] of [
      ["triangle", -4, 1],
      ["triangle", 4, 0.7],
      ["sine", 0, 0.35],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(voice);
      osc.start(t);
      oscs.push(osc);
    }

    let released = false;
    const release = (at?: number) => {
      if (released) return;
      released = true;
      const r = Math.max(at ?? ctx.currentTime, t);
      voice.gain.cancelScheduledValues(r);
      voice.gain.setValueAtTime(Math.max(voice.gain.value, 0.0001), r);
      voice.gain.exponentialRampToValueAtTime(0.0001, r + 0.12);
      for (const osc of oscs) osc.stop(r + 0.16);
      const list = sounding.get(note);
      if (list) {
        const i = list.indexOf(release);
        if (i >= 0) list.splice(i, 1);
      }
    };

    if (duration != null) {
      // Scheduled note: let the natural decay run for `duration`, then damp it.
      const off = t + duration;
      voice.gain.cancelScheduledValues(off);
      voice.gain.setValueAtTime(Math.max(level * 0.5, 0.0001), off);
      voice.gain.exponentialRampToValueAtTime(0.0001, off + 0.12);
      for (const osc of oscs) osc.stop(off + 0.16);
      // Still cancellable. Without this a scheduled pass keeps sounding
      // through a restart, a tempo change or a stop, because nothing holds a
      // handle on it.
      scheduled.push(release);
      oscs[0].onended = () => {
        const i = scheduled.indexOf(release);
        if (i >= 0) scheduled.splice(i, 1);
      };
    } else {
      const list = sounding.get(note) ?? [];
      list.push(release);
      sounding.set(note, list);
    }
    return () => release();
  };

  return {
    ctx,
    kind: "synth",
    output,
    start,
    stop(note) {
      if (note === undefined) {
        for (const r of [...scheduled]) r();
        scheduled = [];
        for (const list of sounding.values()) for (const r of [...list]) r();
        sounding.clear();
        return;
      }
      for (const r of [...(sounding.get(note) ?? [])]) r();
      sounding.delete(note);
    },
    suspend: () => ctx.suspend(),
    resume: () => ctx.resume(),
    now: () => ctx.currentTime,
    dispose() {
      this.stop();
      master.disconnect();
      // Browsers cap the number of live AudioContexts, and this app now creates
      // one on the landing page as well as on every lesson.
      void ctx.close();
    },
  };
}

function wrapSampledPiano(ctx: AudioContext, piano: SplendidGrandPiano, output: AudioNode): PianoEngine {
  // Held notes are released through the StopFn that start() handed back. That
  // is more precise than stop({ note }) and stays correct when the same note is
  // retriggered before the first one is released.
  const stoppers = new Map<Midi, (() => void)[]>();

  return {
    ctx,
    kind: "sampled",
    output,
    start({ note, time, duration, velocity = 90 }) {
      const stopFn = piano.start({ note, time, duration, velocity });
      if (duration == null) {
        const list = stoppers.get(note) ?? [];
        list.push(stopFn);
        stoppers.set(note, list);
      }
      return () => stopFn();
    },
    stop(note) {
      if (note === undefined) {
        for (const list of stoppers.values()) for (const s of list) s();
        stoppers.clear();
        piano.stop();
        return;
      }
      for (const s of stoppers.get(note) ?? []) s();
      stoppers.delete(note);
    },
    suspend: () => ctx.suspend(),
    resume: () => ctx.resume(),
    now: () => ctx.currentTime,
    dispose() {
      this.stop();
      void ctx.close();
    },
  };
}

export interface CreateEngineCallbacks {
  onStatus(status: EngineStatus): void;
  onProgress(loaded: number, total: number): void;
}

/** Must be called synchronously from inside a user gesture handler. */
export async function createPianoEngine(cb: CreateEngineCallbacks): Promise<PianoEngine> {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctor();
  await ctx.resume();

  const output = createOutputBus(ctx);
  cb.onStatus("loading");

  try {
    const piano = SplendidGrandPiano(ctx, {
      destination: output,
      onLoadProgress: ({ loaded, total }) => cb.onProgress(loaded, total),
    });
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("sample load timed out")), LOAD_TIMEOUT_MS),
    );
    await Promise.race([piano.ready, timeout]);
    cb.onStatus("ready");
    return wrapSampledPiano(ctx, piano, output);
  } catch {
    // A slow CDN, an offline machine, or a blocked request. The lesson still
    // works, it just sounds synthetic, and the UI says so.
    cb.onStatus("fallback");
    return createFallbackSynth(ctx, output);
  }
}
