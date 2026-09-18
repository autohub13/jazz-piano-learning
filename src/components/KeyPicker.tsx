"use client";

import { type KeyName } from "@/lib/lessons/transpose";
import { KEY_ORDER } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function KeyPicker({
  current,
  done,
  onChange,
  keys = KEY_ORDER,
}: {
  current: KeyName;
  done: ReadonlySet<KeyName>;
  onChange(key: KeyName): void;
  keys?: readonly KeyName[];
}) {
  return (
    <div className="keypick">
      <span className="keypick__caption">Key</span>
      <div className="keypick__chips" role="radiogroup" aria-label="Key">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={key === current}
            className={cn("keypick__chip", key === current && "is-on", done.has(key) && "is-done")}
            title={done.has(key) ? `Done in ${key}` : undefined}
            onClick={() => onChange(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <span className="keypick__meta">
        {done.size > 0 ? `Done in ${done.size} of ${keys.length} keys.` : "No keys done yet."} Keys run round the circle of fourths.
      </span>
    </div>
  );
}
