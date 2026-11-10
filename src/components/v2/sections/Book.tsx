"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Cross, Rule } from "@/components/site/Rails";
import { BOOKING } from "@/components/v2/content";
import { SUBMIT } from "@/components/book/book";
import { Arrow, FaceSwap, SectionHead, refreshSoon, useReveal } from "@/components/v2/parts";

/* ------------------------------------------------------------------ */
/* Scheduler mock — stands in for the embedded scheduler (Cal.com,     */
/* Calendly or HubSpot) so reviewers see it open on the page, no click  */
/* needed. Availability is sample data; nothing is booked.              */
/* ------------------------------------------------------------------ */

const SLOTS = ["9:00 AM", "9:30 AM", "10:30 AM", "11:00 AM", "1:00 PM", "2:30 PM", "3:30 PM", "4:00 PM"];
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
/* today, as an external store: read on the client only (see Book below) */
const subscribeNever = () => () => {};
const dayKeyNow = () => dayKey(new Date());
const dateFromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m, d);
};
/** Weekdays from tomorrow, four weeks out. */
function isOpen(d: Date, today: Date) {
  const diff = (startOfDay(d).getTime() - today.getTime()) / 864e5;
  const wd = d.getDay();
  return diff >= 1 && diff <= 28 && wd !== 0 && wd !== 6;
}
/** Each day loses a couple of slots, deterministically, so days look different. */
function slotsFor(d: Date) {
  const seed = d.getDate() * 7 + d.getMonth() * 3;
  return SLOTS.filter((_, i) => (seed + i * 5) % 7 !== 0 && (seed + i) % 9 !== 2);
}

function Scheduler({ today, onPick }: { today: Date; onPick: (p: number) => void }) {
  const firstOpen = useMemo(() => {
    const d = new Date(today);
    do d.setDate(d.getDate() + 1);
    while (!isOpen(d, today));
    return d;
  }, [today]);
  const [month, setMonth] = useState(() => new Date(firstOpen.getFullYear(), firstOpen.getMonth(), 1));
  const [day, setDay] = useState<Date>(firstOpen);
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => onPick(booked ? 1 : slot ? 0.66 : 0.33), [slot, booked, onPick]);

  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7; // Monday-first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const monthName = month.toLocaleString("en-US", { month: "long", year: "numeric" });
  const canBack = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canFwd = month < new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const dayLabel = day.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (booked && slot)
    return (
      <div role="status" className="flex min-h-[22rem] flex-col items-start justify-center">
        <span className="price-hole size-11 !bg-ink !text-white">
          <svg viewBox="0 0 14 14" className="size-4" fill="none" aria-hidden>
            <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-6 text-[1.375rem] font-semibold tracking-[-0.03em] text-ink">
          {dayLabel} · {slot}
        </p>
        <p className="mt-1.5 text-[0.9375rem] text-graphite">Free automation audit · 30 minutes · Video call</p>
        <p className="mt-6 rounded-[10px] bg-sunken px-3.5 py-2.5 text-[0.8125rem] text-graphite shadow-[inset_0_0_0_1px_var(--line)]">
          Prototype: the real scheduler embed confirms by email. Nothing was booked.
        </p>
        <button type="button" onClick={() => setBooked(false)} className="mt-5 text-[0.875rem] font-medium text-ink underline underline-offset-4">
          Pick another time
        </button>
      </div>
    );

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
        {/* month */}
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{monthName}</p>
            <div className="flex gap-1">
              {[
                ["Previous month", -1, canBack, "M8.5 3 4.5 7l4 4"],
                ["Next month", 1, canFwd, "M5.5 3l4 4-4 4"],
              ].map(([label, dir, ok, d]) => (
                <button
                  key={label as string}
                  type="button"
                  aria-label={label as string}
                  disabled={!ok}
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + (dir as number), 1))}
                  className="grid size-8 place-items-center rounded-[9px] text-ink transition-colors hover:bg-sunken disabled:opacity-30"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d={d as string} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div role="grid" aria-label={monthName} className="mt-4 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} role="columnheader" className="pb-1.5 font-mono text-[0.625rem] uppercase tracking-[0.04em] text-muted">
                {w}
              </span>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  disabled={!isOpen(d, today)}
                  aria-selected={sameDay(d, day)}
                  aria-label={d.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  onClick={() => {
                    setDay(d);
                    setSlot(null);
                  }}
                  className="sched-day"
                  data-today={sameDay(d, today) || undefined}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>

        {/* slots */}
        <div>
          <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{dayLabel}</p>
          <ul aria-label={`Times on ${dayLabel}`} className="mt-4 grid grid-cols-2 gap-2">
            {slotsFor(day).map((s) => (
              <li key={s}>
                <button type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className="sched-slot">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.8125rem] text-muted">Times in Eastern Time · Sample availability</p>
        <button type="button" disabled={!slot} onClick={() => setBooked(true)} className="btn btn-primary disabled:pointer-events-none disabled:opacity-40">
          {slot ? `Confirm ${slot}` : "Pick a time"}
          <span className="btn-icon">
            <Arrow white />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fallback form                                                       */
/* ------------------------------------------------------------------ */

type Field = "name" | "email" | "company" | "what";

function Fallback() {
  const f = BOOKING.fallback;
  const [errs, setErrs] = useState<Partial<Record<Field, string>>>({});
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => refreshSoon(), [sent, open]);
  // the form unfolds on request; once it is open the first field takes focus
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => document.getElementById("fb-name")?.focus({ preventScroll: true }), 450);
    return () => window.clearTimeout(t);
  }, [open]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: Field) => String(d.get(k) ?? "").trim();
    const next: Partial<Record<Field, string>> = {};
    if (!v("name")) next.name = "Add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = "Enter a work email, like you@company.com.";
    if (!v("company")) next.company = "Add your company name.";
    if (!v("what")) next.what = "Tell us what you want automated.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "message", name: v("name"), email: v("email"), company: v("company"), notes: v("what"), website: String(d.get("website") ?? "") }),
      });
      if (!res.ok) throw new Error(`book answered ${res.status}`);
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const input = (k: Field, label: string, extra: Record<string, string> = {}) => (
    <div>
      <label htmlFor={`fb-${k}`} className="book-label">
        {label}
      </label>
      <div className="book-control">
        <input id={`fb-${k}`} name={k} aria-invalid={errs[k] ? true : undefined} className="book-input" {...extra} />
      </div>
      {errs[k] && <p className="book-err">{errs[k]}</p>}
    </div>
  );

  return (
    <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
      {/* one row: the offer, and the link that unfolds the form beneath it */}
      <div data-rise className="flex flex-col gap-5 px-5 py-9 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-10 lg:px-10">
        <div>
          <h3 className="text-[clamp(1.5rem,2.4vw,1.875rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">{f.heading}</h3>
          <p className="mt-3 max-w-[44ch] text-pretty text-[1rem] leading-[1.6] text-graphite">{f.text}</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="fb-form"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-quiet shrink-0 self-start md:self-auto"
        >
          <span>{open ? f.hide : f.link}</span>
        </button>
      </div>
      <div id="fb-form" className="calc-mail" data-open={open}>
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-rail bg-white/55 px-5 py-10 md:px-8 md:py-12 lg:px-10">
          {sent ? (
            <p role="status" className="flex items-start gap-3 text-[1.0625rem] font-medium leading-[1.5] text-ink">
              <span className="mt-[0.15em] grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white">
                <svg viewBox="0 0 14 14" className="size-3" fill="none" aria-hidden>
                  <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {f.sent}
            </p>
          ) : (
            <form noValidate onSubmit={submit} aria-label={f.heading} className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              {input("name", f.fields.name, { autoComplete: "name", placeholder: "First and last name" })}
              {input("email", f.fields.email, { type: "email", autoComplete: "email", placeholder: "you@company.com" })}
              <div className="md:col-span-2">{input("company", f.fields.company, { autoComplete: "organization", placeholder: "Business name" })}</div>
              <div className="md:col-span-2">
                <label htmlFor="fb-what" className="book-label">
                  {f.fields.what}
                </label>
                <div className="book-control">
                  <textarea
                    id="fb-what"
                    name="what"
                    rows={4}
                    aria-invalid={errs.what ? true : undefined}
                    className="book-input book-area"
                    placeholder="The job your team does by hand every week."
                  />
                </div>
                {errs.what && <p className="book-err">{errs.what}</p>}
              </div>
              {/* honeypot: hidden from people, filled in by bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              {failed && (
                <p role="alert" className="book-err md:col-span-2">
                  {SUBMIT.error}
                </p>
              )}
              <div className="md:col-span-2">
                <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
                  {busy ? SUBMIT.sending : f.send}
                  <span className="btn-icon">
                    <Arrow white />
                  </span>
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

/**
 * 14 · Booking — two columns: what the audit covers on the left, the
 * scheduler open on the right (no click to reveal it); below, the fallback
 * offer as one row, its form folded until "Write to us instead" is clicked.
 * Every "Book a free audit" button on the page lands here (#book).
 */
export function Book() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0.33);
  // the calendar needs today's date, which only the browser may supply: the server snapshot is
  // null (nothing date-based is prerendered), the client's is read once hydration is done
  const todayKey = useSyncExternalStore(subscribeNever, dayKeyNow, () => null);
  const today = useMemo(() => (todayKey ? dateFromKey(todayKey) : null), [todayKey]);
  useReveal(root);

  return (
    <section ref={root} id="book" aria-labelledby="book-h" className="relative overflow-x-clip pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="book-h" eyebrow={BOOKING.eyebrow} soft={BOOKING.soft} strong={BOOKING.strong} lede={BOOKING.sub} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* what you get */}
          <aside className="flex flex-col px-5 pb-12 pt-10 md:px-8 md:pt-12 lg:px-10 lg:py-12">
            <ol className="grid">
              {BOOKING.bullets.map(([k, v], i) => (
                <li key={k} data-rise className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0">
                  {i < BOOKING.bullets.length - 1 && <span aria-hidden className="book-link" />}
                  <span aria-hidden className="price-hole">
                    {i + 1}
                  </span>
                  <p className="pt-[0.35rem] text-pretty text-[1.0625rem] leading-[1.5] text-graphite">
                    <b className="font-semibold text-ink">{k}</b> {v}
                  </p>
                </li>
              ))}
            </ol>
            <p data-rise className="mt-10 flex items-center gap-3.5 border-t border-line pt-6 text-pretty text-[0.9375rem] leading-[1.55] text-graphite lg:mt-auto">
              <FaceSwap size={40} />
              {BOOKING.reassurance}
            </p>
          </aside>

          {/* the scheduler, open on the page */}
          <div
            data-rise
            className="book-sheet relative border-t border-rail lg:border-l lg:border-t-0"
            style={{ "--bk-p": progress } as CSSProperties}
          >
            <span aria-hidden className="book-edge">
              <span className="book-edge-fill" />
            </span>
            <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
            <div className="px-5 py-9 md:px-8 md:py-10 lg:px-10">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">
                    <LogoMark size={15} ground="#ffffff" />
                    Free automation audit
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-muted">30 minutes · Video call</p>
                </div>
                <span className="uc-tag">Scheduler embed</span>
              </div>
              {today ? <Scheduler today={today} onPick={setProgress} /> : <div aria-hidden className="min-h-[22rem]" />}
            </div>
          </div>
        </div>
        <Rule className="relative" />
        <Fallback />
        <Rule className="relative" />
      </div>
    </section>
  );
}
