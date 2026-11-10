/*
 * Book a Weave Session — copy, options and validation.
 * The fields follow the live site's old booking form (#start): name, work
 * email, company, team size, biggest time sink and optional notes. Step copy
 * is the site's own (How it works, footer CTA). Shared by the form and
 * /api/book, so the server checks exactly what the browser checks.
 */

export const HEAD = {
  eyebrow: "Book a session",
  soft: "Book your free",
  strong: "Weave Session.",
  lede: "Tell us a little about the business and where the hours go. We reply within one business day to set a time.",
};

export const NEXT = {
  label: "What happens next",
  title: "Thirty minutes, three time sinks, one written plan.",
  steps: [
    {
      title: "We reply",
      when: "Within one business day",
      body: "We write back to set a time for your call.",
    },
    {
      title: "Your Weave Session",
      when: "Free, 30 minutes",
      body: "We find your three biggest time sinks and show you what we would build first.",
    },
    {
      title: "Your Automation Map",
      when: "Within two business days",
      body: "A written plan ranked by hours saved, with a fixed price for each project. It is yours to keep, whether or not you hire us.",
    },
  ],
};

export const TEAM_SIZES = ["Just me", "2–10", "11–25", "26–50", "51–200", "200+"] as const;

/** The jobs the rest of the page shows us taking off people's plates. */
export const TIME_SINKS = [
  "Retyping data between systems",
  "Chasing invoices",
  "Answering the same questions",
  "Chasing missing documents",
  "Missed calls and slow follow-up",
  "Scheduling and reminders",
  "Reports and paperwork",
  "Something else",
] as const;

export const SUBMIT = {
  idle: "Book your free Weave Session",
  sending: "Sending",
  note: "We reply within one business day. No obligation.",
  error: "That did not go through. Please try again in a moment.",
};

export type Lead = {
  name: string;
  email: string;
  company: string;
  team: string;
  sink: string;
  notes: string;
  /** Honeypot: hidden from people, filled in by bots. */
  website: string;
};

export const EMPTY: Lead = { name: "", email: "", company: "", team: "", sink: "", notes: "", website: "" };

/** Required fields, in the order the form asks for them. */
export const REQUIRED = ["name", "email", "company", "team", "sink"] as const;
export type RequiredField = (typeof REQUIRED)[number];
export type Errors = Partial<Record<keyof Lead, string>>;

export const LIMITS = { name: 120, email: 254, company: 160, notes: 2000 } as const;

const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

export function validate(v: Lead): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const company = v.company.trim();
  if (!name) e.name = "Tell us who we are talking to.";
  else if (name.length > LIMITS.name) e.name = "That name is a little long.";
  if (!email) e.email = "We need an email to reply to.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) e.email = "That email does not look right.";
  if (!company) e.company = "Which business is this for?";
  else if (company.length > LIMITS.company) e.company = "That name is a little long.";
  if (!(TEAM_SIZES as readonly string[]).includes(v.team)) e.team = "Pick the closest size.";
  if (!(TIME_SINKS as readonly string[]).includes(v.sink)) e.sink = "Pick the one that costs the most hours.";
  if (v.notes.length > LIMITS.notes) e.notes = `Keep it under ${LIMITS.notes.toLocaleString("en-US")} characters.`;
  return e;
}

/** Coerce an unknown request body into a Lead (strings only, everything else empty). */
export function toLead(body: unknown): Lead {
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (k: keyof Lead) => (typeof src[k] === "string" ? (src[k] as string) : "");
  return {
    name: str("name"),
    email: str("email"),
    company: str("company"),
    team: str("team"),
    sink: str("sink"),
    notes: str("notes"),
    website: str("website"),
  };
}
