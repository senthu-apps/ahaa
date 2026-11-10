"use client";

import { useRef, useState, type CSSProperties, type ChangeEvent, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";
import { ArrowUpRight } from "@/components/site/Navbar";
import { EMPTY, HEAD, LIMITS, NEXT, REQUIRED, SUBMIT, TEAM_SIZES, TIME_SINKS, validate, type Lead } from "./book";

type Status = "idle" | "sending" | "sent" | "error";
type Field = keyof Lead;

/**
 * Book a session (#book) — the page's last stop before the footer, on the
 * same grid as Pricing's terms: what happens next on the left (three steps
 * down a stitched thread, sticky at lg), the request form on a white sheet
 * on the right. The sheet's ink top edge is the warp; the orange thread is
 * drawn along it as the five required answers come in (--bk-p).
 * Sends to /api/book, which emails it through Resend (see src/lib/mail.ts).
 */
export function BookSession() {
  const root = useRef<HTMLElement>(null);
  const [lead, setLead] = useState<Lead>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const errors = validate(lead);
  const shown = (f: Field) => (tried || touched[f] ? errors[f] : undefined);
  const answered = REQUIRED.map((f) => !errors[f]);
  const done = answered.filter(Boolean).length;

  const change = (f: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setLead((l) => ({ ...l, [f]: value }));
    if (status === "error") setStatus("idle");
  };
  const touch = (f: Field) => () => setTouched((t) => (t[f] ? t : { ...t, [f]: true }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setTried(true);
    const first = [...REQUIRED, "notes" as const].find((f) => errors[f]);
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !body?.ok) throw new Error(`book: ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setLead(EMPTY);
    setTouched({});
    setTried(false);
    setStatus("idle");
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>('[data-field="name"]')?.focus());
  };

  // ---- reveal: the house beat for the header, the steps walk down their thread, the sheet's content rises
  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;
      const q = <T extends Element = HTMLElement>(sel: string, scope: Element = el) => gsap.utils.toArray<T>(sel, scope);
      const owned: JSAnimation[] = [];

      const eyebrowThread = createDrawable(q<SVGPathElement>(".book-eyebrow .stitch-thread"), 0, 0);
      gsap.from(q("[data-bk-head]"), {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "weave",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () => void owned.push(animate(eyebrowThread, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" })),
        },
      });

      q("[data-bk-band]").forEach((band) => {
        gsap.from(q("[data-bk-rise]", band), {
          autoAlpha: 0,
          y: 18,
          duration: 1,
          ease: "weave",
          stagger: 0.06,
          scrollTrigger: { trigger: band, start: "top 82%", once: true },
        });
      });

      // each needle hole pops, its copy rises, then the stitch runs on to the next hole
      const list = el.querySelector<HTMLElement>("[data-bk-steps]")!;
      const steps = q("[data-bk-step]", list);
      const walk = gsap.timeline({ paused: true, defaults: { ease: "weave" } });
      gsap.set(q("[data-bk-hole]", list), { autoAlpha: 0, scale: 0.55 });
      gsap.set(q("[data-bk-text]", list), { autoAlpha: 0, y: 12 });
      gsap.set(q("[data-bk-link]", list), { scaleY: 0, transformOrigin: "50% 0" });
      steps.forEach((step, i) => {
        const at = i * 0.55;
        walk
          .to(q("[data-bk-hole]", step), { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(2.4)" }, at)
          .to(q("[data-bk-text]", step), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, at + 0.1)
          .to(q("[data-bk-link]", step), { scaleY: 1, duration: 0.6, ease: "power2.inOut" }, at + 0.25);
      });
      ScrollTrigger.create({ trigger: list, start: "top 82%", once: true, onEnter: () => void walk.play() });

      return () => owned.forEach((a) => a.revert());
    },
    { scope: root },
  );

  // ---- sent: the confirmation takes focus, rises in, and its tick is drawn
  useGSAP(
    () => {
      if (status !== "sent") return;
      const card = root.current!.querySelector<HTMLElement>("[data-bk-done]");
      if (!card) return;
      card.querySelector<HTMLElement>("[data-bk-done-h]")?.focus();
      if (prefersReducedMotion()) return;
      gsap.from(card.querySelectorAll("[data-bk-done-rise]"), { autoAlpha: 0, y: 14, duration: 0.9, ease: "weave", stagger: 0.07, delay: 0.1 });
      gsap.from(card.querySelector("[data-bk-done-hole]"), { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: "back.out(2.4)" });
      const tick = animate(createDrawable(card.querySelectorAll<SVGPathElement>("[data-bk-done-tick]"), 0, 0), {
        draw: ["0 0", "0 1"],
        duration: 650,
        delay: 300,
        ease: "inOutCubic",
      });
      return () => void tick.revert();
    },
    { scope: root, dependencies: [status], revertOnUpdate: true },
  );

  const sending = status === "sending";

  return (
    // pt-0: the FAQ's closing padding is this section's top margin
    <section ref={root} id="book" aria-labelledby="book-h" className="relative overflow-x-clip pb-24 md:pb-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-bk-head className="book-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            {HEAD.eyebrow}
          </p>
          <div>
            <h2 data-bk-head id="book-h" className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]">
              <span className="text-[#72727d]">{HEAD.soft}</span> <span className="text-ink">{HEAD.strong}</span>
            </h2>
            <p data-bk-head className="mt-5 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              {HEAD.lede}
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* what happens next */}
          <aside
            data-bk-band
            aria-labelledby="book-next-h"
            className="px-5 pb-12 pt-10 md:px-8 md:pt-12 lg:sticky lg:top-12 lg:self-start lg:px-10 lg:py-12"
          >
            <p data-bk-rise className="text-[0.9375rem] font-medium text-graphite">
              {NEXT.label}
            </p>
            <h3
              data-bk-rise
              id="book-next-h"
              className="mt-4 max-w-[17ch] text-pretty text-[clamp(1.625rem,2.6vw,2.125rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink"
            >
              {NEXT.title}
            </h3>
            <ol data-bk-steps className="mt-10">
              {NEXT.steps.map((s, i) => (
                <li key={s.title} data-bk-step className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-9 last:pb-0">
                  {i < NEXT.steps.length - 1 && <span aria-hidden data-bk-link className="book-link" />}
                  <span aria-hidden data-bk-hole className="price-hole">
                    {i + 1}
                  </span>
                  <div className="pt-[0.4rem]">
                    <p data-bk-text className="text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                      {s.title}
                    </p>
                    <p data-bk-text className="mt-0.5 text-[0.8125rem] font-medium text-muted">
                      {s.when}
                    </p>
                    <p data-bk-text className="mt-2 max-w-[42ch] text-pretty text-[0.9375rem] leading-[1.55] text-graphite">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>

          {/* the request, on a white sheet */}
          <div
            data-bk-band
            data-sent={status === "sent" || undefined}
            className="book-sheet relative border-t border-rail lg:border-l lg:border-t-0"
            style={{ "--bk-p": status === "sent" ? 1 : done / REQUIRED.length } as CSSProperties}
          >
            <span aria-hidden className="book-edge">
              <span className="book-edge-fill" />
            </span>
            <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />

            <div className="px-5 py-10 md:px-8 md:py-12 lg:px-10">
              {status === "sent" ? (
                <Sent lead={lead} onReset={reset} />
              ) : (
                <>
                  <div data-bk-rise className="flex items-center justify-between gap-4">
                    <p id="book-form-h" className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">
                      Your details
                    </p>
                    <Progress answered={answered} />
                  </div>

                  <form noValidate onSubmit={submit} aria-labelledby="book-form-h" className="mt-7 grid gap-x-5 gap-y-6 md:grid-cols-2">
                    <TextField
                      field="name"
                      label="Name"
                      autoComplete="name"
                      placeholder="First and last name"
                      maxLength={LIMITS.name}
                      value={lead.name}
                      onChange={change("name")}
                      onBlur={touch("name")}
                      error={shown("name")}
                    />
                    <TextField
                      field="email"
                      label="Work email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="you@company.com"
                      maxLength={LIMITS.email}
                      value={lead.email}
                      onChange={change("email")}
                      onBlur={touch("email")}
                      error={shown("email")}
                    />
                    <TextField
                      field="company"
                      label="Company"
                      autoComplete="organization"
                      placeholder="Business name"
                      maxLength={LIMITS.company}
                      value={lead.company}
                      onChange={change("company")}
                      onBlur={touch("company")}
                      error={shown("company")}
                    />

                    <div data-bk-rise>
                      <label htmlFor="bk-team" className="book-label">
                        Team size
                      </label>
                      <div className="book-control">
                        <select
                          id="bk-team"
                          name="team"
                          data-field="team"
                          required
                          value={lead.team}
                          data-empty={lead.team === "" || undefined}
                          onChange={change("team")}
                          onBlur={touch("team")}
                          aria-invalid={shown("team") ? true : undefined}
                          aria-describedby={shown("team") ? "bk-team-err" : undefined}
                          className="book-input book-select"
                        >
                          <option value="" disabled>
                            Choose one
                          </option>
                          {TEAM_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size === "Just me" ? size : `${size} people`}
                            </option>
                          ))}
                        </select>
                        <svg aria-hidden className="book-chevron" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <FieldError id="bk-team-err" msg={shown("team")} />
                    </div>

                    <fieldset
                      data-bk-rise
                      role="radiogroup"
                      aria-labelledby="bk-sink-legend"
                      aria-required="true"
                      aria-invalid={shown("sink") ? true : undefined}
                      aria-describedby={shown("sink") ? "bk-sink-err" : undefined}
                      className="md:col-span-2"
                    >
                      <legend id="bk-sink-legend" className="book-label">
                        Biggest time sink
                        <span className="book-opt">Pick one</span>
                      </legend>
                      <div className="book-chips flex flex-wrap gap-2" data-invalid={shown("sink") ? true : undefined}>
                        {TIME_SINKS.map((sink, i) => (
                          <label key={sink} className="book-chip">
                            <input
                              type="radio"
                              name="sink"
                              value={sink}
                              data-field={i === 0 ? "sink" : undefined}
                              checked={lead.sink === sink}
                              onChange={change("sink")}
                              onBlur={touch("sink")}
                              className="sr-only"
                            />
                            {sink}
                          </label>
                        ))}
                      </div>
                      <FieldError id="bk-sink-err" msg={shown("sink")} />
                    </fieldset>

                    <div data-bk-rise className="md:col-span-2">
                      <label htmlFor="bk-notes" className="book-label">
                        Anything else we should know?
                        <span className="book-opt">Optional</span>
                      </label>
                      <div className="book-control">
                        <textarea
                          id="bk-notes"
                          name="notes"
                          data-field="notes"
                          rows={4}
                          maxLength={LIMITS.notes}
                          placeholder="The tools you run on, what you have tried, a deadline."
                          value={lead.notes}
                          onChange={change("notes")}
                          onBlur={touch("notes")}
                          aria-invalid={shown("notes") ? true : undefined}
                          aria-describedby={shown("notes") ? "bk-notes-err" : undefined}
                          className="book-input book-area"
                        />
                      </div>
                      <FieldError id="bk-notes-err" msg={shown("notes")} />
                    </div>

                    {/* people never see this; bots fill it in */}
                    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="bk-website">Website</label>
                      <input id="bk-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={lead.website} onChange={change("website")} />
                    </div>

                    {status === "error" && (
                      <p role="alert" className="book-alert md:col-span-2">
                        {SUBMIT.error}
                      </p>
                    )}

                    <div data-bk-rise className="mt-1 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                      <button type="submit" disabled={sending} aria-disabled={sending || undefined} className="btn btn-primary w-full justify-between sm:w-auto">
                        {sending ? `${SUBMIT.sending}…` : SUBMIT.idle}
                        <span className="btn-icon">{sending ? <Busy /> : <ArrowUpRight />}</span>
                      </button>
                      <p className="text-[0.875rem] leading-snug text-muted sm:max-w-[24ch] sm:text-right">{SUBMIT.note}</p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

function TextField({
  field,
  label,
  error,
  ...input
}: { field: Field; label: string; error?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">) {
  const id = `bk-${field}`;
  return (
    <div data-bk-rise>
      <label htmlFor={id} className="book-label">
        {label}
      </label>
      <div className="book-control">
        <input
          id={id}
          name={field}
          data-field={field}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="book-input"
          {...input}
        />
      </div>
      <FieldError id={`${id}-err`} msg={error} />
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="book-err">
      {msg}
    </p>
  );
}

/** Five needle holes on a thread — one lights for each required answer. */
function Progress({ answered }: { answered: boolean[] }) {
  const done = answered.filter(Boolean).length;
  return (
    <p className="flex items-center gap-3 text-[0.8125rem] text-muted" aria-hidden="true">
      <span className="book-pips">
        {answered.map((on, i) => (
          <span key={i} className="book-pip" data-on={on} />
        ))}
      </span>
      <span className="tabular-nums">
        <span className="font-medium text-ink">{done}</span> of {answered.length}
      </span>
    </p>
  );
}

function Busy() {
  return (
    <svg className="wb-spin size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="rgb(255 255 255 / 0.35)" strokeWidth="2" />
      <path d="M13.5 8A5.5 5.5 0 0 0 8 2.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Sent({ lead, onReset }: { lead: Lead; onReset: () => void }) {
  const first = lead.name.trim().split(/\s+/)[0];
  const rows: [string, ReactNode][] = [
    ["Company", lead.company.trim()],
    ["Team size", lead.team === "Just me" ? lead.team : `${lead.team} people`],
    ["Biggest time sink", lead.sink],
  ];
  return (
    <div data-bk-done className="flex flex-col lg:min-h-[34rem]">
      <span data-bk-done-hole aria-hidden className="book-done-hole">
        <svg viewBox="0 0 24 24" fill="none">
          <path data-bk-done-tick d="M6.5 12.6 10.2 16.2 17.6 8.2" />
        </svg>
      </span>
      <div role="status">
        <h3
          data-bk-done-rise
          data-bk-done-h
          tabIndex={-1}
          className="book-done-h mt-7 text-pretty text-[clamp(1.625rem,2.6vw,2.125rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink"
        >
          Thanks, {first}. Your request is in.
        </h3>
        <p data-bk-done-rise className="mt-3 max-w-[48ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite">
          We will reply to <span className="font-medium text-ink">{lead.email.trim()}</span> within one business day to set a time for
          your Weave Session.
        </p>
      </div>
      <dl data-bk-done-rise className="mt-9 border-t border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-line py-3.5 text-[0.9375rem]">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <button data-bk-done-rise type="button" onClick={onReset} className="btn btn-quiet -ml-2 mt-8 self-start lg:mt-auto">
        <span>Send another request</span>
      </button>
    </div>
  );
}
