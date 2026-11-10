"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/LogoMark";
import { ParticleWordmark } from "@/components/brand/ParticleWordmark";
import { ArrowUpRight } from "@/components/site/Navbar";
import { RailMarks, Rails, Rule } from "@/components/site/Rails";

/* Copy verbatim from the live footer. Anchors follow this build's ids (#how-it-works, #book). */
const CTA = {
  soft: "Ready to weave",
  strong: "it all together?",
  copy: "Thirty minutes, three time sinks, one written plan. No obligation.",
  button: "Book your free Weave Session",
};
const BLURB =
  "We weave your tools, data and teams into automated workflows, AI agents and custom software for owner-led businesses. A fixed setup fee for each project, then a flat monthly retainer.";
const COLUMNS = [
  {
    title: "Services",
    links: [
      ["Automations", "#services"],
      ["AI agents", "#services"],
      ["Custom software", "#services"],
      ["Cost calculator", "#roi"],
    ],
  },
  {
    title: "Firm",
    links: [
      ["How it works", "#how-it-works"],
      ["Pricing", "#pricing"],
      ["Questions", "#faq"],
      ["Book a session", "#book"],
    ],
  },
] as const;
// a literal year: Next 16 refuses `new Date()` while prerendering a client component
const COMPANY = "© 2026 AI Weavers. A Scale Shift Ventures company.";
const PLACE = "Ontario, Canada. Serving clients across North America.";

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

/**
 * Site footer — a dark band (the light tokens re-pointed by `.foot-band`,
 * as in Who does the work), carrying the page's last call to action, the
 * site links, and the wordmark at full width, set as a particle field.
 */
export function SiteFooter() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;
      const q = <T extends Element = HTMLElement>(sel: string, scope: Element = el) => gsap.utils.toArray<T>(sel, scope);

      // ---- the call to action and the links rise in as they arrive
      q("[data-foot-band]").forEach((band) => {
        gsap.from(q("[data-foot-rise]", band), {
          autoAlpha: 0,
          y: 22,
          duration: 1,
          ease: "weave",
          stagger: 0.08,
          scrollTrigger: { trigger: band, start: "top 85%", once: true },
        });
      });

      // ---- the wordmark rises off the rule
      const mark = el.querySelector("[data-foot-mark]")!;
      const word = mark.querySelector("[data-foot-word]");
      gsap.set(word, { yPercent: 100 });
      ScrollTrigger.create({
        trigger: mark,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(word, { yPercent: 0, duration: 1.4, ease: "weave" }),
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="foot-band relative overflow-hidden">
      <div aria-hidden className="foot-glow pointer-events-none absolute inset-x-0 bottom-0 h-[34rem]" />
      <Rails />
      <RailMarks edge="top" />

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-6">
        {/* the last call to action */}
        <div
          data-foot-band
          className="grid gap-8 pb-16 pt-24 md:px-8 md:pb-20 md:pt-32 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-14 lg:px-10"
        >
          <h2 data-foot-rise className="text-balance text-[clamp(2.25rem,5.2vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            <span className="text-[#7c7c88]">{CTA.soft}</span> <span className="text-ink">{CTA.strong}</span>
          </h2>
          <div data-foot-rise className="lg:pb-1.5">
            <p className="max-w-[38ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite">{CTA.copy}</p>
            {/* the halo is the wrapper's: it isolates, so the lit dot field can sit behind the button */}
            <span className="halo mt-6">
              <a href="#book" className="btn btn-primary btn-halo">
                {CTA.button}
                <span className="btn-icon">
                  <ArrowUpRight />
                </span>
              </a>
            </span>
          </div>
        </div>

        <Rule className="relative" />

        {/* who we are, and the site links */}
        <div data-foot-band className="grid gap-10 py-12 md:px-8 md:py-14 lg:grid-cols-12 lg:gap-14 lg:px-10">
          <div data-foot-rise className="lg:col-span-5">
            <Link href="/" aria-label="AI Weavers home" className="inline-flex rounded-lg">
              <Wordmark />
            </Link>
            <p className="mt-5 max-w-[46ch] text-pretty text-[0.9375rem] leading-[1.65] text-graphite">{BLURB}</p>
          </div>
          <nav data-foot-rise aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[0.8125rem] font-medium text-muted">{col.title}</h3>
                <ul className="mt-4 grid gap-3">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="foot-link text-[0.9375rem]">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Rule className="relative" />

        {/* the wordmark, standing on the rule; it rises from behind it */}
        <div className="pt-12 md:px-8 md:pt-16 lg:px-10">
          <div data-foot-mark className="overflow-hidden">
            <ParticleWordmark data-foot-word />
          </div>
        </div>

        <Rule className="relative" />

        <div className="flex flex-col gap-1.5 py-6 text-[0.8125rem] text-muted md:flex-row md:items-center md:justify-between md:px-8 lg:px-10">
          <span>{COMPANY}</span>
          <span>{PLACE}</span>
        </div>
      </div>
    </footer>
  );
}
