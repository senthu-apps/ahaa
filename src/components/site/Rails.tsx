/**
 * Page structure lines (blueprint layer).
 *
 * - <Rails/>     two vertical hairlines running the full page height on the
 *                edges of the 1192px content column.
 * - <Rule/>      a full-bleed horizontal hairline with crosshairs where it
 *                meets the rails. Place it inside a column container
 *                (max-w-[1240px] md:px-6) so its own edges ARE the rails.
 * - <RailMarks/> crosshairs only, for full-width bands that already draw
 *                their own top/bottom border.
 *
 * Rails and crosshairs show from md up; on phones the column has no margin.
 */

const COLUMN = "w-[min(100%_-_48px,1192px)]";

export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none size-[11px] ${className}`} viewBox="0 0 11 11" fill="none">
      <path d="M5.5 0v11M0 5.5h11" stroke="var(--muted)" strokeOpacity="0.75" strokeWidth="1" />
    </svg>
  );
}

export function Rails() {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-x border-rail md:block ${COLUMN}`}
    />
  );
}

/** Full-bleed hairline + crosshairs. Pass the positioning (relative/absolute …) via className. */
export function Rule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none h-px ${className}`}>
      <span className="absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-rail" />
      <Cross className="absolute left-0 top-[0.5px] hidden -translate-x-1/2 -translate-y-1/2 md:block" />
      <Cross className="absolute right-0 top-[0.5px] hidden -translate-y-1/2 translate-x-1/2 md:block" />
    </div>
  );
}

/** Crosshairs on the rails along the top or bottom edge of a full-width band. */
export function RailMarks({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-[1] hidden md:block ${edge === "top" ? "-top-px" : "-bottom-px"}`}
    >
      <div className={`relative mx-auto ${COLUMN}`}>
        <Cross className="absolute left-0 top-[0.5px] -translate-x-1/2 -translate-y-1/2" />
        <Cross className="absolute right-0 top-[0.5px] -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
}
