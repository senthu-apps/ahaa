import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { LogoMark } from "@/components/brand/LogoMark";
import { Check, LiveDot, Spinner } from "@/components/services/demos";
import { COMPANIES, CREW, DIFF } from "./team";

/*
 * Who does the work — card illustrations. Static markup only, and every
 * piece is its END state (what no-JS and reduced-motion visitors see);
 * timelines.ts rewinds and plays them. The panels sit in the dark band,
 * so `ink` is light here; `.ops-light` flips the portfolio sheet back.
 */

/** Avatar grounds — the logo's over/under knockouts need the exact colour behind it. */
const AVATAR = "#26262d";
const NODE = "#1c1c22";

function LeadAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
      style={{ width: size, height: size, background: AVATAR }}
    >
      <LogoMark size={Math.round(size * 0.58)} ground={AVATAR} />
    </span>
  );
}

function OwnerAvatar() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#2d2d35] text-graphite shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="5.6" r="2.7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.8 14c.7-2.7 2.7-4.1 5.2-4.1s4.5 1.4 5.2 4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Portfolio — the studio's companies on a white sheet (real content)  */
/* ------------------------------------------------------------------ */

export function PortfolioSheet() {
  return (
    <div className="relative">
      {/* the stack the sheet sits on */}
      <div aria-hidden data-pf-stack className="absolute inset-x-7 -bottom-[18px] top-8 rounded-[16px] bg-white/25" />
      <div aria-hidden data-pf-stack className="absolute inset-x-3.5 -bottom-[9px] top-4 rounded-[16px] bg-white/50" />

      <div
        data-pf-sheet
        className="ops-light relative overflow-hidden rounded-[16px] bg-surface shadow-[0_30px_60px_-24px_rgb(60_14_0/0.65),0_0_0_1px_rgb(255_255_255/0.6)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
          <p className="text-[0.8125rem] font-semibold text-ink">Scale Shift Ventures</p>
          <p className="text-[0.75rem] tabular-nums text-muted">{COMPANIES.length} companies</p>
        </div>
        <ul aria-label="Companies from the Scale Shift Ventures studio">
          {COMPANIES.map((c) => (
            <li
              key={c.name}
              data-pf-row
              className="border-t border-line px-4 py-3.5 transition-colors first:border-t-0 hover:bg-sunken/70 md:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {/* the wordmark is the name (alt text keeps it for screen readers) */}
                  <h4 className="flex h-7 shrink-0 items-center">
                    <Image
                      src={c.logo.src}
                      alt={c.name}
                      width={c.logo.w}
                      height={c.logo.h}
                      unoptimized={c.logo.src.endsWith(".svg")}
                      sizes={`${Math.ceil((c.logo.size * c.logo.w) / c.logo.h)}px`}
                      className={`w-auto max-w-none ${c.logo.muted ? "brightness-[0.45] contrast-[1.15]" : ""}`}
                      style={{ height: c.logo.size }}
                    />
                  </h4>
                  <span className="rounded-[6px] px-1.5 py-[3px] font-mono text-[0.625rem] leading-none text-graphite shadow-[0_0_0_1px_var(--line-strong)]">
                    {c.tag}
                  </span>
                  {c.builds && (
                    <span
                      data-pf-badge
                      className="inline-flex items-center gap-1 rounded-full bg-ink py-[3px] pl-1.5 pr-2 text-[0.6875rem] font-medium leading-none text-white"
                    >
                      <Check className="size-2.5" color="#fff" weight={2.2} />
                      Builds your work
                    </span>
                  )}
                </div>
                <p className="mt-1 text-pretty text-[0.8125rem] leading-[1.5] text-graphite">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Your lead — a direct thread                                         */
/* ------------------------------------------------------------------ */

function Msg({
  who,
  time,
  meta,
  children,
}: {
  who: "you" | "lead";
  time: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li data-th-msg className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-t border-line py-3.5 pl-4 pr-8 first:border-t-0 md:pl-5">
      {who === "lead" ? <LeadAvatar /> : <OwnerAvatar />}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] leading-[1.75rem]">
          <span className="font-semibold text-ink">{who === "lead" ? "Your lead" : "You"}</span>
          <span className="text-muted">{time}</span>
          {meta}
        </p>
        <div className="text-pretty text-[0.8125rem] leading-[1.55] text-graphite">{children}</div>
      </div>
    </li>
  );
}

export function ThreadPanel() {
  return (
    // fills the card's stage like a chat window: newest messages sit down by the composer
    <div data-th-panel className="ops-panel -mr-4 ml-5 mt-5 flex flex-1 flex-col overflow-hidden rounded-l-[14px] md:ml-8 md:mt-8">
      <div className="flex items-center gap-2 border-b border-line py-3 pl-4 pr-8 text-[0.8125rem] md:pl-5">
        <span className="font-semibold text-ink">Direct line</span>
        <span className="truncate text-muted">you and your lead</span>
        <span className="ml-auto shrink-0 text-[0.6875rem] text-muted">Sample data</span>
      </div>
      <p className="mt-auto flex items-center gap-3 px-4 pb-1 pt-4 text-[0.6875rem] text-muted md:px-5">
        <span className="h-px flex-1 bg-line" />
        Tuesday
        <span className="h-px flex-1 bg-line" />
      </p>
      <ul>
        <Msg who="you" time="9:14 AM">
          Can we get invoice reminders going before month-end?
        </Msg>
        <Msg
          who="lead"
          time="9:18 AM"
          meta={
            <span
              data-th-fast
              className="rounded-full px-2 py-[3px] text-[0.6875rem] font-medium leading-none text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]"
            >
              Replied in 4 min
            </span>
          }
        >
          <span className="relative block">
            <span data-th-reply className="block">
              Yes. It&rsquo;s already on your Automation Map and priced. I&rsquo;ll have it live by Thursday.
            </span>
            {/* typing indicator — the end state has already replied */}
            <span data-th-typing aria-hidden className="invisible absolute left-0 top-1 flex gap-1 opacity-0">
              {[0, 1, 2].map((i) => (
                <span key={i} data-th-dot className="size-1.5 rounded-full bg-graphite" />
              ))}
            </span>
          </span>
        </Msg>
        <Msg who="lead" time="Thu 4:02 PM">
          Live. The first reminders went out this afternoon.
          <span
            data-th-attach
            className="mt-2.5 flex w-fit items-center gap-2.5 rounded-[10px] bg-sunken py-2 pl-3 pr-3.5 shadow-[inset_0_0_0_1px_var(--line)]"
          >
            <LiveDot />
            <span className="text-[0.75rem] font-medium text-ink">Invoice reminders</span>
            <span className="font-mono text-[0.625rem] text-graphite">Running</span>
          </span>
        </Msg>
      </ul>
      <div
        data-th-composer
        className="mb-4 ml-4 mr-8 flex items-center justify-between gap-3 rounded-[10px] py-2.5 pl-3.5 pr-2.5 text-[0.8125rem] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)] md:ml-5"
      >
        Reply to your lead…
        <span className="grid size-6 place-items-center rounded-[7px] bg-sunken text-graphite">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 10V2.5M2.8 5.5 6 2.3l3.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Behind your lead — the studio crew in orbit                         */
/* ------------------------------------------------------------------ */

function RoleGlyph({ kind }: { kind: "code" | "design" }) {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {kind === "code" ? (
        <path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M3 12.5C4.5 6 11.5 6 13 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="6.6" y="2.6" width="2.8" height="2.8" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 5.4v2.4" stroke="currentColor" strokeWidth="1.3" />
        </>
      )}
    </svg>
  );
}

const RINGS = [0.44, 1, 1.62, 2.3];

export function CrewOrbit() {
  return (
    <div className="ops-orbit relative h-[18rem] overflow-hidden md:h-[21rem] lg:h-full lg:min-h-[19rem]">
      {RINGS.map((k) => (
        <span key={k} data-crew-ring aria-hidden className="ops-ring" style={{ "--k": k } as CSSProperties} />
      ))}

      {/* the orbit turns (script); spokes, travelling work and chips ride with it */}
      <div data-orbit aria-hidden className="absolute left-1/2 top-1/2 size-0">
        {CREW.map((c) => (
          <div key={c.role} className="ops-spoke" style={{ "--a": `${c.angle}deg` } as CSSProperties}>
            <span data-crew-line className="ops-spoke-line" />
            <span data-crew-travel className="ops-travel" />
            <span className="ops-tip">
              <span data-crew-upright className="absolute left-0 top-0 size-0">
                <span
                  data-crew-chip
                  className="absolute left-0 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#1c1c22] py-1 pl-1 pr-2.5 text-[0.6875rem] font-medium text-ink shadow-[inset_0_0_0_1px_rgb(255_255_255/0.11),0_10px_24px_-10px_rgb(0_0_0/0.9)] md:gap-2 md:pr-3 md:text-[0.75rem]"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-[#2a2a31] text-graphite md:size-[22px]">
                    <RoleGlyph kind={c.kind} />
                  </span>
                  {c.role}
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* the lead, at the centre of it all */}
      <div aria-hidden className="absolute left-1/2 top-1/2">
        <span
          data-crew-node
          className="absolute left-0 top-0 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14),0_0_0_6px_rgb(255_255_255/0.03),0_14px_30px_-10px_rgb(0_0_0/0.9)] md:size-16"
          style={{ background: NODE }}
        >
          <LogoMark size={28} ground={NODE} className="size-[22px] md:size-7" />
        </span>
        <span
          data-crew-label
          className="absolute left-0 top-[2rem] -translate-x-1/2 md:top-[2.6rem] whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[0.6875rem] font-semibold leading-none text-[#0a0a0c]"
        >
          Your lead
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reviewed by people — an AI-drafted change, read and approved        */
/* ------------------------------------------------------------------ */

const CHIP = "col-start-1 row-start-1 inline-flex items-center gap-1.5 justify-self-end whitespace-nowrap rounded-full px-2 py-1 text-[0.6875rem] font-medium leading-none";
const HIDDEN = "invisible opacity-0";

const ACTIONS = [
  { label: "Approve change", key: "A", icon: <Check className="size-3" weight={1.8} /> },
  {
    label: "Request edits",
    key: "E",
    icon: (
      <svg className="size-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 11.5 3 9l6-6 2 2-6 6-2.5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Decline",
    key: "D",
    icon: (
      <svg className="size-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="m4 4 6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function ReviewPanel() {
  return (
    <div data-rv-panel className="ops-panel relative -mr-4 ml-5 mt-5 overflow-hidden rounded-l-[14px] md:ml-8 md:mt-8">
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b border-line py-2.5 pl-4 pr-8 md:pl-5">
        <span aria-hidden className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-white/[0.12]" />
          ))}
        </span>
        <span className="truncate text-[0.8125rem] font-semibold text-ink">Invoice reminders</span>
        <span className="hidden font-mono text-[0.625rem] text-muted sm:inline">change 14</span>
        <span className="ml-auto grid">
          <span data-rv-status="draft" className={`${CHIP} ${HIDDEN} text-graphite shadow-[inset_0_0_0_1px_var(--line-strong)]`}>
            <Spinner className="size-3" />
            AI drafting
          </span>
          <span data-rv-status="review" className={`${CHIP} ${HIDDEN} text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]`}>
            <span className="size-1.5 rounded-full bg-graphite" />
            Needs review
          </span>
          <span data-rv-status="approved" className={`${CHIP} bg-signal-soft text-signal-deep`}>
            <Check className="size-2.5" weight={2.2} />
            Approved
          </span>
        </span>
      </div>

      {/* who did what */}
      <div className="flex items-center gap-x-4 border-b border-line py-2 pl-4 pr-8 text-[0.75rem] text-graphite md:pl-5">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.5 9.4 6.6 14.5 8l-5.1 1.4L8 14.5 6.6 9.4 1.5 8l5.1-1.4L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          Drafted by AI in 38s
        </span>
        <span className="flex items-center gap-1.5">
          <LeadAvatar size={16} />
          Reviewer: your lead
        </span>
        <span className="ml-auto hidden text-[0.6875rem] text-muted sm:inline">Sample data</span>
      </div>

      {/* the diff */}
      <ol className="py-2.5 font-mono text-[0.6875rem] leading-none">
        {DIFF.map(([sign, key, value], i) => (
          <li
            key={i}
            data-rv-line
            className={`grid grid-cols-[1.25rem_1rem_0.75rem_minmax(0,1fr)] items-center gap-x-2 py-[7px] pl-4 pr-8 md:pl-5 ${
              sign === "+" ? "bg-white/[0.035]" : ""
            }`}
          >
            <span className="text-right text-muted">{i + 1}</span>
            <span data-rv-tick className="grid size-4 place-items-center rounded-full bg-white/[0.08] text-graphite">
              <Check className="size-2" weight={2.4} />
            </span>
            <span className={sign === "+" ? "text-ink" : "text-muted"}>{sign}</span>
            <span className={`truncate ${sign === "-" ? "text-muted line-through decoration-white/25" : "text-graphite"}`}>
              <span className={sign === "-" ? "" : "text-ink"}>{key}:</span> {value}
            </span>
          </li>
        ))}
      </ol>

      {/* the call is a person's: the review menu, approve picked
          (phones: it drops in under the diff instead of covering it) */}
      <div data-rv-pop className="ops-pop relative mb-4 ml-auto mr-8 w-[13.25rem] rounded-[12px] p-1.5 sm:absolute sm:right-8 sm:top-[6.4rem] sm:m-0 md:top-[6.9rem]">
        <p className="px-2.5 pb-2 pt-1.5 text-[0.6875rem] text-muted">Your lead decides</p>
        <ul className="relative">
          {ACTIONS.map((a, i) => (
            <li
              key={a.label}
              data-rv-approve={i === 0 || undefined}
              className={`relative flex h-8 items-center gap-2.5 rounded-[8px] px-2.5 text-[0.8125rem] ${
                i === 0 ? "bg-white/[0.08] text-ink" : "text-graphite"
              }`}
            >
              <span className={i === 0 ? "text-signal" : "text-muted"}>{a.icon}</span>
              {a.label}
              <kbd className="ml-auto grid size-[18px] place-items-center rounded-[5px] font-mono text-[0.5625rem] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)]">
                {a.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
