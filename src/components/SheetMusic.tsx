"use client";

// The right hand on a staff, four bars to a line, with the chord symbols over
// it: a lead sheet. The note under the music is lit, so the eye learns to find
// on paper what the ear is hearing. Drawn as plain SVG; a lead sheet line is a
// small enough subset of notation not to need an engraving library.

import { memo, useMemo, useState } from "react";
import type { Lesson } from "@/lib/lessons/types";
import { sheetOf, type Sheet, type StaffEvent } from "@/lib/lessons/notation";
import { cn } from "@/lib/utils";
import { LeadSheet } from "./LeadSheet";

const BARS_PER_ROW = 4;
const WIDTH = 1000;
const CLEF = 46;
const BAR = (WIDTH - CLEF - 2) / BARS_PER_ROW;
/** Half the distance between two staff lines: one diatonic step. */
const HALF = 6;
/** E4, the bottom line. */
const BOTTOM_STEP = 30;
const STEM = 36;

function Note({ event, x, yOf, active }: { event: StaffEvent; x: number; yOf: (step: number) => number; active: boolean }) {
  const steps = event.notes.map((n) => n.step);
  const low = Math.min(...steps);
  const high = Math.max(...steps);
  // Above the middle line the stem hangs down on the left, as engraved.
  const up = (low + high) / 2 < BOTTOM_STEP + 4;
  const hollow = event.glyph === "whole" || event.glyph === "half";
  const flags = event.glyph === "eighth" ? 1 : event.glyph === "sixteenth" ? 2 : 0;
  const stemX = up ? x + 6.7 : x - 6.7;
  const tip = up ? yOf(high) - STEM : yOf(low) + STEM;

  const ledgers: number[] = [];
  for (let s = BOTTOM_STEP - 2; s >= low; s -= 2) ledgers.push(s);
  for (let s = BOTTOM_STEP + 10; s <= high; s += 2) ledgers.push(s);

  return (
    <g className={cn("sheet__note", active && "is-active")}>
      {ledgers.map((s) => (
        <line key={s} className="sheet__line" x1={x - 10} x2={x + 10} y1={yOf(s)} y2={yOf(s)} />
      ))}
      {event.notes.map((n) => (
        <g key={n.midi}>
          {n.sign && (
            <text className="sheet__sign" x={x - 20} y={yOf(n.step) + 7} textAnchor="middle">
              {n.sign === "#" ? "♯" : n.sign === "b" ? "♭" : "♮"}
            </text>
          )}
          <ellipse
            className={hollow ? "sheet__head is-hollow" : "sheet__head"}
            cx={x}
            cy={yOf(n.step)}
            rx={7.4}
            ry={5.2}
            transform={`rotate(-20 ${x} ${yOf(n.step)})`}
          />
          {event.dotted && <circle className="sheet__dot" cx={x + 13} cy={yOf(n.step) - (n.step % 2 === 0 ? HALF : 0)} r={1.7} />}
        </g>
      ))}
      {event.glyph !== "whole" && (
        <line className="sheet__stem" x1={stemX} x2={stemX} y1={up ? yOf(low) : yOf(high)} y2={tip} />
      )}
      {Array.from({ length: flags }, (_, k) => {
        const y = tip + (up ? 1 : -1) * k * 7;
        const d = up ? `M${stemX} ${y} q 9 7 6 19` : `M${stemX} ${y} q 9 -7 6 -19`;
        return <path key={k} className="sheet__flag" d={d} />;
      })}
    </g>
  );
}

/** Enter and Space press a bar the way a click does. */
function onPress(run: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    run();
  };
}

function Row({
  sheet,
  row,
  activeIndex,
  yOf,
  height,
  onBar,
}: {
  sheet: Sheet;
  row: number;
  activeIndex: number;
  yOf: (step: number) => number;
  height: number;
  onBar?: (bar: number) => void;
}) {
  const first = row * BARS_PER_ROW;
  const count = Math.min(BARS_PER_ROW, sheet.bars - first);
  const barX = (bar: number) => CLEF + (bar - first) * BAR;
  const xOf = (bar: number, pos: number) => barX(bar) + 20 + (pos / sheet.beatsPerBar) * (BAR - 32);
  const inRow = (bar: number) => bar >= first && bar < first + count;
  const activeBar = activeIndex >= 0 ? sheet.barOfStep[activeIndex] : -1;
  const events = sheet.events.filter((e) => inRow(e.bar));
  const top = yOf(BOTTOM_STEP + 8);
  const bottom = yOf(BOTTOM_STEP);

  return (
    <svg className="sheet__row" viewBox={`0 0 ${WIDTH} ${height}`} role={onBar ? "group" : "img"} aria-label={`Bars ${first + 1} to ${first + count}`}>
      {inRow(activeBar) && <rect className="sheet__now" x={barX(activeBar)} y={top - 8} width={BAR} height={bottom - top + 16} />}
      {[0, 2, 4, 6, 8].map((s) => (
        <line key={s} className="sheet__line" x1={0} x2={CLEF + count * BAR} y1={yOf(BOTTOM_STEP + s)} y2={yOf(BOTTOM_STEP + s)} />
      ))}
      {/* The G clef curls round the G line, second from the bottom. */}
      <text className="sheet__clef" x={6} y={yOf(BOTTOM_STEP) + 2}>
        {"\u{1D11E}"}
      </text>
      {Array.from({ length: count + 1 }, (_, k) => (
        <line
          key={k}
          className={cn("sheet__barline", sheet.pickup && first === 0 && k === 1 && "is-pickup")}
          x1={CLEF + k * BAR}
          x2={CLEF + k * BAR}
          y1={top}
          y2={bottom}
        />
      ))}
      {sheet.chords.filter((c) => inRow(c.bar)).map((c, k) => (
        <text key={k} className="sheet__chord" x={xOf(c.bar, c.pos) - 8} y={16}>
          {c.symbol}
        </text>
      ))}
      {Array.from({ length: count }, (_, k) => first + k)
        .filter((bar) => !(sheet.pickup && bar === 0) && !events.some((e) => e.bar === bar))
        .map((bar) => (
          // A bar with nothing in it for the right hand: a whole rest.
          <rect key={bar} className="sheet__rest" x={barX(bar) + BAR / 2 - 7} y={yOf(BOTTOM_STEP + 6)} width={14} height={HALF} />
        ))}
      {events.map((e, k) => {
        const x = xOf(e.bar, e.pos);
        const next = e.tied ? sheet.events[sheet.events.indexOf(e) + 1] : undefined;
        // A tie into the next line just runs off the end of this one.
        const x2 = next && inRow(next.bar) ? xOf(next.bar, next.pos) : CLEF + count * BAR;
        return (
          <g key={k}>
            <Note event={e} x={x} yOf={yOf} active={activeIndex >= e.fromStep && activeIndex < e.toStep} />
            {next &&
              e.notes.map((n) => (
                <path key={n.midi} className="sheet__tie" d={`M${x + 7} ${yOf(n.step) + 8} Q ${(x + x2) / 2} ${yOf(n.step) + 18} ${x2 - 7} ${yOf(n.step) + 8}`} />
              ))}
          </g>
        );
      })}
      {onBar &&
        Array.from({ length: count }, (_, k) => first + k).map((bar) => (
          // On top of everything, so a click anywhere in the bar lands here.
          <rect
            key={bar}
            className="sheet__hit"
            x={barX(bar)}
            y={0}
            width={BAR}
            height={height}
            role="button"
            tabIndex={0}
            aria-label={sheet.pickup && bar === 0 ? "Play the pickup" : `Play bar ${sheet.pickup ? bar : bar + 1}`}
            onClick={() => onBar(bar)}
            onKeyDown={onPress(() => onBar(bar))}
          />
        ))}
    </svg>
  );
}

function SheetMusicImpl({ lesson, activeIndex, onBar }: { lesson: Lesson; activeIndex: number; onBar?: (bar: number) => void }) {
  const sheet = useMemo(() => sheetOf(lesson), [lesson]);
  const [view, setView] = useState<"line" | "all">("line");
  // A left hand alone is comping, and comping is read from a chord chart.
  if (!sheet) return lesson.harmony ? <LeadSheet lesson={lesson} activeIndex={activeIndex} onBar={onBar} /> : null;

  // Room for the chord symbols and the highest note above, the lowest below.
  // Stems need none of their own: they point towards the middle of the staff.
  const steps = sheet.events.flatMap((e) => e.notes.map((n) => n.step));
  const above = Math.max(0, Math.max(...steps) - (BOTTOM_STEP + 8)) * HALF;
  const below = Math.max(0, BOTTOM_STEP - Math.min(...steps)) * HALF;
  const staffTop = 34 + above;
  const yOf = (step: number) => staffTop + 8 * HALF - (step - BOTTOM_STEP) * HALF;
  const height = staffTop + 8 * HALF + below + 22;

  const rows = Math.ceil(sheet.bars / BARS_PER_ROW);
  // One line at a time follows the music, so the staff, the chord panel and
  // the keyboard all stay on one screen. Before it starts, that is line one.
  const current = activeIndex >= 0 ? Math.floor(sheet.barOfStep[activeIndex] / BARS_PER_ROW) : 0;
  const shown = view === "line" ? [Math.min(current, rows - 1)] : Array.from({ length: rows }, (_, row) => row);

  return (
    <div className="sheet" aria-label="Sheet music">
      {rows > 1 && (
        <div className="keypick sheet__view">
          <span className="keypick__caption">Score</span>
          <div className="keypick__chips" role="radiogroup" aria-label="Score view">
            {(["line", "all"] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                role="radio"
                aria-checked={view === choice}
                className={cn("keypick__chip", view === choice && "is-on")}
                onClick={() => setView(choice)}
              >
                {choice === "line" ? "One line" : "Whole tune"}
              </button>
            ))}
          </div>
          {view === "line" && (
            <span className="keypick__meta">
              Line {shown[0] + 1} of {rows}
            </span>
          )}
        </div>
      )}
      {shown.map((row) => (
        <Row key={row} sheet={sheet} row={row} activeIndex={activeIndex} yOf={yOf} height={height} onBar={onBar} />
      ))}
    </div>
  );
}

export const SheetMusic = memo(SheetMusicImpl);
