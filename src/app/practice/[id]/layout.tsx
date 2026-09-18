// Server component. The workspace is a Client Component and cannot export
// metadata, which is why this layout exists. The prose here is crawlable.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exercises, exercisesIn, findExercise, LEVEL_TITLES, units } from "@/lib/curriculum/tree";
import { getLesson } from "@/lib/lessons/curriculum";

export function generateStaticParams() {
  return exercises.map((e) => ({ id: e.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const exercise = findExercise(params.id);
  if (!exercise) notFound();
  return { title: exercise.title, description: exercise.blurb };
}

/** The authored lessons still carry their teaching points. */
function pointsFor(id: string): string[] {
  try {
    return getLesson(id).teachingPoints;
  } catch {
    return [];
  }
}

export default function PracticeLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const exercise = findExercise(params.id);
  if (!exercise) notFound();
  const unit = units.find((u) => u.id === exercise.unit)!;
  const siblings = exercisesIn(unit.id);
  const i = siblings.findIndex((e) => e.id === exercise.id);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];
  const points = pointsFor(exercise.id);

  return (
    <main className="page page--lesson">
      <nav className="crumbs">
        <Link href="/">Today</Link>
        <span className="crumbs__sep">/</span>
        <Link href={`/path#level-${exercise.level}`}>
          Level {exercise.level}: {LEVEL_TITLES[exercise.level]}
        </Link>
        <span className="crumbs__sep">/</span>
        <span>{unit.title}</span>
      </nav>

      <header className="lesson-head">
        <h1 className="lesson-head__title">{exercise.title}</h1>
        <p className="lesson-head__tagline">{exercise.blurb}</p>
      </header>

      <div className="lesson-body">
        <div className="lesson-body__player">{children}</div>
        <aside className="lesson-body__notes">
          <h2>{unit.title}</h2>
          <p>{unit.blurb}</p>
          {points.length > 0 && (
            <ul>
              {points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <h2>To mark it done</h2>
          <p>
            {exercise.kind === "improv"
              ? `A chorus scoring ${Math.round(exercise.mastery.accuracy * 100)} percent at ${exercise.mastery.bpm} or faster`
              : exercise.kind === "ear"
                ? `${Math.round(exercise.mastery.accuracy * 100)} percent first try, without pressing Show it`
                : `${Math.round(exercise.mastery.accuracy * 100)} percent first try, no hints${exercise.mastery.bpm ? `, in Timed mode at ${exercise.mastery.bpm} or faster` : ""}`}
            {exercise.keys === "all" ? ", in each of the twelve keys." : "."}
          </p>
        </aside>
      </div>

      <nav className="lesson-nav">
        {prev ? (
          <Link href={`/practice/${prev.id}`} className="btn">
            Back: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/practice/${next.id}`} className="btn">
            Next: {next.title}
          </Link>
        ) : (
          <Link href="/path" className="btn">
            Back to the path
          </Link>
        )}
      </nav>
    </main>
  );
}
