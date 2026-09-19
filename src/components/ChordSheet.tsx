"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {
  SHEET_CHORDS,
  SHEET_ROOTS,
  sheetNotes,
  sheetWindow,
  type SheetRoot,
} from "@/lib/music/chordSheet";
import { buildKeyboardLayout } from "@/lib/music/keyboardLayout";
import { cn } from "@/lib/utils";

/**
 * Every chord on one root, each drawn on the keys. Not a modal: the page
 * underneath stays live, so a chord can be looked up mid-exercise and the
 * keyboard still plays.
 */
export default function ChordSheet({
  root,
  onRoot,
  onClose,
}: {
  root: SheetRoot;
  onRoot(root: SheetRoot): void;
  onClose(): void;
}) {
  const { low, high, rootMidi } = sheetWindow(root);
  const layout = useMemo(() => buildKeyboardLayout(low, high), [low, high]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside className="chordsheet" role="dialog" aria-label="Chord cheat sheet">
      <div className="chordsheet__head">
        <h2 className="chordsheet__title">Chords on {root}</h2>
        <button type="button" className="chordsheet__close" onClick={onClose} aria-label="Close the chord sheet">
          <X aria-hidden />
        </button>
      </div>
      <div className="keypick__chips" role="radiogroup" aria-label="Root">
        {SHEET_ROOTS.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={r === root}
            className={cn("keypick__chip", r === root && "is-on")}
            onClick={() => onRoot(r)}
          >
            {r}
          </button>
        ))}
      </div>
      <ul className="chordsheet__grid">
        {SHEET_CHORDS.map((chord) => {
          const notes = sheetNotes(root, chord);
          const byMidi = new Map(notes.map((n) => [n.midi, n]));
          return (
            <li key={chord.suffix} className="chord-card">
              <div className="chord-card__head">
                <span className="chord-card__symbol">
                  {root}
                  {chord.suffix}
                </span>
                <span className="chord-card__name">{chord.name}</span>
              </div>
              <div
                className="chord-keys"
                role="img"
                aria-label={`${root}${chord.suffix}: ${notes.map((n) => n.name).join(", ")}`}
              >
                {layout.keys.map((k) => {
                  const note = byMidi.get(k.midi);
                  return (
                    <span
                      key={k.midi}
                      className={cn("chord-keys__key", k.isBlack && "chord-keys__key--black", {
                        "is-lit": note !== undefined,
                        "is-root": k.midi === rootMidi,
                      })}
                      style={{ left: `${k.leftPct}%`, width: `${k.widthPct}%` }}
                    >
                      {note?.name}
                    </span>
                  );
                })}
              </div>
              <ol className="chord-card__notes">
                {notes.map((n) => (
                  <li key={n.midi}>
                    <span className="chord-card__note">{n.name}</span>
                    <span className="chord-card__degree">{n.degree}</span>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
