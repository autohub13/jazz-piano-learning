// The order an ear drill asks its prompts in. Steps that share a label and sit
// together are one prompt heard in sequence, a cadence, so they stay together
// and in order. Everything else is shuffled.

import type { LessonStep } from "@/lib/lessons/types";

export function shuffledOrder(steps: readonly LessonStep[], random: () => number = Math.random): number[] {
  const groups: number[][] = [];
  steps.forEach((step, i) => {
    const last = groups[groups.length - 1];
    if (last && step.label !== undefined && steps[last[0]].label === step.label) last.push(i);
    else groups.push([i]);
  });
  for (let i = groups.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [groups[i], groups[j]] = [groups[j], groups[i]];
  }
  return groups.flat();
}
