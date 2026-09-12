"use client";

// The landing page is a server component and owns the metadata, so the hero
// player is pulled in here. Same reason as the lesson route: the player touches
// window, AudioContext and pointer events.

import dynamic from "next/dynamic";
import { theVamp } from "@/lib/lessons/curriculum";

const HeroPlayer = dynamic(() => import("@/components/HeroPlayer"), {
  ssr: false,
  // Same height as the real thing, so the page does not jump when it lands.
  loading: () => (
    <div className="stage">
      <div className="stage__cue">
        <span className="stage__label">ii - V - I in C. Two hands, four bars.</span>
      </div>
      <div className="stage__keys">
        <div className="piano" aria-hidden />
      </div>
    </div>
  ),
});

export default function HeroPlayerLoader() {
  return <HeroPlayer lesson={theVamp} />;
}
