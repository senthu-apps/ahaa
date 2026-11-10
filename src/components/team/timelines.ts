"use client";

import { animate, stagger, type JSAnimation } from "animejs";
import { gsap } from "@/lib/gsap";

/*
 * One builder per card. Each builder rewinds its card to the start state
 * synchronously and returns a PAUSED timeline that plays it forward to the
 * end state (the static HTML in panels.tsx). anime.js instances are handed
 * to `own` so the section can revert them on unmount.
 */

type Own = (a: JSAnimation) => void;
export type CardBuilder = (card: HTMLElement, own: Own) => gsap.core.Timeline;
export type CardKey = "portfolio" | "thread" | "crew" | "review";

const $ = (scope: Element, sel: string) => gsap.utils.toArray<HTMLElement>(sel, scope);

/** Shared opening: the card rises out of the band. */
function opening(card: HTMLElement) {
  return gsap
    .timeline({ paused: true, defaults: { ease: "weave" } })
    .fromTo(card, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 1.15 }, 0);
}

/* Portfolio: the sheet lands on its stack, the companies fill in, Kimp is flagged. */
const portfolio: CardBuilder = (card) => {
  const copy = $(card, "[data-pf-copy]");
  const sheet = $(card, "[data-pf-sheet]");
  const stack = $(card, "[data-pf-stack]");
  const rows = $(card, "[data-pf-row]");
  const badge = $(card, "[data-pf-badge]");

  gsap.set(copy, { autoAlpha: 0, y: 12 });
  gsap.set(sheet, { autoAlpha: 0, y: 44 });
  gsap.set(stack, { autoAlpha: 0, y: 26 });
  gsap.set(rows, { autoAlpha: 0, y: 10 });
  gsap.set(badge, { autoAlpha: 0, scale: 0.8 });

  return opening(card)
    .to(copy, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.2)
    .to(sheet, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.38)
    .to(stack, { autoAlpha: 1, y: 0, duration: 1.1, stagger: -0.08 }, 0.5)
    .to(rows, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.09 }, 0.75)
    .to(badge, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 1.45);
};

/* Your lead: you ask, the lead types and answers in minutes, then reports it live. */
const thread: CardBuilder = (card, own) => {
  const panel = $(card, "[data-th-panel]");
  const msgs = $(card, "[data-th-msg]");
  const typing = $(card, "[data-th-typing]");
  const dots = $(card, "[data-th-dot]");
  const reply = $(card, "[data-th-reply]");
  const fast = $(card, "[data-th-fast]");
  const attach = $(card, "[data-th-attach]");
  const composer = $(card, "[data-th-composer]");

  gsap.set(panel, { autoAlpha: 0, y: 22 });
  gsap.set(msgs, { autoAlpha: 0, y: 10 });
  gsap.set(typing, { autoAlpha: 1 });
  gsap.set(reply, { autoAlpha: 0 });
  gsap.set(fast, { autoAlpha: 0, scale: 0.85 });
  gsap.set(attach, { autoAlpha: 0, y: 6 });
  gsap.set(composer, { autoAlpha: 0 });

  let bounce: JSAnimation | undefined;
  return opening(card)
    .to(panel, { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
    .to(composer, { autoAlpha: 1, duration: 0.6 }, 0.6)
    .to(msgs[0], { autoAlpha: 1, y: 0, duration: 0.6 }, 0.55)
    .to(msgs[1], { autoAlpha: 1, y: 0, duration: 0.6 }, 1.15)
    .call(
      () => {
        bounce = animate(dots, { translateY: [0, -3, 0], duration: 720, delay: stagger(130), loop: true, ease: "inOutSine" });
        own(bounce);
      },
      [],
      1.2,
    )
    .to(typing, { autoAlpha: 0, duration: 0.2 }, 2.35)
    .call(() => void bounce?.pause(), [], 2.55)
    .to(reply, { autoAlpha: 1, duration: 0.55 }, 2.4)
    .to(fast, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, 2.6)
    .to(msgs[2], { autoAlpha: 1, y: 0, duration: 0.6 }, 3.3)
    .to(attach, { autoAlpha: 1, y: 0, duration: 0.5 }, 3.65);
};

/* Behind your lead: rings open out, spokes reach the crew, the crew checks in. */
const crew: CardBuilder = (card) => {
  const rings = $(card, "[data-crew-ring]");
  const node = $(card, "[data-crew-node]");
  const label = $(card, "[data-crew-label]");
  const lines = $(card, "[data-crew-line]");
  const chips = $(card, "[data-crew-chip]");

  gsap.set(rings, { autoAlpha: 0, scale: 0.72 });
  gsap.set(node, { autoAlpha: 0, scale: 0.5 });
  gsap.set(label, { autoAlpha: 0, y: -4 });
  gsap.set(lines, { scaleX: 0 });
  gsap.set(chips, { autoAlpha: 0, scale: 0.6 });

  return opening(card)
    .to(rings, { autoAlpha: 1, scale: 1, duration: 1.3, stagger: 0.1 }, 0.2)
    .to(node, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }, 0.45)
    .to(label, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.8)
    .to(lines, { scaleX: 1, duration: 0.8, stagger: 0.1, ease: "power2.inOut" }, 0.75)
    .to(chips, { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(2)" }, 1.25);
};

/* Reviewed by people: AI drafts fast, the lead reads every line, then makes the call. */
const review: CardBuilder = (card) => {
  const panel = $(card, "[data-rv-panel]");
  const lines = $(card, "[data-rv-line]");
  const ticks = $(card, "[data-rv-tick]");
  const pop = $(card, "[data-rv-pop]");
  const approve = $(card, "[data-rv-approve]");
  const status = (k: string) => $(card, `[data-rv-status="${k}"]`);

  gsap.set(panel, { autoAlpha: 0, y: 22 });
  gsap.set(lines, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(ticks, { autoAlpha: 0, scale: 0.4 });
  gsap.set(pop, { autoAlpha: 0, y: 8, scale: 0.97 });
  gsap.set(status("draft"), { autoAlpha: 1 });
  gsap.set([...status("review"), ...status("approved")], { autoAlpha: 0 });

  const tl = opening(card)
    .to(panel, { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
    // AI speeds up the building: the change writes itself in a couple of seconds
    .to(lines, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.42, stagger: 0.17, ease: "power2.out" }, 0.75)
    .to(status("draft"), { autoAlpha: 0, duration: 0.2 }, 2.05)
    .to(status("review"), { autoAlpha: 1, duration: 0.3 }, 2.15);

  // People review every change: the lead reads it line by line
  const read = 2.4;
  lines.forEach((line, i) => {
    const t = read + i * 0.17;
    tl.fromTo(
      line,
      { boxShadow: "inset 2px 0 0 0 rgba(255,255,255,0.55)", backgroundColor: "rgba(255,255,255,0.08)" },
      { boxShadow: "inset 2px 0 0 0 rgba(255,255,255,0)", backgroundColor: "rgba(255,255,255,0)", duration: 0.7, ease: "power1.out", immediateRender: false, clearProps: "boxShadow,backgroundColor" },
      t,
    ).to(ticks[i], { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.6)" }, t);
  });

  // …and makes the call
  const decide = read + lines.length * 0.17 + 0.35;
  return tl
    .to(pop, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 }, decide)
    .to(approve, { scale: 0.96, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, decide + 0.8)
    .to(status("review"), { autoAlpha: 0, duration: 0.2 }, decide + 1)
    .to(status("approved"), { autoAlpha: 1, duration: 0.35 }, decide + 1.05)
    .fromTo(status("approved"), { scale: 0.8 }, { scale: 1, duration: 0.55, ease: "back.out(2.6)", immediateRender: false }, decide + 1.05);
};

export const CARD_TIMELINES: Record<CardKey, CardBuilder> = { portfolio, thread, crew, review };
