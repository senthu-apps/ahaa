"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IsoIcon } from "@/components/brand/Iso";
import { Cross, Rule } from "@/components/site/Rails";
import { PROCESS_HEAD, STEPS } from "@/components/v2/content";
import { Ph, SectionHead, useReveal } from "@/components/v2/parts";

/**
 * 7 · How it works — five steps as one thread: a horizontal timeline across
 * the grid on desktop, a vertical one on phones. Scroll pulls the signal
 * thread from hole to hole (--p on the list, 0 → 5); each hole is ringed as
 * the thread reaches it, then inked once it has passed.
 */
export function Process() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useReveal(root);

  useGSAP(
    () => {
      const ol = list.current!;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", ol);
      const render = (p: number) => {
        ol.style.setProperty("--p", p.toFixed(3));
        steps.forEach((s, i) => (s.dataset.state = p >= i + 1 ? "done" : p >= i ? "now" : "idle"));
      };
      if (prefersReducedMotion()) return render(STEPS.length);
      render(-0.2);
      const proxy = { p: -0.2 };
      ScrollTrigger.create({
        trigger: ol,
        start: "top 72%",
        end: "bottom 38%",
        onUpdate: (st) => {
          gsap.to(proxy, { p: -0.2 + st.progress * (STEPS.length + 0.2), duration: 0.5, ease: "power2.out", overwrite: true, onUpdate: () => render(proxy.p) });
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how-it-works" aria-labelledby="how-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="how-title" {...PROCESS_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          <ol ref={list} className="pt-steps grid bg-white/40 lg:grid-cols-5" style={{ "--p": 0 } as CSSProperties}>
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-step
                data-state="idle"
                className={`hw-step pt-step relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 px-5 pb-10 pt-8 md:px-8 lg:flex lg:flex-col lg:px-7 lg:pb-12 lg:pt-10 xl:px-8 ${
                  i > 0 ? "lg:border-l lg:border-rail" : ""
                }`}
                style={{ "--i": i } as CSSProperties}
              >
                {i > 0 && (
                  <>
                    <Cross className="absolute left-0 top-0 z-[1] hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
                    <Cross className="absolute bottom-0 left-0 z-[1] hidden -translate-x-1/2 translate-y-1/2 lg:block" />
                  </>
                )}
                <IsoIcon name={s.icon} className="pt-icon -ml-1 hidden size-12 lg:block" />
                {/* the thread to the next hole */}
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="pt-link">
                    <span className="pt-under" />
                    <span className="pt-thread" />
                  </span>
                )}
                <span aria-hidden className="hw-hole pt-hole relative z-[1] lg:mt-6">
                  <svg className="hw-ring" viewBox="0 0 40 40" aria-hidden="true">
                    <path d="M20 1a19 19 0 0 1 0 38" pathLength={1} />
                    <path d="M20 1a19 19 0 0 0 0 38" pathLength={1} />
                  </svg>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 pt-[0.35rem] lg:pt-0">
                  {s.label ? (
                    <span className="pt-label lg:mt-5">{s.label}</span>
                  ) : (
                    <span aria-hidden className="hidden h-[22px] lg:mt-5 lg:block" />
                  )}
                  <h3 className="hw-title pt-title mt-3 text-pretty text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] lg:mt-4">{s.title}</h3>
                  <p className="mt-2 text-pretty text-[0.9375rem] leading-[1.55] text-graphite">
                    <Ph text={s.body} />
                  </p>
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
