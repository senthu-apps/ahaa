"use client";

import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { CircuitBoard } from "@/components/hero/CircuitBoard";
import { CornerCircuits } from "@/components/hero/CornerCircuits";
import { Rule } from "@/components/site/Rails";
import { HERO, BOOK } from "@/components/v2/content";
import { PrimaryButton } from "@/components/v2/parts";

/** Keeps a hyphenated phrase on one line, so the browser never turns the line at its hyphen. */
function noBreak(text: string, phrase: string) {
  const parts = text.split(phrase);
  return parts.flatMap((part, i) =>
    i < parts.length - 1
      ? [
          part,
          <span key={i} className="whitespace-nowrap">
            {phrase}
          </span>,
        ]
      : [part],
  );
}

/** The live site's check badge: hairline ring with a short signal arc. */
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

/**
 * Hero — the live hero (grid, corner circuits, headline, circuit-board mockup
 * with the Three.js weave core) with the doc's copy. The pill above the
 * headline is gone (not in the doc); the guarantee row under the board
 * carries the doc's trust strip. The proof line under the frame was dropped
 * at the user's request (v2 review); the strip below carries the proof.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [boardActive, setBoardActive] = useState(false);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      gsap.set(q("[data-intro]"), { visibility: "visible" });

      if (prefersReducedMotion()) {
        setBoardActive(true);
        return;
      }

      const split = SplitText.create(q("[data-headline]"), { type: "words", mask: "words", wordsClass: "hl-word" });

      const tl = gsap.timeline({ defaults: { ease: "weave" } });
      tl.from(split.words, { yPercent: 115, duration: 1.15, stagger: 0.055 }, 0.1)
        .from(q("[data-intro='copy']"), { autoAlpha: 0, y: 16, duration: 1 }, 0.52)
        .from(q("[data-cta]"), { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.08 }, 0.66)
        .from(q("[data-intro='micro']"), { autoAlpha: 0, duration: 0.8 }, 0.85)
        .from(q("[data-intro='corners']"), { autoAlpha: 0, duration: 1.2 }, 0.4)
        .call(() => setBoardActive(true), [], 0.68)
        .from(q("[data-intro='board']"), { autoAlpha: 0, y: 70, duration: 1.5 }, 0.75)
        .from(q("[data-guarantee]"), { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.07 }, 1.35)
        .from(q(".badge-arc"), { strokeDashoffset: 22, duration: 1.1, stagger: 0.07, ease: "power2.out" }, 1.5);

      // the board leans toward the pointer (fine pointers only), as on the live hero
      const board = q("[data-board-tilt]")[0] as HTMLElement | undefined;
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (!board || !mq.matches) return;
      gsap.set(board, { transformPerspective: 1600, transformOrigin: "50% 40%" });
      const rx = gsap.quickTo(board, "rotationX", { duration: 1.1, ease: "power3.out" });
      const ry = gsap.quickTo(board, "rotationY", { duration: 1.1, ease: "power3.out" });
      const onMove = contextSafe!((e: PointerEvent) => {
        ry((e.clientX / window.innerWidth - 0.5) * 5);
        rx(-(e.clientY / window.innerHeight - 0.5) * 3.5);
      });
      const onLeave = contextSafe!(() => {
        rx(0);
        ry(0);
      });
      const el = root.current!;
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden pb-14 md:pb-16">
      <div aria-hidden="true" className="page-grid pointer-events-none absolute inset-0 -z-10" />
      {/* the fixed header sits over this band, as the live nav sits in it */}
      <div aria-hidden className="h-[72px]" />
      <div className="relative mx-auto max-w-[1240px] md:px-6">
        <Rule className="relative" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pt-14 text-center md:px-8 md:pt-[4.25rem]">
        <div className="relative [--hl-size:clamp(2.25rem,10.4vw,4.75rem)]">
          <div
            aria-hidden="true"
            className="title-panel pointer-events-none absolute left-1/2 -z-[1] hidden -translate-x-1/2 lg:block"
            style={{ top: "calc(var(--hl-size) * 0.013)", height: "calc(var(--hl-size) * 1.013)" }}
          />
          <CornerCircuits active={boardActive} />
          <h1
            id="hero-title"
            data-headline
            data-intro="headline"
            className="headline mx-auto text-[length:var(--hl-size)] font-semibold leading-[0.98] tracking-[-0.048em] text-ink"
          >
            <span className="line-soft block">{HERO.soft}</span> <span className="block">{HERO.strong}</span>
          </h1>
        </div>

        <p
          data-intro="copy"
          className="mx-auto mt-5 max-w-[50rem] text-pretty text-[1rem] leading-[1.62] text-graphite md:mt-6 md:text-[1.0625rem]"
        >
          {noBreak(HERO.sub, "off-the-shelf")}
        </p>

        <div data-intro="ctas" className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <span data-cta className="inline-flex max-sm:w-full">
            <PrimaryButton href={BOOK} className="hero-cta max-sm:w-full max-sm:justify-between">
              {HERO.primary}
            </PrimaryButton>
          </span>
          {/* the entrance tween runs on a plain wrapper (as for the button): the .btn's own transform
              transition would fight GSAP on the anchor and leave it sitting at its start offset */}
          <span data-cta className="inline-flex">
            <a href={HERO.secondary.href} className="btn btn-quiet">
              <span>{HERO.secondary.label}</span>
            </a>
          </span>
        </div>
        <p data-intro="micro" className="mx-auto mt-4 max-w-[34rem] text-balance text-[0.875rem] text-muted">
          {HERO.under}
        </p>
      </div>

      <div className="relative mx-auto mt-9 max-w-[1240px] px-4 md:mt-10 md:px-6">
        {/* Board frame: sides sit on the page rails; top/bottom are full-bleed rules */}
        <div className="relative border-x border-rail bg-white/55 backdrop-blur-[2px]">
          <Rule className="absolute -inset-x-px -top-px" />
          <Rule className="absolute -inset-x-px -bottom-px" />
          <div data-intro="board" className="board-mask overflow-hidden">
            <div data-board-tilt className="relative left-1/2 w-[max(100%,460px)] -translate-x-1/2 pb-4 pt-1 md:pb-6 md:pt-2">
              <CircuitBoard active={boardActive} />
            </div>
          </div>
          <div className="border-t border-line">
            <ul aria-label="Trust" className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
              {HERO.trust.map((item) => (
                <li key={item} data-guarantee className="flex items-center gap-3.5 bg-surface px-5 py-5 md:px-6">
                  <CheckBadge />
                  <span className="text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
