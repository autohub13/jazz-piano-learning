"use client";

import { useDevMode } from "@/hooks/useDevMode";
import { cn } from "@/lib/utils";

export function DevToggle() {
  const { dev, toggle } = useDevMode();
  return (
    <button
      type="button"
      className={cn("dev-toggle", dev && "is-on")}
      onClick={toggle}
      aria-pressed={dev}
      title="Dev mode opens every exercise, whatever its prerequisites."
    >
      Dev {dev ? "on" : "off"}
    </button>
  );
}
