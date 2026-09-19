"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { SheetRoot } from "@/lib/music/chordSheet";
import { cn } from "@/lib/utils";

const ChordSheet = dynamic(() => import("./ChordSheet"), { ssr: false });

// Lives in the root layout's header, so the sheet opens over any page. The
// root is held here rather than in the sheet, so it is still there on reopening.
export function ChordSheetToggle() {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<SheetRoot>("C");
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        type="button"
        className={cn("chords-toggle", open && "is-on")}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Chords
      </button>
      {open && <ChordSheet root={root} onRoot={setRoot} onClose={close} />}
    </>
  );
}
