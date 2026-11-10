/**
 * A single stitch: the orange thread passes over the cloth between two
 * needle holes; its underside is the dashed line beneath. Used as the
 * ticker separator and as the eyebrow mark on section headers.
 * The `.stitch-thread` path can be drawn in with anime.js createDrawable.
 */
export function Stitch({ className = "h-[1.1em] w-[1.4em]" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 40 32" fill="none" aria-hidden="true">
      <path
        d="M7 22C15 26 26 21 33 11"
        stroke="var(--line-strong)"
        strokeWidth="1.5"
        strokeDasharray="2 3.6"
        strokeLinecap="round"
      />
      <path className="stitch-thread" d="M7 22C11 10 23 6.5 33 11" stroke="var(--signal)" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="7" cy="22" r="2.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.4" />
      <circle cx="33" cy="11" r="2.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.4" />
    </svg>
  );
}
