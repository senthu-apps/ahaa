import { LogoMark } from "@/components/brand/LogoMark";
import { Check, LiveDot, Spinner } from "@/components/services/demos";

/*
 * How it works — one animated card per step, following one sample project
 * from the first call to the retainer. Static markup only: the rendered HTML
 * is each card's END state (what no-JS and reduced-motion visitors see);
 * cardTimelines.ts rewinds and plays them.
 */

/** The sample project carried through every card. */
const PROJECT = "Sync data between systems";

function Cursor() {
  return (
    <svg
      data-hc-cursor
      className="pointer-events-none invisible absolute left-0 top-0 z-[2] h-[22px] w-[18px] origin-top-left opacity-0"
      viewBox="0 0 20 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 2.2 16.4 14l-5.6.7 3.4 6.8-2.7 1.3-3.3-6.9-4.1 4V2.2Z"
        fill="#fff"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A number that counts up from 0 when its card plays. Renders the final value. */
function Num({ to }: { to: number }) {
  return (
    <span data-n data-to={to} className="tabular-nums">
      {to}
    </span>
  );
}

const panel = "rounded-[10px] bg-sunken/70 shadow-[inset_0_0_0_1px_var(--line)]";
const chip = "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[0.6875rem] font-semibold leading-none";

/* ------------------------------------------------------------------ */
/* 01 · Weave Session — book the call, find the three biggest time sinks */
/* ------------------------------------------------------------------ */

const SLOTS: [string, string[]][] = [
  ["Tue", ["9:30", "13:00"]],
  ["Wed", ["10:30", "15:00"]],
  ["Thu", ["11:00", "16:30"]],
];
const BOOKED = "Wed 10:30";
const SINKS: [string, number][] = [
  ["Retyping data between systems", 8],
  ["Chasing invoices", 6],
  ["Answering the same questions", 5],
];

export function SessionCard() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold text-ink">Pick a time</p>
        <span className={`${chip} bg-sunken text-graphite shadow-[inset_0_0_0_1px_var(--line)]`}>30 min, free</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {SLOTS.map(([day, times]) => (
          <div key={day}>
            <p className="mb-1.5 text-[0.6875rem] font-medium text-muted">{day}</p>
            <div className="grid gap-1.5">
              {times.map((t) => {
                const booked = `${day} ${t}` === BOOKED;
                return (
                  <span
                    key={t}
                    data-ws-slot
                    data-ws-target={booked || undefined}
                    className="relative grid h-8 place-items-center rounded-[8px] bg-surface text-[0.75rem] font-medium tabular-nums text-ink shadow-[0_0_0_1px_var(--line-strong)]"
                  >
                    {t}
                    {booked && (
                      <span
                        data-ws-on
                        className="absolute inset-0 flex items-center justify-center gap-1 rounded-[8px] bg-ink text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16)]"
                      >
                        <Check className="size-2.5" color="#fff" />
                        {t}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div data-ws-call>
        <p className="mt-4 flex items-center gap-2 text-[0.6875rem] font-medium text-muted">
          On the call
          <span className="h-px flex-1 bg-line" />
        </p>
        <p className="mt-2 text-[0.8125rem] font-semibold text-ink">Your three biggest time sinks</p>
      </div>
      <ol className="mt-2 grid gap-1">
        {SINKS.map(([label, hrs], i) => (
          <li
            key={label}
            data-ws-sink
            className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 ${i === 0 ? "bg-signal-soft" : ""}`}
          >
            <span className="w-3 shrink-0 text-[0.6875rem] font-semibold tabular-nums text-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 text-pretty text-[0.8125rem] leading-snug text-ink">{label}</span>
            {i === 0 && (
              <span data-ws-first className={`${chip} shrink-0 bg-signal text-white`}>
                Build first
              </span>
            )}
            <span className="shrink-0 text-[0.75rem] font-semibold text-ink">
              <Num to={hrs} /> hrs/wk
            </span>
          </li>
        ))}
      </ol>
      <Cursor />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 · Automation Map — the projects, ranked by hours saved, each priced */
/* ------------------------------------------------------------------ */

const PROJECTS: [string, number, string][] = [
  [PROJECT, 6, "$4,500"],
  ["Invoice reminders", 5, "$3,000"],
  ["Client question agent", 4, "$6,000"],
];
const MOST = PROJECTS[0][1];

export function MapCard() {
  return (
    <div>
      <div data-map-head className="flex items-baseline justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold text-ink">Ranked by hours saved</p>
        <p className="text-[0.6875rem] text-muted">Fixed price</p>
      </div>
      <ol className="mt-3 grid gap-2">
        {PROJECTS.map(([name, hrs, price], i) => (
          <li
            key={name}
            data-map-row
            className="relative grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[10px] bg-[#f4f4f6] px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]"
          >
            <span data-map-rank className="text-[0.75rem] font-semibold tabular-nums text-ink">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] font-medium text-ink">{name}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-[5px] flex-1 rounded-full bg-line">
                  <span data-map-bar className="block h-full origin-left rounded-full bg-ink" style={{ width: `${(hrs / MOST) * 100}%` }} />
                </span>
                <span className="w-[3.25rem] shrink-0 text-right text-[0.6875rem] tabular-nums text-graphite">{hrs} hrs/wk</span>
              </div>
            </div>
            <span
              data-map-price
              className="rounded-[7px] bg-surface px-2 py-1 text-[0.75rem] font-semibold tabular-nums text-ink shadow-[0_0_0_1px_var(--line-strong)]"
            >
              {price}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
        {["Fixed price for each project", "Yours to keep"].map((t) => (
          <span key={t} data-map-foot className="flex items-center gap-1.5 text-[0.75rem] text-graphite">
            <Check color="var(--ink)" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 · First project — approve, half the fee starts it, a lead is assigned */
/* ------------------------------------------------------------------ */

export function ApproveCard() {
  return (
    <div className="relative">
      <div data-ap-row>
        <p className="text-[0.6875rem] font-medium text-muted">Project 1 of 3</p>
        <p className="mt-0.5 text-[1rem] font-semibold tracking-[-0.02em] text-ink">{PROJECT}</p>
      </div>
      <dl className="mt-3 text-[0.8125rem]">
        {[
          ["Fixed price", "$4,500"],
          ["Half to start the build", "$2,250"],
        ].map(([k, v]) => (
          <div key={k} data-ap-row className="flex justify-between border-t border-line py-2">
            <dt className="text-graphite">{k}</dt>
            <dd className="font-semibold tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <span
        data-ap-btn
        className="mt-2 grid h-10 place-items-center rounded-[11px] bg-signal text-[0.8125rem] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_0_0_1px_var(--signal-deep)]"
      >
        <span data-ap-a className="invisible col-start-1 row-start-1 opacity-0">
          Approve and start
        </span>
        <span data-ap-b className="col-start-1 row-start-1 flex items-center gap-1.5">
          <Check className="size-3" color="#fff" weight={2.2} />
          Approved
        </span>
      </span>

      <div data-ap-lead className={`mt-4 flex items-center gap-3 p-3 ${panel}`}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
          <LogoMark size={14} ground="#ffffff" />
        </span>
        <p className="min-w-0 flex-1 text-[0.8125rem] font-semibold text-ink">Your lead</p>
        <span data-ap-assigned className={`${chip} bg-ink text-white`}>
          <Check className="size-2" color="#fff" weight={2.4} />
          Assigned
        </span>
      </div>
      <div data-ap-build className={`mt-2 p-3 ${panel}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink">
            <Spinner className="size-3.5" />
            Build started
          </p>
          <span className="text-[0.6875rem] font-medium text-graphite">This week</span>
        </div>
        <span className="mt-2.5 block h-[5px] rounded-full bg-line">
          <span data-ap-bar className="block h-full w-[22%] origin-left rounded-full bg-signal" />
        </span>
      </div>
      <Cursor />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 · Launch — built, tested, launched; it switches on; retainer starts */
/* ------------------------------------------------------------------ */

const CHECKS = ["Built", "Tested with your team", "Launched"];

export function LaunchCard() {
  return (
    <div>
      <ol className="relative">
        <span aria-hidden className="absolute bottom-[18px] left-[11px] top-[18px] w-px bg-line-strong" />
        <span aria-hidden data-lc-line className="absolute bottom-[18px] left-[10.5px] top-[18px] w-[2px] origin-top rounded-full bg-ink" />
        {CHECKS.map((c) => (
          <li key={c} data-lc-step className="relative flex items-center gap-3 py-1.5">
            <span className="relative grid size-[22px] shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
              <span data-lc-spin className="absolute inset-0 grid place-items-center opacity-0">
                <Spinner className="size-3" />
              </span>
              <span data-lc-done className="absolute inset-0 grid place-items-center rounded-full bg-ink">
                <Check className="size-2.5" color="#fff" />
              </span>
            </span>
            <span data-lc-label className="text-[0.8125rem] font-medium text-ink">
              {c}
            </span>
          </li>
        ))}
      </ol>

      <div data-lc-switchrow className="mt-3 flex items-center gap-3 rounded-[12px] bg-surface p-3 shadow-[0_0_0_1px_var(--line-strong),0_10px_22px_-16px_rgb(22_22_27/0.4)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-semibold text-ink">{PROJECT}</p>
          <p data-lc-live className="mt-1 flex items-center gap-1.5 text-[0.6875rem] font-semibold text-signal-deep">
            <LiveDot />
            Live
          </p>
        </div>
        <span data-lc-track className="relative h-5 w-9 shrink-0 rounded-full bg-signal">
          <span
            data-lc-knob
            className="absolute left-0.5 top-0.5 size-4 rounded-full bg-surface shadow-[0_1px_3px_rgb(22_22_27/0.3)]"
            style={{ transform: "translateX(16px)" }}
          />
        </span>
      </div>

      <dl className="mt-3 text-[0.8125rem]">
        {[
          ["Second half of the setup fee", "$2,250"],
          ["Monthly retainer", "Starts today"],
        ].map(([k, v]) => (
          <div key={k} data-lc-ledger className="flex justify-between gap-3 border-t border-line py-2">
            <dt className="text-graphite">{k}</dt>
            <dd className="font-semibold tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 05 · Retainer — monitored, fixed, improved; the next thing gets a quote */
/* ------------------------------------------------------------------ */

export const CELLS = 28;
export const FAULT = 18;
const LOG: [string, string][] = [
  ["A failed step caught and fixed", "Fix"],
  ["Small improvements made", "Improve"],
  ["Monthly hours-saved report sent", "Report"],
];

export function RetainerCard() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[0.8125rem] font-semibold text-ink">{PROJECT}</p>
        <span className="flex shrink-0 items-center gap-1.5 text-[0.6875rem] font-semibold text-signal-deep">
          <LiveDot />
          Running
        </span>
      </div>
      <p className="mt-0.5 text-[0.6875rem] text-muted">Hosted and monitored</p>

      {/* monitoring checks, oldest to newest; one failed and was fixed */}
      <div className="relative mt-3.5 flex h-5 items-end gap-[3px]">
        {Array.from({ length: CELLS }, (_, i) => (
          <span key={i} data-rt-cell className="relative h-full flex-1 rounded-[2px] bg-graphite">
            {i === FAULT && (
              <span data-rt-mark className="absolute -top-1.5 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-signal" />
            )}
          </span>
        ))}
      </div>

      <ul className="mt-3 grid gap-1.5">
        {LOG.map(([text, tag]) => (
          <li key={text} data-rt-log className="flex items-center gap-2.5 text-[0.8125rem] text-ink">
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-ink">
              <Check className="size-2.5" color="#fff" />
            </span>
            <span className="min-w-0 flex-1 truncate">{text}</span>
            <span className="shrink-0 rounded-[6px] px-1.5 py-[3px] font-mono text-[0.625rem] leading-none text-graphite shadow-[0_0_0_1px_var(--line-strong)]">
              {tag}
            </span>
          </li>
        ))}
      </ul>

      <div
        data-rt-next
        className="mt-4 flex items-center gap-3 rounded-[11px] border border-dashed border-line-strong bg-surface/60 px-3 py-2.5"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-medium text-muted">Next thing to fix</p>
          <p className="truncate text-[0.8125rem] font-semibold text-ink">Invoice reminders</p>
        </div>
        <span className={`${chip} shrink-0 bg-sunken text-ink shadow-[inset_0_0_0_1px_var(--line-strong)]`}>Its own quote</span>
      </div>
    </div>
  );
}

export const CARDS = [SessionCard, MapCard, ApproveCard, LaunchCard, RetainerCard];
