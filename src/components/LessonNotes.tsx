"use client";

// The teaching points, one at a time. A column of prose beside the keyboard
// does not get read, so a point shows its headline and keeps the rest behind
// More. Every point is in the markup from the server, shown or not, so the
// prose stays crawlable.

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LessonNotes({ tips }: { tips: { head: string; rest: string }[] }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const go = (next: number) => {
    setIndex(next);
    setOpen(false);
  };

  return (
    <div className="tips">
      {/* The cards share one grid cell, so the tallest headline sets the height and the buttons below never jump. */}
      <ol className="tips__cards" aria-live="polite">
        {tips.map((tip, i) => (
          <li key={i} className={cn("tips__card", i === index && "is-on")} aria-hidden={i !== index}>
            <span className="tips__label">
              Tip {i + 1} of {tips.length}
            </span>
            <p className="tips__head">{tip.head}</p>
            {tip.rest && (
              <>
                <p className="tips__rest" hidden={!(open && i === index)}>
                  {tip.rest}
                </p>
                <button type="button" className="tips__more" aria-expanded={open && i === index} onClick={() => setOpen((o) => !o)}>
                  {open && i === index ? "Less" : "More"}
                </button>
              </>
            )}
          </li>
        ))}
      </ol>

      <div className="tips__nav">
        <button type="button" className="btn" onClick={() => go(index - 1)} disabled={index === 0}>
          <ChevronLeft size={15} aria-hidden /> Back
        </button>
        <div className="tips__dots">
          {tips.map((_, i) => (
            <button key={i} type="button" className={cn("tips__dot", i === index && "is-on")} aria-label={`Tip ${i + 1}`} aria-current={i === index} onClick={() => go(i)} />
          ))}
        </div>
        <button type="button" className="btn" onClick={() => go(index + 1)} disabled={index === tips.length - 1}>
          Next <ChevronRight size={15} aria-hidden />
        </button>
      </div>
    </div>
  );
}
