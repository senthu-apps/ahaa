import type { IsoName } from "@/components/brand/Iso";

/*
 * Pricing (#pricing). Copy is verbatim from aiweavers.com; the payment
 * schedule is an illustration built from that same copy.
 */

export const HEAD = {
  eyebrow: "Pricing",
  soft: "Pay once to build.",
  strong: "Pay monthly to keep it running.",
  lede: "No hourly rates and no surprises on the invoice. Each project gets a fixed price, then a flat retainer looks after it.",
};

export const SETUP = {
  label: "Setup fee",
  figure: "$3,000–$15,000",
  unit: "once per project, USD",
  desc: "A fixed price for each project, quoted after your free Weave Session. You pay half up front and half at launch.",
};

export type Tier = {
  name: string;
  icon: IsoName;
  audience: string;
  tag: string;
  price: number;
  /** What gets built at this level — the first line of the list. */
  builds: string;
  /** "Everything in …" — the tier this one builds on. */
  inherits?: string;
  features: string[];
  featured?: boolean;
};

export const TIERS: Tier[] = [
  {
    name: "Growth",
    icon: "gear",
    audience: "For a business with one clear area to fix.",
    tag: "The usual starting point",
    price: 1495,
    builds: "A full workflow stack or an AI agent",
    features: ["Hosting, monitoring and fixes", "A few hours of improvements a month", "Monthly hours-saved report"],
    featured: true,
  },
  {
    name: "Pro",
    icon: "layers",
    audience: "For a business that runs on what we build.",
    tag: "Adds priority",
    price: 2995,
    builds: "Custom software and several agents",
    inherits: "Everything in Growth",
    features: ["Priority in the queue", "Monthly review with your lead"],
  },
  {
    name: "Scale",
    icon: "chart",
    audience: "For a business ready to rebuild how it runs.",
    tag: "Adds a strategist",
    price: 4995,
    builds: "Several systems across your teams",
    inherits: "Everything in Pro",
    features: ["More improvement hours each month", "Monthly roadmap session with a strategist", "AI usage reporting across your tools"],
  },
];

export const UNIT = "per month, USD";

export const TERMS = {
  label: "Terms of engagement",
  title: "The whole contract, in five lines.",
  clauses: [
    ["Fixed price per project", "Quoted after your free Weave Session. Half up front, half at launch."],
    ["Three-month minimum", "The retainer runs for three months, then month to month."],
    [
      "You own your data and the work",
      "It runs on our infrastructure. Cancel the retainer and we hand over an export, and it stops running on ours.",
    ],
    ["Upkeep in the retainer", "Hosting, monitoring and fixes for what we build are part of the monthly fee."],
    ["Outside costs at cost", "AI usage and paid software seats are passed through with no markup."],
  ] as const,
};

/* ------------------------------------------------------------------ */
/* Illustrations                                                       */
/* ------------------------------------------------------------------ */

/**
 * How the setup fee is paid, left to right. Each step's `line` runs from its
 * node to the next one (the last runs on into the retainer); `chip` labels it.
 */
export type PayStep = {
  event: string;
  pay: string;
  icon: IsoName;
  line: "plain" | "build" | "live";
  chip: string;
  live?: boolean;
};

export const PAY_STEPS: PayStep[] = [
  { event: "Weave Session", pay: "Free", icon: "talk", line: "plain", chip: "Automation Map" },
  { event: "Quote approved", pay: "Half up front", icon: "papers", line: "build", chip: "Build" },
  { event: "Launch", pay: "Half at launch", icon: "bolt", line: "live", chip: "Retainer starts", live: true },
];
