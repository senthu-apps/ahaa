"use client";

import { useRef, type ReactNode } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { RailMarks, Rails, Rule } from "@/components/site/Rails";
import { CrewOrbit, PortfolioSheet, ReviewPanel, ThreadPanel } from "./panels";
import { CARD_TIMELINES, type CardKey } from "./timelines";
import { LEAD, NOTE, POINTS } from "./team";

/** A bento card: illustration on top, eyebrow + headline underneath. */
function Card({ id, eyebrow, title, className = "", children }: { id: CardKey; eyebrow: string; title: string; className?: string; children: ReactNode }) {
  return (
    <article data-ops-card={id} className={`ops-card flex flex-col ${className}`}>
      <div aria-hidden className="relative flex flex-1 flex-col">
        {children}
      </div>
      <div className="relative px-6 pb-7 pt-7 md:px-8 md:pb-8">
        <p className="text-[0.9375rem] font-medium text-graphite">{eyebrow}</p>
        <h3 className="mt-2 max-w-[30ch] text-pretty text-[clamp(1.25rem,1.9vw,1.5rem)] font-semibold leading-[1.22] tracking-[-0.025em] text-ink">
          {title}
        </h3>
      </div>
    </article>
  );
}

/**
 * Who does the work — the page's one black band. The light tokens are
 * re-pointed inside `.ops-band`, so the blueprint layer (rails, rules,
 * crosshairs) and the house parts carry on, light-on-dark.
 *
 * Four bento cards, each a small story that plays once as it scrolls in:
 * the studio's companies (the proof, on the ember card), a direct thread with
 * your lead, the studio crew orbiting that lead, and an AI-drafted change a
 * person reads and approves. The orbit keeps turning while it is on screen.
 */
export function WhoDoesTheWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const owned: JSAnimation[] = [];
      const own = (a: JSAnimation) => void owned.push(a);
      const cleanups: (() => void)[] = [];

      // ---- pointer spotlight on the cards (not motion: kept for reduced-motion visitors too)
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const grid = el.querySelector<HTMLElement>("[data-ops-grid]")!;
        const onMove = (e: PointerEvent) => {
          const card = (e.target as Element).closest<HTMLElement>("[data-ops-card]");
          if (!card) return;
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
          card.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
        };
        grid.addEventListener("pointermove", onMove);
        cleanups.push(() => grid.removeEventListener("pointermove", onMove));
      }

      if (prefersReducedMotion()) return () => cleanups.forEach((fn) => fn());

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const eyebrowThread = createDrawable(el.querySelectorAll<SVGPathElement>(".ops-eyebrow .stitch-thread"), 0, 0);
      gsap.from(gsap.utils.toArray("[data-ops-head]", el), {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "weave",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () => own(animate(eyebrowThread, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" })),
        },
      });

      // ---- cards: rewound now, each plays its story as it scrolls in
      const timelines = new Map<CardKey, gsap.core.Timeline>();
      gsap.utils.toArray<HTMLElement>("[data-ops-card]", el).forEach((card) => {
        const key = card.dataset.opsCard as CardKey;
        const tl = CARD_TIMELINES[key](card, own);
        timelines.set(key, tl);
        // (the card waits 32px low, so trigger a little early)
        ScrollTrigger.create({ trigger: card, start: "top 90%", once: true, onEnter: () => void tl.play() });
      });

      // ---- the orbit turns while on screen; once the crew is in, work travels in to the lead
      const crewCard = el.querySelector<HTMLElement>('[data-ops-card="crew"]')!;
      const spin = gsap
        .timeline({ paused: true, repeat: -1, defaults: { ease: "none", duration: 110 } })
        .to(crewCard.querySelector("[data-orbit]"), { rotation: 360 }, 0)
        .to(gsap.utils.toArray("[data-crew-upright]", crewCard), { rotation: -360 }, 0);

      const node = crewCard.querySelector("[data-crew-node]");
      const travel = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 });
      gsap.utils.toArray<HTMLElement>("[data-crew-travel]", crewCard).forEach((dot, i) => {
        const at = i * 1.25;
        travel
          .fromTo(dot, { xPercent: 0 }, { xPercent: -100, duration: 1.5, ease: "power2.in" }, at)
          .fromTo(dot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, at)
          .to(dot, { autoAlpha: 0, duration: 0.2, ease: "none" }, at + 1.3)
          .to(node, { scale: 1.07, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }, at + 1.42);
      });

      let onScreen = false;
      let crewIn = false;
      timelines.get("crew")?.eventCallback("onComplete", () => {
        crewIn = true;
        if (onScreen) travel.play();
      });
      ScrollTrigger.create({
        trigger: crewCard,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          onScreen = self.isActive;
          if (onScreen) {
            spin.play();
            if (crewIn) travel.play();
          } else {
            spin.pause();
            travel.pause();
          }
        },
      });

      return () => {
        owned.forEach((a) => a.revert());
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="operators" aria-labelledby="ops-title" className="ops-band relative overflow-x-clip">
      <div aria-hidden className="ops-glow pointer-events-none absolute inset-x-0 top-0 h-[38rem]" />
      <Rails />
      <RailMarks edge="bottom" />

      <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-24 md:px-6 md:pb-28 md:pt-32">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-ops-head className="ops-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            Who does the work
          </p>
          <div>
            <h2
              data-ops-head
              id="ops-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#7c7c88]">Built by</span> <span className="text-ink">operators.</span>
            </h2>
            <p data-ops-head className="mt-5 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              {LEAD}
            </p>
          </div>
        </header>

        <Rule className="relative mt-12 md:mt-16" />

        <div data-ops-grid className="grid gap-4 pt-10 md:px-8 md:pt-14 lg:grid-cols-12 lg:gap-5 lg:px-10">
          {/* the proof: the studio's companies (real content, so not aria-hidden) */}
          <article data-ops-card="portfolio" className="ops-card ops-ember flex flex-col lg:col-span-7">
            <div className="px-6 pt-7 md:px-9 md:pt-9">
              <p data-pf-copy className="text-[0.9375rem] font-medium text-white/70">
                Where we come from
              </p>
              <h3
                data-pf-copy
                className="mt-2 max-w-[26ch] text-pretty text-[clamp(1.375rem,2.2vw,1.75rem)] font-semibold leading-[1.18] tracking-[-0.03em] text-white"
              >
                {NOTE}
              </h3>
            </div>
            <div className="mt-7 flex-1 px-4 pb-9 md:mt-8 md:px-9 md:pb-11">
              <PortfolioSheet />
            </div>
          </article>

          <Card id="thread" eyebrow="Your lead" title={POINTS.lead} className="lg:col-span-5">
            <ThreadPanel />
          </Card>

          <Card id="crew" eyebrow="Behind your lead" title={POINTS.studio} className="lg:col-span-5">
            <CrewOrbit />
          </Card>

          <Card id="review" eyebrow="Reviewed by people" title={POINTS.review} className="lg:col-span-7">
            <ReviewPanel />
          </Card>
        </div>
      </div>
    </section>
  );
}
