"use client";

import { useRef } from "react";
import { animate, createDrawable, stagger, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";
import { HEAD, SETUP, TERMS, TIERS } from "./plans";
import { PayStepper, TierCell } from "./parts";

/**
 * Pricing — the commercial model read top to bottom, on the page grid:
 * how a project is paid for (a stepper that runs on into the retainer),
 * the three retainers, the setup fee in two lines, then the terms, five
 * lines long. Copy is verbatim from the live site.
 */
export function Pricing() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;

      const q = <T extends Element = HTMLElement>(sel: string, scope: Element = el) => gsap.utils.toArray<T>(sel, scope);
      const owned: JSAnimation[] = [];
      const own = (a: JSAnimation) => void owned.push(a);

      // ---- header: rises in, the eyebrow stitch is sewn (house beat)
      const eyebrowThread = createDrawable(q<SVGPathElement>(".price-eyebrow .stitch-thread"), 0, 0);
      gsap.from(q("[data-pr-head]"), {
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

      // ---- each band's content rises in as it arrives (the grid lines stay put)
      q("[data-pr-band]").forEach((band) => {
        gsap.from(q("[data-pr-rise]", band), {
          autoAlpha: 0,
          y: 22,
          duration: 1,
          ease: "weave",
          stagger: 0.08,
          scrollTrigger: { trigger: band, start: "top 82%", once: true },
        });
      });

      // ---- the payment stepper walks left to right; the last line runs on into the retainer
      const pay = el.querySelector<HTMLElement>("[data-pay]")!;
      const steps = q("[data-pay-step]", pay);
      const nodes = q("[data-pay-node]", pay);
      const lines = q("[data-pay-line]", pay);
      gsap.set(lines, { "--f": 0 });
      nodes.forEach((n) => (n.dataset.on = "false"));
      gsap.set(q(".pay-icon, [data-pay-text]", pay), { autoAlpha: 0, y: 10 });
      gsap.set(q("[data-pay-chip]", pay), { autoAlpha: 0, scale: 0.88 });

      const walk = gsap.timeline({ paused: true, defaults: { ease: "weave" } });
      steps.forEach((step, i) => {
        const at = i * 1.05;
        walk
          .to(q(".pay-icon", step), { autoAlpha: 1, y: 0, duration: 0.9 }, at)
          .call(() => void (nodes[i].dataset.on = "true"), [], at + 0.2)
          .fromTo(nodes[i], { scale: 0.55 }, { scale: 1, duration: 0.7, ease: "back.out(2.4)" }, at + 0.2)
          .to(q("[data-pay-text]", step), { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, at + 0.25)
          .to(lines[i], { "--f": 1, duration: 0.9, ease: "power2.inOut" }, at + 0.4)
          .to(q("[data-pay-chip]", step), { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2)" }, at + 0.75);
      });
      ScrollTrigger.create({ trigger: pay, start: "top 80%", once: true, onEnter: () => void walk.play() });

      // ---- the tiers rise, every price reel spins one full turn, the ticks are drawn
      const tiers = el.querySelector<HTMLElement>("[data-tiers]")!;
      const cells = q("[data-tier]", tiers);
      const reels = cells.map((c) => q("[data-reel]", c));
      reels.flat().forEach((r) => {
        gsap.set(r, { clearProps: "transform" });
        gsap.set(r, { yPercent: -Number(r.dataset.reel) * 5 });
      });
      const ticks = cells.map((c) => createDrawable(q<SVGPathElement>("[data-tier-check] path", c), 0, 0));
      const tags = q("[data-tier-tag]", tiers);
      gsap.set(tags, { autoAlpha: 0, y: 6 });
      const rise = gsap.from(q("[data-pr-rise]", tiers), { autoAlpha: 0, y: 22, duration: 1, ease: "weave", stagger: 0.07, paused: true });

      ScrollTrigger.create({
        trigger: tiers,
        start: "top 80%",
        once: true,
        onEnter: () => {
          rise.play();
          cells.forEach((_, t) => {
            const at = 0.3 + t * 0.14;
            reels[t].forEach((r, i) =>
              gsap.to(r, { yPercent: -(10 + Number(r.dataset.reel)) * 5, duration: 1.6 + i * 0.12, ease: "expo.out", delay: at }),
            );
            gsap.to(tags[t], { autoAlpha: 1, y: 0, duration: 0.7, ease: "back.out(2)", delay: at + 0.45 });
            own(animate(ticks[t], { draw: ["0 0", "0 1"], duration: 520, ease: "inOutCubic", delay: stagger(80, { start: (at + 0.55) * 1000 }) }));
          });
        },
      });

      // ---- terms: each clause's rule is drawn as the clauses rise
      const terms = el.querySelector<HTMLElement>("[data-terms]")!;
      gsap.from(q("[data-clause-rule]", terms), {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "weave",
        stagger: 0.09,
        scrollTrigger: { trigger: terms, start: "top 82%", once: true },
      });

      return () => owned.forEach((a) => a.revert());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="pricing" aria-labelledby="price-h" className="relative overflow-x-clip pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-pr-head className="price-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            {HEAD.eyebrow}
          </p>
          <div>
            <h2 data-pr-head id="price-h" className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]">
              <span className="text-[#72727d]">{HEAD.soft}</span> <span className="text-ink">{HEAD.strong}</span>
            </h2>
            <p data-pr-head className="mt-5 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
              {HEAD.lede}
            </p>
          </div>
        </header>

        {/* How a project is paid for: the stepper runs on into the retainer */}
        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0">
          <div className="relative overflow-hidden px-5 py-10 md:border-x md:border-rail md:px-8 md:py-12 lg:px-10">
            <div aria-hidden className="fp-dots absolute inset-0" />
            <div className="relative">
              <PayStepper />
            </div>
          </div>
        </div>

        {/* The three retainers */}
        <Rule className="relative" />
        <div className="-mx-5 md:mx-0">
          <div data-tiers className="grid md:border-x md:border-rail lg:grid-cols-3">
            {TIERS.map((t, i) => (
              <TierCell key={t.name} tier={t} index={i} />
            ))}
          </div>
        </div>
        <Rule className="relative" />

        {/* The setup fee, in two lines */}
        <div data-pr-band className="-mx-5 px-5 py-8 md:mx-0 md:border-x md:border-rail md:px-8 md:py-10 lg:px-10">
          <p data-pr-rise className="text-pretty text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink">
            {SETUP.label}: {SETUP.figure} <span className="font-normal text-muted">{SETUP.unit}</span>
          </p>
          <p data-pr-rise className="mt-1.5 text-pretty text-[1rem] leading-[1.65] text-graphite">
            {SETUP.desc}
          </p>
        </div>

        {/* Terms of engagement */}
        <Rule className="relative" />
        <div data-pr-band data-terms className="-mx-5 grid md:mx-0 md:border-x md:border-rail lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div data-pr-rise className="px-5 pb-4 pt-10 md:px-8 md:pt-12 lg:sticky lg:top-12 lg:self-start lg:px-10 lg:py-12">
            <p className="flex items-center gap-3 text-[0.9375rem] font-medium text-graphite">
              <span aria-hidden className="price-hole size-7 font-mono text-[0.75rem] font-normal text-graphite">
                §
              </span>
              {TERMS.label}
            </p>
            <h3 className="mt-5 max-w-[15ch] text-pretty text-[clamp(1.625rem,2.6vw,2.125rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">
              {TERMS.title}
            </h3>
          </div>
          <ol className="relative lg:border-l lg:border-rail lg:py-4">
            <Cross className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
            {TERMS.clauses.map(([title, text], i) => (
              <li key={title} data-pr-rise className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 px-5 py-6 md:px-8 lg:px-10">
                {i > 0 && <span data-clause-rule aria-hidden className="absolute inset-x-5 top-0 h-px bg-line md:inset-x-8 lg:inset-x-10" />}
                <span className="pt-[3px] font-mono text-[0.75rem] tabular-nums text-muted">§ {i + 1}</span>
                <div>
                  <h4 className="font-semibold tracking-[-0.01em] text-ink">{title}</h4>
                  <p className="mt-1 text-pretty text-[0.9375rem] leading-[1.55] text-graphite">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
