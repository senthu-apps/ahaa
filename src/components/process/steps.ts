/** How it works (copy from aiweavers.com #how). `card` titles the step's animated card. */
export const STEPS = [
  {
    title: "Book your Weave Session",
    body: "A free 30-minute call. We find your three biggest time sinks and show you what we would build first.",
    foot: "Free, 30 minutes",
    card: "Weave Session",
  },
  {
    title: "Get your Automation Map",
    body: "A written plan ranked by hours saved, with a fixed price for each project. It is yours to keep, whether or not you hire us.",
    foot: "Within two business days",
    card: "Automation Map",
  },
  {
    title: "Approve your first project",
    body: "Half the setup fee starts the build. Your lead is assigned and work starts the same week.",
    foot: "Same week",
    card: "First project",
  },
  {
    title: "Go live",
    body: "We build it, test it and launch it. The second half of the setup fee is due, and your retainer starts.",
    foot: "At launch",
    card: "Launch",
  },
  {
    title: "Keep it running",
    body: "We host, monitor, fix and improve it for as long as you are with us. When you find the next thing to fix, it gets its own quote.",
    foot: "Every month",
    card: "Retainer",
  },
] as const;

/** The cloth goes live once this many steps are woven (step 4, "Go live"). */
export const LIVE_AT = 4;
