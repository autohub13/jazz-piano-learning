// What the learner has done, kept in this browser only. Every storage call is
// wrapped: private windows, blocked site data and full quotas all throw, and
// none of them should do more than make the progress badges disappear.
//
// Each (exercise, key) is a card in a spaced repetition deck. A pass at the
// exercise's mastery bar pushes its next review further out; a fail brings it
// back to tomorrow. The daily plan is the due cards plus the next new thing.

import type { Exercise } from "@/lib/curriculum/types";
import { KEYS, type KeyName } from "@/lib/lessons/transpose";

/** Bump the suffix when the shape changes. Old data is then simply ignored. */
const STORAGE_KEY = "jazz-piano-learning:progress:v2";

/** Review intervals in days after each consecutive pass. */
const INTERVALS = [1, 3, 7, 14, 30, 60];

/** Circle of fourths from C: the order jazz players learn keys in. */
export const KEY_ORDER: KeyName[] = ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb", "B", "E", "A", "D", "G"];

export interface Attempt {
  /** First-try accuracy, 0..1. */
  accuracy: number;
  /** Fraction of hits that were on time, when timed. */
  timing?: number;
  bpm?: number;
  timed: boolean;
  /** No hints were showing. */
  clean: boolean;
}

export interface KeyRecord {
  attempts: number;
  bestAccuracy: number;
  /** Best tempo at which the mastery bar was met with the clock on. */
  bestTimedBpm: number | null;
  mastered: boolean;
  /** Consecutive passes; the next review is INTERVALS[streak - 1] days out. */
  streak: number;
  /** "YYYY-MM-DD" of the next review. */
  due: string;
  lastPracticedAt: string;
}

export interface ProgressStore {
  version: 2;
  exercises: Record<string, Partial<Record<KeyName, KeyRecord>>>;
  /** lastDay is a local calendar day, "YYYY-MM-DD". */
  streak: { count: number; lastDay: string | null };
}

function emptyStore(): ProgressStore {
  return { version: 2, exercises: {}, streak: { count: 0, lastDay: null } };
}

/** Local date, never UTC: a pass at 11pm belongs to today, not tomorrow. */
export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function loadProgress(): ProgressStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProgressStore;
    if (parsed?.version !== 2 || typeof parsed.exercises !== "object" || !parsed.streak) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function save(store: ProgressStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Nothing to do: the pass still counted on screen, it just will not persist.
  }
}

/** Whether one attempt clears the exercise's bar. */
export function meetsMastery(attempt: Attempt, mastery: Exercise["mastery"]): boolean {
  if (!attempt.clean || attempt.accuracy < mastery.accuracy) return false;
  if (mastery.bpm === undefined) return true;
  return attempt.timed && (attempt.bpm ?? 0) >= mastery.bpm && (attempt.timing ?? 1) >= 0.7;
}

/** Records one finished pass. Pure on the store; the caller saves. */
export function applyAttempt(
  store: ProgressStore,
  exercise: Exercise,
  key: KeyName,
  attempt: Attempt,
  now = new Date(),
): ProgressStore {
  const prev = store.exercises[exercise.id]?.[key];
  const passed = meetsMastery(attempt, exercise.mastery);
  const streak = passed ? Math.min((prev?.streak ?? 0) + 1, INTERVALS.length) : 0;
  const record: KeyRecord = {
    attempts: (prev?.attempts ?? 0) + 1,
    bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, attempt.accuracy),
    bestTimedBpm:
      passed && attempt.timed ? Math.max(prev?.bestTimedBpm ?? 0, attempt.bpm ?? 0) : prev?.bestTimedBpm ?? null,
    mastered: (prev?.mastered ?? false) || passed,
    streak,
    due: dayKey(addDays(now, passed ? INTERVALS[streak - 1] : 1)),
    lastPracticedAt: now.toISOString(),
  };
  const today = dayKey(now);
  const continued = store.streak.lastDay === dayKey(addDays(now, -1));
  return {
    ...store,
    exercises: { ...store.exercises, [exercise.id]: { ...store.exercises[exercise.id], [key]: record } },
    streak:
      store.streak.lastDay === today ? store.streak : { count: continued ? store.streak.count + 1 : 1, lastDay: today },
  };
}

export function recordAttempt(exercise: Exercise, key: KeyName, attempt: Attempt, now = new Date()): ProgressStore {
  const next = applyAttempt(loadProgress(), exercise, key, attempt, now);
  save(next);
  return next;
}

export function keysFor(exercise: Exercise): readonly KeyName[] {
  return exercise.keys === "all" ? KEY_ORDER : exercise.keys;
}

export function masteredKeys(store: ProgressStore, exerciseId: string): Set<KeyName> {
  const records = store.exercises[exerciseId] ?? {};
  return new Set(KEYS.filter((k) => records[k]?.mastered));
}

export function isMastered(store: ProgressStore, exercise: Exercise): boolean {
  const done = masteredKeys(store, exercise.id);
  return keysFor(exercise).every((k) => done.has(k));
}

/** Unlocked once every prerequisite is mastered in at least one key. */
export function isUnlocked(store: ProgressStore, exercise: Exercise, all: Exercise[]): boolean {
  return exercise.prerequisites.every((id) => {
    const pre = all.find((e) => e.id === id);
    return pre ? masteredKeys(store, pre.id).size > 0 : true;
  });
}

export function exerciseStatus(
  store: ProgressStore,
  exercise: Exercise,
  all: Exercise[],
): "locked" | "new" | "in-progress" | "done" {
  if (isMastered(store, exercise)) return "done";
  if (!isUnlocked(store, exercise, all)) return "locked";
  return Object.keys(store.exercises[exercise.id] ?? {}).length > 0 ? "in-progress" : "new";
}

/** A streak survives until the end of the day after the last pass. */
export function currentStreak(store: ProgressStore, now = new Date()): number {
  const { count, lastDay } = store.streak;
  return lastDay === dayKey(now) || lastDay === dayKey(addDays(now, -1)) ? count : 0;
}

export interface QueueItem {
  exercise: Exercise;
  key: KeyName;
  reason: "review" | "next-key" | "new";
}

/** About twenty minutes: what is due, then the next new key or exercise. */
export function planToday(store: ProgressStore, all: Exercise[], now = new Date(), budget = 20): QueueItem[] {
  const today = dayKey(now);
  const queue: QueueItem[] = [];
  let minutes = 0;
  const seen = new Set<string>();
  const push = (item: QueueItem) => {
    const id = `${item.exercise.id}:${item.key}`;
    if (seen.has(id) || minutes + item.exercise.minutes > budget + 2) return;
    seen.add(id);
    minutes += item.exercise.minutes;
    queue.push(item);
  };

  // Reviews: mastered cards whose date has come, oldest first.
  const due: { item: QueueItem; due: string }[] = [];
  for (const exercise of all) {
    const records = store.exercises[exercise.id] ?? {};
    for (const key of keysFor(exercise)) {
      const r = records[key];
      if (r?.mastered && r.due <= today) due.push({ item: { exercise, key, reason: "review" }, due: r.due });
    }
  }
  due.sort((a, b) => a.due.localeCompare(b.due));
  for (const { item } of due.slice(0, 3)) push(item);

  // Then the next thing, lowest level first, mixing kinds so a session is
  // not four scales in a row.
  const kinds = new Map<string, number>();
  const ordered = [...all].sort((a, b) => a.level - b.level);
  for (const exercise of ordered) {
    if (minutes >= budget) break;
    if (!isUnlocked(store, exercise, all) || isMastered(store, exercise)) continue;
    if ((kinds.get(exercise.kind) ?? 0) >= 2) continue;
    const done = masteredKeys(store, exercise.id);
    const key = keysFor(exercise).find((k) => !done.has(k));
    if (!key) continue;
    kinds.set(exercise.kind, (kinds.get(exercise.kind) ?? 0) + 1);
    push({ exercise, key, reason: done.size > 0 ? "next-key" : "new" });
  }
  return queue;
}

export function queueMinutes(queue: QueueItem[]): number {
  return queue.reduce((sum, q) => sum + q.exercise.minutes, 0);
}
