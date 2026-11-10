"use client";

import { useRef } from "react";
import { IsoIcon } from "@/components/brand/Iso";
import { Rule } from "@/components/site/Rails";
import { SECURITY, SECURITY_HEAD } from "@/components/v2/content";
import { SectionHead, useReveal } from "@/components/v2/parts";

/** 11 · Security and data handling — six small cards with iso icons, two rows of three. */
export function Security() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} id="security" aria-labelledby="sec-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        <SectionHead id="sec-title" {...SECURITY_HEAD} />

        <Rule className="relative mt-12 md:mt-16" />
        <div className="-mx-5 md:mx-0 md:border-x md:border-rail">
          <ul className="grid gap-px bg-rail sm:grid-cols-2 lg:grid-cols-3">
            {SECURITY.map((c) => (
              <li key={c.title} data-rise className="bg-canvas">
                <article data-spot className="sec-card flex h-full gap-5 px-5 py-8 md:px-8 lg:px-10 lg:py-10">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[14px] bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
                    <IsoIcon name={c.icon} className="size-12" />
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-pretty text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] text-ink">{c.title}</h3>
                    <p className="mt-1.5 text-pretty text-[0.9375rem] leading-[1.55] text-graphite">{c.body}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
