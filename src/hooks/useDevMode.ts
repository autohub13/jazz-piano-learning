"use client";

// Dev mode: every exercise is open regardless of prerequisites. Kept in this
// browser only. Components that care listen for the change event so the
// toggle in the header updates the path without a reload.

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "jazz-piano-learning:dev";
const EVENT = "jazz-piano-learning:dev-change";

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** False until mounted, so the first client render matches the server's. */
export function useDevMode(): { dev: boolean; toggle(): void } {
  const [dev, setDev] = useState(false);

  useEffect(() => {
    const sync = () => setDev(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, read() ? "0" : "1");
    } catch {
      // Storage blocked: the toggle simply does nothing.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { dev, toggle };
}
