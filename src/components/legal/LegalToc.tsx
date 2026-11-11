"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "On this page" list for /privacy and /terms. Highlights the section being read:
 * the last heading above 30% of the viewport, or the final section once the page
 * bottoms out (short closing sections never reach that line otherwise).
 */
export function LegalToc({ sections }: { sections: { id: string; heading: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const lock = useRef(0);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < lock.current) return; // a clicked item stays lit while the page scrolls to it
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      // the footer sits below the article, so "bottom" means the last section has scrolled well into view
      const last = els[els.length - 1];
      if (atBottom || (last && last.getBoundingClientRect().bottom < window.innerHeight * 0.6)) {
        setActive(last?.id);
        return;
      }
      const line = window.innerHeight * 0.3;
      let current = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <nav aria-label="On this page" className="mt-10 hidden lg:block">
      <ol className="grid gap-1 border-l border-line text-[0.875rem]">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "location" : undefined}
                onClick={() => {
                  lock.current = Date.now() + 1200;
                  setActive(s.id);
                }}
                className={`-ml-px block border-l-2 py-1 pl-4 transition-colors duration-200 ${
                  on ? "border-signal font-medium text-ink" : "border-transparent text-graphite hover:text-ink"
                }`}
              >
                {s.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
