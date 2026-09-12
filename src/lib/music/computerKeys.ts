// QWERTY as a piano. Two rows in the standard tracker/DAW layout: naturals on
// a letter row, sharps on the row physically above, so the shape of the black
// keys is already under your fingers.
//
// Keyed by event.code (physical position), never event.key. event.key would
// scatter the notes on AZERTY/QWERTZ/Dvorak and would change under Shift or
// CapsLock. Offsets are semitones above the mapping base.

import type { Midi } from "./notes";

export const KEY_OFFSETS: Record<string, number> = {
  // Lower octave: naturals on the bottom row, sharps on the home row.
  KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4,
  KeyV: 5, KeyG: 6, KeyB: 7, KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11,
  Comma: 12, KeyL: 13, Period: 14, Semicolon: 15, Slash: 16,
  // Upper octave: naturals on the top letter row, sharps on the number row.
  KeyQ: 12, Digit2: 13, KeyW: 14, Digit3: 15, KeyE: 16,
  KeyR: 17, Digit5: 18, KeyT: 19, Digit6: 20, KeyY: 21, Digit7: 22, KeyU: 23,
  KeyI: 24, Digit9: 25, KeyO: 26, Digit0: 27, KeyP: 28,
};

/** Highest offset in the table, used to clamp the octave shift. */
export const KEY_SPAN = 28;

export const MIN_BASE = 24;
export const MAX_BASE = 108 - KEY_SPAN;

export interface ComputerKeyboardHandlers {
  onNoteDown(midi: Midi): void;
  onNoteUp(midi: Midi): void;
  onBaseChange(base: Midi): void;
}

function isTextTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Attaches window key listeners and returns a detach function.
 *
 * Held notes are tracked as a Map from physical code to MIDI, not a Set of
 * MIDI. Comma/Period/Slash deliberately overlap Q/W/E, so two physical keys can
 * sound one note; with a plain Set, releasing one would silence a note the
 * other is still holding. Note-down fires only on the first code to claim a
 * note, note-up only when the last one lets go.
 */
export function attachComputerKeyboard(
  getBase: () => Midi,
  handlers: ComputerKeyboardHandlers,
): () => void {
  const heldByCode = new Map<string, Midi>();

  const isHeldElsewhere = (midi: Midi, exceptCode: string) => {
    for (const [code, m] of heldByCode) {
      if (code !== exceptCode && m === midi) return true;
    }
    return false;
  };

  const releaseAll = () => {
    for (const midi of new Set(heldByCode.values())) handlers.onNoteUp(midi);
    heldByCode.clear();
  };

  const shiftOctave = (delta: number) => {
    const next = Math.min(MAX_BASE, Math.max(MIN_BASE, getBase() + delta * 12));
    if (next === getBase()) return;
    // Release first: a note-up arriving after the shift would otherwise be
    // computed against the new base and leave the old note ringing.
    releaseAll();
    handlers.onBaseChange(next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // The OS repeats keydown ~30 times a second while a key is held. Without
    // this guard the sample retriggers and the practice validator re-fires.
    if (e.repeat) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isTextTarget(e.target)) return;

    if (e.code === "ArrowUp" || e.code === "BracketRight") {
      e.preventDefault();
      shiftOctave(1);
      return;
    }
    if (e.code === "ArrowDown" || e.code === "BracketLeft") {
      e.preventDefault();
      shiftOctave(-1);
      return;
    }

    const offset = KEY_OFFSETS[e.code];
    if (offset === undefined) return;
    e.preventDefault(); // Slash opens quick-find in Firefox, Space scrolls, etc.
    if (heldByCode.has(e.code)) return;

    const midi = getBase() + offset;
    const alreadySounding = isHeldElsewhere(midi, e.code);
    heldByCode.set(e.code, midi);
    if (!alreadySounding) handlers.onNoteDown(midi);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const midi = heldByCode.get(e.code);
    if (midi === undefined) return;
    heldByCode.delete(e.code);
    if (!isHeldElsewhere(midi, e.code)) handlers.onNoteUp(midi);
  };

  // Alt-tabbing mid-chord otherwise leaves notes ringing forever and poisons
  // the next practice evaluation with phantom held notes.
  const onBlur = () => releaseAll();
  const onVisibility = () => {
    if (document.hidden) releaseAll();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    releaseAll();
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
