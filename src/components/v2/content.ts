/*
 * Every word on the prototype page, from the content doc
 * "AI Weavers website: full page content for design" (Nov 10, 2026),
 * in page order. Text in [square brackets] is a placeholder Senthu will
 * supply: it renders with a dashed signal underline (see <Ph>), bracket kept.
 *
 * Headings are split into `soft` + `strong` only to carry the site's
 * two-tone heading style; the words are the doc's, unchanged.
 * Eyebrows are the doc's section names.
 */
import type { IsoName } from "@/components/brand/Iso";

export const BOOK = "#book";

/* ------------------------------------------------------------ Header */
export const NAV = [
  { label: "Services", href: "#services" },
  { label: "Use cases", href: "#use-cases" },
  // { label: "Case studies", href: "#case-studies" }, — section hidden for now (see main.tsx)
  { label: "Pricing", href: "#pricing" },
  { label: "Cost calculator", href: "#calculator" },
  { label: "FAQ", href: "#faq" },
];
export const NAV_BUTTON = "Book a free audit";

/* ------------------------------------------------------------ 1 · Hero */
export const HERO = {
  soft: "Stop doing work",
  strong: "software should do.",
  sub: "We connect your apps, build AI agents for the repetitive jobs and write custom software where off-the-shelf tools stop. Fixed price per project, flat monthly fee to keep it running.",
  primary: "Book a free 30-minute automation audit",
  secondary: { label: "See what we automate", href: "#use-cases" },
  under: "You leave the call with a written plan and a fixed quote. No obligation.",
  trust: ["Fixed price per project", "Flat monthly fee", "You own the code and data", "Month to month after three months"],
  proof: {
    lead: "Trusted by",
    client: "Fides Mortgages",
    mid: "and running inside",
    own: ["Kimp", "Repliers", "Botdog"],
    tail: "First project live in 2 weeks.",
    /* the portfolio wordmarks (public/logos, inlined at build), shown in place of the bold names */
    ownLogos: [
      { name: "Kimp", src: "/logos/kimp.svg", h: 15 },
      { name: "Repliers", src: "/logos/repliers.png", h: 12 },
      { name: "Botdog", src: "/logos/botdog.png", h: 19 },
    ],
  },
};

/* ------------------------------------------------------------ 2 · Integrations */
export const INTEGRATIONS = {
  /* the doc's line was "Works with the software you already pay for."; the figure was added in review */
  heading: "Works with the 4,000+ tools you already pay for.",
  logos: [
    "QuickBooks",
    "Xero",
    "HubSpot",
    "Salesforce",
    "Google Workspace",
    "Microsoft 365",
    "Slack",
    "Stripe",
    "Shopify",
    "Airtable",
    "Notion",
    "Twilio",
    "Follow Up Boss",
    "Agent360.io",
  ],
  under: "If it has an API, an export or an inbox, we can connect it.",
};

/* ------------------------------------------------------------ 3 · What we build */
export const SERVICES_HEAD = {
  eyebrow: "What we build",
  soft: "Four things we build,",
  strong: "and keep running.",
  lede: "Every project is quoted at a fixed price before you approve it.",
};
export type ServiceKey = "automations" | "agents" | "software" | "care";
export const SERVICES: { key: ServiceKey; title: string; body: string; examples: string[]; demoTitle: string }[] = [
  {
    key: "automations",
    title: "Automations",
    body: "Your apps pass work to each other with no copy and paste.",
    examples: [
      "Invoice arrives by email, gets matched in QuickBooks, exceptions go to Slack.",
      "New lead lands in the CRM with a task and a reply sent in 60 seconds.",
      "Signed contract triggers onboarding emails, a folder and a kickoff invite.",
    ],
    demoTitle: "One payment, start to finish",
  },
  {
    key: "agents",
    title: "AI agents",
    body: "Software that reads, decides and drafts, with a person approving anything that matters.",
    examples: [
      "Inbox agent sorts support email and drafts replies.",
      "Document agent pulls figures from PDFs into your system.",
      "Follow-up agent chases unpaid invoices and stale quotes.",
    ],
    demoTitle: "Inbox agent",
  },
  {
    key: "software",
    title: "Custom software",
    body: "Internal tools and client portals when no off-the-shelf product fits.",
    examples: ["Client portal with status and document upload.", "Job board for field crews.", "Reporting dashboard across three systems."],
    demoTitle: "Job board",
  },
  {
    key: "care",
    title: "Care and upkeep",
    body: "We monitor, fix and adjust everything we build.",
    examples: ["Alerts when a run fails.", "Fixes when an app changes its API.", "Small changes each month included."],
    demoTitle: "Your systems this month",
  },
];

/* ------------------------------------------------------------ 4 · Use-case library */
export const USE_CASES_HEAD = {
  eyebrow: "Use cases",
  soft: "What we can take",
  strong: "off your team’s plate.",
  lede: "Pick a department. Every item is something we can quote at a fixed price.",
};
export const DEPARTMENTS = ["Sales", "Finance", "Operations", "Customer support", "HR and admin"] as const;
export type Department = (typeof DEPARTMENTS)[number];
export const DEPARTMENT_ICON: Record<Department, IsoName> = {
  Sales: "talk",
  Finance: "coins",
  Operations: "gear",
  "Customer support": "mail",
  "HR and admin": "papers",
};
export const USE_CASES: { dept: Department; title: string; body: string }[] = [
  { dept: "Sales", title: "Lead intake and instant reply", body: "Form, email or portal lead lands in the CRM, gets a reply in 60 seconds and a task for the rep." },
  { dept: "Sales", title: "Quote follow-up", body: "Unanswered quotes get a polite nudge on day 3 and day 7." },
  { dept: "Sales", title: "Meeting notes to CRM", body: "Call recordings become summaries, next steps and updated deal fields." },
  { dept: "Sales", title: "Proposal drafting", body: "A proposal is assembled from the deal record and your templates." },
  { dept: "Finance", title: "Invoice matching", body: "Incoming invoices are read, matched to purchase orders and queued for approval." },
  { dept: "Finance", title: "Payment reconciliation", body: "Bank deposits are matched to open invoices, exceptions flagged." },
  { dept: "Finance", title: "Collections reminders", body: "Overdue invoices trigger a reminder sequence that stops when paid." },
  { dept: "Finance", title: "Expense receipts", body: "Photos of receipts become coded entries in your accounting system." },
  { dept: "Operations", title: "Client onboarding", body: "A signed contract creates the folder, the project, the welcome email and the kickoff invite." },
  { dept: "Operations", title: "Job scheduling", body: "Requests are assigned to the right person based on location and load." },
  { dept: "Operations", title: "Document collection", body: "Clients get reminders until every required file is uploaded." },
  { dept: "Operations", title: "Weekly reporting", body: "Numbers from three systems arrive as one report every Monday." },
  { dept: "Customer support", title: "Inbox triage", body: "Email is sorted by topic and urgency, with a drafted reply for approval." },
  { dept: "Customer support", title: "Answers from your own documents", body: "An agent answers common questions using your policies and past tickets." },
  { dept: "Customer support", title: "Review requests", body: "Completed jobs trigger a review request, low scores go to a manager." },
  { dept: "Customer support", title: "Renewal alerts", body: "Accounts coming up for renewal get a task and a prepared summary." },
  { dept: "HR and admin", title: "Hiring pipeline", body: "Applications are screened against your criteria and interviews booked." },
  { dept: "HR and admin", title: "Employee onboarding", body: "Accounts, equipment requests and training tasks are created on day one." },
  { dept: "HR and admin", title: "Time-off requests", body: "Requests route to the manager and update the shared calendar." },
  { dept: "HR and admin", title: "Contract renewals", body: "Vendor and lease dates trigger alerts 60 and 30 days ahead." },
];
export const USE_CASES_FOOT = {
  line: "Don’t see your problem? Bring it to the audit call. Most first projects are something the owner describes in one sentence.",
  button: "Book a free audit",
  showAll: "Show all 20",
  showFewer: "Show fewer",
  /* on every card (UI label, not in the doc): the lede's promise, repeated where the eye lands */
  quote: "Quote at a fixed price",
};

/* ------------------------------------------------------------ 5 · Case studies */
export const CASES_HEAD = {
  eyebrow: "Case studies",
  soft: "Real work,",
  strong: "real numbers.",
  lede: "Three projects, how long they took and what they gave back.",
};
export type CaseLogo = { kind: "img"; src: string; alt: string; h: number } | { kind: "ph"; text: string };
export const CASES: {
  tag: "Client" | "Our own company";
  company: string;
  logo: CaseLogo;
  sector: string;
  problem: string;
  built: string;
  live: string;
  result: string;
  quote: string;
  who: string;
}[] = [
  {
    tag: "Client",
    company: "Fides Mortgages",
    logo: { kind: "ph", text: "Fides Mortgages logo" },
    sector: "Mortgage brokerage",
    problem: "[one line]",
    built: "[one line]",
    live: "2 weeks",
    result: "[result]",
    quote: "[One sentence]",
    who: "[name, role]",
  },
  {
    tag: "Our own company",
    company: "Kimp",
    logo: { kind: "img", src: "/logos/kimp.svg", alt: "Kimp", h: 24 },
    sector: "Design services",
    problem: "[one line]",
    built: "[one line]",
    live: "2 weeks",
    result: "100+ hours saved every month",
    quote: "[One sentence]",
    who: "[name, role]",
  },
  {
    tag: "Our own company",
    company: "[Repliers or Botdog]",
    logo: { kind: "ph", text: "[Repliers or Botdog] logo" },
    sector: "[Real estate data or LinkedIn automation]",
    problem: "[one line]",
    built: "[one line]",
    live: "2 weeks",
    result: "100+ hours saved every month",
    quote: "[One sentence]",
    who: "[name, role]",
  },
];

/* ------------------------------------------------------------ 6 · Cost calculator */
export const CALC_HEAD = {
  eyebrow: "Cost calculator",
  soft: "What is manual work",
  strong: "costing you?",
  lede: "Move the sliders. The numbers update as you go.",
};
export const CALC = {
  hours: { label: "Hours your team spends on repetitive work each week", min: 1, max: 120, step: 1, initial: 32 },
  rate: { label: "Average cost per hour", min: 20, max: 150, step: 5, initial: 50 },
  share: {
    label: "Share of that work software can take over",
    min: 20,
    max: 80,
    step: 5,
    initial: 60,
    note: "60% is based on the projects we have delivered. We confirm your real figure on the audit call.",
  },
  results: {
    cost: "Manual work costs you each year",
    recover: "You can recover each year",
    yearOne: "Year-one cost on the Growth plan with a $3,000 setup",
    ratio: "Return for every $1 spent",
  },
  setup: 3000,
  growthMonthly: 1495,
  primary: "Book a free audit to confirm these numbers",
  secondary: "Email me this estimate",
  form: { email: "Work email", company: "Company name", send: "Send" },
  sent: "Sent. Check your inbox for your estimate and a link to book your audit.",
};

/* ------------------------------------------------------------ 7 · How it works */
export const PROCESS_HEAD = {
  eyebrow: "How it works",
  soft: "From first call",
  strong: "to live in 2 weeks.",
  lede: "Five steps. Nothing is billed until you approve a fixed quote.",
};
export const STEPS: { title: string; body: string; label?: string; icon: IsoName }[] = [
  { title: "Free automation audit.", body: "30 minutes on video. We list where your team loses hours.", label: "Weave Session", icon: "talk" },
  {
    title: "Written plan.",
    body: "Within [2] business days you get the top opportunities ranked by hours saved, each with a fixed quote.",
    label: "Automation Map",
    icon: "papers",
  },
  { title: "You approve one project.", body: "Nothing starts and nothing is billed before this.", icon: "key" },
  { title: "We build and go live.", body: "Typical first project: 2 weeks. You test it with real data before launch.", icon: "bolt" },
  { title: "We keep it running.", body: "Monitoring, fixes and small changes are inside the monthly fee.", icon: "gear" },
];

/* ------------------------------------------------------------ 8 · Your options compared */
export const COMPARE_HEAD = {
  eyebrow: "Your options",
  soft: "Four ways to get this done.",
  strong: "Three of them stall.",
};
export const COMPARE = {
  options: ["Do it yourself with no-code tools", "Freelancer", "Hire an operations person", "AI Weavers"],
  rows: [
    ["Upfront cost", "Low", "Hourly, open-ended", "Recruiting plus salary", "Fixed quote per project"],
    ["Who maintains it", "You", "Often nobody after handover", "The hire, if they stay", "Us, inside the monthly fee"],
    ["When it breaks", "You find out from a customer", "You wait for availability", "Depends on one person", "We are alerted and fix it"],
    ["Handles AI and custom code", "Limited", "Varies by person", "Rarely", "Yes"],
    ["Who owns the result", "You", "Check the contract", "You", "You, code and data"],
    ["Time to first result", "Whenever you find the hours", "Weeks, variable", "Months", "2 weeks from approval"],
  ],
  under: "Hourly billing pays more when work goes slowly. A fixed quote puts that risk on us.",
};

/* ------------------------------------------------------------ 9 · Pricing */
export const PRICING_HEAD = {
  eyebrow: "Pricing",
  soft: "Simple pricing.",
  strong: "No hourly bills.",
  lede: "A fixed setup fee for each project, then one flat monthly fee to keep everything running.",
};
export const PLANS: { name: string; price: string; bestFor: string; icon: IsoName; featured?: boolean }[] = [
  { name: "Growth", price: "$1,495", bestFor: "One team, first automations", icon: "gear" },
  { name: "Pro", price: "$2,995", bestFor: "Several teams, agents in daily use", icon: "layers", featured: true },
  { name: "Scale", price: "$4,995", bestFor: "Company-wide, custom software", icon: "chart" },
];
export const PLAN_ROWS: [string, string][] = [
  ["Scope", "Set with you on the audit call"],
  ["Dedicated Delivery Manager", "Included"],
  ["Monitoring and fixes", "Included"],
  ["First project live", "2 weeks"],
];
export const PRICING = {
  unit: "/ month",
  monthlyFee: "Monthly fee",
  bestFor: "Best for",
  badge: "Recommended",
  button: "Book a free audit",
  under: "Every plan is scoped to what you need. Your written quote lists the projects, monthly changes and response times before you commit to anything.",
  setup: "Each new project has a fixed setup fee between $3,000 and $15,000, quoted in writing before you approve anything.",
  terms: "Three-month minimum, then month to month. Third-party software and AI usage billed at cost with no markup.",
};

/* ------------------------------------------------------------ 10 · Who does the work */
export const TEAM = {
  eyebrow: "Who does the work",
  soft: "Built by operators",
  strong: "who run their own companies on this.",
  body: "AI Weavers is part of Scale Shift Ventures, the studio behind Kimp, DesignDog.ai, Repliers, Buy.ca and Botdog. The automations we sell are the ones we run in our own businesses every day.",
  stat: { before: "Inside our own companies, these automations went live in", a: "2 weeks", mid: "and save", b: "100+ hours", after: "every month." },
  /* optical heights, a quarter up on the first prototype's (review: "slightly bigger").
     Botdog: a one-colour version of the brand's own SVG (logos/botdog-white.svg, made from
     logos/botdog.svg, botdog.co) — outline and wordmark white, the mark's inner fills cut
     out in the band's colour — shown without the white filter (`plain`), which would have
     flattened the mark into a silhouette. */
  logos: [
    { name: "Kimp", src: "/logos/kimp.svg", h: 24 },
    { name: "DesignDog.ai", src: "/logos/designdog.png", h: 30 },
    { name: "Repliers", src: "/logos/repliers.png", h: 19 },
    { name: "Buy.ca", src: "/logos/buyca.png", h: 25 },
    { name: "Botdog", src: "/logos/botdog-white.svg", h: 30, plain: true },
  ] as { name: string; src: string; h: number; plain?: boolean }[],
  dmHeading: "One person owns your account.",
  dmBody:
    "Every client gets a dedicated Delivery Manager. They are responsible for everything on your account and coordinate between you and the AI Weavers team, so you always have one person to call.",
  video: {
    name: "Senthu Velnayagam",
    rest: "on why we built AI Weavers (about a minute)",
    /* Bunny CDN: a direct .mp4 (plays in a native <video>); an embed URL (iframe.mediadelivery.net/embed/…) would render as an iframe instead */
    src: "https://aiweavers.b-cdn.net/how-ai-weavers-automates-final-video.mp4",
    poster: "/people/senthu-b.jpg",
  },
  /* the modal the play button opens: vertical video left, this copy and the call to action right (draft copy, to review) */
  modal: {
    eyebrow: "Founder's note · about a minute",
    heading: "Why we built AI Weavers",
    body: "Senthu Velnayagam, founder of Scale Shift Ventures, on the manual work we kept hitting inside our own companies, the automations that fixed it, and why we now run the same work for clients on a retainer.",
    points: [
      "What we automated first inside Kimp, Repliers and Botdog",
      "Why a fixed monthly retainer, not hourly billing",
      "What a free audit covers and what you get after it",
    ],
    cta: "Book a free audit",
    dismiss: "Maybe later",
    pending: "Video link to come. The player drops in here.",
  },
};

/* ------------------------------------------------------------ 11 · Security */
export const SECURITY_HEAD = {
  eyebrow: "Security",
  soft: "Your systems, your data,",
  strong: "your rules.",
};
export const SECURITY: { title: string; body: string; icon: IsoName }[] = [
  { title: "Least access needed", body: "Each automation gets its own credentials with only the permissions it requires.", icon: "key" },
  { title: "You own everything", body: "Code, workflows and data are yours and can be exported or handed over at any time.", icon: "papers" },
  { title: "Canada or US hosting", body: "Your data stays in Canada or the US. You choose the region at the start.", icon: "layers" },
  { title: "NDA before we start", body: "We sign your NDA, or ours, before the audit call if you prefer.", icon: "mail" },
  { title: "Every run is logged", body: "You can see what each automation did and when.", icon: "clock" },
  { title: "People approve what matters", body: "Payments, client messages and deletions wait for a human unless you say otherwise.", icon: "talk" },
];

/* ------------------------------------------------------------ 13 · FAQ */
export const FAQ_HEAD = { eyebrow: "FAQ", soft: "Questions owners ask", strong: "before they book." };
/** The doc's nine questions first, then the live site's, minus the ones they repeat. */
export const FAQ: { q: string; a: string; from: "doc" | "live" }[] = [
  {
    q: "Have you done this for a company like mine?",
    a: "Yes. We run these systems in our own companies (Kimp, Repliers and Botdog) and for clients including Fides Mortgages. See the case studies above.",
    from: "doc",
  },
  { q: "How fast will my first project go live?", a: "Two weeks from approval is typical. You get the date in writing with your quote.", from: "doc" },
  {
    q: "Who will I deal with?",
    a: "A dedicated Delivery Manager. They are responsible for everything on your account and coordinate between you and our team.",
    from: "doc",
  },
  {
    q: "What does each plan include?",
    a: "Every plan is scoped to what you need. Your written quote lists the projects, monthly changes and response times before you commit.",
    from: "doc",
  },
  {
    q: "What if it does not work or we do not use it?",
    a: "You test every build with your own data before launch. Nothing goes live until you approve it.",
    from: "doc",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep the code, the workflows and the data. We hand over documentation and credentials within [5] business days.",
    from: "doc",
  },
  {
    q: "How much of my team’s time does this need?",
    a: "About [2 to 3] hours in the first week for access and questions, then a 30-minute review [each month].",
    from: "doc",
  },
  {
    q: "Will this replace my staff?",
    a: "It replaces tasks, not people. Most clients move the freed hours to sales, service or work that was being skipped.",
    from: "doc",
  },
  { q: "What do I pay besides your fees?", a: "Third-party software and AI usage, billed at cost. We estimate it in the quote.", from: "doc" },
  // live site, kept (setup fees, retainer scope, AI models, approvals, confidentiality, software, data location)
  {
    q: "What does the setup fee cover?",
    a: "Building and launching one project, like a text-back for missed calls, a reminder that chases missing documents, an AI agent or a client portal. Setup fees run from $3,000 to $15,000 USD, and you get a fixed price after your free Weave Session. You pay half up front and half at launch.",
    from: "live",
  },
  {
    q: "What does the retainer cover?",
    a: "Hosting, monitoring, fixes and small improvements for what we build. It starts at launch and runs from $1,495 to $4,995 USD a month, depending on what is running. New projects are quoted separately.",
    from: "live",
  },
  {
    q: "Which AI models do you use?",
    a: "Whatever fits the job best. We build on Claude, OpenAI, Gemini and open models, and switch when a better one arrives. You are never locked to one vendor.",
    from: "live",
  },
  {
    q: "Does anything go out without our approval?",
    a: "Only what you choose. Client emails, documents, filings and payments wait for a person on your team to approve them. Routine steps, like a reminder or a receipt, can run on their own once you trust them. Every action is logged.",
    from: "live",
  },
  {
    q: "Is client information kept confidential?",
    a: "Yes. Agents only see the systems and files you approve, and we are happy to sign your confidentiality agreement before we start. We work within the rules you already follow, like FINTRAC records, trust accounting and CRA deadlines, and your team stays responsible for compliance. Agents are set up not to give legal, tax or mortgage advice. That stays with your lawyers, brokers and accountants.",
    from: "live",
  },
  {
    q: "Do we have to switch software?",
    a: "No. We build on what you already run, like your CRM, practice management, accounting and job software. If a tool cannot be connected, we tell you in the Weave Session.",
    from: "live",
  },
  {
    q: "Where does my data live?",
    a: "What we build runs on our infrastructure, and you choose the region, including Canada or the US. Your data stays in your own accounts wherever possible, and agents only see the systems you approve.",
    from: "live",
  },
];
/**
 * Reading order on the page: four themes, each an index list into FAQ above
 * (the doc's wording unchanged; the order inside a theme follows the doc).
 * Theme names are UI labels for review.
 */
export const FAQ_GROUPS: { title: string; items: number[] }[] = [
  { title: "Before you book", items: [0, 1, 2, 7] },
  { title: "Plans and money", items: [3, 8, 9, 10] },
  { title: "Delivery and ownership", items: [4, 5, 6, 11, 14] },
  { title: "Data and approvals", items: [12, 13, 15] },
];
// Dropped as repeats of the doc's questions: "Who actually does the work?", "How soon will something be live?",
// "What happens if I cancel?" (live answer), "Are AI and software costs included?".

/* ------------------------------------------------------------ 14 · Booking */
export const BOOKING = {
  eyebrow: "Book an audit",
  soft: "Book your free",
  strong: "automation audit.",
  sub: "30 minutes on video. You get a written plan and fixed quotes within [2] business days.",
  bullets: [
    ["What we cover:", "where your team loses the most hours."],
    ["What you get:", "a ranked list of automations with a price on each."],
    ["What it costs:", "nothing, and no obligation."],
  ] as [string, string][],
  reassurance: "Once you start, a dedicated Delivery Manager is your single point of contact.",
  fallback: {
    heading: "No time that suits?",
    text: "Tell us what you want automated and we will reply within one business day.",
    /* the same fields as the scheduler's details step (Figma node 183:16); the topic options are book.ts TIME_SINKS */
    fields: { first: "First Name", last: "Last Name", email: "Email Address", company: "Company", topic: "What would you like to automate?" },
    /* the form stays folded until this link is clicked (UI labels, not in the doc) */
    link: "Write to us instead",
    hide: "Hide the form",
    send: "Send",
    sent: "Thanks. We will reply within one business day.",
  },
  /* the scheduler (UI labels, not in the doc). Times and bookings come from LunaCal through
     /api/schedule; without LUNACAL_API_KEY + LUNACAL_EVENT_TYPE_ID it shows sample times and books nothing. */
  scheduler: {
    tag: { live: "Live availability", sample: "Preview" },
    event: "Free automation audit",
    call: "Video call",
    timesIn: "Times in",
    sample: "Sample availability",
    loading: "Checking the calendar…",
    empty: "No times left on this day. Pick another.",
    failed: "The calendar did not load.",
    retry: "Try again",
    pick: "Pick a time",
    next: "Continue with",
    change: "Change time",
    /* labels as in the Figma form (node 183:16); the topic options are book.ts TIME_SINKS */
    fields: { first: "First Name", last: "Last Name", email: "Email Address", company: "Company", topic: "What would you like to automate?" },
    topicPlaceholder: "Select from the list",
    hint: "You get a calendar invite by email. Reschedule from it any time.",
    confirm: "Confirm booking",
    booking: "Booking…",
    taken: "That time was just taken. Pick another.",
    done: {
      sent: "Booked. A calendar invite is on its way to",
      change: "Need a different time? The invite has a link to reschedule.",
      again: "Pick another time",
    },
    sampleNote: "Prototype: nothing was booked. With the LunaCal keys set, this confirms by email.",
  },
};

/* ------------------------------------------------------------ 15 · Footer */
export const FOOTER = {
  company: "AI Weavers, a Scale Shift Ventures company",
  address: "7030 Woodbine Avenue, Suite 500",
  place: "Markham, ON L3R 6G2, Canada",
  email: "hello@aiweavers.com",
  phone: "1-800-946-9778",
  nav: [
    { label: "Services", href: "#services" },
    { label: "Use cases", href: "#use-cases" },
    // { label: "Case studies", href: "#case-studies" }, — section hidden for now (see main.tsx)
    { label: "Pricing", href: "#pricing" },
    { label: "Cost calculator", href: "#calculator" },
    { label: "FAQ", href: "#faq" },
    { label: "Book an audit", href: "#book" },
  ],
  legal: ["Privacy Policy", "Terms of Service"],
  social: ["LinkedIn", "YouTube"],
  copyright: "© 2026 AI Weavers. All rights reserved.",
};
