"use client";

import { CHOICES, type Variation } from "@/lib/lessons/variation";
import { cn } from "@/lib/utils";

const AXES: { axis: keyof Variation; caption: string; names: Record<string, string> }[] = [
  {
    axis: "voicing",
    caption: "Voicing",
    names: { written: "As written", shell: "Shells", rootless: "Rootless", drop2: "Drop 2", quartal: "Quartal" },
  },
  {
    axis: "reharm",
    caption: "Chords",
    names: { written: "As written", tritone: "Tritone subs", secondary: "Secondary dominants", passingDim: "Passing diminished" },
  },
  {
    axis: "melody",
    caption: "Melody",
    names: { written: "As written", arpeggio: "Arpeggios", enclosure: "Enclosures", scaleRun: "Scale runs" },
  },
  {
    axis: "rhythm",
    caption: "Comping",
    names: { written: "As written", held: "Held", charleston: "Charleston", anticipate: "Anticipations", fill: "In the gaps" },
  },
  {
    axis: "texture",
    caption: "Hands",
    names: { written: "As written", melodyTop: "Melody on top", stride: "Stride", solo: "Right hand alone" },
  },
];

export function VariationPicker({
  value,
  onChange,
}: {
  value: Variation;
  onChange(next: Variation): void;
}) {
  return (
    <div className="variations">
      {AXES.map(({ axis, caption, names }) => (
        <div key={axis} className="keypick">
          <span className="keypick__caption variations__caption">{caption}</span>
          <div className="keypick__chips" role="radiogroup" aria-label={caption}>
            {CHOICES[axis].map((choice) => (
              <button
                key={choice}
                type="button"
                role="radio"
                aria-checked={value[axis] === choice}
                className={cn("keypick__chip", value[axis] === choice && "is-on")}
                onClick={() => onChange({ ...value, [axis]: choice })}
              >
                {names[choice]}
              </button>
            ))}
          </div>
        </div>
      ))}
      <span className="keypick__meta">
        Changes are heard straight away. Practice always uses the version as written.
      </span>
    </div>
  );
}
