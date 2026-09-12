"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { LessonStep } from "@/lib/lessons/types";

function StepStripImpl({
  steps,
  activeIndex,
  completed,
}: {
  steps: LessonStep[];
  activeIndex: number;
  completed: number;
}) {
  return (
    <ol className="steps" aria-label="Lesson steps">
      {steps.map((step, i) => (
        <li
          key={i}
          className={cn("steps__dot", {
            "is-active": i === activeIndex,
            "is-done": i < completed,
            "is-chord": step.notes.length > 1,
          })}
          title={step.label ?? `Step ${i + 1}`}
        />
      ))}
    </ol>
  );
}

export const StepStrip = memo(StepStripImpl);
