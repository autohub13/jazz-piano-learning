import type { Metadata } from "next";
import Link from "next/link";
import { exercises } from "@/lib/curriculum/tree";
import { tunes } from "@/lib/tunes/library";

export const metadata: Metadata = {
  title: "Tunes",
  description: "The repertoire: blues forms, traditional tunes and the changes of standards, arranged by level.",
};

export default function TunesPage() {
  return (
    <main className="page">
      <section className="hero hero--compact">
        <p className="eyebrow">Tunes</p>
        <h1 className="hero__title">The repertoire</h1>
        <p className="hero__body">
          Every tune is a chord chart. The arrangement, the walking bass and the comping are generated for the
          level you are at and the key you pick, so the same tune grows with you. Standards are here under
          their own names, as the changes you comp and improvise over with the band.
        </p>
      </section>
      <ol className="lesson-grid">
        {tunes.map((tune) => {
          const ex = exercises.filter((e) => e.tune === tune.slug);
          const play = ex.find((e) => e.kind === "tune") ?? ex[0];
          return (
            <li key={tune.slug}>
              <div className="lesson-card lesson-card--static">
                <span className="lesson-card__num">Level {tune.level}</span>
                <span className="lesson-card__title">{tune.title}</span>
                <span className="lesson-card__ingredient">{tune.blurb}</span>
                <span className="lesson-card__meta">
                  {tune.key} · {tune.style} · {tune.bpm.default} bpm
                  {tune.composer && ` · ${tune.composer}`}
                  {!tune.melody && " · changes only"}
                </span>
                <span className="lesson-card__links">
                  {play && (
                    <Link href={`/practice/${play.id}?key=${tune.key}`} className="btn">
                      Play it
                    </Link>
                  )}
                  {ex
                    .filter((e) => e.kind === "improv")
                    .map((e) => (
                      <Link key={e.id} href={`/practice/${e.id}?key=${tune.key}`} className="btn">
                        Improvise
                      </Link>
                    ))}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
