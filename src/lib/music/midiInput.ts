// A MIDI keyboard as input. Same shape as computerKeys.ts: plain listeners in,
// a detach function out, nothing React-specific.
//
// Only note-on and note-off matter here. The channel nibble is ignored, so a
// keyboard sending on any channel works. A note-on with velocity 0 is a
// note-off, which is how most hardware sends it.

import type { Midi } from "./notes";

export interface MidiInputHandlers {
  onNoteDown(midi: Midi, velocity: number): void;
  onNoteUp(midi: Midi): void;
  /** Called with the names of the connected inputs whenever that list changes. */
  onDevices(names: string[]): void;
}

const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;

export function attachMidiInput(access: MIDIAccess, handlers: MidiInputHandlers): () => void {
  const held = new Set<Midi>();

  const releaseAll = () => {
    for (const midi of held) handlers.onNoteUp(midi);
    held.clear();
  };

  const onMessage = (e: MIDIMessageEvent) => {
    const data = e.data;
    if (!data || data.length < 3) return;
    const kind = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];

    if (kind === NOTE_ON && velocity > 0) {
      if (held.has(note)) return;
      held.add(note);
      handlers.onNoteDown(note, velocity);
    } else if (kind === NOTE_OFF || kind === NOTE_ON) {
      if (!held.delete(note)) return;
      handlers.onNoteUp(note);
    }
  };

  const bind = () => {
    const names: string[] = [];
    access.inputs.forEach((input) => {
      if (input.state !== "connected") return;
      input.onmidimessage = onMessage;
      names.push(input.name || "MIDI keyboard");
    });
    handlers.onDevices(names);
  };

  // A device unplugged mid-chord never sends its note-offs, so anything held
  // is released on every connection change rather than left ringing.
  const onStateChange = () => {
    releaseAll();
    bind();
  };

  bind();
  access.addEventListener("statechange", onStateChange);

  return () => {
    releaseAll();
    access.removeEventListener("statechange", onStateChange);
    access.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
  };
}
