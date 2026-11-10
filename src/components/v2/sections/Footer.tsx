"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/LogoMark";
import { ParticleWordmark } from "@/components/brand/ParticleWordmark";
import { RailMarks, Rails, Rule } from "@/components/site/Rails";
import { FOOTER } from "@/components/v2/content";

/** Links whose pages don't exist yet (Privacy, Terms) or whose URLs aren't supplied (social). */
const toCome = (e: React.MouseEvent) => e.preventDefault();

/**
 * 15 · Footer — the live dark band and particle wordmark, carrying the doc's
 * footer: company line, contact, navigation, legal and social links, copyright.
 * (The live footer's "Ready to weave" call to action isn't in the doc; the
 * booking section right above does that job.)
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;
      gsap.from(gsap.utils.toArray("[data-foot-rise]", el), {
        autoAlpha: 0,
        y: 22,
        duration: 1,
        ease: "weave",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
      const mark = el.querySelector("[data-foot-mark]")!;
      const word = mark.querySelector("[data-foot-word]");
      gsap.set(word, { yPercent: 100 });
      ScrollTrigger.create({
        trigger: mark,
        start: "top 92%",
        once: true,
        onEnter: () => void gsap.to(word, { yPercent: 0, duration: 1.4, ease: "weave" }),
      });
    },
    { scope: root },
  );

  const col = (title: string, links: { label: string; href?: string }[]) => (
    <div key={title}>
      <h3 className="text-[0.8125rem] font-medium text-muted">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href ?? "#"}
              onClick={l.href ? undefined : toCome}
              title={l.href ? undefined : "Link to come"}
              className="foot-link text-[0.9375rem]"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer ref={root} className="foot-band relative overflow-hidden">
      <div aria-hidden className="foot-glow pointer-events-none absolute inset-x-0 bottom-0 h-[34rem]" />
      <Rails />
      <RailMarks edge="top" />

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-6">
        <div className="grid gap-12 pb-14 pt-20 md:px-8 md:pb-16 md:pt-24 lg:grid-cols-12 lg:gap-14 lg:px-10">
          <div data-foot-rise className="lg:col-span-5">
            <a href="#top" aria-label="AI Weavers home" className="inline-flex rounded-lg">
              <Wordmark />
            </a>
            <p className="mt-6 max-w-[40ch] text-pretty text-[0.9375rem] leading-[1.65] text-graphite">
              {FOOTER.company}
              <span className="mt-1.5 block">{FOOTER.address}</span>
              <span className="block">{FOOTER.place}</span>
            </p>
            <p className="mt-3 text-[0.9375rem] leading-[1.65] text-graphite">
              <a href={`mailto:${FOOTER.email}`} className="foot-link">
                {FOOTER.email}
              </a>{" "}
              ·{" "}
              <a href={`tel:+${FOOTER.phone.replace(/\D/g, "")}`} className="foot-link">
                {FOOTER.phone}
              </a>
            </p>
          </div>
          <nav data-foot-rise aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {col("Navigation", FOOTER.nav)}
            {col(
              "Legal",
              FOOTER.legal.map((label) => ({ label })),
            )}
            {col(
              "Social",
              FOOTER.social.map((label) => ({ label })),
            )}
          </nav>
        </div>

        <Rule className="relative" />
        <div className="pt-12 md:px-8 md:pt-16 lg:px-10">
          <div data-foot-mark className="overflow-hidden">
            <ParticleWordmark data-foot-word />
          </div>
        </div>
        <Rule className="relative" />

        <div className="py-6 text-[0.8125rem] text-muted md:px-8 lg:px-10">{FOOTER.copyright}</div>
      </div>
    </footer>
  );
}
