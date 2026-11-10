/*
 * FAQ copy, verbatim from the live site (#faq), in the live order.
 * (Not named faq.ts: on macOS's case-insensitive disk it would clash with Faq.tsx.)
 */

export const HEAD = {
  eyebrow: "Questions",
  soft: "Straight",
  strong: "answers.",
  lede: "Anything else, ask us on the call. We will tell you if a retainer is the wrong fit.",
};

export type QA = { q: string; a: string };

export const QUESTIONS: QA[] = [
  {
    q: "What does the setup fee cover?",
    a: "Building and launching one project, like a text-back for missed calls, a reminder that chases missing documents, an AI agent or a client portal. Setup fees run from $3,000 to $15,000 USD, and you get a fixed price after your free Weave Session. You pay half up front and half at launch.",
  },
  {
    q: "What does the retainer cover?",
    a: "Hosting, monitoring, fixes and small improvements for what we build. It starts at launch and runs from $1,495 to $4,995 USD a month, depending on what is running. New projects are quoted separately.",
  },
  {
    q: "Who actually does the work?",
    a: "A senior lead owns your account and talks to you directly. Engineers and product designers from the Kimp studio build with them. AI speeds up the building, and people review every change before it goes live.",
  },
  {
    q: "Which AI models do you use?",
    a: "Whatever fits the job best. We build on Claude, OpenAI, Gemini and open models, and switch when a better one arrives. You are never locked to one vendor.",
  },
  {
    q: "How soon will something be live?",
    a: "It depends on the project, and your quote includes a target launch date before you pay anything. We start with the item on your Automation Map that saves the most hours.",
  },
  {
    q: "What happens if I cancel?",
    a: "The retainer has a three-month minimum, then runs month to month. You own your data and the work. If you cancel, we hand over an export, and it stops running on our infrastructure.",
  },
  {
    q: "Are AI and software costs included?",
    a: "Hosting and upkeep are in your retainer. Outside costs like AI usage, text messages or paid software seats are billed at cost, with no markup.",
  },
  {
    q: "Does anything go out without our approval?",
    a: "Only what you choose. Client emails, documents, filings and payments wait for a person on your team to approve them. Routine steps, like a reminder or a receipt, can run on their own once you trust them. Every action is logged.",
  },
  {
    q: "Is client information kept confidential?",
    a: "Yes. Agents only see the systems and files you approve, and we are happy to sign your confidentiality agreement before we start. We work within the rules you already follow, like FINTRAC records, trust accounting and CRA deadlines, and your team stays responsible for compliance. Agents are set up not to give legal, tax or mortgage advice. That stays with your lawyers, brokers and accountants.",
  },
  {
    q: "Do we have to switch software?",
    a: "No. We build on what you already run, like your CRM, practice management, accounting and job software. If a tool cannot be connected, we tell you in the Weave Session.",
  },
  {
    q: "Where does my data live?",
    a: "What we build runs on our infrastructure, and you choose the region, including Canada or the US. Your data stays in your own accounts wherever possible, and agents only see the systems you approve.",
  },
];
