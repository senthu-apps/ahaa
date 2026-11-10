"use client";

import { useRef, type ReactNode } from "react";
import { animate, createDrawable, createTimer, stagger, utils, type JSAnimation, type Timer } from "animejs";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Frame } from "@/components/brand/Frame";
import { LogoMark } from "@/components/brand/LogoMark";
import { Stitch } from "@/components/brand/Stitch";
import { Cross, Rule } from "@/components/site/Rails";

const SIGNAL = "#f2541b";
const BAR_IDLE = "#d3d3da";
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/* ------------------------------------------------------------------ */
/* Shared illustration parts                                           */
/* ------------------------------------------------------------------ */

/** Sheets peeking out behind a mock, like a stack of documents. */
function Sheets() {
  return <div aria-hidden className="absolute -inset-x-[21px] inset-y-7 rounded-[16px] bg-surface shadow-[0_0_0_1px_var(--line)]" />;
}

const mockSurface =
  "rounded-[15px] bg-surface shadow-[0_0_0_1px_var(--line-strong),0_12px_26px_-16px_rgb(22_22_27/0.3)]";

function Cursor() {
  return (
    <svg data-fp-cursor className="absolute -bottom-[42px] left-[60%] h-[24px] w-[20px] origin-top-left" viewBox="0 0 20 24" fill="none">
      <path
        d="M3 2.2 16.4 14l-5.6.7 3.4 6.8-2.7 1.3-3.3-6.9-4.1 4V2.2Z"
        fill="#fff"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg data-fp-spinner className="size-3.5" viewBox="-8 -8 16 16" fill="none">
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          y1="-6.5"
          x2="0"
          y2="-3.4"
          stroke={SIGNAL}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity={1 - i * 0.11}
          transform={`rotate(${-i * 45})`}
        />
      ))}
    </svg>
  );
}

function CheckBadgeSmall() {
  return (
    <span className="relative grid size-[18px] shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]">
      <svg className="absolute inset-0" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="8.5" stroke={SIGNAL} strokeWidth="1.2" strokeLinecap="round" pathLength={100} strokeDasharray="26 100" transform="rotate(-120 9 9)" />
      </svg>
      <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 7.4 5.8 10 11 4.2" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* The three mocks                                                     */
/* ------------------------------------------------------------------ */

function QuoteMock() {
  return (
    <div className="relative w-[236px]">
      <Sheets />
      <Frame>
        <div className={`${mockSurface} px-5 pb-10 pt-5 text-center`}>
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-[7px] border border-dashed border-line-strong px-2 py-1 text-[0.6875rem] text-graphite">
            <LogoMark size={12} ground="#ffffff" />
            Project quote
          </div>
          <p className="mt-3 text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-ink">Fixed price</p>
          <p className="mt-1.5 text-[0.75rem] text-graphite">Priced up front</p>
          <dl className="mt-4 text-left text-[0.6875rem]">
            {[
              ["Scope", "Automation Map"],
              ["Billing", "Fixed, not hourly"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-t border-line py-1.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-graphite">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Frame>
      <span
        data-fp-approve
        className="absolute -bottom-[17px] left-1/2 grid h-9 -translate-x-1/2 place-items-center rounded-[10px] bg-ink px-4 text-[0.8125rem] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_0_0_1px_#000]"
      >
        <span data-fp-label-a className="col-start-1 row-start-1 whitespace-nowrap">
          Approve quote
        </span>
        <span data-fp-label-b className="invisible col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap opacity-0">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 7.4 5.8 10 11 4.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Approved
        </span>
      </span>
      <Cursor />
    </div>
  );
}

function RetainerMock() {
  return (
    <div className="relative w-[236px]">
      <Sheets />
      <Frame>
        <div className={`${mockSurface} px-5 pb-10 pt-4`}>
          <div className="flex items-center justify-between">
            <span className="text-[0.75rem] font-semibold text-ink">Monthly retainer</span>
            <span className="flex items-center gap-1.5 rounded-full bg-signal-soft px-2 py-0.5 text-[0.625rem] font-medium text-signal-deep">
              <span data-fp-live className="size-1.5 rounded-full bg-signal" />
              Running
            </span>
          </div>
          <p className="mt-3 text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-ink">Flat fee</p>
          <p className="mt-1.5 text-[0.75rem] text-graphite">Same amount every month</p>
          {/* twelve equal bars: the fee doesn't move with the hours */}
          <div className="mt-4 flex items-end justify-between">
            {MONTHS.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span data-fp-bar className="block h-[34px] w-[9px] origin-bottom rounded-[3px]" style={{ backgroundColor: BAR_IDLE }} />
                <span className="font-mono text-[0.5rem] leading-none text-muted">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </Frame>
      <span className="absolute -bottom-[17px] left-1/2 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-surface pl-3 pr-4 text-[0.8125rem] font-medium text-graphite shadow-[0_0_0_1px_var(--line-strong),0_8px_18px_-12px_rgb(22_22_27/0.3)]">
        <Spinner />
        Keeping it running…
      </span>
    </div>
  );
}

function OwnershipMock() {
  return (
    <div className="flex w-[272px] flex-col items-center gap-[60px]">
      <div className="relative w-full">
        <div aria-hidden className="absolute inset-x-7 -top-[24px] h-10 rounded-[14px] bg-surface shadow-[0_0_0_1px_var(--line)]" />
        <div aria-hidden className="absolute inset-x-3.5 -top-[13px] h-10 rounded-[14px] bg-surface shadow-[0_0_0_1px_var(--line)]" />
        <Frame>
          <div className={`${mockSurface} grid grid-cols-[1fr_1fr_auto] items-center gap-3 px-4 py-3.5`}>
            {["Your data", "The work"].map((t) => (
              <div key={t}>
                <p className="text-[0.8125rem] font-semibold leading-tight text-ink">{t}</p>
                <p className="mt-0.5 text-[0.6875rem] text-muted">Owned by you</p>
              </div>
            ))}
            <p className="flex items-center gap-1 text-[0.8125rem] font-semibold text-ink">
              <svg data-fp-check width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7.4 5.6 10.3 11.5 3.9" stroke={SIGNAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Yours
            </p>
          </div>
        </Frame>
      </div>
      <span
        data-fp-pill
        className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface py-2 pl-2 pr-4 text-[0.8125rem] font-medium text-ink shadow-[0_0_0_1px_var(--line-strong),0_8px_18px_-12px_rgb(22_22_27/0.3)]"
      >
        <CheckBadgeSmall />
        Month to month after three months
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

/** One cell of the page grid: floating illustration, centred title + description. */
function Cell({ title, desc, index, children }: { title: string; desc: string; index: number; children: ReactNode }) {
  const divided = index > 0;
  return (
    <article
      data-fp-card
      className={`relative flex flex-col bg-white/40 transition-colors duration-500 hover:bg-white/80 ${
        divided ? "border-t border-rail lg:border-l lg:border-t-0" : ""
      }`}
    >
      {divided && (
        <>
          <Cross className="absolute left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
          <Cross className="absolute bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 lg:block" />
        </>
      )}
      <div data-fp-cell-content aria-hidden="true" className="relative grid h-[320px] place-items-center overflow-hidden">
        <div className="fp-dots absolute inset-0" />
        <div className="relative -mt-2">{children}</div>
      </div>
      <div data-fp-cell-content className="px-6 pb-12 text-center md:px-10">
        <h3 className="text-[1.25rem] font-semibold tracking-[-0.025em] text-ink">{title}</h3>
        <p className="mx-auto mt-2 max-w-[32ch] text-pretty text-[0.9375rem] leading-[1.6] text-graphite">{desc}</p>
      </div>
    </article>
  );
}

export function FixedPrice() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, el);
      const approve = q("[data-fp-approve]")[0];
      const labelA = q("[data-fp-label-a]")[0];
      const labelB = q("[data-fp-label-b]")[0];
      const cursor = q<SVGElement>("[data-fp-cursor]")[0];
      const bars = q("[data-fp-bar]");
      const pill = q("[data-fp-pill]")[0];

      if (prefersReducedMotion()) {
        // Show the story's end state, still.
        gsap.set(labelA, { autoAlpha: 0 });
        gsap.set(labelB, { autoAlpha: 1 });
        gsap.set(approve, { backgroundColor: SIGNAL });
        bars[0].style.backgroundColor = SIGNAL;
        return;
      }

      const owned: (JSAnimation | Timer)[] = [];
      const loops: (JSAnimation | Timer)[] = [];

      // ---- header: content rises in, the eyebrow stitch is sewn
      const eyebrowThread = createDrawable(q<SVGPathElement>(".fp-eyebrow .stitch-thread"), 0, 0);
      gsap.from(q("[data-fp-head]"), {
        autoAlpha: 0,
        y: 18,
        duration: 1,
        ease: "weave",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () =>
            void owned.push(animate(eyebrowThread, { draw: ["0 0", "0 1"], duration: 900, delay: 250, ease: "inOutCubic" })),
        },
      });

      // ---- story pieces, each replayable
      const checks = createDrawable(q<SVGPathElement>("[data-fp-check] path"), 0, 0);
      utils.set(bars, { scaleY: 0 });
      gsap.set(cursor, { autoAlpha: 0, x: 70, y: 46 });
      gsap.set(pill, { autoAlpha: 0, scale: 0.7, y: 8 });

      const resetApprove = () => {
        gsap.set(approve, { backgroundColor: "#16161b", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 1px #000" });
        gsap.set(labelA, { autoAlpha: 1, yPercent: 0 });
        gsap.set(labelB, { autoAlpha: 0, yPercent: 60 });
      };
      const clickApprove = () =>
        gsap
          .timeline()
          .to(cursor, { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: "power3.inOut" })
          .to([approve, cursor], { scale: 0.92, duration: 0.12, ease: "power2.in" })
          .to([approve, cursor], { scale: 1, duration: 0.4, ease: "back.out(3)" })
          .to(
            approve,
            { backgroundColor: SIGNAL, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px #d9400c", duration: 0.3 },
            "<",
          )
          .to(labelA, { autoAlpha: 0, yPercent: -60, duration: 0.25 }, "<")
          .fromTo(labelB, { autoAlpha: 0, yPercent: 60 }, { autoAlpha: 1, yPercent: 0, duration: 0.35 }, "<0.08");

      let month = 0;
      const lightMonth = (next: number) => {
        animate(bars[month], { backgroundColor: BAR_IDLE, duration: 450, ease: "outQuad" });
        month = next;
        animate(bars[month], { backgroundColor: SIGNAL, duration: 300, ease: "outQuad" });
      };
      const growBars = () =>
        owned.push(animate(bars, { scaleY: [0, 1], duration: 650, delay: stagger(55), ease: "outBack(1.6)" }));

      let retainerStarted = false;
      const startRetainer = () => {
        growBars();
        if (retainerStarted) return;
        retainerStarted = true;
        lightMonth(0);
        loops.push(
          animate(q("[data-fp-spinner]"), { rotate: 360, duration: 1300, loop: true, ease: "linear" }),
          animate(q("[data-fp-live]"), { opacity: [1, 0.25], duration: 700, loop: true, alternate: true, ease: "inOutSine" }),
          // time passes month by month; the bar height (the fee) never changes
          createTimer({ duration: 1500, loop: true, onLoop: () => lightMonth((month + 1) % MONTHS.length) }),
        );
      };
      const confirmOwnership = () => {
        owned.push(animate(checks, { draw: ["0 0", "0 1"], duration: 600, ease: "inOutCubic" }));
        gsap.fromTo(pill, { autoAlpha: 0, scale: 0.7, y: 8 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(2.2)", delay: 0.35 });
      };

      // ---- the orchestrated moment: quote approved → retainer runs → it's yours
      let storyDone = false;
      const story = gsap
        .timeline({ paused: true, defaults: { ease: "weave" }, onComplete: () => void (storyDone = true) })
        // reveal what's inside the cells, so the grid lines never move
        .from(q("[data-fp-cell-content]"), { autoAlpha: 0, y: 24, duration: 1, stagger: 0.08 })
        .add(clickApprove(), 0.55)
        .call(startRetainer, [], ">-0.1")
        .call(confirmOwnership, [], "+=0.9");

      ScrollTrigger.create({
        trigger: q("[data-fp-cards]")[0],
        start: "top 75%",
        once: true,
        onEnter: () => void story.play(),
      });

      // Loops only tick while the section is on screen.
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loops.forEach((a) => (self.isActive ? a.play() : a.pause())),
      });

      // ---- hovering a card replays its beat
      const replays: ((() => void) | undefined)[] = [
        () => {
          resetApprove();
          gsap.set(cursor, { autoAlpha: 0, x: 70, y: 46 });
          clickApprove();
        },
        growBars,
        confirmOwnership,
      ];
      const cards = q("[data-fp-card]");
      const handlers = cards.map((card, i) => {
        let last = 0;
        const h = contextSafe!(() => {
          const now = performance.now();
          if (!storyDone || now - last < 1800) return;
          last = now;
          replays[i]?.();
        });
        card.addEventListener("pointerenter", h);
        return h;
      });

      return () => {
        cards.forEach((card, i) => card.removeEventListener("pointerenter", handlers[i]));
        [...owned, ...loops].forEach((a) => a.revert());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="why-fixed-price" aria-labelledby="fixed-price-title" className="relative overflow-x-clip pt-24 md:pt-32">
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        {/* content sits inside the rails; Rules below still run out to them */}
        <header className="grid gap-6 md:px-8 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:px-10">
          <p data-fp-head className="fp-eyebrow flex items-center gap-2.5 self-start text-[0.9375rem] font-medium text-graphite lg:mt-3">
            <Stitch className="h-[18px] w-[23px]" />
            Why a fixed price
          </p>
          <div>
            <h2
              data-fp-head
              id="fixed-price-title"
              className="text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#72727d]">Hourly billing pays dev shops more when the work goes slowly.</span>{" "}
              <span className="text-ink">AI has made building software many times faster, and that speed belongs to you.</span>
            </h2>
            <div data-fp-head className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-1 md:mt-8">
              <a href="#compare" className="btn btn-quiet px-0">
                <span>Compare it with hourly work</span>
              </a>
              <p className="text-[0.9375rem] text-muted">Priced up front. Kept running on retainer.</p>
            </div>
          </div>
        </header>

        {/* Cell grid on the page structure: top/bottom are Rules, outer sides sit on
            the rails, inner dividers carry crosshairs where they meet the Rules. */}
        <Rule className="relative mt-12 md:mt-16" />
        <div data-fp-cards className="grid md:border-x md:border-rail lg:grid-cols-3">
          <Cell
            index={0}
            title="A fixed price for each project"
            desc="Every project is quoted once, before the work starts. The price doesn't climb when the work takes longer."
          >
            <QuoteMock />
          </Cell>
          <Cell
            index={1}
            title="A flat monthly retainer"
            desc="Then one flat fee each month keeps it running, the same amount whether the month is busy or quiet."
          >
            <RetainerMock />
          </Cell>
          <Cell
            index={2}
            title="Your data and the work stay yours"
            desc="You own your data and the work. Month to month after three months."
          >
            <OwnershipMock />
          </Cell>
        </div>
        <Rule className="relative" />
      </div>
    </section>
  );
}
