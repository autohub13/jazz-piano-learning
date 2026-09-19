"use client";

import type { ImprovSession } from "@/hooks/useImprovSession";
import { cn } from "@/lib/utils";

const pct = (x: number) => `${Math.round(x * 100)}%`;

export function ImprovMeter({ session, target }: { session: ImprovSession; target: number }) {
  const { last, chorus, choruses } = session;
  const best = choruses.reduce((m, c) => Math.max(m, c.score), 0);
  return (
    <div className="meter">
      <div className={cn("meter__last", last && `is-${last.klass}`)}>
        {last
          ? last.klass === "chord"
            ? `Chord tone over ${last.symbol}${last.guide ? ", on the change" : ""}`
            : last.klass === "scale"
              ? `Scale tone over ${last.symbol}`
              : `Outside ${last.symbol}`
          : "Play anything. Chord tones on one and three."}
      </div>
      <dl className="meter__stats">
        <div>
          <dt>In the scale</dt>
          <dd>{pct(chorus.inScale)}</dd>
        </div>
        <div>
          <dt>Chord tones on strong beats</dt>
          <dd>{pct(chorus.strongChordTones)}</dd>
        </div>
        <div>
          <dt>Guide tones on changes</dt>
          <dd>{chorus.guideHits}</dd>
        </div>
        <div>
          <dt>This chorus</dt>
          <dd>{pct(chorus.score)}</dd>
        </div>
        <div>
          <dt>Best chorus</dt>
          <dd className={cn(best >= target && "is-pass")}>{choruses.length ? pct(best) : "-"}</dd>
        </div>
      </dl>
      <p className="meter__hint">
        {pct(target)} on a full chorus marks this done. Choruses so far: {choruses.length}.
      </p>
    </div>
  );
}
