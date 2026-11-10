/**
 * "An ordinary Tuesday" — one business day per industry.
 * Copy verbatim from aiweavers.com. `m` is minutes after 7:00 AM; the day
 * closes at 5:30 PM (DAY_LENGTH).
 */

export type DayEvent = { m: number; text: string; sys: string };
export type Industry = { key: string; label: string; events: DayEvent[] };

export const DAY_START = 7 * 60;
export const DAY_LENGTH = 630;

/** Whole minutes after 7:00 → display parts ("1:16", "PM") and an ISO time. */
export function clock(m: number) {
  const t = DAY_START + Math.floor(m);
  const h24 = Math.floor(t / 60);
  const mm = String(t % 60).padStart(2, "0");
  return {
    hm: `${((h24 + 11) % 12) + 1}:${mm}`,
    mer: h24 >= 12 ? "PM" : "AM",
    iso: `${String(h24).padStart(2, "0")}:${mm}`,
  };
}

export const INDUSTRIES: Industry[] = [
  {
    key: "real-estate",
    label: "Real estate",
    events: [
      { m: 23, text: "Four overnight showing requests are confirmed with sellers", sys: "Texts" },
      { m: 74, text: "A new deal file is flagged for a missing FINTRAC ID record", sys: "Doc portal" },
      { m: 141, text: "A $50,000 deposit lands in trust and is matched to its deal", sys: "Bank" },
      { m: 217, text: "A sign call is answered, qualified and booked for a callback", sys: "Phone" },
      { m: 283, text: "Showing feedback is chased and summed up for the seller", sys: "Email" },
      { m: 376, text: "Listing agreement and data form are prefilled for review", sys: "Forms" },
      { m: 428, text: "An agent asks “Am I capped yet?” and gets the answer", sys: "Team chat" },
      { m: 479, text: "A closed deal’s 70/30 split and HST are queued for approval", sys: "Back office" },
      { m: 532, text: "A buyer’s lender approves and a waiver is drafted for review", sys: "E-sign" },
      { m: 589, text: "Home anniversary notes are drafted for four past clients", sys: "CRM" },
    ],
  },
  {
    key: "mortgage",
    label: "Mortgage",
    events: [
      { m: 12, text: "Last night’s pre-approval lead is booked for a call", sys: "Web form" },
      { m: 63, text: "Three clients missing an NOA or job letter get a reminder", sys: "Texts" },
      { m: 137, text: "A $12,000 deposit in 90 days of bank statements is flagged", sys: "Doc portal" },
      { m: 206, text: "Five lender conditions are logged with Thursday’s due date", sys: "Email" },
      { m: 281, text: "A realtor update on Friday’s financing condition is drafted", sys: "Email" },
      { m: 318, text: "Someone asks “Which rate holds expire soon?” and gets three", sys: "Team chat" },
      { m: 394, text: "A self-employed file is packaged for the broker to review", sys: "Deal portal" },
      { m: 442, text: "A compliance check flags a missing FINTRAC ID record", sys: "Compliance" },
      { m: 527, text: "Lender commission payments are matched to 11 funded deals", sys: "QuickBooks" },
      { m: 592, text: "Seven clients up for renewal in 120 days get a check-in", sys: "CRM" },
    ],
  },
  {
    key: "law",
    label: "Law",
    events: [
      { m: 8, text: "Each lawyer gets today’s court dates, closings and deadlines", sys: "Reports" },
      { m: 37, text: "A divorce inquiry is conflict-checked against both spouses", sys: "Web form" },
      { m: 74, text: "A $2,500 trust deposit is matched to its file for review", sys: "Bank" },
      { m: 131, text: "A name mismatch between the APS and lender docs is flagged", sys: "Doc portal" },
      { m: 213, text: "A confirmed limitation date gets alerts at 90, 30 and 7 days", sys: "Calendar" },
      { m: 292, text: "A couple’s mirror wills and POAs are drafted for review", sys: "Templates" },
      { m: 386, text: "A lawyer-approved engagement letter goes out for e-signature", sys: "E-sign" },
      { m: 469, text: "Last month’s trust reconciliation is prepared for review", sys: "Trust books" },
      { m: 547, text: "Status updates for 11 quiet files are drafted for approval", sys: "Email" },
      { m: 618, text: "Today’s calls and emails become 14 draft dockets to review", sys: "Billing" },
    ],
  },
  {
    key: "agencies",
    label: "Agencies",
    events: [
      { m: 23, text: "A rebrand inquiry gets the intake form and a Tuesday call", sys: "Web form" },
      { m: 79, text: "Client feedback across 11 emails becomes one change list", sys: "Email" },
      { m: 131, text: "Three people missing yesterday’s timesheets get a nudge", sys: "Slack" },
      { m: 176, text: "A retainer hits 80% of its hours by the 12th and is flagged", sys: "Timesheets" },
      { m: 221, text: "Yesterday’s discovery call is turned into a draft proposal", sys: "Proposals" },
      { m: 268, text: "A Meta campaign pacing 30% over budget is sent for review", sys: "Ad spend" },
      { m: 307, text: "Someone asks “Is round 3 in scope?” and gets the SOW clause", sys: "Slack" },
      { m: 373, text: "Six client reports are drafted from Google Ads, Meta and GA4", sys: "Reports" },
      { m: 451, text: "A logo sign-off becomes a draft invoice for the final 50%", sys: "QuickBooks" },
      { m: 583, text: "Next week’s draft schedule flags two overbooked designers", sys: "Resourcing" },
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    events: [
      { m: 4, text: "Yesterday’s MRR, churn and new signups emailed to the owner", sys: "Reports" },
      { m: 49, text: "Five failed payments get a friendly note and an update link", sys: "Stripe" },
      { m: 98, text: "Eleven “where’s my box?” emails get replies with tracking", sys: "Help desk" },
      { m: 163, text: "A new member is welcomed and an onboarding call booked", sys: "Calendar" },
      { m: 227, text: "Four skips and an address change are applied before cutoff", sys: "Email" },
      { m: 292, text: "A Stripe payout is split into sales, refunds, fees and HST", sys: "QuickBooks" },
      { m: 371, text: "A cancel request gets a pause offer drafted for review", sys: "Email" },
      { m: 438, text: "Someone asks “How many boxes ship Friday?” and gets 214", sys: "Slack" },
      { m: 509, text: "A “forgot to cancel” refund request is queued for approval", sys: "Help desk" },
      { m: 589, text: "A chargeback gets its evidence pack drafted for approval", sys: "Stripe" },
    ],
  },
  {
    key: "accounting",
    label: "Accounting",
    events: [
      { m: 4, text: "This week’s HST, payroll and T2 deadlines go to the team", sys: "Reports" },
      { m: 31, text: "Overnight bank feeds for 26 clients are coded for review", sys: "QuickBooks" },
      { m: 98, text: "Four clients missing last month’s statements get a reminder", sys: "Texts" },
      { m: 139, text: "A lead two years behind on the books gets a Thursday call", sys: "Web form" },
      { m: 197, text: "A client’s CRA letter is logged with its 30-day reply date", sys: "Email" },
      { m: 266, text: "A quarterly HST return is prepared for review and filing", sys: "QuickBooks" },
      { m: 367, text: "Hours for Friday’s payroll are collected from three clients", sys: "Payroll" },
      { m: 433, text: "Someone asks “Is Patel current on instalments?” and gets it", sys: "Team chat" },
      { m: 508, text: "A reviewed T2 goes to the client with a T183CORP to e-sign", sys: "E-sign" },
      { m: 587, text: "Follow-ups are drafted for five fee invoices past 60 days", sys: "Billing" },
    ],
  },
  {
    key: "trades",
    label: "Trades",
    events: [
      { m: 2, text: "Yesterday’s jobs, sales and callbacks texted to the owner", sys: "Reports" },
      { m: 9, text: "Six overnight voicemails are sorted, no-heat calls first", sys: "Phone" },
      { m: 94, text: "A $1,200 e-transfer deposit is matched and the job booked", sys: "Bank" },
      { m: 167, text: "Site visit notes become a three-option quote for review", sys: "Quotes" },
      { m: 238, text: "A tech closes a job with photos and the invoice goes out", sys: "Field app" },
      { m: 314, text: "A part order is queued for approval and the return booked", sys: "Supplier" },
      { m: 396, text: "Fourteen maintenance plan customers are booked for tune-ups", sys: "Calendar" },
      { m: 441, text: "A job runs long and the next two customers get new ETAs", sys: "Dispatch" },
      { m: 517, text: "A tech asks for the Nguyens’ filter size and gets the answer", sys: "Texts" },
      { m: 593, text: "Follow-ups are drafted for seven unsold quotes", sys: "CRM" },
    ],
  },
];
