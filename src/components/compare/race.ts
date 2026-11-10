import type { IsoName } from "@/components/brand/Iso";

/** Same project, two ways to pay: an example first quarter, week by week (copy from aiweavers.com #compare). */

export const WEEKS = 12;

export type Phase = "talk" | "paper" | "build" | "change" | "launch" | "live";

export const PHASES: { key: Phase; label: string; icon: IsoName }[] = [
  { key: "talk", label: "Meetings", icon: "talk" },
  { key: "paper", label: "Quotes and contracts", icon: "papers" },
  { key: "build", label: "Building, nothing live", icon: "gear" },
  { key: "change", label: "Change order", icon: "layers" },
  { key: "launch", label: "Launch", icon: "bolt" },
  { key: "live", label: "Live, on retainer", icon: "meter" },
];

type Week = { phase: Phase; text: string };
const w = (phase: Phase, text: string): Week => ({ phase, text });

export type Lane = {
  key: "hourly" | "weavers";
  name: string;
  /** Week the first version ships. */
  shipsAt: number;
  weeks: Week[];
  /** Bar labels, keyed by the first week of a multi-week bar. */
  labels: Partial<Record<number, string>>;
  /** Weeks with their own event inside a longer bar. */
  pins: number[];
};

export const LANES: Lane[] = [
  {
    key: "hourly",
    name: "Hourly dev shop",
    shipsAt: 12,
    labels: { 1: "Discovery calls", 3: "Quote, contract", 5: "Building, nothing live yet" },
    pins: [8],
    weeks: [
      w("talk", "Discovery calls"),
      w("talk", "More discovery calls"),
      w("paper", "Waiting on a quote"),
      w("paper", "Contract and deposit"),
      w("build", "Building, nothing live yet"),
      w("build", "Building, nothing live yet"),
      w("build", "Building, nothing live yet"),
      w("build", "First demo, feedback round"),
      w("build", "Building, nothing live yet"),
      w("change", "Priorities changed. Change order issued"),
      w("build", "Reworking for the change order"),
      w("launch", "First version launches"),
    ],
  },
  {
    key: "weavers",
    name: "AI Weavers fixed price",
    shipsAt: 6,
    labels: { 3: "Building to the fixed price", 7: "Running, hosted and monitored on retainer" },
    pins: [4, 5, 8, 9, 10],
    weeks: [
      w("talk", "Free Weave Session"),
      w("paper", "Fixed quote approved. Half the setup fee paid"),
      w("build", "Building to the fixed price"),
      w("build", "First demo, feedback round"),
      w("build", "Testing with your team"),
      w("launch", "Project live. Second half of the setup fee paid, retainer starts"),
      w("live", "Running, hosted and monitored on retainer"),
      w("live", "A failed step caught and fixed by us"),
      w("live", "Priorities changed. Next project gets its own fixed quote"),
      w("live", "Small improvements made under the retainer"),
      w("live", "Running, hosted and monitored on retainer"),
      w("live", "Still running, still looked after"),
    ],
  },
];

export type Segment = { phase: Phase; start: number; span: number; label?: string };

/** Consecutive weeks in the same phase merge into one bar. Weeks are 1-based. */
export function segmentsOf(lane: Lane): Segment[] {
  const out: Segment[] = [];
  lane.weeks.forEach((wk, i) => {
    const last = out[out.length - 1];
    if (last && last.phase === wk.phase) last.span++;
    else out.push({ phase: wk.phase, start: i + 1, span: 1, label: lane.labels[i + 1] });
  });
  return out;
}

/** Weeks the work has been live by the end of `week` (launch week included). */
export const weeksLive = (lane: Lane, week: number) =>
  lane.weeks.slice(0, week).filter((wk) => wk.phase === "launch" || wk.phase === "live").length;

/** The side-by-side table under the board (copy from aiweavers.com; the topics name each row). */
export const COMPARE: { topic: string; icon: IsoName; hourly: string; weavers: string }[] = [
  {
    topic: "Getting a price",
    icon: "coins",
    hourly: "Weeks of paid discovery before a real number",
    weavers: "A free Weave Session, then a fixed quote",
  },
  {
    topic: "When priorities change",
    icon: "layers",
    hourly: "Change orders when priorities shift",
    weavers: "New work quoted as its own fixed-price project",
  },
  {
    topic: "After launch",
    icon: "meter",
    hourly: "Hosting and fixes billed separately",
    weavers: "Hosting, monitoring and fixes in one retainer",
  },
  {
    topic: "Who owns it",
    icon: "key",
    hourly: "The dev shop holds the code and accounts",
    weavers: "You own your data and the work",
  },
];
