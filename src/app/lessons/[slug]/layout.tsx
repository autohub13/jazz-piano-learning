// Server component. The page below is a Client Component and cannot export
// metadata, which is the whole reason this layout exists. The prose here is
// also crawlable, unlike anything the interactive widget renders.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findLesson, lessons } from "@/lib/lessons/curriculum";

/** The lessons that are pieces of the vamp, which is what the crumb counts. */
const ingredientCount = lessons.filter((l) => l.ingredient).length;

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const lesson = findLesson(params.slug);
  if (!lesson) notFound();
  return {
    title: lesson.title,
    description: lesson.tagline,
  };
}

export default function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const lesson = findLesson(params.slug);
  if (!lesson) notFound();
  const index = lessons.findIndex((l) => l.slug === lesson.slug);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <main className="page page--lesson">
      <nav className="crumbs">
        <Link href="/">The vamp</Link>
        <span className="crumbs__sep">/</span>
        <span>
          {lesson.topic === "piece"
            ? "The piece"
            : lesson.topic === "song"
              ? "The tune"
              : `Ingredient ${lesson.order - 1} of ${ingredientCount}`}
        </span>
      </nav>

      <header className="lesson-head">
        <h1 className="lesson-head__title">{lesson.title}</h1>
        <p className="lesson-head__tagline">{lesson.tagline}</p>
      </header>

      <div className="lesson-body">
        <div className="lesson-body__player">{children}</div>
        <aside className="lesson-body__notes">
          <h2>What to listen for</h2>
          <ul>
            {lesson.teachingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {lesson.topic !== "piece" && (
            <Link href="/" className="btn lesson-body__hear">
              Hear it in the vamp
            </Link>
          )}
        </aside>
      </div>

      <nav className="lesson-nav">
        {prev ? (
          <Link href={`/lessons/${prev.slug}`} className="btn">
            Back: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/lessons/${next.slug}`} className="btn">
            Next: {next.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
