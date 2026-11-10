"use client";

import { useRef, useState } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Navbar, ArrowUpRight } from "@/components/site/Navbar";
import { CircuitBoard } from "./CircuitBoard";
import { CornerCircuits } from "./CornerCircuits";
import { Guarantees } from "./Guarantees";
import { Rule } from "@/components/site/Rails";

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

      const split = SplitText.create(q("[data-headline]"), {
        type: "words",
        mask: "words",
        wordsClass: "hl-word",
      });

      const tl = gsap.timeline({ defaults: { ease: "weave" } });
      tl.from(q("[data-intro='nav']"), { autoAlpha: 0, y: -14, duration: 0.9 }, 0)
        .from(q("[data-intro='pill']"), { autoAlpha: 0, y: 12, scale: 0.96, duration: 0.9 }, 0.12)
        .from(split.words, { yPercent: 115, duration: 1.15, stagger: 0.055 }, 0.2)
        .from(q("[data-intro='copy']"), { autoAlpha: 0, y: 16, duration: 1 }, 0.62)
        .from(q("[data-cta]"), { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.08 }, 0.76)
        .from(q("[data-intro='micro']"), { autoAlpha: 0, duration: 0.8 }, 0.95)
        .from(q("[data-intro='corners']"), { autoAlpha: 0, duration: 1.2 }, 0.5)
        // activate just before the board shows so traces start hidden, then draw in
        .call(() => setBoardActive(true), [], 0.78)
        .from(q("[data-intro='board']"), { autoAlpha: 0, y: 70, duration: 1.5 }, 0.85)
        .from(q("[data-guarantee]"), { autoAlpha: 0, y: 10, duration: 0.8, stagger: 0.07 }, 1.45)
        .from(
          q(".badge-arc"),
          { strokeDashoffset: 22, duration: 1.1, stagger: 0.07, ease: "power2.out" },
          1.6,
        );

      // Board responds to the pointer with a slight 3D tilt (fine pointers only).
      const board = q("[data-board-tilt]")[0] as HTMLElement | undefined;
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (!board || !mq.matches) return;

      gsap.set(board, { transformPerspective: 1600, transformOrigin: "50% 40%" });
      const rx = gsap.quickTo(board, "rotationX", { duration: 1.1, ease: "power3.out" });
      const ry = gsap.quickTo(board, "rotationY", { duration: 1.1, ease: "power3.out" });
      const onMove = contextSafe!((e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        ry(nx * 5);
        rx(-ny * 3.5);
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
    <section ref={root} aria-labelledby="hero-title" className="relative isolate overflow-hidden pb-14 md:pb-20">
      <div aria-hidden="true" className="page-grid pointer-events-none absolute inset-0 -z-10" />
      {/* z-index lives on the wrapper: GSAP's transform makes it the stacking context */}
      <div data-intro="nav" className="relative z-30">
        <Navbar />
      </div>
      <div className="relative mx-auto max-w-[1240px] md:px-6">
        <Rule className="relative" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-5 pt-6 text-center md:px-8 md:pt-7">
        <a
          href="#how-it-works"
          data-intro="pill"
          className="group inline-flex items-center gap-2.5 rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-[0.8125rem] text-graphite shadow-[0_0_0_1px_var(--line-strong),0_6px_16px_-10px_rgb(22_22_27/0.25)] transition-shadow hover:shadow-[0_0_0_1px_var(--ink),0_6px_16px_-10px_rgb(22_22_27/0.3)] sm:text-[0.875rem]"
        >
          <span className="grid size-6 place-items-center rounded-full bg-signal shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4H10M2 8H10M4 2V10M8 2V10" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="hidden sm:inline">AI automation, agents and custom software, on retainer</span>
          <span className="sm:hidden">AI automation and agents, on retainer</span>
          <span className="hidden font-semibold text-ink sm:inline">How it works</span>
        </a>

        {/* Headline block. --hl-size drives the headline type size AND the end-line
            geometry, so the end lines + wires always sit on the first headline line
            (Figma 181:8 — 77px tall at a 76px headline). */}
        <div className="relative mt-6 [--hl-size:clamp(2.25rem,10.4vw,4.75rem)] md:mt-7">
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
            <span className="line-soft block">Stop doing work</span>{" "}
            <span className="block">software should do.</span>
          </h1>
        </div>

        <p
          data-intro="copy"
          className="mx-auto mt-5 max-w-[40rem] text-pretty text-[1rem] leading-[1.62] text-graphite md:mt-6 md:text-[1.0625rem]"
        >
          AI Weavers ties your apps, data and people together, then builds and runs the automated
          workflows, AI agents and custom software your business needs. You pay a fixed setup fee for
          each project, then a flat monthly retainer to keep it running. AI does the busywork and your
          team approves what matters.
        </p>

        <div data-intro="ctas" className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <a href="#book" data-cta className="btn btn-primary">
            Book your free Weave Session
            <span className="btn-icon">
              <ArrowUpRight />
            </span>
          </a>
          <a href="#pricing" data-cta className="btn btn-quiet">
            <span>See pricing</span>
          </a>
        </div>
        <p data-intro="micro" className="mt-4 text-balance text-[0.875rem] text-muted">
          A 30-minute call. You leave with a written plan, whether you hire us or not.
        </p>
      </div>

      <div className="relative mx-auto mt-8 max-w-[1240px] px-4 md:mt-9 md:px-6">
        {/* Board frame: sides sit on the page rails; top/bottom are full-bleed rules */}
        <div className="relative border-x border-rail bg-white/55 backdrop-blur-[2px]">
          <Rule className="absolute -inset-x-px -top-px" />
          <Rule className="absolute -inset-x-px -bottom-px" />
          <div data-intro="board" className="board-mask overflow-hidden">
            <div data-board-tilt className="relative left-1/2 w-[max(100%,460px)] -translate-x-1/2 pb-4 pt-1 md:pb-6 md:pt-2">
              <CircuitBoard active={boardActive} />
            </div>
          </div>
          <div data-intro="guarantees" className="border-t border-line">
            <Guarantees />
          </div>
        </div>
      </div>
    </section>
  );
}
