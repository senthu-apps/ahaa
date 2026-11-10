/**
 * A plain-weave knot: two ink warps and two orange wefts, interlaced, each
 * thread going over then under. Used as the ticker separator and as the
 * eyebrow mark on section headers.
 * The `.stitch-thread` paths (the wefts) can be drawn in with anime.js
 * createDrawable: the first runs left to right, the second comes back like a
 * shuttle, filling the openings left for it in the warps.
 */
export function Stitch({ className = "h-[1.1em] w-[1.4em]" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 40 32" fill="none" aria-hidden="true">
      {/* warps, parted where a weft crosses over them */}
      <path
        d="M15 4.5v1.9M15 15.6v11.9M25 4.5v11.9M25 25.6v1.9"
        stroke="var(--ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* wefts */}
      <path className="stitch-thread" d="M7 11h26" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" />
      <path className="stitch-thread" d="M33 21H7" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" />
      {/* where a warp crosses over: a collar of ground parts the weft, the warp lies on top */}
      <path d="M25 8.5v5M15 18.5v5" stroke="var(--canvas)" strokeWidth="6.2" />
      <path d="M25 7.5v7M15 17.5v7" stroke="var(--ink)" strokeWidth="2.6" />
    </svg>
  );
}
