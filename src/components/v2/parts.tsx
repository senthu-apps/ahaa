"use client";

import { Fragment, useEffect, useLayoutEffect, useState, type ReactNode, type RefObject } from "react";
import { animate, createDrawable, type JSAnimation } from "animejs";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Stitch } from "@/components/brand/Stitch";

/* ------------------------------------------------------------------ */
/* Placeholders                                                        */
/* ------------------------------------------------------------------ */

/**
 * Copy with [bracketed] placeholders: the bracket stays visible (as the doc
 * asks) and gets a dashed signal underline so reviewers can spot it.
 */
export function Ph({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[") ? (
          <span key={i} className="ph" title="Placeholder: Senthu to supply">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Faces — two headshots in a round frame, cross-fading on a timer     */
/* ------------------------------------------------------------------ */

/** Generic professional headshots (AI-generated, public/people) shown beside the Delivery Manager copy. */
export const FACES = [
  { src: "/people/man.jpg" },
  { src: "/people/woman.jpg" },
];

/**
 * A round avatar that cross-fades between the FACES every few seconds.
 * Decorative (hidden from assistive tech); holds the first face when the
 * viewer prefers reduced motion. Used in the Team card and the Book aside.
 */
export function FaceSwap({ size = 40, every = 3800, className = "" }: { size?: number; every?: number; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % FACES.length), every);
    return () => window.clearInterval(id);
  }, [every]);
  return (
    <span
      aria-hidden
      className={`relative block shrink-0 overflow-hidden rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)] ${className}`}
      style={{ width: size, height: size }}
    >
      {FACES.map((f, n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.src}
          src={f.src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out"
          style={{ opacity: n === i ? 1 : 0 }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — the house pattern: stitch eyebrow in a 12rem column */
/* beside a two-tone h2 and a lede                                      */
/* ------------------------------------------------------------------ */

export function SectionHead({
  id,
  eyebrow,
  soft,
  strong,
  lede,
  dark = false,
  children,
}: {
  id: string;
  eyebrow: string;
  soft: string;
  strong: string;
  lede?: string;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
      <p data-head className="sec-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
        <Stitch className="h-[18px] w-[23px]" />
        {eyebrow}
      </p>
      <div>
        <h2
          data-head-title
          id={id}
          className="sec-h2 text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
        >
          <span className={dark ? "text-[#7c7c88]" : "text-[#72727d]"}>{soft}</span> <span className="text-ink">{strong}</span>
        </h2>
        {lede && (
          <p data-head className="mt-5 max-w-[56ch] text-pretty text-[1.0625rem] leading-[1.6] text-graphite md:mt-6">
            <Ph text={lede} />
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Motion: the house beat for every section                             */
/* ------------------------------------------------------------------ */

/**
 * The eyebrow rises and its stitch is sewn; the heading's words rise out
 * of a mask the way the hero headline does, so every title on the page
 * arrives in one language; anything marked [data-rise] rises a few at a
 * time as it comes into view. Cards marked [data-spot] get the pointer
 * spotlight.
 */
export function useReveal(root: RefObject<HTMLElement | null>, extra?: (q: (sel: string) => HTMLElement[]) => void) {
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);
      spotlight(q("[data-spot]"));
      if (prefersReducedMotion()) return;
      const owned: JSAnimation[] = [];

      const threads = gsap.utils.toArray<SVGPathElement>(".sec-eyebrow .stitch-thread", el);
      const drawable = threads.length ? createDrawable(threads, 0, 0) : null;

      // the title: words rise out of masks, the soft half leading the ink half
      const splits = q("[data-head-title]").map((t) => SplitText.create(t, { type: "words", mask: "words", wordsClass: "hl-word" }));
      const words = splits.flatMap((s) => s.words as HTMLElement[]);

      const head = q("[data-head]");
      const tl = gsap.timeline({
        defaults: { ease: "weave" },
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () => {
            if (drawable) owned.push(animate(drawable, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" }));
          },
        },
      });
      if (head.length) tl.from(head, { autoAlpha: 0, y: 18, duration: 1, stagger: 0.1 }, 0);
      if (words.length) tl.from(words, { yPercent: 110, duration: 1.05, stagger: 0.035 }, 0.08);

      const rise = q("[data-rise]");
      if (rise.length) {
        gsap.set(rise, { autoAlpha: 0, y: 16 });
        ScrollTrigger.batch(rise, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => void gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "weave", stagger: 0.07, overwrite: true }),
        });
      }
      extra?.(q);
      return () => {
        owned.forEach((a) => a.revert());
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );
}

/**
 * Pointer spotlight on light cards: the script writes --mx / --my and the
 * CSS pools a faint warm light under the pointer (fine pointers only).
 */
export function spotlight(cards: HTMLElement[]) {
  if (!cards.length || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/** Re-measure every ScrollTrigger after a layout change (filters, show all, accordions). */
export function refreshSoon() {
  requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
}

/** Runs `fn` after layout on every change of `deps` (skipping the first render). */
export function useAfterLayout(fn: () => void, deps: unknown[]) {
  useLayoutEffect(() => {
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ------------------------------------------------------------------ */
/* Small glyphs                                                         */
/* ------------------------------------------------------------------ */

/** The house up-right arrow. `white` for the ink buttons' orange chip, currentColor otherwise. */
export function Arrow({ white = false, size = 14 }: { white?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M4 10L10 4M10 4H5M10 4V9"
        stroke={white ? "#fff" : "currentColor"}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Tick({ className = "size-3" }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.4 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Primary ink button with the orange arrow chip (the site's main call to action). */
export function PrimaryButton({ href = "#book", children, className = "" }: { href?: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={`btn btn-primary ${className}`}>
      {children}
      <span className="btn-icon">
        <Arrow white />
      </span>
    </a>
  );
}
