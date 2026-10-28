import { Arrow, Label } from "../icons";

const EVENTS = [
  [2, "7:02", "Yesterday’s sales and cash numbers emailed to four managers", "Reports"],
  [15, "7:15", "A customer email becomes a draft order, waiting for approval", "Email"],
  [101, "8:41", "An e-transfer is matched to invoice 1047 and marked paid", "Bank"],
  [130, "9:10", "A new lead is called, qualified and booked for Thursday", "Phone"],
  [206, "10:26", "An invoice syncs to QuickBooks with the right tax code", "QuickBooks"],
  [243, "11:03", "A technician closes a job from a phone and the report files itself", "Field app"],
  [330, "12:30", "A website inquiry is screened and routed to the right person", "Web form"],
  [432, "2:12", "Someone asks “What did we invoice last month?” and gets the answer", "Slack"],
  [525, "3:45", "Approved time off lands on the team calendar", "Calendar"],
  [598, "4:58", "Follow-ups are drafted for six open quotes", "CRM"],
] as const;

export function Day() {
  return (
    <section className="band navy day" aria-labelledby="day-h">
      <div className="wrap">
        <div className="day-head">
          <div>
            <Label>An ordinary Tuesday</Label>
            <h2 className="d h2" id="day-h">A day that runs itself.</h2>
          </div>
          <p className="lead">This is one business day with AI Weavers on retainer. Scroll to move the clock.</p>
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
          <div>
            <ol className="events" id="events">
              {EVENTS.map(([m, time, text, sys]) => (
                <li className="is-done" data-m={m} key={m}><time>{time}</time><p>{text}</p><span className="sys">{sys}</span></li>
              ))}
            </ol>
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
  [{ background: "var(--cobalt)" }, "Agency launch"],
  [{ background: "var(--coral)" }, "Something shipped"],
];

const COMPARE = [
  ["Weeks of discovery before anything ships", "Something live in the first week"],
  ["Change orders when priorities shift", "Change priorities anytime, same fee"],
  ["Hosting and fixes billed separately", "Hosting and upkeep included"],
  ["The agency holds the code and accounts", "You own everything from day one"],
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
          <p className="lead">An hourly agency spends months deciding. A retainer ships in week one and keeps shipping. Drag through the first quarter.</p>
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
            <div><p className="lane-name">Hourly agency</p><p className="lane-count">Shipped <b id="h-count">1</b></p></div>
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
  ["r3", "Answering the same customer questions", 6],
  ["r4", "Building reports and spreadsheets", 4],
  ["r5", "Scheduling, reminders and follow-ups", 4],
  ["r6", "Sorting email, forms and new inquiries", 5],
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
            <div className="sl rate"><div className="sl-h"><label htmlFor="rate">Cost of one staff hour, wages plus overhead</label><output htmlFor="rate" id="o-rate">$50</output></div><input type="range" id="rate" min="20" max="150" step="5" defaultValue="50" /></div>
          </form>
          <div className="result" aria-live="polite">
            <p className="r-line">Your team spends <b id="x-hrs">32 hours</b> a week on work software could do.</p>
            <p className="r-big"><b id="x-cost">$83,200</b><span>a year spent on busywork</span></p>
            <div className="r-pair">
              <div><b id="x-back">$49,920</b><span>AI Weavers could win back each year</span></div>
              <div><b id="x-time">19 hrs</b><span>back every week</span></div>
            </div>
            <p className="r-verdict" id="x-verdict">The Core retainer costs $42,000 a year. Every $1 returns about <b>$1.19</b>. It pays for itself once AI Weavers wins back 17 hours a week.</p>
            <a className="btn btn-block" href="#start">Check these numbers on a free call
              <Arrow /></a>
            <p className="r-note">Assumes 60% of these hours can be automated. We measure your real numbers in the Weave Session.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
