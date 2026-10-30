import { Arrow, Label } from "../icons";

const DAYS = [
  {
    key: "realestate",
    label: "Real estate",
    events: [
      [23, "Four overnight showing requests are confirmed with sellers", "Texts"],
      [74, "A new deal file is flagged for a missing FINTRAC ID record", "Doc portal"],
      [141, "A $50,000 deposit lands in trust and is matched to its deal", "Bank"],
      [217, "A sign call is answered, qualified and booked for a callback", "Phone"],
      [283, "Showing feedback is chased and summed up for the seller", "Email"],
      [376, "Listing agreement and data form are prefilled for review", "Forms"],
      [428, "An agent asks “Am I capped yet?” and gets the answer", "Team chat"],
      [479, "A closed deal’s 70/30 split and HST are queued for approval", "Back office"],
      [532, "A buyer’s lender approves and a waiver is drafted for review", "E-sign"],
      [589, "Home anniversary notes are drafted for four past clients", "CRM"],
    ],
  },
  {
    key: "mortgage",
    label: "Mortgage",
    events: [
      [12, "Last night’s pre-approval lead is booked for a call", "Web form"],
      [63, "Three clients missing an NOA or job letter get a reminder", "Texts"],
      [137, "A $12,000 deposit in 90 days of bank statements is flagged", "Doc portal"],
      [206, "Five lender conditions are logged with Thursday’s due date", "Email"],
      [281, "A realtor update on Friday’s financing condition is drafted", "Email"],
      [318, "Someone asks “Which rate holds expire soon?” and gets three", "Team chat"],
      [394, "A self-employed file is packaged for the broker to review", "Deal portal"],
      [442, "A compliance check flags a missing FINTRAC ID record", "Compliance"],
      [527, "Lender commission payments are matched to 11 funded deals", "QuickBooks"],
      [592, "Seven clients up for renewal in 120 days get a check-in", "CRM"],
    ],
  },
  {
    key: "law",
    label: "Law",
    events: [
      [8, "Each lawyer gets today’s court dates, closings and deadlines", "Reports"],
      [37, "A divorce inquiry is conflict-checked against both spouses", "Web form"],
      [74, "A $2,500 trust deposit is matched to its file for review", "Bank"],
      [131, "A name mismatch between the APS and lender docs is flagged", "Doc portal"],
      [213, "A confirmed limitation date gets alerts at 90, 30 and 7 days", "Calendar"],
      [292, "A couple’s mirror wills and POAs are drafted for review", "Templates"],
      [386, "A lawyer-approved engagement letter goes out for e-signature", "E-sign"],
      [469, "Last month’s trust reconciliation is prepared for review", "Trust books"],
      [547, "Status updates for 11 quiet files are drafted for approval", "Email"],
      [618, "Today’s calls and emails become 14 draft dockets to review", "Billing"],
    ],
  },
  {
    key: "agencies",
    label: "Agencies",
    events: [
      [23, "A rebrand inquiry gets the intake form and a Tuesday call", "Web form"],
      [79, "Client feedback across 11 emails becomes one change list", "Email"],
      [131, "Three people missing yesterday’s timesheets get a nudge", "Slack"],
      [176, "A retainer hits 80% of its hours by the 12th and is flagged", "Timesheets"],
      [221, "Yesterday’s discovery call is turned into a draft proposal", "Proposals"],
      [268, "A Meta campaign pacing 30% over budget is sent for review", "Ad spend"],
      [307, "Someone asks “Is round 3 in scope?” and gets the SOW clause", "Slack"],
      [373, "Six client reports are drafted from Google Ads, Meta and GA4", "Reports"],
      [451, "A logo sign-off becomes a draft invoice for the final 50%", "QuickBooks"],
      [583, "Next week’s draft schedule flags two overbooked designers", "Resourcing"],
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    events: [
      [4, "Yesterday’s MRR, churn and new signups emailed to the owner", "Reports"],
      [49, "Five failed payments get a friendly note and an update link", "Stripe"],
      [98, "Eleven “where’s my box?” emails get replies with tracking", "Help desk"],
      [163, "A new member is welcomed and an onboarding call booked", "Calendar"],
      [227, "Four skips and an address change are applied before cutoff", "Email"],
      [292, "A Stripe payout is split into sales, refunds, fees and HST", "QuickBooks"],
      [371, "A cancel request gets a pause offer drafted for review", "Email"],
      [438, "Someone asks “How many boxes ship Friday?” and gets 214", "Slack"],
      [509, "A “forgot to cancel” refund request is queued for approval", "Help desk"],
      [589, "A chargeback gets its evidence pack drafted for approval", "Stripe"],
    ],
  },
  {
    key: "accounting",
    label: "Accounting",
    events: [
      [4, "This week’s HST, payroll and T2 deadlines go to the team", "Reports"],
      [31, "Overnight bank feeds for 26 clients are coded for review", "QuickBooks"],
      [98, "Four clients missing last month’s statements get a reminder", "Texts"],
      [139, "A lead two years behind on the books gets a Thursday call", "Web form"],
      [197, "A client’s CRA letter is logged with its 30-day reply date", "Email"],
      [266, "A quarterly HST return is prepared for review and filing", "QuickBooks"],
      [367, "Hours for Friday’s payroll are collected from three clients", "Payroll"],
      [433, "Someone asks “Is Patel current on instalments?” and gets it", "Team chat"],
      [508, "A reviewed T2 goes to the client with a T183CORP to e-sign", "E-sign"],
      [587, "Follow-ups are drafted for five fee invoices past 60 days", "Billing"],
    ],
  },
  {
    key: "trades",
    label: "Trades",
    events: [
      [2, "Yesterday’s jobs, sales and callbacks texted to the owner", "Reports"],
      [9, "Six overnight voicemails are sorted, no-heat calls first", "Phone"],
      [94, "A $1,200 e-transfer deposit is matched and the job booked", "Bank"],
      [167, "Site visit notes become a three-option quote for review", "Quotes"],
      [238, "A tech closes a job with photos and the invoice goes out", "Field app"],
      [314, "A part order is queued for approval and the return booked", "Supplier"],
      [396, "Fourteen maintenance plan customers are booked for tune-ups", "Calendar"],
      [441, "A job runs long and the next two customers get new ETAs", "Dispatch"],
      [517, "A tech asks for the Nguyens’ filter size and gets the answer", "Texts"],
      [593, "Follow-ups are drafted for seven unsold quotes", "CRM"],
    ],
  },
] as const;

// minutes after 7:00 AM, shown the way the clock reads
function clockTime(m: number) {
  const t = 7 * 60 + m;
  return `${Math.floor(t / 60) % 12 || 12}:${String(t % 60).padStart(2, "0")}`;
}

export function Day() {
  return (
    <section className="band navy day" aria-labelledby="day-h">
      <div className="wrap">
        <div className="day-head">
          <div>
            <Label>An ordinary Tuesday</Label>
            <h2 className="d h2" id="day-h">A day that runs itself.</h2>
          </div>
          <p className="lead">This is one business day with AI Weavers on retainer. Pick your industry, then scroll to move the clock.</p>
        </div>
        <div className="day-pin" id="day-pin">
          <div className="clock">
            <div className="clock-time" id="clock" aria-live="off">5:30<small>PM</small></div>
            <div className="meter" aria-hidden="true"><span id="meter"></span></div>
            <div className="meter-x" aria-hidden="true"><span>7:00 AM</span><span>5:30 PM</span></div>
            <div className="tally">
              <div><b id="n-done">10</b><span>Handled by AI Weavers</span></div>
              <div className="zero"><b>0</b><span>Done by hand</span></div>
            </div>
          </div>
          <div className="day-pick">
            <p className="day-pick-h" id="day-pick-h">Pick your industry</p>
            <div className="day-tabs" role="tablist" aria-labelledby="day-pick-h">
              {DAYS.map(({ key, label }, i) => (
                <button
                  key={key}
                  className="day-tab"
                  type="button"
                  role="tab"
                  id={`day-tab-${key}`}
                  aria-controls={`day-pan-${key}`}
                  aria-selected={i === 0 ? "true" : "false"}
                  tabIndex={i === 0 ? 0 : -1}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="day-log">
            <div className="day-stack">
              {DAYS.map(({ key, events }, i) => (
                <div key={key} className={i === 0 ? "day-panel" : "day-panel is-off"} role="tabpanel" id={`day-pan-${key}`} aria-labelledby={`day-tab-${key}`} tabIndex={0}>
                  <ol className="events">
                    {events.map(([m, text, sys]) => (
                      <li className="is-done" data-m={m} key={m}><time>{clockTime(m)}</time><p>{text}</p><span className="sys">{sys}</span></li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <p className="day-end" id="day-end">5:30 PM. Ten jobs handled. <span>Nothing copied by hand.</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

const LEGEND: [React.CSSProperties, string][] = [
  [{ background: "var(--ph1)" }, "Meetings"],
  [{ background: "var(--ph2)" }, "Quotes and contracts"],
  [{ background: "var(--ph3)" }, "Building, nothing live"],
  [{ background: "var(--coral-wash)", boxShadow: "inset 0 0 0 1.5px var(--coral-ink)" }, "Change order"],
  [{ background: "var(--cobalt)" }, "Dev shop launch"],
  [{ background: "var(--coral)" }, "Something shipped"],
];

const COMPARE = [
  ["Weeks of discovery before anything ships", "Something live in the first week"],
  ["Change orders when priorities shift", "Change priorities anytime, same fee"],
  ["Hosting and fixes billed separately", "Hosting and upkeep included"],
  ["The dev shop holds the code and accounts", "You own everything from day one"],
];

export function Race() {
  return (
    <section className="sec" id="compare" aria-labelledby="race-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>Hourly or retainer</Label>
            <h2 className="d h2" id="race-h">Same project. Two ways to pay for it.</h2>
          </div>
          <p className="lead">An hourly dev shop spends months deciding. A retainer ships in week one and keeps shipping. Drag through the first quarter.</p>
        </div>

        <div className="race-board">
          <div className="race-top">
            <p className="race-week" id="race-week">Week 12 <span>of 12</span></p>
            <div className="race-ctl"><label htmlFor="week">Week</label><input type="range" id="week" min="1" max="12" step="1" defaultValue="12" aria-describedby="race-week" /></div>
          </div>
          <div className="lane lane-ticks">
            <div></div>
            <div className="ticks" aria-hidden="true" id="ticks"></div>
          </div>
          <div className="lane" style={{ borderTop: 0, paddingTop: 4 }}>
            <div><p className="lane-name">Hourly dev shop</p><p className="lane-count">Shipped <b id="h-count">1</b></p></div>
            <div className="cells" id="h-cells" aria-hidden="true"></div>
            <p className="lane-status" id="h-status" aria-live="polite"></p>
          </div>
          <div className="lane">
            <div><p className="lane-name">AI Weavers retainer</p><p className="lane-count">Shipped <b id="a-count">12</b></p></div>
            <div className="cells" id="a-cells" aria-hidden="true"></div>
            <p className="lane-status" id="a-status" aria-live="polite"></p>
          </div>
          <div className="legend" aria-hidden="true">
            {LEGEND.map(([style, text]) => (
              <span key={text}><i style={style}></i>{text}</span>
            ))}
          </div>
        </div>

        <div className="cmp" role="table" aria-label="Hourly billing compared with an AI Weavers retainer">
          <div className="r" role="row"><div className="c h a" role="columnheader">Billed by the hour</div><div className="c h b" role="columnheader">On an AI Weavers retainer</div></div>
          {COMPARE.map(([a, b]) => (
            <div className="r" role="row" key={a}><div className="c a" role="cell">{a}</div><div className="c b" role="cell">{b}</div></div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SLIDERS = [
  ["r1", "Retyping data from one system into another", 8],
  ["r2", "Invoicing and chasing payments", 5],
  ["r3", "Answering the same client questions", 6],
  ["r4", "Building reports and spreadsheets", 4],
  ["r5", "Chasing documents, signatures and follow-ups", 4],
  ["r6", "Sorting email and booking new inquiries", 5],
] as const;

export function Roi() {
  return (
    <section className="sec" id="roi" style={{ paddingTop: 0 }} aria-labelledby="roi-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>Cost calculator</Label>
            <h2 className="d h2" id="roi-h">What is busywork costing you?</h2>
          </div>
          <p className="lead">Set the hours your whole team spends each week. The math updates as you go.</p>
        </div>
        <div className="roi-grid">
          <form className="sliders" id="roi-form">
            {SLIDERS.map(([id, label, value]) => (
              <div className="sl" key={id}><div className="sl-h"><label htmlFor={id}>{label}</label><output htmlFor={id} id={`o-${id}`}>{value} hrs</output></div><input type="range" id={id} min="0" max="40" defaultValue={value} /></div>
            ))}
            <div className="sl rate"><div className="sl-h"><label htmlFor="rate">Cost of one staff hour, wages plus overhead (USD)</label><output htmlFor="rate" id="o-rate">$50</output></div><input type="range" id="rate" min="20" max="150" step="5" defaultValue="50" /></div>
          </form>
          <div className="result" aria-live="polite">
            <p className="r-line">Your team spends <b id="x-hrs">32 hours</b> a week on work software could do.</p>
            <p className="r-big"><b id="x-cost">$83,200</b><span>a year spent on busywork</span></p>
            <div className="r-pair">
              <div><b id="x-back">$49,920</b><span>AI Weavers could win back each year</span></div>
              <div><b id="x-time">19 hrs</b><span>back every week</span></div>
            </div>
            <p className="r-verdict" id="x-verdict">The Core retainer costs $42,000 USD a year. Every $1 returns about <b>$1.19</b>. It pays for itself once AI Weavers wins back 17 hours a week.</p>
            <a className="btn btn-block" href="#start">Check these numbers on a free call
              <Arrow /></a>
            <p className="r-note">Assumes 60% of these hours can be automated. We measure your real numbers in the Weave Session.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
