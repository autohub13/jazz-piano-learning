import Link from "next/link";
import { Dashboard } from "@/components/Dashboard";
import { exercises } from "@/lib/curriculum/tree";
import { tunes } from "@/lib/tunes/library";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero hero--compact">
        <p className="eyebrow">Jazz piano, from the first key to the session</p>
        <h1 className="hero__title">Do the next small thing</h1>
        <p className="hero__body">
          Six levels, {exercises.length} exercises, every drill in all twelve keys and every tune in four, a song
          book for each unit, {tunes.length} standards with a band. Voicings, ears, reading and improvising, drilled alone and then used in a tune, and spaced out so
          what you learned comes back before you forget it. Twenty minutes a day. Plug in a MIDI keyboard.
        </p>
        <div className="hero__actions">
          <Link href="/path" className="btn btn--lg">
            See the whole path
          </Link>
          <Link href="/tunes" className="btn btn--lg">
            The tunes
          </Link>
        </div>
      </section>
      <Dashboard />
    </main>
  );
}
