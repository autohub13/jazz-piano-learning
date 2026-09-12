"use client";

import { useEffect, useRef } from "react";
import { attachComputerKeyboard } from "@/lib/music/computerKeys";
import type { Midi } from "@/lib/music/notes";

export interface ComputerKeyboardOptions {
  base: Midi;
  enabled: boolean;
  onNoteDown(midi: Midi): void;
  onNoteUp(midi: Midi): void;
  onBaseChange(base: Midi): void;
}

/**
 * The handlers are read through refs so the listener is attached once per
 * enable/disable, not on every render. If the effect re-ran on every callback
 * identity change it would tear down and rebuild the listener mid-chord and
 * drop note-up events.
 */
export function useComputerKeyboard(opts: ComputerKeyboardOptions): void {
  const { base, enabled } = opts;

  const baseRef = useRef(base);
  baseRef.current = base;

  const handlersRef = useRef(opts);
  handlersRef.current = opts;

  useEffect(() => {
    if (!enabled) return;
    return attachComputerKeyboard(() => baseRef.current, {
      onNoteDown: (m) => handlersRef.current.onNoteDown(m),
      onNoteUp: (m) => handlersRef.current.onNoteUp(m),
      onBaseChange: (b) => handlersRef.current.onBaseChange(b),
    });
  }, [enabled]);
}
