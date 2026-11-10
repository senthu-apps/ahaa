"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Cross, Rule } from "@/components/site/Rails";
import { BOOKING } from "@/components/v2/content";
import { EMAIL, SUBMIT, TIME_SINKS } from "@/components/book/book";
import { Arrow, FaceSwap, SectionHead, refreshSoon, useReveal } from "@/components/v2/parts";

/* ------------------------------------------------------------------ */
/* Scheduler — the calendar is ours; the availability and the booking   */
/* are LunaCal's, through /api/schedule (the API key stays on the       */
/* server). Without LUNACAL_API_KEY + LUNACAL_EVENT_TYPE_ID the calendar */
/* shows sample availability and books nothing.                         */
/* ------------------------------------------------------------------ */

const S = BOOKING.scheduler;
/** Bookable window: from tomorrow, this many days out. */
const WINDOW_DAYS = 28;
const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const fmtTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const fmtDay = (d: Date) => d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" });
/** "Eastern Standard Time" for America/Toronto; the IANA name if Intl cannot say. */
function tzName(tz: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "long" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

/* today, as an external store: read on the client only (see Book below) */
const subscribeNever = () => () => {};
const dayKeyNow = () => dayKey(new Date());
const dateFromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m, d);
};

function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" aria-hidden>
      <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Availability                                                         */
/* ------------------------------------------------------------------ */

type Avail = {
  status: "loading" | "ready" | "error";
  /** true when the times come from LunaCal, false for the sample calendar */
  live: boolean;
  slots: Date[];
  minutes: number;
  tz: string;
};
type ScheduleJson = { ok: boolean; configured?: boolean; slots?: string[]; minutes?: number | null };

/** Sample availability (no LunaCal keys): weekdays, 9 to 4, each day missing a couple of
 *  slots deterministically so days look different. */
const SAMPLE_MINUTES = [540, 570, 630, 660, 780, 870, 930, 960];
function sampleSlots(today: Date) {
  const out: Date[] = [];
  for (let i = 1; i <= WINDOW_DAYS; i++) {
    const d = addDays(today, i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const seed = d.getDate() * 7 + d.getMonth() * 3;
    SAMPLE_MINUTES.forEach((m, j) => {
      if ((seed + j * 5) % 7 !== 0 && (seed + j) % 9 !== 2) out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, m));
    });
  }
  return out;
}

/** The open slots for the window, in the visitor's time zone. Fetched once `today` is known,
 *  and again on `reload` (after a slot was taken under us); while a request runs, the previous
 *  answer stays on screen, dimmed, rather than blanking. */
function useAvailability(today: Date | null) {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  // one key per request: an answer counts only while it is the latest request's
  const key = today ? `${dayKey(today)}·${tick}` : null;
  const [answer, setAnswer] = useState<(Avail & { key: string }) | null>(null);

  useEffect(() => {
    if (!today || !key) return;
    const ctl = new AbortController();
    const from = addDays(today, 1);
    const to = addDays(today, WINDOW_DAYS + 1);
    fetch(`/api/schedule?from=${from.toISOString()}&to=${to.toISOString()}&tz=${encodeURIComponent(tz)}`, { signal: ctl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`schedule answered ${r.status}`);
        return (await r.json()) as ScheduleJson;
      })
      .then((j) => {
        if (!j.configured) return setAnswer({ key, status: "ready", live: false, slots: sampleSlots(today), minutes: 30, tz });
        const slots = (j.slots ?? []).map((s) => new Date(s)).filter((d) => !Number.isNaN(d.getTime()) && d >= from && d < to);
        setAnswer({ key, status: "ready", live: true, slots, minutes: j.minutes ?? 30, tz });
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setAnswer({ key, status: "error", live: false, slots: [], minutes: 30, tz });
      });
    return () => ctl.abort();
  }, [today, key, tz]);

  const state: Avail = answer && answer.key === key ? answer : answer ? { ...answer, status: "loading" } : { status: "loading", live: false, slots: [], minutes: 30, tz };
  return { ...state, reload };
}

/* ------------------------------------------------------------------ */
/* Picker — a <select> drawn by the site, not by the OS: the trigger    */
/* is a .book-input, the list a panel below it (.sched-menu). Keyboard: */
/* arrows, Home, End, Enter or Space, Escape. The value travels in a    */
/* hidden input so the form reads it like any other field.             */
/* ------------------------------------------------------------------ */

/** Room the open list needs below the field (its max-height plus a margin) before it flips upward. */
const MENU_ROOM = 380;

function Picker({
  id,
  name,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: {
  id: string;
  name: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // the row the keyboard (or pointer) is on
  const [up, setUp] = useState(false); // the list opens above the field when the viewport has more room there
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = `${id}-list`;

  // a press anywhere else closes the list
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  // the keyboard's row stays in view when the list scrolls
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const show = () => {
    const r = trigger.current?.getBoundingClientRect();
    if (r) {
      const below = window.innerHeight - r.bottom;
      setUp(below < MENU_ROOM && r.top > below);
    }
    setActive(Math.max(options.indexOf(value), 0));
    setOpen(true);
  };
  const choose = (i: number) => {
    onChange(options[i]);
    setOpen(false);
    trigger.current?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (open) setActive((a) => Math.min(a + 1, last));
        else show();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) setActive((a) => Math.max(a - 1, 0));
        else show();
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open && active >= 0) choose(active);
        else show();
        break;
    }
  };

  return (
    <div ref={root} className="book-control">
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        data-empty={!value || undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className="book-input book-select text-left"
      >
        <span className="block truncate">{value || placeholder}</span>
      </button>
      {/* the design's chevron (akar-icons chevron-down-small, public/icons); it turns while the list is open */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a 16px static SVG; next/image adds nothing here */}
      <img
        src="/icons/chevron-down-small.svg"
        alt=""
        width={16}
        height={16}
        className={`pointer-events-none absolute right-[15px] top-1/2 -translate-y-1/2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      />
      {open && (
        <ul id={listId} role="listbox" aria-labelledby={id} data-up={up || undefined} className="sched-menu">
          {options.map((o, i) => (
            <li
              key={o}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o === value}
              data-active={i === active || undefined}
              onPointerMove={() => setActive(i)}
              onClick={() => choose(i)}
              className="sched-option"
            >
              <span>{o}</span>
              {o === value && <Check className="size-3.5 shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fields — the scheduler's details step and the fallback form ask for  */
/* the same things (Figma node 183:16), so they share these.            */
/* ------------------------------------------------------------------ */

/** The fields both forms validate; the last name is optional. */
type Who = "first" | "email" | "company" | "topic";

function TextField({ id, label, error, ...input }: { id: string; name: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="book-label">
        {label}
      </label>
      <div className="book-control">
        <input id={id} aria-invalid={error ? true : undefined} className="book-input" {...input} />
      </div>
      {error && <p className="book-err">{error}</p>}
    </div>
  );
}

/** "What would you like to automate?" — one of book.ts TIME_SINKS, in the Picker. */
function TopicField({ id, label, value, error, onChange }: { id: string; label: string; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="book-label">
        {label}
      </label>
      <Picker id={id} name="topic" value={value} options={TIME_SINKS} placeholder={S.topicPlaceholder} invalid={!!error} onChange={onChange} />
      {error && <p className="book-err">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scheduler                                                            */
/* ------------------------------------------------------------------ */

type Step = "pick" | "details" | "done";

function Scheduler({ today, avail, onPick }: { today: Date; avail: ReturnType<typeof useAvailability>; onPick: (p: number) => void }) {
  const byDay = useMemo(() => {
    const m = new Map<string, Date[]>();
    for (const s of avail.slots) {
      const k = dayKey(s);
      const list = m.get(k);
      if (list) list.push(s);
      else m.set(k, [s]);
    }
    return m;
  }, [avail.slots]);
  const firstOpen = useMemo(() => {
    const days = [...byDay.keys()].map(dateFromKey).sort((a, b) => a.getTime() - b.getTime());
    return days[0] ?? addDays(today, 1);
  }, [byDay, today]);

  const [monthPick, setMonthPick] = useState<Date | null>(null); // the month the visitor paged to; else the first open day's
  const month = monthPick ?? monthOf(firstOpen);
  const [picked, setPicked] = useState<Date | null>(null); // the day the visitor chose; else the first open day
  const day = picked ?? firstOpen;
  const [slot, setSlot] = useState<Date | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [errs, setErrs] = useState<Partial<Record<Who, string>>>({});
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(""); // "What would you like to automate?" (Picker)

  useEffect(() => onPick(step === "done" ? 1 : step === "details" ? 0.66 : slot ? 0.5 : 0.33), [step, slot, onPick]);
  // the sheet changes height between steps: let the scroll-driven reveals re-measure
  useEffect(() => refreshSoon(), [step, avail.status]);
  useEffect(() => {
    if (step !== "details") return;
    const t = window.setTimeout(() => document.getElementById("bk-first")?.focus({ preventScroll: true }), 350);
    return () => window.clearTimeout(t);
  }, [step]);

  const cells = useMemo(() => {
    const lead = (month.getDay() + 6) % 7; // Monday-first
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  }, [month]);

  const monthName = month.toLocaleString("en-US", { month: "long", year: "numeric" });
  const canBack = month > monthOf(addDays(today, 1));
  const canFwd = month < monthOf(addDays(today, WINDOW_DAYS));
  const dayLabel = fmtDay(day);
  const times = byDay.get(dayKey(day)) ?? [];
  const meta = `${S.event} · ${avail.minutes} minutes · ${S.call}`;
  const zone = tzName(avail.tz);

  const reset = () => {
    setStep("pick");
    setSlot(null);
    setErr(null);
    setErrs({});
    setTopic("");
  };

  const confirm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slot) return;
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const next: Partial<Record<Who, string>> = {};
    if (!v("first")) next.first = "Add your first name.";
    if (!EMAIL.test(v("email"))) next.email = "Enter a work email, like you@company.com.";
    if (!v("company")) next.company = "Add your company name.";
    if (!v("topic")) next.topic = "Pick the closest match.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          start: slot.toISOString(),
          tz: avail.tz,
          name: [v("first"), v("last")].filter(Boolean).join(" "),
          email: v("email"),
          company: v("company"),
          topic: v("topic"),
          website: v("website"),
        }),
      });
      if (res.status === 409) {
        // somebody took the slot meanwhile: back to the calendar, with fresh times
        reset();
        setErr(S.taken);
        avail.reload();
        return;
      }
      if (!res.ok) throw new Error(`schedule answered ${res.status}`);
      setEmail(v("email"));
      setStep("done");
    } catch {
      setErr(SUBMIT.error);
    } finally {
      setBusy(false);
    }
  };
  /* booked */
  if (step === "done" && slot)
    return (
      <div role="status" className="flex min-h-[22rem] flex-col items-start justify-center">
        <span className="price-hole size-11 !bg-ink !text-white">
          <Check className="size-4" />
        </span>
        <p className="mt-6 text-[1.375rem] font-semibold tracking-[-0.03em] text-ink">
          {fmtDay(slot)} · {fmtTime(slot)}
        </p>
        <p className="mt-1.5 text-[0.9375rem] text-graphite">{meta}</p>
        {avail.live ? (
          <p className="mt-6 max-w-[44ch] text-pretty text-[0.9375rem] leading-[1.55] text-graphite">
            {S.done.sent} <b className="font-medium text-ink">{email}</b>. {S.done.change}
          </p>
        ) : (
          <p className="mt-6 rounded-[10px] bg-sunken px-3.5 py-2.5 text-[0.8125rem] text-graphite shadow-[inset_0_0_0_1px_var(--line)]">{S.sampleNote}</p>
        )}
        <button type="button" onClick={reset} className="mt-5 text-[0.875rem] font-medium text-ink underline underline-offset-4">
          {S.done.again}
        </button>
      </div>
    );

  /* who is coming */
  if (step === "details" && slot)
    return (
      <form noValidate onSubmit={confirm} aria-label={S.confirm}>
        {/* the chosen slot, as a panel */}
        <div className="rounded-[12px] bg-sunken px-3.5 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="text-[1.125rem] font-semibold tracking-[-0.02em] text-ink">
              {fmtDay(slot)} · {fmtTime(slot)}
            </p>
            <button type="button" onClick={reset} className="text-[0.875rem] font-medium text-ink underline underline-offset-4">
              {S.change}
            </button>
          </div>
          <p className="mt-1 text-[0.8125rem] text-muted">
            {meta} · {zone}
          </p>
        </div>
        <div className="mt-7 grid gap-x-5 gap-y-5 md:grid-cols-2">
          <TextField id="bk-first" name="first" label={S.fields.first} error={errs.first} autoComplete="given-name" placeholder="First name" maxLength={60} />
          <TextField id="bk-last" name="last" label={S.fields.last} autoComplete="family-name" placeholder="Last name" maxLength={60} />
          <div className="md:col-span-2">
            <TextField id="bk-email" name="email" label={S.fields.email} error={errs.email} type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} />
          </div>
          <div className="md:col-span-2">
            <TextField id="bk-company" name="company" label={S.fields.company} error={errs.company} autoComplete="organization" placeholder="Business name" maxLength={160} />
          </div>
          <div className="md:col-span-2">
            <TopicField
              id="bk-topic"
              label={S.fields.topic}
              value={topic}
              error={errs.topic}
              onChange={(v) => {
                setTopic(v);
                setErrs((e) => ({ ...e, topic: undefined }));
              }}
            />
          </div>
          {/* honeypot: hidden from people, filled in by bots */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {err ? (
            <p role="alert" className="book-err">
              {err}
            </p>
          ) : (
            <p className="text-[0.8125rem] text-muted">{S.hint}</p>
          )}
          <button type="submit" disabled={busy} className="btn btn-primary shrink-0 disabled:opacity-60">
            {busy ? S.booking : S.confirm}
            <span className="btn-icon">
              <Arrow white />
            </span>
          </button>
        </div>
      </form>
    );

  /* pick a day and a time */
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
                  onClick={() => setMonthPick(new Date(month.getFullYear(), month.getMonth() + (dir as number), 1))}
                  className="grid size-8 place-items-center rounded-[9px] text-ink transition-colors hover:bg-sunken disabled:opacity-30"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d={d as string} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div
            role="grid"
            aria-label={monthName}
            aria-busy={avail.status === "loading" || undefined}
            className="mt-4 grid grid-cols-7 gap-1 text-center transition-opacity duration-300"
            style={{ opacity: avail.status === "loading" ? 0.5 : 1 }}
          >
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
                  disabled={!byDay.has(dayKey(d))}
                  aria-selected={sameDay(d, day)}
                  aria-label={d.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  onClick={() => {
                    setPicked(d);
                    setSlot(null);
                    setErr(null);
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

        {/* times */}
        <div aria-live="polite">
          <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">{dayLabel}</p>
          {avail.status === "loading" ? (
            <p className="mt-4 text-[0.875rem] text-muted">{S.loading}</p>
          ) : avail.status === "error" ? (
            <p className="mt-4 text-[0.875rem] leading-[1.55] text-graphite">
              {S.failed}{" "}
              <button type="button" onClick={avail.reload} className="font-medium text-ink underline underline-offset-4">
                {S.retry}
              </button>
            </p>
          ) : times.length === 0 ? (
            <p className="mt-4 text-[0.875rem] text-muted">{S.empty}</p>
          ) : (
            <ul aria-label={`Times on ${dayLabel}`} className="mt-4 grid grid-cols-2 gap-2">
              {times.map((t) => (
                <li key={t.getTime()}>
                  <button type="button" aria-pressed={slot?.getTime() === t.getTime()} onClick={() => setSlot(t)} className="sched-slot">
                    {fmtTime(t)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        {err ? (
          <p role="alert" className="book-err">
            {err}
          </p>
        ) : (
          <p className="text-[0.8125rem] text-muted">
            {S.timesIn} {zone}
            {avail.status === "ready" && !avail.live && ` · ${S.sample}`}
          </p>
        )}
        <button
          type="button"
          disabled={!slot}
          onClick={() => {
            setErr(null);
            setStep("details");
          }}
          className="btn btn-primary shrink-0 disabled:pointer-events-none disabled:opacity-40"
        >
          {slot ? `${S.next} ${fmtTime(slot)}` : S.pick}
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
function Fallback() {
  const f = BOOKING.fallback;
  const [errs, setErrs] = useState<Partial<Record<Who, string>>>({});
  const [topic, setTopic] = useState(""); // "What would you like to automate?" (Picker)
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [settled, setSettled] = useState(false); // the unfold has finished
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => refreshSoon(), [sent, open]);
  // the form unfolds on request; once it is open the first field takes focus, and once the unfold has
  // settled the wrapper stops clipping, so the topic list can open past the form's edges
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => document.getElementById("fb-first")?.focus({ preventScroll: true }), 450);
    const s = window.setTimeout(() => setSettled(true), 600);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(s);
    };
  }, [open]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const next: Partial<Record<Who, string>> = {};
    if (!v("first")) next.first = "Add your first name.";
    if (!EMAIL.test(v("email"))) next.email = "Enter a work email, like you@company.com.";
    if (!v("company")) next.company = "Add your company name.";
    if (!v("topic")) next.topic = "Pick the closest match.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "message", name: [v("first"), v("last")].filter(Boolean).join(" "), email: v("email"), company: v("company"), sink: v("topic"), website: v("website") }),
      });
      if (!res.ok) throw new Error(`book answered ${res.status}`);
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
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
          onClick={() => {
            setSettled(false);
            setOpen((v) => !v);
          }}
          className="btn btn-quiet shrink-0 self-start md:self-auto"
        >
          <span>{open ? f.hide : f.link}</span>
        </button>
      </div>
      <div id="fb-form" className="calc-mail" data-open={open}>
        <div className={settled ? "min-h-0" : "min-h-0 overflow-hidden"}>
          <div className="border-t border-rail bg-white/55 px-5 py-10 md:px-8 md:py-12 lg:px-10">
          {sent ? (
            <p role="status" className="flex items-start gap-3 text-[1.0625rem] font-medium leading-[1.5] text-ink">
              <span className="mt-[0.15em] grid size-6 shrink-0 place-items-center rounded-full bg-ink text-white">
                <Check className="size-3" />
              </span>
              {f.sent}
            </p>
          ) : (
            <form noValidate onSubmit={submit} aria-label={f.heading} className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <TextField id="fb-first" name="first" label={f.fields.first} error={errs.first} autoComplete="given-name" placeholder="First name" maxLength={60} />
              <TextField id="fb-last" name="last" label={f.fields.last} autoComplete="family-name" placeholder="Last name" maxLength={60} />
              <div className="md:col-span-2">
                <TextField id="fb-email" name="email" label={f.fields.email} error={errs.email} type="email" autoComplete="email" placeholder="you@company.com" maxLength={254} />
              </div>
              <div className="md:col-span-2">
                <TextField id="fb-company" name="company" label={f.fields.company} error={errs.company} autoComplete="organization" placeholder="Business name" maxLength={160} />
              </div>
              <div className="md:col-span-2">
                <TopicField
                  id="fb-topic"
                  label={f.fields.topic}
                  value={topic}
                  error={errs.topic}
                  onChange={(v) => {
                    setTopic(v);
                    setErrs((e) => ({ ...e, topic: undefined }));
                  }}
                />
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
  const avail = useAvailability(today);
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
                    {S.event}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-muted">
                    {avail.minutes} minutes · {S.call}
                  </p>
                </div>
                <span className="uc-tag">{avail.live ? S.tag.live : S.tag.sample}</span>
              </div>
              {today ? <Scheduler today={today} avail={avail} onPick={setProgress} /> : <div aria-hidden className="min-h-[22rem]" />}
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
