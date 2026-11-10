"use client";

import { useRef, useState, type ReactNode } from "react";
import { siAirtable, siHubspot, siNotion, siQuickbooks, siShopify, siStripe, siXero } from "simple-icons";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { RailMarks } from "@/components/site/Rails";
import { INTEGRATIONS } from "@/components/v2/content";

/* ------------------------------------------------------------------ */
/* Marks, in their own colours. Single-colour marks come from            */
/* simple-icons with the brand hex it carries; the multi-colour ones     */
/* (Google, Slack, Microsoft 365) and the ones simple-icons lacks         */
/* (Twilio, Salesforce, Follow Up Boss) are drawn inline. Treat the drawn */
/* ones as stand-ins until Senthu confirms the list and supplies approved */
/* artwork. Agent360 uses its real wordmark (WORDMARKS below).            */
/* ------------------------------------------------------------------ */

const si = (icon: { path: string; hex: string }) => (
  <svg viewBox="0 0 24 24" className="size-[28px] shrink-0" aria-hidden="true">
    <path d={icon.path} fill={`#${icon.hex}`} />
  </svg>
);

const MARKS: Record<string, ReactNode> = {
  QuickBooks: si(siQuickbooks),
  Xero: si(siXero),
  HubSpot: si(siHubspot),
  Stripe: si(siStripe),
  Shopify: si(siShopify),
  Airtable: si(siAirtable),
  Notion: si(siNotion),
  "Google Workspace": (
    <svg viewBox="0 0 48 48" className="size-[28px] shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  ),
  Slack: (
    <svg viewBox="0 0 127 127" className="size-[28px] shrink-0" aria-hidden="true">
      <path fill="#E01E5A" d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" />
      <path fill="#36C5F0" d="M47 27c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.5 39.7.6 47 .6c7.3 0 13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2H47z" />
      <path fill="#2EB67D" d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6c7.3 0 13.2 5.9 13.2 13.2v33.1z" />
      <path fill="#ECB22E" d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" />
    </svg>
  ),
  "Microsoft 365": (
    <svg viewBox="0 0 24 24" className="size-[28px] shrink-0" aria-hidden="true">
      <rect x="1.5" y="1.5" width="10" height="10" fill="#F25022" />
      <rect x="12.5" y="1.5" width="10" height="10" fill="#7FBA00" />
      <rect x="1.5" y="12.5" width="10" height="10" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="10" height="10" fill="#FFB900" />
    </svg>
  ),
  Twilio: (
    <svg viewBox="0 0 24 24" className="size-[28px] shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#F22F46" />
      <circle cx="8.6" cy="8.6" r="2.3" fill="#fff" />
      <circle cx="15.4" cy="8.6" r="2.3" fill="#fff" />
      <circle cx="8.6" cy="15.4" r="2.3" fill="#fff" />
      <circle cx="15.4" cy="15.4" r="2.3" fill="#fff" />
    </svg>
  ),
  Salesforce: (
    <svg viewBox="0 0 24 24" className="size-[28px] shrink-0" aria-hidden="true">
      <g fill="#00A1E0">
        <circle cx="7" cy="13.5" r="4.6" />
        <circle cx="11.2" cy="9.6" r="4.9" />
        <circle cx="16.2" cy="11.6" r="4.2" />
        <circle cx="18.6" cy="14.6" r="3.4" />
        <rect x="5.2" y="13" width="14.5" height="5.2" rx="2.6" />
      </g>
    </svg>
  ),
  /* three stacked chevron bands in the brand's amber, blue and red (stand-in for the FUB emblem) */
  "Follow Up Boss": (
    <svg viewBox="0 0 24 24" className="size-[28px] shrink-0" aria-hidden="true">
      <g fill="none" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 9.6 12 4.2l7.5 5.4" stroke="#F3B942" />
        <path d="M4.5 14.7 12 9.3l7.5 5.4" stroke="#4EADDD" />
        <path d="M4.5 19.8 12 14.4l7.5 5.4" stroke="#EB484B" />
      </g>
    </svg>
  ),
};

/* Brands whose real artwork we have: the whole wordmark stands in for mark + name.
   Files live in this folder's logos/ and are inlined at build (see build.mjs). */
const WORDMARKS: Record<string, { src: string; alt: string; h: number }> = {
  "Agent360.io": { src: "/logos/agent360.svg", alt: "Agent360", h: 34 },
};

const SPEED = 38; // px per second

function Mark({ name }: { name: string }) {
  const wordmark = WORDMARKS[name];
  if (wordmark)
    return (
      <li className="int-logo flex shrink-0 items-center pr-[clamp(2.25rem,4.5vw,4rem)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmark.src} alt={wordmark.alt} style={{ height: wordmark.h }} className="w-auto" />
      </li>
    );
  return (
    <li className="int-logo flex shrink-0 items-center gap-3 pr-[clamp(2.25rem,4.5vw,4rem)]">
      {MARKS[name] ?? (
        <span aria-hidden className="grid size-[28px] shrink-0 place-items-center rounded-[7px] border-[1.5px] border-current text-[0.8125rem] font-bold leading-none">
          {name[0]}
        </span>
      )}
      <span className="whitespace-nowrap text-[1.25rem] font-semibold tracking-[-0.025em]">{name}</span>
    </li>
  );
}

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className={`flex shrink-0 items-center ${hidden ? "motion-reduce:hidden" : ""}`}>
      {INTEGRATIONS.logos.map((n) => (
        <Mark key={n} name={n} />
      ))}
    </ul>
  );
}

/**
 * 2 · Integrations strip — the band the industry ticker used to hold: a label
 * cell on the left rail (its heading carries the "4,000+" figure), one row of
 * logos in their own colours drifting past on the right (pausable; slows
 * under the pointer; static and scrollable for reduced motion).
 */
export function Integrations() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const ctl = useRef<{ setPaused: (p: boolean) => void }>({ setPaused: () => {} });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const section = root.current!;
      const vp = viewport.current!;
      const el = track.current!;
      const first = el.firstElementChild as HTMLElement;

      gsap.from(section.querySelectorAll("[data-reveal]"), {
        autoAlpha: 0,
        y: 12,
        duration: 0.9,
        ease: "weave",
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: "top 90%", once: true },
      });
      gsap.from(vp, { autoAlpha: 0, x: 80, duration: 1.3, ease: "weave", scrollTrigger: { trigger: section, start: "top 90%", once: true } });

      let width = first.offsetWidth;
      let x = 0;
      let visible = false;
      let hovering = false;
      let userPaused = false;
      const speed = { v: 1 };
      const setX = gsap.quickSetter(el, "x", "px");
      const wrap = (v: number) => gsap.utils.wrap(-width, 0, v);
      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        x = wrap(x - SPEED * (dt / 1000) * speed.v);
        setX(x);
      };
      gsap.ticker.add(tick);
      const ro = new ResizeObserver(() => {
        width = first.offsetWidth;
        x = wrap(x);
      });
      ro.observe(first);
      const rest = () => (userPaused ? 0 : hovering ? 0.2 : 1);
      ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
      const onEnter = () => {
        hovering = true;
        gsap.to(speed, { v: rest(), duration: 0.6 });
      };
      const onLeave = () => {
        hovering = false;
        gsap.to(speed, { v: rest(), duration: 0.6 });
      };
      vp.addEventListener("pointerenter", onEnter);
      vp.addEventListener("pointerleave", onLeave);
      ctl.current.setPaused = (p) => {
        userPaused = p;
        gsap.to(speed, { v: rest(), duration: 0.5 });
      };
      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        vp.removeEventListener("pointerenter", onEnter);
        vp.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root },
  );

  const toggle = () => {
    setPaused(!paused);
    ctl.current.setPaused(!paused);
  };

  return (
    <section ref={root} aria-labelledby="int-h" className="relative overflow-x-clip border-y border-rail bg-surface/70 backdrop-blur-[2px]">
      <RailMarks edge="top" />
      <RailMarks edge="bottom" />
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="gutter-start flex shrink-0 items-start justify-between gap-6 pr-5 pt-7 md:w-[calc((100%-1240px)/2+21rem)] md:min-w-[19rem] md:border-r md:border-rail md:py-8 md:pr-8">
          <div className="md:pl-6">
            <h2 id="int-h" data-reveal className="max-w-[17rem] text-pretty text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-ink">
              {INTEGRATIONS.heading}
            </h2>
            <p data-reveal className="mt-2 max-w-[17rem] text-pretty text-[0.875rem] leading-[1.5] text-graphite">
              {INTEGRATIONS.under}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={paused}
            aria-label={paused ? "Play the logo row" : "Pause the logo row"}
            data-reveal
            className="grid size-9 shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong),0_4px_12px_-6px_rgb(22_22_27/0.25)] transition-shadow hover:shadow-[0_0_0_1px_var(--ink),0_4px_12px_-6px_rgb(22_22_27/0.3)] motion-reduce:hidden"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              {paused ? (
                <path d="M3.5 2.2v7.6L10 6 3.5 2.2Z" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1" strokeLinejoin="round" />
              ) : (
                <path d="M4 2.5v7M8 2.5v7" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        <div ref={viewport} className="ticker-viewport flex min-w-0 flex-1 items-center overflow-hidden py-7 md:py-0 motion-reduce:overflow-x-auto">
          <div ref={track} className="flex w-max pl-6 will-change-transform md:pl-10" role="list" aria-label="Software we connect">
            <Row />
            <Row hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
