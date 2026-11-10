const ITEMS = [
  "Fixed price per project",
  "Flat monthly retainer",
  "You own your data and the work",
  "Month to month after three months",
];

/** Icon badge in the reference's style: hairline ring with a short signal arc. */
function CheckBadge() {
  return (
    <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong),0_4px_10px_-6px_rgb(22_22_27/0.2)]">
      <svg className="absolute inset-0" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle
          className="badge-arc"
          cx="18"
          cy="18"
          r="17.5"
          stroke="var(--signal)"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="22 100"
          transform="rotate(-120 18 18)"
        />
      </svg>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 7.4L5.8 10L11 4.2" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Guarantees() {
  return (
    <ul aria-label="What you can count on" className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map((item) => (
        <li key={item} data-guarantee className="flex items-center gap-3.5 bg-surface px-5 py-5 md:px-6">
          <CheckBadge />
          <span className="text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
