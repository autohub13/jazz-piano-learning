"use client";

import Link from "next/link";
import { useDevMode } from "@/hooks/useDevMode";
import { useProgress } from "@/hooks/useProgress";
import { exercises, exercisesIn, LEVEL_TITLES, units } from "@/lib/curriculum/tree";
import type { Exercise, Level } from "@/lib/curriculum/types";
import { exerciseStatus, keysFor, masteredKeys, type ProgressStore } from "@/lib/progress";
import { cn } from "@/lib/utils";

const KIND: Record<Exercise["kind"], string> = {
  drill: "Drill",
  progression: "Progression",
  tune: "Tune",
  improv: "Improvise",
  ear: "Ear",
};

function Card({ exercise, store, dev }: { exercise: Exercise; store: ProgressStore; dev: boolean }) {
  const real = exerciseStatus(store, exercise, exercises);
  // Dev mode opens a locked card; it never changes what has been earned.
  const status = dev && real === "locked" ? "new" : real;
  const done = masteredKeys(store, exercise.id);
  const keys = keysFor(exercise);
  const next = keys.find((k) => !done.has(k)) ?? keys[0];
  const body = (
    <>
      <span className="card__kind">{exercise.etude ? "Etude" : KIND[exercise.kind]}</span>
      <span className="card__title">{exercise.title}</span>
      <span className="card__blurb">{exercise.blurb}</span>
      <span className="card__keys" aria-label={`${done.size} of ${keys.length} keys done`}>
        {keys.map((k) => (
          <span key={k} className={cn("card__dot", done.has(k) && "is-done")} title={k} />
        ))}
      </span>
      {exercise.mastery.bpm && <span className="card__meta">Timed at {exercise.mastery.bpm}</span>}
    </>
  );
  if (status === "locked") {
    return (
      <div className="card is-locked" title={`Needs ${exercise.prerequisites.join(", ")}`}>
        {body}
      </div>
    );
  }
  return (
    <Link href={`/practice/${exercise.id}?key=${next}`} className={cn("card", `is-${status}`)}>
      {body}
    </Link>
  );
}

export function SkillTree() {
  const { store } = useProgress();
  const { dev } = useDevMode();
  if (!store) return <div className="tree tree--loading">Loading...</div>;
  return (
    <div className="tree">
      {([1, 2, 3, 4, 5, 6] as Level[]).map((level) => (
        <section key={level} id={`level-${level}`} className="tree__level">
          <h2>
            <span className="tree__num">Level {level}</span> {LEVEL_TITLES[level]}
          </h2>
          {units
            .filter((u) => u.level === level)
            .map((unit) => (
              <div key={unit.id} className="tree__unit">
                <h3>{unit.title}</h3>
                <p>{unit.blurb}</p>
                <div className="tree__cards">
                  {exercisesIn(unit.id).map((e) => (
                    <Card key={e.id} exercise={e} store={store} dev={dev} />
                  ))}
                </div>
              </div>
            ))}
        </section>
      ))}
    </div>
  );
}
