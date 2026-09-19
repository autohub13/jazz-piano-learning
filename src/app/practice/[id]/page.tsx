"use client";

import dynamic from "next/dynamic";
import { findExercise } from "@/lib/curriculum/tree";

// Every part of the workspace touches window, AudioContext or pointer events,
// so there is nothing worth rendering on the server.
const PracticeWorkspace = dynamic(() => import("@/components/PracticeWorkspace"), {
  ssr: false,
  loading: () => <div className="gate">Loading the keyboard...</div>,
});

export default function PracticePage({ params }: { params: { id: string } }) {
  const exercise = findExercise(params.id);
  // The server layout already rendered the not-found boundary for a bad id.
  if (!exercise) return null;
  return <PracticeWorkspace exercise={exercise} />;
}
