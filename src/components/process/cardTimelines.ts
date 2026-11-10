"use client";

import { gsap } from "@/lib/gsap";
import { CELLS, FAULT } from "./cards";

/*
 * One builder per How-it-works card. Each rewinds its card's markup to the
 * start state synchronously and returns a paused GSAP timeline that plays it
 * forward to the end state (the static HTML). Building fresh on every play
 * keeps replays deterministic, whatever state a killed run left behind.
 */

const INK = "#16161b";
const MUTED = "#8b8b96";
const SIGNAL = "#f2541b";
const SIGNAL_DEEP = "#d9400c";
const SOFT = "#ffe9df";
const IDLE = "#dcdce2";
const PASSED = "#5c5c68"; /* --graphite: a check that ran clean */

export type CardBuilder = (card: HTMLElement) => gsap.core.Timeline;

const $ = <T extends Element = HTMLElement>(scope: Element, sel: string) => gsap.utils.toArray<T>(sel, scope);

/** Shared opening: the framed card rises in. */
function opening(card: HTMLElement) {
  return gsap
    .timeline({ paused: true, defaults: { ease: "weave" } })
    .fromTo($(card, "[data-hc-frame]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0);
}

/** Where to put the cursor tip on `target`, in its offset parent's space. Measure before rewinding. */
function aim(cursor: Element, target: Element) {
  const host = (cursor as SVGElement).parentElement!.getBoundingClientRect();
  const r = target.getBoundingClientRect();
  return { x: r.left - host.left + r.width * 0.56, y: r.top - host.top + r.height * 0.58 };
}

/** The cursor glides in and clicks; the target dips with it. Returns the moment of the click. */
function click(tl: gsap.core.Timeline, cursor: Element, target: Element, at: { x: number; y: number }, t: number) {
  gsap.set(cursor, { x: at.x + 76, y: at.y + 54, autoAlpha: 0, scale: 1 });
  tl.to(cursor, { autoAlpha: 1, duration: 0.25 }, t)
    .to(cursor, { x: at.x, y: at.y, duration: 0.8, ease: "power3.inOut" }, t)
    .to([cursor, target], { scale: 0.93, duration: 0.12, ease: "power2.in" }, t + 0.85)
    .to([cursor, target], { scale: 1, duration: 0.4, ease: "back.out(3)" }, t + 0.97)
    .to(cursor, { autoAlpha: 0, duration: 0.3 }, t + 1.5);
  return t + 0.97;
}

/** Numbers count up from 0 to data-to. */
function countUp(tl: gsap.core.Timeline, nodes: HTMLElement[], t: number, each = 0.12) {
  nodes.forEach((n, i) => {
    const o = { v: 0 };
    n.textContent = "0";
    tl.to(o, { v: Number(n.dataset.to), duration: 0.9, ease: "power2.out", onUpdate: () => void (n.textContent = String(Math.round(o.v))) }, t + i * each);
  });
}

/* 01 · Weave Session: a slot is booked, then the call surfaces the three biggest time sinks. */
const session: CardBuilder = (card) => {
  const cursor = $(card, "[data-hc-cursor]")[0];
  const target = $(card, "[data-ws-target]")[0];
  const at = aim(cursor, target);
  const slots = $(card, "[data-ws-slot]");
  const on = $(card, "[data-ws-on]");
  const call = $(card, "[data-ws-call]");
  const sinks = $(card, "[data-ws-sink]");
  const first = $(card, "[data-ws-first]");

  gsap.set(slots, { autoAlpha: 0, y: 6 });
  gsap.set(on, { autoAlpha: 0, scale: 0.85 });
  gsap.set(call, { autoAlpha: 0 });
  gsap.set(sinks, { autoAlpha: 0, x: -8 });
  gsap.set(sinks[0], { backgroundColor: "rgba(255, 233, 223, 0)" });
  gsap.set(first, { autoAlpha: 0, scale: 0.6 });

  const tl = opening(card).to(slots, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04 }, 0.3);
  const hit = click(tl, cursor, target, at, 0.75);
  tl.to(on, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, hit)
    .to(call, { autoAlpha: 1, duration: 0.5 }, hit + 0.45)
    .to(sinks, { autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.14 }, hit + 0.6);
  countUp(tl, $(card, "[data-n]"), hit + 0.65, 0.14);
  return tl
    .to(sinks[0], { backgroundColor: SOFT, duration: 0.5, ease: "power1.out" }, hit + 1.6)
    .to(first, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, hit + 1.65);
};

/* 02 · Automation Map: projects arrive in the order they were found, get measured, then rank. */
const map: CardBuilder = (card) => {
  const rows = $(card, "[data-map-row]");
  const pitch = rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 0;
  const found = [2, 0, 1]; // where each ranked row sits before ranking

  gsap.set($(card, "[data-map-head]"), { autoAlpha: 0 });
  // higher-ranked rows travel over the others as they sort into place
  gsap.set(rows, { autoAlpha: 0, y: (i: number) => (found[i] - i) * pitch, zIndex: (i: number) => rows.length - i });
  gsap.set($(card, "[data-map-bar]"), { scaleX: 0 });
  gsap.set($(card, "[data-map-rank]"), { autoAlpha: 0 });
  gsap.set($(card, "[data-map-price]"), { autoAlpha: 0, scale: 0.6 });
  gsap.set($(card, "[data-map-foot]"), { autoAlpha: 0, y: 6 });

  return opening(card)
    .to($(card, "[data-map-head]"), { autoAlpha: 1, duration: 0.5 }, 0.3)
    .to(rows, { autoAlpha: 1, duration: 0.45, stagger: (i: number) => found[i] * 0.12 }, 0.4)
    .to($(card, "[data-map-bar]"), { scaleX: 1, duration: 0.9, stagger: 0.1, ease: "power3.out" }, 0.8)
    .to(rows, { y: 0, duration: 0.8, ease: "power3.inOut" }, 1.85)
    .to(rows[0], { scale: 1.03, boxShadow: "inset 0 0 0 1px #e4e4e8, 0 10px 22px -12px rgba(22,22,27,0.35)", duration: 0.4, yoyo: true, repeat: 1, ease: "power2.out" }, 1.85)
    .to($(card, "[data-map-rank]"), { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, 2.45)
    .to($(card, "[data-map-price]"), { autoAlpha: 1, scale: 1, duration: 0.45, stagger: 0.12, ease: "back.out(2.2)" }, 2.65)
    .to($(card, "[data-map-foot]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 3.15);
};

/* 03 · First project: approved, the lead is assigned, the build starts. */
const approve: CardBuilder = (card) => {
  const cursor = $(card, "[data-hc-cursor]")[0];
  const btn = $(card, "[data-ap-btn]")[0];
  const at = aim(cursor, btn);
  const a = $(card, "[data-ap-a]");
  const b = $(card, "[data-ap-b]");
  const lead = $(card, "[data-ap-lead]");
  const build = $(card, "[data-ap-build]");
  const assigned = $(card, "[data-ap-assigned]");
  const bar = $(card, "[data-ap-bar]");

  gsap.set($(card, "[data-ap-row]"), { autoAlpha: 0, y: 6 });
  gsap.set(btn, { autoAlpha: 0, backgroundColor: INK, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px #000" });
  gsap.set(a, { autoAlpha: 1, yPercent: 0 });
  gsap.set(b, { autoAlpha: 0, yPercent: 60 });
  gsap.set([lead, build], { autoAlpha: 0, y: 8 });
  gsap.set(assigned, { autoAlpha: 0, scale: 0.6 });
  gsap.set(bar, { scaleX: 0 });

  const tl = opening(card)
    .to($(card, "[data-ap-row]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.3)
    .to(btn, { autoAlpha: 1, duration: 0.4 }, 0.55);
  const hit = click(tl, cursor, btn, at, 0.8);
  return tl
    .to(btn, { backgroundColor: SIGNAL, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px ${SIGNAL_DEEP}`, duration: 0.3 }, hit)
    .to(a, { autoAlpha: 0, yPercent: -60, duration: 0.25 }, hit)
    .to(b, { autoAlpha: 1, yPercent: 0, duration: 0.35 }, hit + 0.08)
    .to(lead, { autoAlpha: 1, y: 0, duration: 0.6 }, hit + 0.55)
    .to(assigned, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, hit + 1)
    .to(build, { autoAlpha: 1, y: 0, duration: 0.6 }, hit + 1.25)
    .to(bar, { scaleX: 1, duration: 1.4, ease: "power2.out" }, hit + 1.5);
};

/* 04 · Launch: built, tested, launched — then it switches on and the retainer starts. */
const launch: CardBuilder = (card) => {
  const steps = $(card, "[data-lc-step]");
  const spin = $(card, "[data-lc-spin]");
  const done = $(card, "[data-lc-done]");
  const labels = $(card, "[data-lc-label]");
  const line = $(card, "[data-lc-line]");
  const row = $(card, "[data-lc-switchrow]");
  const live = $(card, "[data-lc-live]");
  const ledger = $(card, "[data-lc-ledger]");
  const last = steps.length - 1;

  gsap.set(spin, { autoAlpha: 0 });
  gsap.set(done, { autoAlpha: 0, scale: 0.4 });
  gsap.set(labels, { color: MUTED });
  gsap.set(line, { scaleY: 0 });
  gsap.set(row, { autoAlpha: 0, y: 8 });
  gsap.set($(card, "[data-lc-track]"), { backgroundColor: IDLE });
  gsap.set($(card, "[data-lc-knob]"), { x: 0 });
  gsap.set(live, { autoAlpha: 0, x: -4 });
  gsap.set(ledger, { autoAlpha: 0, y: 6 });

  const tl = opening(card);
  let t = 0.45;
  steps.forEach((_, i) => {
    tl.set(spin[i], { autoAlpha: 1 }, t)
      .to(labels[i], { color: INK, duration: 0.3, ease: "power1.out" }, t)
      .to(done[i], { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2.6)" }, t + 0.55)
      .set(spin[i], { autoAlpha: 0 }, t + 0.65);
    if (i < last) tl.to(line, { scaleY: (i + 1) / last, duration: 0.4, ease: "power2.inOut" }, t + 0.65);
    t += 0.85;
  });
  return tl
    .to(row, { autoAlpha: 1, y: 0, duration: 0.6 }, t)
    .to($(card, "[data-lc-knob]"), { x: 16, duration: 0.45, ease: "back.out(2)" }, t + 0.6)
    .to($(card, "[data-lc-track]"), { backgroundColor: SIGNAL, duration: 0.3 }, t + 0.62)
    .to(live, { autoAlpha: 1, x: 0, duration: 0.4 }, t + 0.8)
    .to(ledger, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, t + 1.05);
};

/* 05 · Retainer: checks run; one fails, is caught and fixed; improvements; the next thing gets its own quote. */
const retainer: CardBuilder = (card) => {
  const cells = $(card, "[data-rt-cell]");
  const mark = $(card, "[data-rt-mark]");
  const log = $(card, "[data-rt-log]");
  const next = $(card, "[data-rt-next]");
  const before = cells.slice(0, FAULT);
  const after = cells.slice(FAULT + 1, CELLS);

  gsap.set(cells, { backgroundColor: IDLE });
  gsap.set(mark, { autoAlpha: 0, scale: 0.4 });
  gsap.set(log, { autoAlpha: 0, x: -8 });
  gsap.set(next, { autoAlpha: 0, y: 10 });

  const step = 0.045;
  const tFault = 0.45 + FAULT * step;
  return opening(card)
    .to(before, { backgroundColor: PASSED, duration: 0.15, stagger: step }, 0.45)
    .to(cells[FAULT], { backgroundColor: SIGNAL, duration: 0.15 }, tFault)
    .to(cells[FAULT], { scaleY: 1.15, transformOrigin: "50% 100%", duration: 0.2, yoyo: true, repeat: 3 }, tFault)
    .to(log[0], { autoAlpha: 1, x: 0, duration: 0.5 }, tFault + 0.35)
    .to(cells[FAULT], { backgroundColor: PASSED, duration: 0.3 }, tFault + 0.9)
    .to(mark, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2.4)" }, tFault + 0.9)
    .to(after, { backgroundColor: PASSED, duration: 0.15, stagger: step }, tFault + 1.1)
    .to(log.slice(1), { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.25 }, tFault + 1.25)
    .to(next, { autoAlpha: 1, y: 0, duration: 0.7 }, tFault + 2);
};

export const CARD_TIMELINES: CardBuilder[] = [session, map, approve, launch, retainer];
