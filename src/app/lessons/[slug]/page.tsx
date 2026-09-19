// The old lesson URLs. Each one now lives as an exercise on the path.

import { redirect } from "next/navigation";
import { findExercise } from "@/lib/curriculum/tree";

const MOVED: Record<string, string> = {
  "c-major-scale": "major-scale",
  "shell-voicings": "shells",
  "ii-v-i": "ii-v-i-shells",
  "blues-in-c": "f-blues",
};

export default function OldLessonPage({ params }: { params: { slug: string } }) {
  const id = MOVED[params.slug] ?? params.slug;
  redirect(findExercise(id) ? `/practice/${id}` : "/path");
}
