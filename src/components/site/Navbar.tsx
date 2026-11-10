"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Wordmark } from "@/components/brand/LogoMark";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Industries", href: "#industries" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      if (open) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: -10, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "weave" },
        );
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
    <header ref={root} className="relative z-30">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link href="/" aria-label="AI Weavers home" className="rounded-lg">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-[0.925rem] text-graphite transition-colors duration-200 hover:bg-white hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#book" className="btn btn-ghost hidden sm:inline-flex">
            Book a Weave Session
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-[11px] bg-surface shadow-[0_0_0_1px_var(--line-strong)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d={open ? "M4 4L14 14" : "M2.5 6H15.5"}
                stroke="var(--ink)"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <path
                d={open ? "M14 4L4 14" : "M2.5 12H15.5"}
                stroke="var(--ink)"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={panel}
        id="mobile-menu"
        className="invisible absolute inset-x-4 top-[68px] rounded-2xl bg-surface p-2 opacity-0 shadow-[0_0_0_1px_var(--line),0_24px_48px_-20px_rgb(22_22_27/0.25)] md:hidden"
      >
        <nav aria-label="Mobile">
          {LINKS.map((l) => (
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
          <a
            href="#book"
            data-menu-item
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-2 w-full justify-between"
          >
            Book your free Weave Session
            <span className="btn-icon">
              <ArrowUpRight />
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 10L10 4M10 4H5M10 4V9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
