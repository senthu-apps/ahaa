import type { IsoName } from "@/components/brand/Iso";

/** Cost calculator (copy and math from aiweavers.com #roi). */

export const TASKS: { id: string; label: string; icon: IsoName; hours: number }[] = [
  { id: "retyping", label: "Retyping data from one system into another", icon: "keyboard", hours: 8 },
  { id: "invoicing", label: "Invoicing and chasing payments", icon: "coins", hours: 5 },
  { id: "questions", label: "Answering the same client questions", icon: "talk", hours: 6 },
  { id: "reports", label: "Building reports and spreadsheets", icon: "chart", hours: 4 },
  { id: "documents", label: "Chasing documents, signatures and follow-ups", icon: "papers", hours: 4 },
  { id: "inbox", label: "Sorting email and booking new inquiries", icon: "mail", hours: 5 },
];

export const HOURS_MAX = 40;
export const RATE = { min: 20, max: 150, step: 5, initial: 50 };

/** Share of these hours assumed automatable. */
export const AUTOMATABLE = 0.6;
/** Lowest setup fee plus a year of the Growth retainer (pricing section). */
export const SETUP_FEE = 3000;
export const GROWTH_MONTHLY = 1495;
export const FIRST_YEAR = SETUP_FEE + GROWTH_MONTHLY * 12;

export function estimate(hours: number[], rate: number) {
  const total = hours.reduce((a, b) => a + b, 0);
  const cost = total * rate * 52;
  const back = AUTOMATABLE * cost;
  return {
    total,
    cost,
    back,
    /** Hours won back each week. */
    backHours: Math.round(AUTOMATABLE * total),
    /** Dollars returned per dollar of the first year. */
    ratio: back / FIRST_YEAR,
    /** Hours a week AI Weavers must win back to cover the first year. */
    breakEven: Math.ceil(FIRST_YEAR / (52 * rate)),
  };
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export const INITIAL = estimate(
  TASKS.map((t) => t.hours),
  RATE.initial,
);
