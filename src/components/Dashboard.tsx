"use client";

// Today. The due reviews and the next new thing, about twenty minutes, one
// click each. This is the page the site opens on because the fastest way to
// get good is to do the next small thing every day.

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/hooks/useProgress";
import { exercises, LEVEL_TITLES } from "@/lib/curriculum/tree";
import type { Level } from "@/lib/curriculum/types";
import { currentStreak, isMastered, keysFor, masteredKeys, planToday, queueMinutes } from "@/lib/progress";

const REASON: Record<"review" | "next-key" | "new", string> = {
  review: "Review",
  "next-key": "Next key",
  new: "New",
};

export function Dashboard() {
  const { store } = useProgress();
  const queue = useMemo(() => (store ? planToday(store, exercises) : []), [store]);

  if (!store) return <div className="dashboard dashboard--loading">Loading your plan...</div>;

  const streak = currentStreak(store);
  const levels = ([1, 2, 3, 4, 5, 6] as Level[]).map((level) => {
    const ofLevel = exercises.filter((e) => e.level === level);
    const cards = ofLevel.reduce((sum, e) => sum + keysFor(e).length, 0);
    const done = ofLevel.reduce((sum, e) => sum + masteredKeys(store, e.id).size, 0);
    return { level, cards, done, complete: ofLevel.every((e) => isMastered(store, e)) };
  });
  const current = levels.find((l) => !l.complete)?.level ?? 6;

  return (
    <div className="dashboard">
      <section className="today">
        <div className="today__head">
          <p className="eyebrow">Today</p>
          <h2>{queue.length ? `About ${queueMinutes(queue)} minutes` : "Nothing due"}</h2>
          <p className="today__meta">
            {streak > 0 ? `${streak} day streak. ` : ""}
            Level {current}: {LEVEL_TITLES[current]}.
          </p>
        </div>
        <ol className="queue">
          {queue.map((item) => (
            <li key={`${item.exercise.id}:${item.key}`}>
              <Link href={`/practice/${item.exercise.id}?key=${item.key}`} className="queue__item">
                <span className={`queue__reason is-${item.reason}`}>{REASON[item.reason]}</span>
                <span className="queue__title">
                  {item.exercise.title}
                  {keysFor(item.exercise).length > 1 && <span className="queue__key"> in {item.key}</span>}
                </span>
                <span className="queue__blurb">{item.exercise.blurb}</span>
                <span className="queue__minutes">{item.exercise.minutes} min</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="levels">
        <p className="eyebrow">The path</p>
        <ol className="levels__list">
          {levels.map((l) => (
            <li key={l.level} className={l.complete ? "is-done" : l.level === current ? "is-current" : undefined}>
              <Link href={`/path#level-${l.level}`}>
                <span className="levels__num">{l.level}</span>
                <span className="levels__title">{LEVEL_TITLES[l.level]}</span>
                <span className="levels__bar">
                  <span style={{ width: `${l.cards ? (100 * l.done) / l.cards : 0}%` }} />
                </span>
                <span className="levels__count">
                  {l.done} / {l.cards}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
