"use client";

import { useCallback, useEffect, useState } from "react";
import { loadProgress, type ProgressStore } from "@/lib/progress";

/**
 * Null until mounted. The server has no localStorage, so reading it during
 * render would make the first client render disagree with the prerendered HTML.
 */
export function useProgress(): { store: ProgressStore | null; refresh(): void } {
  const [store, setStore] = useState<ProgressStore | null>(null);
  const refresh = useCallback(() => setStore(loadProgress()), []);
  useEffect(() => refresh(), [refresh]);
  return { store, refresh };
}
