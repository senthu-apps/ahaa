"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/LogoMark";
import { NAV, NAV_BUTTON, BOOK } from "@/components/v2/content";
import { Arrow } from "@/components/v2/parts";

/**
 * Sticky site header. Sits clear over the hero (as the live nav does), then
 * turns into a frosted bar with a hairline once the page scrolls; the
 * "Book a free audit" button stays on screen at every width (doc design note)
 * and fills in ink once the bar is stuck. Along the bar's hairline a signal
 * thread is drawn as the page is read — the reader's place on a long page.
 */
export function Header() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // highlight the menu item whose section is under the bar
  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        setCurrent(ids.find((id) => seen.get(id)) ?? null);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!prefersReducedMotion()) gsap.from(root.current, { autoAlpha: 0, y: -14, duration: 0.9, ease: "weave" });
      // the reading thread follows the page's scroll progress
      const thread = root.current!.querySelector<HTMLElement>("[data-thread]")!;
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => thread.style.setProperty("--sp", st.progress.toFixed(4)) });
    },
    { scope: root },
  );

  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      if (open) {
        gsap.fromTo(el, { autoAlpha: 0, y: -10, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "weave" });
        gsap.fromTo(
          el.querySelectorAll("[data-menu-item]"),
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "weave", delay: 0.05 },
        );
      } else {
        gsap.to(el, { autoAlpha: 0, y: -6, duration: 0.2, ease: "power2.in" });
      }
    },
    { dependencies: [open], scope: root },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={root} data-stuck={stuck || open} className="site-head fixed inset-x-0 top-0 z-50">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-5 md:px-8">
        <a href="#top" aria-label="AI Weavers home" className="shrink-0 rounded-lg">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={current === l.href.slice(1) ? "true" : undefined}
              className="head-link rounded-lg px-3 py-2 text-[0.9rem] text-graphite transition-colors duration-200 hover:bg-white hover:text-ink xl:px-3.5"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={BOOK} className="head-cta btn btn-ghost max-[359px]:px-3 max-[359px]:text-[0.8125rem]">
            {NAV_BUTTON}
            <span className="head-cta-icon hidden">
              <Arrow white size={12} />
            </span>
          </a>
          <button
            type="button"
            className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-surface shadow-[0_0_0_1px_var(--line-strong)] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d={open ? "M4 4L14 14" : "M2.5 6H15.5"} stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
              <path d={open ? "M14 4L4 14" : "M2.5 12H15.5"} stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={panel}
        id="mobile-menu"
        className="invisible absolute inset-x-4 top-[68px] rounded-2xl bg-surface p-2 opacity-0 shadow-[0_0_0_1px_var(--line),0_24px_48px_-20px_rgb(22_22_27/0.25)] lg:hidden"
      >
        <nav aria-label="Mobile">
          {NAV.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-menu-item
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[1rem] text-ink hover:bg-sunken"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <span data-thread aria-hidden className="head-thread" />
    </header>
  );
}
