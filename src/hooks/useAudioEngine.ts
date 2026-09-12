"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPianoEngine,
  type EngineStatus,
  type PianoEngine,
} from "@/lib/audio/pianoEngine";

export interface AudioEngineState {
  engine: PianoEngine | null;
  status: EngineStatus;
  progress: { loaded: number; total: number };
  /** Call from a click handler. The AudioContext needs a user gesture. */
  start(): void;
}

export function useAudioEngine(): AudioEngineState {
  const [engine, setEngine] = useState<PianoEngine | null>(null);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  // React 18 Strict Mode double-invokes effects in dev; without a guard this
  // would create two AudioContexts and double every note.
  const creatingRef = useRef(false);
  const engineRef = useRef<PianoEngine | null>(null);

  const start = useCallback(() => {
    if (creatingRef.current || engineRef.current) return;
    creatingRef.current = true;
    void createPianoEngine({
      onStatus: setStatus,
      onProgress: (loaded, total) => setProgress({ loaded, total }),
    })
      .then((created) => {
        engineRef.current = created;
        setEngine(created);
      })
      .catch(() => setStatus("error"))
      .finally(() => {
        creatingRef.current = false;
      });
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return { engine, status, progress, start };
}
