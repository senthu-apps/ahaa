import { LOGO_LETTERS, LOGO_THREAD, LOGO_VIEWBOX } from "./logo-paths";

type LogoMarkProps = {
  size?: number;
  /** Colour behind the mark — used for the over/under knockouts. */
  ground?: string;
  className?: string;
};

/**
 * A 2×2 plain weave: two warp and two weft threads crossing over/under.
 * One weft thread runs in signal orange — the "live" thread.
 */
export function LogoMark({ size = 28, ground = "var(--canvas)", className }: LogoMarkProps) {
  const ink = "var(--ink)";
  const signal = "var(--signal)";
  const w = 3.2;
  const halo = w + 2.6;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      strokeLinecap="round"
    >
      {/* warp (vertical) */}
      <path d="M8 3.5V20.5" stroke={ink} strokeWidth={w} />
      <path d="M16 3.5V20.5" stroke={ink} strokeWidth={w} />
      {/* weft 1 — over both warps */}
      <path d="M3.5 8H20.5" stroke={ground} strokeWidth={halo} />
      <path d="M3.5 8H20.5" stroke={signal} strokeWidth={w} />
      {/* warp 2 back over weft 1 */}
      <path d="M16 5V11" stroke={ground} strokeWidth={halo} strokeLinecap="butt" />
      <path d="M16 4V12" stroke={ink} strokeWidth={w} strokeLinecap="butt" />
      {/* weft 2 — over both warps */}
      <path d="M3.5 16H20.5" stroke={ground} strokeWidth={halo} />
      <path d="M3.5 16H20.5" stroke={ink} strokeWidth={w} />
      {/* warp 1 back over weft 2 */}
      <path d="M8 13V19" stroke={ground} strokeWidth={halo} strokeLinecap="butt" />
      <path d="M8 12V20" stroke={ink} strokeWidth={w} strokeLinecap="butt" />
    </svg>
  );
}

/**
 * The AI Weavers logo: the wordmark, its A crossed by a thread instead of a
 * bar. Traced from the master PNG (scripts/logo). The letters take the text
 * colour, so they read ink on the light bands and light on the dark ones;
 * the thread is always the signal orange.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label="AI Weavers">
      <path d={LOGO_LETTERS} fill="currentColor" fillRule="evenodd" />
      <path d={LOGO_THREAD} fill="var(--signal)" />
    </svg>
  );
}

/** The logo at header size, for the navbar and the footer. */
export function Wordmark({ className }: { className?: string }) {
  return <Logo className={`block h-5 w-auto text-ink ${className ?? ""}`} />;
}
