// Which hand plays what. Both hands share one on-screen keyboard, so the only
// way to tell a shell from the melody sitting on top of it is to say so.

import type { Midi } from "@/lib/music/notes";
import type { Hand, Lesson, LessonStep } from "./types";

/**
 * Note to hand for one step. A per-note `hands` array wins over the step's
 * single `hand`, and a step with neither returns nothing rather than guessing:
 * in this piece the melody dips below the left hand's top note, so no pitch
 * split point could get it right.
 */
export function handMap(step: LessonStep | null | undefined): ReadonlyMap<Midi, Hand> | undefined {
  if (!step) return undefined;

  if (step.hands) {
    const map = new Map<Midi, Hand>();
    step.notes.forEach((note, i) => {
      const hand = step.hands?.[i];
      if (hand) map.set(note, hand);
    });
    return map.size > 0 ? map : undefined;
  }

  if (step.hand) {
    const map = new Map<Midi, Hand>();
    for (const note of step.notes) map.set(note, step.hand);
    return map;
  }

  return undefined;
}

/** The hands a lesson actually uses, so the legend only names those. */
export function handsUsed(lesson: Lesson): Hand[] {
  const seen = new Set<Hand>();
  for (const step of lesson.steps) {
    if (step.hands) for (const hand of step.hands) seen.add(hand);
    else if (step.hand) seen.add(step.hand);
  }
  return (["left", "right"] as const).filter((hand) => seen.has(hand));
}
