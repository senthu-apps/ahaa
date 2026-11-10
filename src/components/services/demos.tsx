import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";

/*
 * Service demos — static markup only. The rendered HTML is each demo's END
 * state (what no-JS and reduced-motion visitors see); timelines.ts rewinds
 * and plays them. Copy is verbatim from aiweavers.com.
 */

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

export function Check({ className = "size-2.5", color = "currentColor", weight = 2 }: { className?: string; color?: string; weight?: number }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.4 5.8 10 11 4.2" stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Spinner({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={`wb-spin ${className}`} viewBox="-8 -8 16 16" fill="none" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="-6.5"
          x2="0"
          y2="-3.4"
          stroke="var(--signal)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity={1 - i * 0.11}
          transform={`rotate(${-i * 45})`}
        />
      ))}
    </svg>
  );
}

/** Signal dot with a soft ping — something running right now. */
export function LiveDot({ delay = 0 }: { delay?: number }) {
  return (
    <span aria-hidden className="relative grid size-1.5 shrink-0">
      <span className="wb-ping absolute inset-0 rounded-full bg-signal" style={{ animationDelay: `${delay}ms` }} />
      <span className="relative rounded-full bg-signal" />
    </span>
  );
}

export const formatCount = (v: number, decimals: number, prefix: string, suffix: string) =>
  prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

/** A number that counts up when its demo plays. Renders the final value. */
function Count({ to, from = 0, decimals = 0, prefix = "", suffix = "" }: { to: number; from?: number; decimals?: number; prefix?: string; suffix?: string }) {
  return (
    <span data-count data-to={to} data-from={from} data-dec={decimals} data-pre={prefix} data-suf={suffix} className="tabular-nums">
      {formatCount(to, decimals, prefix, suffix)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Card shell                                                          */
/* ------------------------------------------------------------------ */

export function DemoCard({
  title,
  onReplay,
  footer,
  children,
}: {
  title: string;
  onReplay: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="@container relative overflow-hidden rounded-[15px] bg-surface shadow-[0_0_0_1px_var(--line-strong),0_18px_40px_-26px_rgb(22_22_27/0.35)]">
      <div className="flex items-center justify-between gap-4 border-b border-line py-2 pl-4 pr-2 md:pl-5">
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink">
          <LogoMark size={13} ground="#ffffff" />
          {title}
        </p>
        <button
          type="button"
          onClick={onReplay}
          aria-label={`Replay: ${title}`}
          className="flex items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-[0.75rem] font-medium text-graphite transition-colors hover:bg-sunken hover:text-ink motion-reduce:hidden"
        >
          <svg data-wb-replay-icon width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2.9 8a5.1 5.1 0 1 0 1.5-3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M2.6 1.9v3.2h3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Replay
        </button>
      </div>
      <div className="p-4 md:p-5">{children}</div>
      {footer}
    </div>
  );
}

export function SampleData() {
  return <p className="border-t border-line px-4 py-2.5 text-right text-[0.6875rem] text-muted md:px-5">Sample data</p>;
}

/* ------------------------------------------------------------------ */
/* 1 · Automations — one payment, start to finish                      */
/* ------------------------------------------------------------------ */

const FLOW = [
  ["E-transfer notice arrives", "Inbox"],
  ["Matched to INV-1048", "Weavers"],
  ["Invoice marked paid", "QuickBooks"],
  ["Receipt sent to the client", "Email"],
];

export function FlowDemo() {
  return (
    <ol className="relative">
      {/* connector: hairline track, signal progress drawn over it (node centres are 24px in) */}
      <span aria-hidden className="absolute bottom-6 left-[13.5px] top-6 w-px bg-line-strong" />
      <span aria-hidden data-flow-line className="absolute bottom-6 left-[13px] top-6 w-[2px] origin-top rounded-full bg-signal" />
      {FLOW.map(([label, system]) => (
        <li key={label} data-flow-step className="relative grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
          <span className="relative grid size-7 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
            <span data-flow-spin className="absolute inset-0 grid place-items-center opacity-0">
              <Spinner />
            </span>
            <span data-flow-done className="absolute inset-0 grid place-items-center rounded-full bg-ink">
              <Check className="size-3" color="#fff" />
            </span>
          </span>
          <span data-flow-label className="text-pretty text-[0.875rem] font-medium leading-snug text-ink">
            {label}
          </span>
          <span className="rounded-[6px] px-1.5 py-[3px] font-mono text-[0.625rem] leading-none text-graphite shadow-[0_0_0_1px_var(--line-strong)]">
            {system}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function FlowFooter() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line px-4 py-3 md:px-5">
      {["Runs around the clock", "Every step logged", "We are alerted if a step fails"].map((t) => (
        <li key={t} data-flow-foot className="flex items-center gap-1.5 text-[0.75rem] text-graphite">
          <Check color="var(--ink)" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · AI agents — inbox agent, a person approves                      */
/* ------------------------------------------------------------------ */

const AGENT_STEPS = ["Read the email", "Found the client file", "Listed what is missing", "Drafted a reply"];
const REVIEW = [
  ["Client", "Patel Renovations"],
  ["Received", "Q1 statements"],
  ["Missing", "2 receipts"],
  ["Due", "HST return, Apr 30"],
];

export function InboxDemo() {
  return (
    <div className="grid gap-4 @[30rem]:grid-cols-2 @[30rem]:gap-5">
      <div className="flex flex-col gap-4">
        <div data-inbox-email className="rounded-[12px] bg-sunken p-3.5 shadow-[inset_0_0_0_1px_var(--line)]">
          <p className="flex items-center gap-2 text-[0.6875rem] leading-snug text-muted">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-surface text-[0.625rem] font-semibold text-ink shadow-[0_0_0_1px_var(--line-strong)]">
              D
            </span>
            From Dana, Patel Renovations · 8:12 AM
          </p>
          <p className="mt-2 text-pretty text-[0.8125rem] leading-[1.5] text-ink">
            Here are our Q1 bank statements. Can we get HST filed by the 30th?
          </p>
        </div>
        <ol className="flex flex-col gap-2.5 px-1">
          {AGENT_STEPS.map((s) => (
            <li key={s} data-inbox-step className="flex items-center gap-2.5 text-[0.8125rem] text-graphite">
              <span className="relative grid size-[18px] shrink-0 place-items-center">
                <span data-inbox-spin className="absolute inset-0 grid place-items-center opacity-0">
                  <Spinner className="size-3.5" />
                </span>
                <span data-inbox-done className="absolute inset-0 grid place-items-center rounded-full bg-ink">
                  <Check className="size-2.5" color="#fff" />
                </span>
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div
        data-inbox-review
        className="self-start rounded-[12px] bg-surface p-4 shadow-[0_0_0_1px_var(--line-strong),0_10px_24px_-16px_rgb(22_22_27/0.3)]"
      >
        <p className="text-pretty text-[0.875rem] font-semibold leading-snug text-ink">Reply to Dana is ready for review</p>
        <dl className="mt-3 text-[0.75rem]">
          {REVIEW.map(([k, v]) => (
            <div key={k} data-inbox-row className="flex justify-between gap-3 border-t border-line py-1.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="relative mt-3">
          {/* waiting on a person: a soft signal ring breathes around the button */}
          <span aria-hidden data-inbox-ring className="absolute -inset-[3px] rounded-[13px] border-[1.5px] border-signal opacity-0" />
          <span
            data-inbox-approve
            className="relative grid h-9 place-items-center rounded-[10px] bg-ink text-[0.8125rem] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_#000]"
          >
            Approve reply
          </span>
        </div>
        <p data-inbox-note className="mt-2.5 flex items-start gap-1.5 text-[0.6875rem] leading-snug text-graphite">
          <svg className="mt-px size-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="2.25" y="5.25" width="7.5" height="5" rx="1.25" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 5.25V4a2 2 0 1 1 4 0v1.25" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          Nothing is sent until a person approves.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Custom software — job board                                     */
/* ------------------------------------------------------------------ */

const METRICS = [
  { label: "Open jobs", count: <Count to={48} /> },
  { label: "On time", count: <Count to={97} suffix="%" /> },
  { label: "Unpaid", count: <Count to={3.2} decimals={1} prefix="$" suffix="k" /> },
];
const JOBS = [
  ["2231", "Nguyen residence", "Booked"],
  ["2230", "Brant St Bakery", "Tech on site"],
  ["2229", "Okafor residence", "Complete"],
  ["2228", "Harris residence", "Invoiced"],
];
const JOB_COLS = "grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-2";

function Status({ status }: { status: string }) {
  const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[4px] text-[0.6875rem] font-medium leading-none";
  if (status === "Tech on site")
    return (
      <span className={`${base} bg-signal-soft text-signal-deep`}>
        <LiveDot />
        {status}
      </span>
    );
  if (status === "Complete")
    return (
      <span className={`${base} bg-ink text-white`}>
        <Check className="size-2" color="#fff" weight={2.4} />
        {status}
      </span>
    );
  if (status === "Invoiced") return <span className={`${base} bg-sunken text-graphite shadow-[inset_0_0_0_1px_var(--line)]`}>{status}</span>;
  return <span className={`${base} text-graphite shadow-[inset_0_0_0_1px_var(--line-strong)]`}>{status}</span>;
}

export function JobsDemo() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {METRICS.map((m) => (
          <div key={m.label} data-jobs-metric className="rounded-[10px] bg-sunken px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
            <p className="text-[0.6875rem] text-muted">{m.label}</p>
            <p className="mt-1.5 text-[1.375rem] font-semibold leading-none tracking-[-0.03em] text-ink">{m.count}</p>
          </div>
        ))}
      </div>
      <div role="table" aria-label="Job board" className="mt-4 text-[0.8125rem]">
        <div role="row" className={`${JOB_COLS} pb-2 font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-muted`}>
          <span role="columnheader">Job</span>
          <span role="columnheader">Customer</span>
          <span role="columnheader" className="text-right">
            Status
          </span>
        </div>
        {JOBS.map(([id, customer, status], i) => (
          <div key={id} role="row" data-jobs-row data-jobs-new={i === 0 || undefined} className={`${JOB_COLS} border-t border-line py-2`}>
            <span role="cell" className="font-mono text-[0.6875rem] text-graphite">
              {id}
            </span>
            <span role="cell" className="truncate text-ink">
              {customer}
            </span>
            <span role="cell" className="justify-self-end">
              <Status status={status} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Care and upkeep — your systems this month                       */
/* ------------------------------------------------------------------ */

const SYSTEMS = [
  { name: "Invoice matcher", count: <Count to={1284} suffix=" runs" /> },
  { name: "Inbox agent", count: <Count to={412} suffix=" drafts" /> },
  { name: "Phone agent", count: <Count to={96} suffix=" calls" /> },
  { name: "Client portal", count: <Count to={99.98} from={99} decimals={2} suffix="% up" /> },
];
const WEEKS = [3, 5, 7, 8, 11, 12, 14, 15];
const WEEK_MAX = 15;

export function CareDemo() {
  return (
    <div className="grid gap-5 @[30rem]:grid-cols-2 @[30rem]:gap-7">
      <ul className="flex flex-col">
        {SYSTEMS.map((s, i) => (
          <li
            key={s.name}
            data-care-row
            className="flex items-center justify-between gap-3 border-t border-line py-2.5 first:border-t-0 first:pt-1"
          >
            <span className="flex items-center gap-2.5 text-[0.8125rem] text-ink">
              <LiveDot delay={i * 400} />
              {s.name}
            </span>
            <span className="font-mono text-[0.6875rem] text-graphite">{s.count}</span>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-[0.75rem] font-medium text-ink">Hours won back per week</p>
        <div className="mt-3 flex h-[118px] items-end justify-between gap-1.5">
          {WEEKS.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span data-care-val className="font-mono text-[0.5625rem] leading-none text-graphite">
                {v}
              </span>
              <span
                data-care-bar
                className={`block w-full max-w-[18px] origin-bottom rounded-[3px] ${i === WEEKS.length - 1 ? "bg-signal" : "bg-line-strong"}`}
                style={{ height: `${Math.round((v / WEEK_MAX) * 100)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between gap-1.5 border-t border-line pt-1.5">
          {WEEKS.map((_, i) => (
            <span key={i} className="flex-1 text-center font-mono text-[0.5rem] leading-none text-muted">
              W{i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
