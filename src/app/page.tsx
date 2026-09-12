import Link from "next/link";
import HeroPlayerLoader from "@/components/HeroPlayerLoader";
import { findLesson, lessons } from "@/lib/lessons/curriculum";

// Everything with an `ingredient` line is a piece of the vamp. The curriculum
// is already sorted by order, which is the unpack order.
const ingredients = lessons.filter((lesson) => lesson.ingredient);
const song = findLesson("when-the-saints");

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">One piece. {ingredients.length} lessons inside it.</p>
        <h1 className="hero__title">Start with the sound</h1>
        <p className="hero__body">
          This is a two hand jazz vamp: three left hand chords, a melody that moves
          one step at a time on top, looping. Press play and watch the keys. Then
          take it apart, one ingredient at a time, until you can play it yourself.
        </p>

        <HeroPlayerLoader />

        <div className="hero__actions">
          <Link href="/lessons/the-vamp" className="btn btn--primary btn--lg">
            Play it yourself
          </Link>
          <a href="#ingredients" className="btn btn--lg">
            See what is inside
          </a>
        </div>
      </section>

      <section id="ingredients" className="ingredients">
        <div className="ingredients__head">
          <p className="eyebrow">Unpack the piece</p>
          <h2>What is inside this</h2>
          <p>
            Every lesson below is one part of what you just heard, from the biggest
            chunk down to the keyboard itself. Each one plays itself, then hands the
            keys to you. Take them in any order.
          </p>
        </div>

        <ol className="lesson-grid">
          {ingredients.map((lesson, i) => (
            <li key={lesson.slug}>
              <Link href={`/lessons/${lesson.slug}`} className="lesson-card">
                <span className="lesson-card__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="lesson-card__title">{lesson.title}</span>
                <span className="lesson-card__ingredient">{lesson.ingredient}</span>
                <span className="lesson-card__meta">
                  {lesson.topic} · {lesson.steps.length} steps
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {song && (
        <section className="payoff">
          <p className="eyebrow">When the vamp is easy</p>
          <h2>Then play a whole tune</h2>
          <p>
            Sixteen bars of {song.title}, arranged with the same three note shells
            and the same one note melody hand. A tune older than recorded jazz, and
            you will already know how it is put together.
          </p>
          <Link href={`/lessons/${song.slug}`} className="btn btn--primary btn--lg">
            Play the tune
          </Link>
        </section>
      )}
    </main>
  );
}
