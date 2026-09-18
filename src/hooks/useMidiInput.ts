"use client";

import { useEffect, useRef, useState } from "react";
import { attachMidiInput } from "@/lib/music/midiInput";
import type { Midi } from "@/lib/music/notes";

export type MidiStatus = "unsupported" | "requesting" | "no-device" | "connected" | "denied";

export interface MidiInputOptions {
  enabled: boolean;
  onNoteDown(midi: Midi, velocity: number): void;
  onNoteUp(midi: Midi): void;
}

export interface MidiInputState {
  status: MidiStatus;
  deviceName: string | null;
}

/**
 * Handlers are read through a ref for the same reason as useComputerKeyboard:
 * the listeners are attached once per enable, not rebuilt on every render,
 * which would drop note-offs mid-chord.
 */
export function useMidiInput(opts: MidiInputOptions): MidiInputState {
  const { enabled } = opts;
  const [state, setState] = useState<MidiInputState>({ status: "requesting", deviceName: null });

  const handlersRef = useRef(opts);
  handlersRef.current = opts;

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("requestMIDIAccess" in navigator)) {
      setState({ status: "unsupported", deviceName: null });
      return;
    }

    let cancelled = false;
    let detach: (() => void) | null = null;

    navigator.requestMIDIAccess().then(
      (access) => {
        if (cancelled) return;
        detach = attachMidiInput(access, {
          onNoteDown: (m, v) => handlersRef.current.onNoteDown(m, v),
          onNoteUp: (m) => handlersRef.current.onNoteUp(m),
          onDevices: (names) =>
            setState(
              names.length > 0
                ? { status: "connected", deviceName: names.join(", ") }
                : { status: "no-device", deviceName: null },
            ),
        });
      },
      () => {
        if (!cancelled) setState({ status: "denied", deviceName: null });
      },
    );

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [enabled]);

  return state;
}
