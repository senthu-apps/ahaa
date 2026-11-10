"use client";

import { useRef, useState } from "react";
import { animate, createDrawable, stagger } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { RailMarks } from "@/components/site/Rails";

const INDUSTRIES = [
  "Real estate brokerages and teams",
  "Mortgage brokerages",
  "Law firms",
  "Creative and marketing agencies",
  "Subscription products and services",
  "Accounting and bookkeeping firms",
  "Trades and field service",
];

/** Ticker speed at rest, in px per second. */
const BASE_SPEED = 52;

function IndustryList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className={`flex shrink-0 items-center ${hidden ? "motion-reduce:hidden" : ""}`}
    >
      {INDUSTRIES.map((name) => (
        <li
          key={name}
          className="flex items-center gap-[clamp(1.25rem,2.4vw,2.25rem)] pr-[clamp(1.25rem,2.4vw,2.25rem)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-none tracking-[-0.035em] whitespace-nowrap text-ink"
        >
          <span>{name}</span>
          <Stitch />
        </li>
      ))}
    </ul>
  );
}

export function IndustryTicker() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const controls = useRef<{ setPaused: (p: boolean) => void }>({ setPaused: () => {} });

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      const section = root.current!;
      const vp = viewport.current!;
      const el = track.current!;
      const firstCopy = el.firstElementChild as HTMLElement;

      // --- reveal: label + names ease in, then every stitch is sewn (anime.js)
      const threads = createDrawable(section.querySelectorAll<SVGPathElement>(".stitch-thread"), 0, 0);
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        autoAlpha: 0,
        y: 12,
        duration: 0.9,
        ease: "weave",
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: "top 88%", once: true },
      });
      gsap.from(vp, {
        autoAlpha: 0,
        x: 80,
        duration: 1.3,
        ease: "weave",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          once: true,
          onEnter: () =>
            void animate(threads, {
              draw: ["0 0", "0 1"],
              duration: 900,
              delay: stagger(110, { start: 350 }),
              ease: "inOutCubic",
            }),
        },
      });

      // --- the loop: one copy's width of travel, wrapped, driven by the ticker
      let copyWidth = firstCopy.offsetWidth;
      let x = 0;
      let visible = false;
      let hovering = false;
      let userPaused = false;
      const speed = { v: 1 };
      const setX = gsap.quickSetter(el, "x", "px");
      const wrapX = (v: number) => gsap.utils.wrap(-copyWidth, 0, v);

      const tick = (_time: number, deltaMs: number) => {
        if (!visible) return;
        x = wrapX(x - BASE_SPEED * (deltaMs / 1000) * speed.v);
        setX(x);
      };
      gsap.ticker.add(tick);

      const ro = new ResizeObserver(() => {
        copyWidth = firstCopy.offsetWidth;
        x = wrapX(x);
      });
      ro.observe(firstCopy);

      const restingSpeed = () => (userPaused ? 0 : hovering ? 0.18 : 1);

      // Scrolling pushes the ticker: faster going down, briefly backwards going up.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive),
        onUpdate: contextSafe!((self: ScrollTrigger) => {
          if (userPaused || hovering) return;
          const v = self.getVelocity();
          const target = gsap.utils.clamp(-4, 6, 1 + v / 260);
          gsap.to(speed, {
            v: target,
            duration: 0.25,
            ease: "power2.out",
            overwrite: true,
            onComplete: () => void gsap.to(speed, { v: restingSpeed(), duration: 1.4, ease: "power3.out" }),
          });
        }),
      });

      const settle = contextSafe!(() =>
        gsap.to(speed, { v: restingSpeed(), duration: 0.7, ease: "power3.out", overwrite: true }),
      );
      const onEnter = contextSafe!(() => {
        hovering = true;
        settle();
      });
      const onLeave = contextSafe!(() => {
        hovering = false;
        settle();
      });
      vp.addEventListener("pointerenter", onEnter);
      vp.addEventListener("pointerleave", onLeave);

      controls.current.setPaused = contextSafe!((p: boolean) => {
        userPaused = p;
        settle();
      });

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        vp.removeEventListener("pointerenter", onEnter);
        vp.removeEventListener("pointerleave", onLeave);
        controls.current.setPaused = () => {};
      };
    },
    { scope: root },
  );

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    controls.current.setPaused(next);
  };

  return (
    <section
      ref={root}
      aria-labelledby="built-for-label"
      className="relative overflow-x-clip border-y border-rail bg-surface/70 backdrop-blur-[2px]"
    >
      <RailMarks edge="top" />
      <RailMarks edge="bottom" />
      <div className="flex flex-col md:flex-row md:items-stretch">
        <div className="gutter-start flex shrink-0 items-center justify-between gap-6 pr-5 pt-6 md:border-r md:border-rail md:py-0 md:pr-8">
          <p
            id="built-for-label"
            data-reveal
            className="text-[0.9375rem] font-medium leading-snug text-graphite md:max-w-[12rem] md:pl-6"
          >
            Built for owner-led businesses in
          </p>
          <PauseButton paused={paused} onToggle={toggle} />
        </div>

        <div
          ref={viewport}
          className="ticker-viewport min-w-0 flex-1 overflow-hidden py-6 md:py-10 motion-reduce:overflow-x-auto"
        >
          <div ref={track} className="flex w-max pl-6 will-change-transform md:pl-10">
            <IndustryList />
            <IndustryList hidden />
          </div>
        </div>
      </div>

    </section>
  );
}

function PauseButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? "Play the industry ticker" : "Pause the industry ticker"}
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
  );
}
