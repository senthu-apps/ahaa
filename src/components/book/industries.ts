/*
 * Step 3 of the #book scheduler, "Your business": what we ask, by industry.
 *
 * Source: the internal workflow draft "From booked demo to paid build" (Nov 2026):
 * team-size bands, pains and tools per industry, plus the one volume or
 * scope question its booking checklist names for each. Every answer is
 * something an owner knows without looking anything up, in bands, not figures.
 * The pains decide which demo we prep; team size, revenue and role decide
 * who gets a custom one; the tools say what we will connect to.
 */

export type IndustryKey = "realestate" | "mortgage" | "law" | "agencies" | "subscriptions" | "accounting" | "trades" | "other";

export type Industry = {
  key: IndustryKey;
  label: string;
  /** "Team size" options, as bands */
  team: { label: string; options: readonly string[] };
  /** the one question that sizes the work or picks the demo */
  extra: { label: string; options: readonly string[]; multi?: boolean };
  /** "What eats your week?" (pick up to MAX_PAINS) */
  pains: readonly string[];
  /** "Tools you use" (any number) */
  tools: readonly string[];
};

export const MAX_PAINS = 3;

export const INDUSTRIES: readonly Industry[] = [
  {
    key: "realestate",
    label: "Real estate",
    team: { label: "Agents on the roster", options: ["Under 10", "10–50", "50–150", "150+"] },
    extra: { label: "Deals closed a month", options: ["Under 10", "10–25", "25–75", "75+"] },
    pains: ["Checking deal files for FINTRAC", "Matching trust deposits to deals", "Commission, cap and HST questions", "Confirming showing requests", "Leads and sign calls not answered fast"],
    tools: ["Lone Wolf", "BrokerBay", "Follow Up Boss", "Lofty", "WEBForms", "DocuSign", "QuickBooks"],
  },
  {
    key: "mortgage",
    label: "Mortgage",
    team: { label: "Agents", options: ["Solo", "2–10", "10–50", "50+"] },
    extra: { label: "Files funded a month", options: ["Under 10", "10–25", "25–75", "75+"] },
    pains: ["Chasing NOAs, job letters and statements", "Reviewing bank statements", "Tracking lender conditions", "Keeping realtors and clients updated", "Renewals slipping to the bank"],
    tools: ["Finmo", "Filogix Expert", "Velocity", "HubSpot", "GoHighLevel", "QuickBooks"],
  },
  {
    key: "law",
    label: "Law",
    team: { label: "Lawyers", options: ["Solo", "2–5", "6–20", "20+"] },
    extra: { label: "Main practice areas", options: ["Real estate", "Family", "Wills and estates", "Corporate", "Litigation", "Immigration", "Personal injury"], multi: true },
    pains: ["Intake calls and follow-up", "Conflict checks", "Engagement letters", "Clients asking for status", "Time that never makes it into a docket"],
    tools: ["Clio", "PCLaw", "LEAP", "Teraview", "Outlook", "QuickBooks"],
  },
  {
    key: "agencies",
    label: "Agencies",
    team: { label: "Team size", options: ["Under 5", "5–15", "15–50", "50+"] },
    extra: { label: "How you bill clients", options: ["Retainers", "Projects", "Both"] },
    pains: ["Building client reports", "Out-of-scope work we never bill", "Chasing invoices", "Retainers running over", "Timesheets"],
    tools: ["HubSpot", "Asana", "ClickUp", "Monday", "Harvest", "Slack", "GA4", "QuickBooks"],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    team: { label: "Active subscribers", options: ["Under 500", "500–2,000", "2,000–10,000", "10,000+"] },
    extra: { label: "Support emails a week", options: ["Under 100", "100–500", "500–2,000", "2,000+"] },
    pains: ["“Where’s my box?” emails", "Failed payments", "Skips and address changes", "Reconciling payouts", "Chargebacks"],
    tools: ["Shopify", "Recharge", "Skio", "Stripe", "Gorgias", "Zendesk", "Klaviyo", "ShipStation"],
  },
  {
    key: "accounting",
    label: "Accounting",
    team: { label: "Staff", options: ["Solo", "2–5", "6–20", "20+"] },
    extra: { label: "Main client work", options: ["Bookkeeping", "Personal tax (T1)", "Corporate tax (T2)", "Payroll"], multi: true },
    pains: ["Chasing clients for documents", "Coding bank feeds", "Tracking CRA letters", "Clients asking where things stand", "Collecting our own fees"],
    tools: ["QuickBooks Online", "Xero", "Dext", "Hubdoc", "TaxCycle", "Karbon"],
  },
  {
    key: "trades",
    label: "Trades",
    team: { label: "Techs in the field", options: ["Owner and 1–2 techs", "3–10 techs", "10–25", "25+"] },
    extra: { label: "Your trade", options: ["HVAC", "Plumbing", "Electrical", "Roofing", "Landscaping", "Garage doors"], multi: true },
    pains: ["Missed calls", "Writing quotes", "Following up on quotes", "Invoicing after jobs", "Telling customers we’re running late"],
    tools: ["Jobber", "Housecall Pro", "ServiceTitan", "QuickBooks", "Google Business Profile"],
  },
  {
    key: "other",
    label: "Something else",
    team: { label: "Team size", options: ["Just me", "2–10", "11–50", "50+"] },
    /* "other" asks what the business does in a text field instead (see Book.tsx) */
    extra: { label: "", options: [] },
    pains: ["Retyping data between systems", "Chasing invoices", "Answering the same questions", "Chasing missing documents", "Missed calls and slow follow-up", "Reports and paperwork"],
    tools: ["QuickBooks", "Xero", "HubSpot", "Salesforce", "Google Workspace", "Microsoft 365", "Slack"],
  },
];

export const ROLES = ["Owner", "Partner", "Manager", "Other"] as const;
export const REVENUE = ["Under $1M", "$1M–$5M", "$5M+"] as const;

/** What step 3 sends to /api/schedule (all strings, bands as shown). */
export type Business = {
  industry: string;
  about: string;
  role: string;
  team: string;
  extra: string[];
  pains: string[];
  tools: string[];
  revenue: string;
};

export const BUSINESS_LIMIT = 120; // per value

/** The booking notes the host reads in LunaCal, one line per answer. */
export function businessNotes(b: Business, site: string): string {
  const ind = INDUSTRIES.find((i) => i.label === b.industry);
  const line = (k: string, v: string | string[]) => {
    const s = Array.isArray(v) ? v.join(", ") : v;
    return s ? `${k}: ${s}` : "";
  };
  return [
    line("Industry", b.industry === "Something else" && b.about ? b.about : b.industry),
    line("Website", site),
    line("Role", b.role),
    line(ind?.team.label ?? "Team size", b.team),
    ind?.extra.label ? line(ind.extra.label, b.extra) : "",
    line("What eats their week", b.pains),
    line("Tools", b.tools),
    line("Yearly revenue", b.revenue),
  ]
    .filter(Boolean)
    .join("\n");
}
