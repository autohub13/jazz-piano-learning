import type { Metadata } from "next";
import { SkillTree } from "@/components/SkillTree";

export const metadata: Metadata = {
  title: "The path",
  description: "Six levels from the keyboard to rhythm changes: drills in all twelve keys, tunes in four.",
};

export default function PathPage() {
  return (
    <main className="page">
      <section className="hero hero--compact">
        <p className="eyebrow">The path</p>
        <h1 className="hero__title">Six levels</h1>
        <p className="hero__body">
          Each card is one skill. The dots are its keys, round the circle of fourths: twelve for a drill, four for
          a tune. A card unlocks when
          what it builds on is done in at least one key. A timed card is only marked done with the band on, at the
          tempo it names.
        </p>
      </section>
      <SkillTree />
    </main>
  );
}
