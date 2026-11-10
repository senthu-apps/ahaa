"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { RailMarks, Rails } from "@/components/site/Rails";
import { LiveDot } from "@/components/services/demos";
import { BOOK, TEAM } from "@/components/v2/content";
import { Stitch } from "@/components/brand/Stitch";
import { FaceSwap, PrimaryButton, Tick, useReveal } from "@/components/v2/parts";

/** True for a Bunny Stream embed URL (rendered as an iframe) rather than a direct file. */
const isEmbed = (src: string) => /mediadelivery\.net\/embed|\/embed\//.test(src);

/** Seconds of playback before the note and its call to action slide in beside the video. */
const REVEAL_AFTER = 8;

/**
 * The founder video itself: a Bunny Stream embed (iframe) when TEAM.video.src is an
 * embed URL, a plain <video> for a direct file, and the poster with a note until a
 * link is supplied. A direct file reports when REVEAL_AFTER seconds have played.
 */
function FounderVideo({ onReveal }: { onReveal: () => void }) {
  const { src, poster, name, rest } = TEAM.video;
  if (!src)
    return (
      <div className="relative size-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="size-full object-cover object-[22%_50%] opacity-70" />
        <p className="absolute inset-x-4 bottom-4 rounded-[10px] bg-black/55 px-3 py-2 text-center text-[0.75rem] font-medium text-white/85 backdrop-blur">
          {TEAM.modal.pending}
        </p>
      </div>
    );
  if (isEmbed(src))
    return (
      <iframe
        src={src}
        title={`${name} ${rest}`}
        className="size-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  return (
    <video
      src={src}
      poster={poster}
      controls
      autoPlay
      playsInline
      onTimeUpdate={(e) => {
        if (e.currentTarget.currentTime >= REVEAL_AFTER) onReveal();
      }}
      className="size-full object-cover"
    />
  );
}
/**
 * 10 · Who does the work — kept on the live site's black band (.ops-band
 * re-points the tokens, so Stitch, Rails and crosshairs draw light-on-dark).
 * Two columns: heading, body, stat line and the portfolio wordmarks on the
 * left; the founder video placeholder with the Delivery Manager block under
 * it on the right.
 */
export function Team() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null); // the video and its 8px frame
  const note = useRef<HTMLDivElement>(null); // the right-hand section
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    setRevealed(false);
  }, []);
  const reveal = useCallback(() => setRevealed(true), []);

  // Open and close the native <dialog> (focus trap, Esc) and hold the page still behind it. On
  // open the panel is clipped to the framed video alone (cut off beside it, or below it when the
  // columns stack on a phone) and shifted so what shows sits centred; the note waits, hidden.
  useEffect(() => {
    const d = dialog.current;
    const p = panel.current;
    const f = frame.current;
    const n = note.current;
    const x = closeBtn.current;
    if (!d || !p || !f || !n || !x) return;
    if (!open) {
      if (d.open) d.close();
      document.body.style.overflow = "";
      gsap.killTweensOf([p, n, x]);
      gsap.set([p, n, x, ...n.querySelectorAll("[data-note]")], { clearProps: "all" });
      return;
    }
    if (!d.open) d.showModal();
    document.body.style.overflow = "hidden";
    if (prefersReducedMotion()) return; // the whole panel at once, no reveal
    const fit = () => {
      const pr = p.getBoundingClientRect();
      const fr = f.getBoundingClientRect();
      const beside = fr.width < pr.width - 1;
      const cut = Math.max(0, beside ? pr.right - fr.right : pr.bottom - fr.bottom);
      gsap.set(p, {
        clipPath: beside ? `inset(0px ${cut}px 0px 0px round 24px)` : `inset(0px 0px ${cut}px 0px round 24px)`,
        x: beside ? cut / 2 : 0,
        y: beside ? 0 : cut / 2,
      });
      gsap.set(x, { x: beside ? -cut : 0 });
    };
    fit();
    gsap.set(n, { autoAlpha: 0 });
    gsap.from(p, { autoAlpha: 0, scale: 0.97, duration: 0.55, ease: "expo.out", clearProps: "opacity,visibility" });
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open]);

  // Without a direct file to listen to (the Bunny iframe, or the poster), the note comes in on a timer.
  useEffect(() => {
    if (!open || revealed || prefersReducedMotion()) return;
    if (TEAM.video.src && !isEmbed(TEAM.video.src)) return; // the <video> reports its own playback
    const t = window.setTimeout(reveal, REVEAL_AFTER * 1000);
    return () => window.clearTimeout(t);
  }, [open, revealed, reveal]);

  // The reveal: the cut slides off while the panel settles back to centre, then the note's lines
  // scale up into place, the call to action last with a small overshoot.
  useEffect(() => {
    const p = panel.current;
    const n = note.current;
    const x = closeBtn.current;
    if (!revealed || !p || !n || !x) return;
    const lines = n.querySelectorAll("[data-note]");
    const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    tl.to(p, { clipPath: "inset(0px 0px 0px 0px round 24px)", x: 0, y: 0, duration: 1.05 }, 0)
      .to(x, { x: 0, duration: 1.05 }, 0)
      .set(n, { autoAlpha: 1 }, 0.25)
      .from(lines, { autoAlpha: 0, scale: 0.88, x: 28, transformOrigin: "0% 50%", duration: 0.9, ease: "expo.out", stagger: 0.085 }, 0.4)
      .from(n.querySelector("[data-note-cta]"), { scale: 0.9, transformOrigin: "0% 50%", duration: 0.7, ease: "back.out(2)" }, 0.78);
    return () => {
      tl.kill();
    };
  }, [revealed]);
  useReveal(root, (q) => {
    if (prefersReducedMotion()) return;
    const logos = q("[data-team-logo]");
    gsap.set(logos, { autoAlpha: 0, y: 8 });
    ScrollTrigger.create({
      trigger: q("[data-team-logos]")[0],
      start: "top 90%",
      once: true,
      onEnter: () => void gsap.to(logos, { autoAlpha: 1, y: 0, duration: 0.7, ease: "weave", stagger: 0.07 }),
    });
    // pointer spotlight on the cards, as on the live band
    q(".ops-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  });

  const s = TEAM.stat;
  return (
    <section ref={root} id="operators" aria-labelledby="ops-title" className="ops-band relative overflow-x-clip py-24 md:py-32">
      <div aria-hidden className="ops-glow pointer-events-none absolute inset-x-0 top-0 h-[40rem]" />
      <Rails />
      <RailMarks edge="top" />
      <RailMarks edge="bottom" />

      <div className="relative mx-auto max-w-[1240px] px-5 md:px-6">
        <div className="grid gap-14 md:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:px-10">
          {/* ---------------- left: the eyebrow stacks over the heading (the half column has no room for the 12rem side column) */}
          <div>
            <p data-head className="sec-eyebrow flex items-center gap-2.5 text-[0.9375rem] font-medium text-graphite">
              <Stitch className="h-[18px] w-[23px]" />
              {TEAM.eyebrow}
            </p>
            <h2
              data-head-title
              id="ops-title"
              className="sec-h2 mt-7 max-w-[22ch] text-pretty text-[clamp(1.75rem,3.7vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              <span className="text-[#7c7c88]">{TEAM.soft}</span> <span className="text-ink">{TEAM.strong}</span>
            </h2>
            <p data-head className="mt-6 max-w-[56ch] text-pretty text-[1.0625rem] leading-[1.65] text-graphite">
              {TEAM.body}
            </p>
            <p data-head className="mt-8 max-w-[36ch] text-pretty text-[clamp(1.25rem,2vw,1.5rem)] font-medium leading-[1.35] tracking-[-0.02em] text-graphite">
              {s.before} <span className="font-semibold text-ink">{s.a}</span> {s.mid} <span className="font-semibold text-ink">{s.b}</span> {s.after}
            </p>
            <ul data-team-logos aria-label="Scale Shift Ventures companies" className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-line pt-8">
              {TEAM.logos.map((l) => (
                <li key={l.name} data-team-logo>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.src} alt={l.name} style={{ height: l.h }} className={`w-auto ${l.plain ? "team-logo-plain" : "team-logo"}`} />
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- right ---------------- */}
          <div className="grid content-start gap-4 lg:pt-3">
            <figure data-rise className="ops-card team-card p-3">
              <div className="team-video relative aspect-video overflow-hidden rounded-[16px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/people/senthu-b.jpg" alt="Senthu Velnayagam" className="team-video-photo absolute inset-0 size-full object-cover" />
                <div aria-hidden className="team-video-shade absolute inset-0" />
                <div aria-hidden className="team-video-grain absolute inset-0" />
                <span className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[0.6875rem] text-white/75">
                  <LiveDot /> 66 sec
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-haspopup="dialog"
                  aria-label={`Play: ${TEAM.video.name} ${TEAM.video.rest}`}
                  className="team-play absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M6.5 4.2v11.6L16 10 6.5 4.2Z" fill="#16161b" stroke="#16161b" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <figcaption className="px-2 pb-1.5 pt-3.5 text-[0.9375rem] text-white/80">
                {TEAM.video.name} {TEAM.video.rest}
              </figcaption>
            </figure>

            <div data-rise className="ops-card px-6 py-6 md:px-7 md:py-7">
              <div className="flex items-center gap-3">
                <FaceSwap size={40} />
                <span className="text-[0.8125rem] font-medium text-graphite">Delivery Manager</span>
              </div>
              <h3 className="mt-5 text-pretty text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-ink">{TEAM.dmHeading}</h3>
              <p className="mt-2.5 text-pretty text-[0.9375rem] leading-[1.6] text-graphite">{TEAM.dmBody}</p>
            </div>
          </div>
        </div>
      </div>

      {/* the founder video, opened by the play button: a native <dialog>. It opens as the vertical
          player alone in an 8px white frame; after REVEAL_AFTER seconds of playback the panel slides
          open to the right and the note with its call to action scales in. The player mounts only
          while open, so closing stops playback. */}
      <dialog
        ref={dialog}
        className="team-modal"
        aria-labelledby="team-modal-h"
        onClose={close}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          ref={panel}
          className="team-modal-panel ops-light relative grid max-h-[92vh] w-[min(92vw,64rem)] overflow-y-auto rounded-[24px] bg-white text-ink shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)] md:grid-cols-[auto_minmax(0,1fr)]"
        >
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            aria-label="Close"
            className="team-modal-close absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white text-ink shadow-[0_0_0_1px_var(--line-strong)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>

          {/* left: the vertical video in its 8px frame (all that shows at first) */}
          <div ref={frame} className="p-2">
            <div className="team-modal-video relative h-[52vh] w-full overflow-hidden rounded-[16px] md:aspect-[3/4] md:h-auto md:w-[min(30rem,calc((92vh_-_1rem)*0.75))]">
              {open && <FounderVideo onReveal={reveal} />}
            </div>
          </div>

          {/* right: the note and the call to action, revealed after REVEAL_AFTER seconds */}
          <div ref={note} className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-10 lg:px-12">
            <p data-note className="flex items-center gap-2.5 text-[0.8125rem] font-medium text-graphite">
              <LiveDot /> {TEAM.modal.eyebrow}
            </p>
            <h3 data-note id="team-modal-h" className="mt-4 text-pretty text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-ink">
              {TEAM.modal.heading}
            </h3>
            <p data-note className="mt-4 max-w-[46ch] text-pretty text-[1rem] leading-[1.65] text-graphite">
              {TEAM.modal.body}
            </p>
            <ul data-note className="mt-6 grid gap-3">
              {TEAM.modal.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[0.9375rem] leading-[1.5] text-ink">
                  <span className="mt-[0.2em] grid size-5 shrink-0 place-items-center rounded-full bg-signal-soft text-signal-deep">
                    <Tick className="size-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <div data-note data-note-cta className="mt-8 flex flex-wrap items-center gap-3">
              {/* the click closes the modal and the link then scrolls to #book; the ring fires once the button has landed */}
              <span className={`team-cta-halo relative inline-flex ${revealed ? "is-live" : ""}`} onClick={close}>
                <PrimaryButton href={BOOK}>{TEAM.modal.cta}</PrimaryButton>
              </span>
              <button type="button" onClick={close} className="btn btn-quiet">
                <span>{TEAM.modal.dismiss}</span>
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
