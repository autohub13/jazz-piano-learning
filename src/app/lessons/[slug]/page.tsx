"use client";

import dynamic from "next/dynamic";
import { findLesson } from "@/lib/lessons/curriculum";

// Every part of the player touches window, AudioContext or pointer events, so
// there is nothing worth rendering on the server.
const LessonWorkspace = dynamic(() => import("@/components/LessonWorkspace"), {
  ssr: false,
  loading: () => <div className="gate">Loading the keyboard...</div>,
});

export default function LessonPage({ params }: { params: { slug: string } }) {
  const lesson = findLesson(params.slug);
  // The server layout already rendered the not-found boundary for a bad slug.
  if (!lesson) return null;
  return <LessonWorkspace lesson={lesson} />;
}
