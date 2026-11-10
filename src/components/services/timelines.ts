"use client";

import { animate, stagger, utils, type JSAnimation } from "animejs";
import { gsap } from "@/lib/gsap";
import { formatCount } from "./demos";

/*
 * One builder per service demo. Each builder rewinds its demo's markup to the
 * start state synchronously and returns a PAUSED-able GSAP timeline that plays
 * it forward to the end state (the static HTML). Building fresh on every play
 * keeps replays deterministic; anime.js instances are handed to `own` so the
 * caller can revert them on the next play / unmount.
 */

const INK = "#16161b";
const MUTED = "#8b8b96";
const SIGNAL_SOFT = "#ffe9df";

type Own = (a: JSAnimation) => void;
export type DemoBuilder = (panel: HTMLElement, own: Own) => gsap.core.Timeline;

const $ = <T extends Element = HTMLElement>(scope: Element, sel: string) => gsap.utils.toArray<T>(sel, scope);

const countText = (node: HTMLElement, v: number) =>
  formatCount(v, Number(node.dataset.dec ?? 0), node.dataset.pre ?? "", node.dataset.suf ?? "");

function resetCounts(nodes: HTMLElement[]) {
  nodes.forEach((n) => (n.textContent = countText(n, Number(n.dataset.from ?? 0))));
}

function countUp(nodes: HTMLElement[], own: Own) {
  nodes.forEach((node, i) => {
    const o = { v: Number(node.dataset.from ?? 0) };
    own(
      animate(o, {
        v: Number(node.dataset.to),
        duration: 1400,
        delay: i * 90,
        ease: "outExpo",
        onUpdate: () => void (node.textContent = countText(node, o.v)),
      }),
    );
  });
}

/** Shared opening: the copy rises, then the framed demo card. */
function opening(panel: HTMLElement) {
  return gsap
    .timeline({ paused: true, defaults: { ease: "weave" } })
    .fromTo($(panel, "[data-wb-copy]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05 }, 0)
    .fromTo($(panel, "[data-wb-card]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.12);
}

/* 1 · Automations: each step spins, lands, and the signal line carries the payment on. */
const flow: DemoBuilder = (panel) => {
  const steps = $(panel, "[data-flow-step]");
  const spin = $(panel, "[data-flow-spin]");
  const done = $(panel, "[data-flow-done]");
  const labels = $(panel, "[data-flow-label]");
  const line = $(panel, "[data-flow-line]");
  const foot = $(panel, "[data-flow-foot]");
  const last = steps.length - 1;

  gsap.set(spin, { autoAlpha: 0 });
  gsap.set(done, { autoAlpha: 0, scale: 0.4 });
  gsap.set(labels, { color: MUTED });
  gsap.set(line, { scaleY: 0 });
  gsap.set(foot, { autoAlpha: 0, y: 6 });

  const tl = opening(panel);
  let t = 0.75;
  steps.forEach((_, i) => {
    tl.set(spin[i], { autoAlpha: 1 }, t)
      .to(labels[i], { color: INK, duration: 0.3, ease: "power1.out" }, t)
      .to(done[i], { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.6)" }, t + 0.6)
      .set(spin[i], { autoAlpha: 0 }, t + 0.7);
    if (i < last) tl.to(line, { scaleY: (i + 1) / last, duration: 0.4, ease: "power2.inOut" }, t + 0.7);
    t += 0.95;
  });
  return tl.to(foot, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "weave" }, t);
};

/* 2 · AI agents: email arrives, the agent works through its steps, the reply waits for a person. */
const inbox: DemoBuilder = (panel) => {
  const email = $(panel, "[data-inbox-email]");
  const steps = $(panel, "[data-inbox-step]");
  const spin = $(panel, "[data-inbox-spin]");
  const done = $(panel, "[data-inbox-done]");
  const review = $(panel, "[data-inbox-review]");
  const rows = $(panel, "[data-inbox-row]");
  const approve = $(panel, "[data-inbox-approve], [data-inbox-note]");
  const ring = $(panel, "[data-inbox-ring]");

  gsap.set(email, { autoAlpha: 0, y: 10 });
  gsap.set(steps, { autoAlpha: 0, x: -6 });
  gsap.set(spin, { autoAlpha: 1 });
  gsap.set(done, { autoAlpha: 0, scale: 0.4 });
  gsap.set(review, { autoAlpha: 0, y: 16 });
  gsap.set(rows, { autoAlpha: 0 });
  gsap.set(approve, { autoAlpha: 0, y: 6 });
  gsap.set(ring, { autoAlpha: 0 });

  const tl = opening(panel).to(email, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.55);
  let t = 1.05;
  steps.forEach((step, i) => {
    tl.to(step, { autoAlpha: 1, x: 0, duration: 0.4, ease: "power2.out" }, t)
      .to(done[i], { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.6)" }, t + 0.5)
      .to(spin[i], { autoAlpha: 0, duration: 0.15 }, t + 0.5);
    t += 0.55;
  });
  return (
    tl
      .to(review, { autoAlpha: 1, y: 0, duration: 0.9 }, t + 0.15)
      .to(rows, { autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: "power1.out" }, t + 0.35)
      .to(approve, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, t + 0.7)
      // nothing is sent until a person approves: the button keeps breathing
      .fromTo(
        ring,
        { autoAlpha: 0.85, scaleX: 1, scaleY: 1 },
        { autoAlpha: 0, scaleX: 1.04, scaleY: 1.32, duration: 1.4, ease: "power2.out", repeat: -1, repeatDelay: 0.5 },
        t + 1.3,
      )
  );
};

/* 3 · Custom software: numbers count in, rows land, the newest job flashes. */
const jobs: DemoBuilder = (panel, own) => {
  const metrics = $(panel, "[data-jobs-metric]");
  const counts = $(panel, "[data-count]");
  const rows = $(panel, "[data-jobs-row]");
  const fresh = $(panel, "[data-jobs-new]");

  resetCounts(counts);
  gsap.set(metrics, { autoAlpha: 0, y: 8 });
  gsap.set(rows, { autoAlpha: 0, y: 8 });

  return opening(panel)
    .to(metrics, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.5)
    .call(() => countUp(counts, own), [], 0.55)
    .to(rows, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 }, 0.9)
    .fromTo(fresh, { backgroundColor: SIGNAL_SOFT }, { backgroundColor: "rgba(255, 233, 223, 0)", duration: 1.8, ease: "power2.out" }, 1.5);
};

/* 4 · Care: systems report in, the weekly hours grow bar by bar. */
const care: DemoBuilder = (panel, own) => {
  const rows = $(panel, "[data-care-row]");
  const counts = $(panel, "[data-count]");
  const bars = $(panel, "[data-care-bar]");
  const vals = $(panel, "[data-care-val]");

  resetCounts(counts);
  utils.set(bars, { scaleY: 0 });
  gsap.set(rows, { autoAlpha: 0, x: -6 });
  gsap.set(vals, { autoAlpha: 0, y: 4 });

  return opening(panel)
    .to(rows, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.5)
    .call(() => countUp(counts, own), [], 0.55)
    .call(() => own(animate(bars, { scaleY: [0, 1], duration: 750, delay: stagger(70), ease: "outBack(1.4)" })), [], 0.8)
    .to(vals, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }, 1.15);
};

export const DEMO_TIMELINES: DemoBuilder[] = [flow, inbox, jobs, care];
