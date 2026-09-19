"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";

// Shown by the stylesheet only on a phone held upright. It lives in the root
// layout, so a dismissal lasts until the page is reloaded.
export function RotatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="rotate-prompt" role="dialog" aria-modal="true" aria-labelledby="rotate-prompt-title">
      <Smartphone className="rotate-prompt__icon" aria-hidden />
      <h2 id="rotate-prompt-title" className="rotate-prompt__title">
        Turn your phone sideways
      </h2>
      <p className="rotate-prompt__text">
        The keyboard needs the width. On its side the phone fits both hands and the music above them.
      </p>
      <button type="button" className="btn" onClick={() => setDismissed(true)}>
        Stay upright
      </button>
    </div>
  );
}
