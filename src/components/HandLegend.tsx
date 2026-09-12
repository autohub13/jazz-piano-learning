"use client";

// Names the two key colours. Only the hands a lesson actually uses are listed,
// so a one handed lesson gets one swatch rather than a puzzle.

import type { Hand } from "@/lib/lessons/types";
import { cn } from "@/lib/utils";

const WHAT: Record<Hand, string> = {
  left: "Left hand",
  right: "Right hand",
};

export function HandLegend({ hands }: { hands: Hand[] }) {
  if (hands.length === 0) return null;

  return (
    <ul className="hand-legend">
      {hands.map((hand) => (
        <li key={hand} className="hand-legend__item">
          <span className={cn("hand-legend__dot", `is-${hand}`)} aria-hidden />
          {WHAT[hand]}
        </li>
      ))}
    </ul>
  );
}
