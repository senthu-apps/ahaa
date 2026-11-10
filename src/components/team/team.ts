/*
 * Who does the work — copy verbatim from aiweavers.com (section #ops-h).
 * Card illustrations (thread, crew, review) use sample data; the portfolio is real.
 */

export const LEAD =
  "AI Weavers comes from Scale Shift Ventures, the studio behind the companies listed here. We run a home-buying platform, an MLS data company and a design subscription, and we built and sold a SaaS business. So we automate like owners: start with what saves the most time, then keep it running.";

/** The three team points, used as the card headlines. */
export const POINTS = {
  lead: "One senior lead who knows your business and answers to you directly.",
  studio: "Engineers and product designers from the Kimp studio behind them.",
  review: "AI speeds up the building. People make the calls and review every change.",
};

export const NOTE = "Same operators, now running your back office on the tools we use in our own.";

/**
 * A company's wordmark, from its own site (public/logos/). `w`×`h` is the
 * file's intrinsic size; `size` is the display height in px, set by eye so
 * the five marks carry the same optical weight (wide, thin marks sit lower).
 */
export type Logo = { src: string; w: number; h: number; size: number; muted?: boolean };

export type Company = { name: string; tag: string; body: string; logo: Logo; builds?: boolean };

export const COMPANIES: Company[] = [
  {
    name: "Kimp",
    tag: "Design subscription",
    body: "A flat-fee design subscription for brands and agencies. Its design and engineering team builds AI Weavers client work.",
    logo: { src: "/logos/kimp.svg", w: 98, h: 40, size: 21 },
    builds: true,
  },
  {
    name: "DesignDog.ai",
    tag: "AI design",
    body: "AI-powered design software. Brand-ready creative made in minutes, not days.",
    logo: { src: "/logos/designdog.png", w: 985, h: 267, size: 26 },
  },
  {
    name: "Repliers",
    tag: "Data infrastructure",
    body: "Real estate MLS data infrastructure. An API that brokerages and proptech products build on.",
    logo: { src: "/logos/repliers.png", w: 1364, h: 242, size: 16 },
  },
  {
    name: "Buy.ca",
    tag: "Proptech brokerage",
    body: "A Canadian home-buying platform. Cash back toward the down payment and low-commission listings.",
    logo: { src: "/logos/buyca.png", w: 1919, h: 576, size: 21 },
  },
  {
    name: "Botdog",
    tag: "SaaS, acquired",
    body: "LinkedIn automation software. Built, scaled and acquired.",
    // the light-background file is a grey logo-wall version: darkened for contrast on the sheet
    logo: { src: "/logos/botdog.png", w: 185, h: 56, size: 26, muted: true },
  },
];

/** The studio crew orbiting the lead (angles in degrees, 0 = east, clockwise). */
export const CREW = [
  { role: "Product designer", kind: "design", angle: -135 },
  { role: "AI engineer", kind: "code", angle: -45 },
  { role: "UX designer", kind: "design", angle: 45 },
  { role: "Software engineer", kind: "code", angle: 135 },
] as const;

/** The change the lead reviews: [sign, key, value]. "" = context line. */
export const DIFF: [sign: "" | "+" | "-", key: string, value: string][] = [
  ["", "trigger", "invoice is 3 days overdue"],
  ["+", "draft", "reminder in your voice"],
  ["+", "check", "skip clients on a payment plan"],
  ["-", "send", "by hand from the inbox"],
  ["+", "send", "after a person approves"],
  ["+", "log", "note on the client file"],
];
