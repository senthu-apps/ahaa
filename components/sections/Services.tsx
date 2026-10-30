import { Icon, Label } from "../icons";

const TABS = [
  ["Automations", "Your tools pass work to each other, so nobody copies and pastes."],
  ["AI agents", "AI that answers calls, sorts email, drafts replies and follows up. A person approves what matters."],
  ["Custom software", "Portals, dashboards and internal apps shaped around how you actually work."],
  ["Care and upkeep", "Hosting, monitoring and fixes for everything we build, inside the fee."],
];

function Check() {
  return <span className="ck"><svg><use href="#i-check" /></svg></span>;
}

function Replay() {
  return (
    <button className="mini-replay" type="button"><Icon name="i-replay" />Replay</button>
  );
}

export function Services() {
  return (
    <section className="sec" id="services" style={{ paddingTop: 0 }} aria-labelledby="svc-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>What we build</Label>
            <h2 className="d h2" id="svc-h">One retainer. Everything your operations run on.</h2>
          </div>
          <p className="lead">Put anything on your board. If it saves your team time, it gets built, launched and looked after.</p>
        </div>

        <div className="svc">
          <div className="svc-tabs" role="tablist" aria-label="Services" aria-orientation="vertical">
            {TABS.map(([title, sub], i) => (
              <button
                key={title}
                className="svc-tab"
                role="tab"
                id={`tab-${i}`}
                aria-controls={`pan-${i}`}
                aria-selected={i === 0 ? "true" : "false"}
                tabIndex={i === 0 ? 0 : -1}
              >
                <span className="t">{title}</span><span className="s">{sub}</span>
                <span className="i" aria-hidden="true"><svg><use href="#i-arrow" /></svg></span>
              </button>
            ))}
          </div>

          <div className="svc-panels">
            {/* automations */}
            <div className="svc-panel" role="tabpanel" id="pan-0" aria-labelledby="tab-0" tabIndex={0}>
              <p>Payments, invoices, reports and handoffs move between your systems on their own, day and night, with every step on record.</p>
              <ul className="ex"><li>Payments matched to invoices</li><li>Invoices synced to QuickBooks or Xero</li><li>Morning numbers sent before the office opens</li></ul>
              <div className="demo" data-demo="auto">
                <div className="demo-top"><span className="l-title">One payment, start to finish</span>
                  <Replay /></div>
                <div className="flow-wrap"><span className="flow-line" aria-hidden="true"></span><span className="flow-fill" aria-hidden="true"></span>
                  <ol className="flow">
                    <li className="on"><span className="dot"><svg><use href="#i-check" /></svg></span><span className="txt">E-transfer notice arrives</span><span className="sys">Inbox</span></li>
                    <li className="on"><span className="dot"><svg><use href="#i-check" /></svg></span><span className="txt">Matched to INV-1048</span><span className="sys">Weavers</span></li>
                    <li className="on"><span className="dot"><svg><use href="#i-check" /></svg></span><span className="txt">Invoice marked paid</span><span className="sys">QuickBooks</span></li>
                    <li className="on"><span className="dot"><svg><use href="#i-check" /></svg></span><span className="txt">Receipt sent to the client</span><span className="sys">Email</span></li>
                  </ol></div>
                <div className="meta"><span><Icon name="i-check" />Runs around the clock</span><span><Icon name="i-check" />Every step logged</span><span><Icon name="i-check" />We are alerted if a step fails</span></div>
              </div>
            </div>

            {/* agents */}
            <div className="svc-panel" role="tabpanel" id="pan-1" aria-labelledby="tab-1" tabIndex={0} hidden>
              <p>Agents work inside the tools you already use. They read, look things up and prepare the work. Your people stay in charge of the decisions.</p>
              <ul className="ex"><li>Replies drafted from client emails</li><li>New inquiries answered and booked</li><li>Staff questions answered from company data</li></ul>
              <div className="demo" data-demo="agent">
                <div className="demo-top"><span className="l-title">Inbox agent</span>
                  <Replay /></div>
                <div className="mail"><p className="mail-h">From Dana, Patel Renovations · 8:12 AM</p><p>Here are our Q1 bank statements. Can we get HST filed by the 30th?</p></div>
                <div className="agent">
                  <ul className="steps">
                    <li className="on"><Check />Read the email</li>
                    <li className="on"><Check />Found the client file</li>
                    <li className="on"><Check />Listed what is missing</li>
                    <li className="on"><Check />Drafted a reply</li>
                  </ul>
                  <div className="draft">
                    <h4>Reply to Dana is ready for review</h4>
                    <dl><dt>Client</dt><dd>Patel Renovations</dd><dt>Received</dt><dd>Q1 statements</dd><dt>Missing</dt><dd>2 receipts</dd><dt>Due</dt><dd>HST return, Apr 30</dd></dl>
                    <div className="approve-row"><button className="btn btn-cobalt btn-sm" type="button" id="approve">Approve reply</button>
                      <p id="approve-note" aria-live="polite">Nothing is sent until a person approves.</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* custom software */}
            <div className="svc-panel" role="tabpanel" id="pan-2" aria-labelledby="tab-2" tabIndex={0} hidden>
              <p>When off-the-shelf software forces you to work its way, we build yours. Engineers build it, product designers make it easy to use.</p>
              <ul className="ex"><li>Client portals with e-signing</li><li>Deal and file trackers</li><li>Field apps with photo job cards</li></ul>
              <div className="demo" data-demo="dash">
                <div className="demo-top"><span className="l-title"><span className="live" aria-hidden="true"></span>Job board</span>
                  <Replay /></div>
                <div className="kpis">
                  <div className="kpi"><span>Open jobs</span><b data-n="48">48</b></div>
                  <div className="kpi"><span>On time</span><b data-n="97" data-suf="%">97%</b></div>
                  <div className="kpi"><span>Unpaid</span><b data-n="3.2" data-pre="$" data-suf="k" data-dec="1">$3.2k</b></div>
                </div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th scope="col">Job</th><th scope="col">Customer</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    <tr><td>2231</td><td>Nguyen residence</td><td><span className="st st-a">Booked</span></td></tr>
                    <tr><td>2230</td><td>Brant St Bakery</td><td><span className="st st-b">Tech on site</span></td></tr>
                    <tr><td>2229</td><td>Okafor residence</td><td><span className="st st-c">Complete</span></td></tr>
                    <tr><td>2228</td><td>Harris residence</td><td><span className="st st-d">Invoiced</span></td></tr>
                  </tbody>
                </table></div>
                <p className="sample">Sample data</p>
              </div>
            </div>

            {/* care */}
            <div className="svc-panel" role="tabpanel" id="pan-3" aria-labelledby="tab-3" tabIndex={0} hidden>
              <p>Everything we build is hosted, watched and kept current by us. If something breaks, we usually know before you do.</p>
              <ul className="ex"><li>Uptime and error monitoring</li><li>Fixes and model updates</li><li>Monthly hours-saved report</li></ul>
              <div className="demo" data-demo="care">
                <div className="demo-top"><span className="l-title"><span className="live" aria-hidden="true"></span>Your systems this month</span>
                  <Replay /></div>
                <div className="care">
                  <ul className="health">
                    <li><span className="live" aria-hidden="true"></span>Invoice matcher<small>1,284 runs</small></li>
                    <li><span className="live" aria-hidden="true"></span>Inbox agent<small>412 drafts</small></li>
                    <li><span className="live" aria-hidden="true"></span>Phone agent<small>96 calls</small></li>
                    <li><span className="live" aria-hidden="true"></span>Client portal<small>99.98% up</small></li>
                  </ul>
                  <div className="bars">
                    <p className="bars-h">Hours won back per week</p>
                    <div className="bars-plot" role="img" aria-label="Hours won back per week rising from 3 in week 1 to 15 in week 8">
                      {[[18, 3], [30, 5], [42, 7], [48, 8], [66, 11], [72, 12], [84, 14], [90, 15]].map(([h, v]) => (
                        <span className="bar" style={{ height: `${h}%` }} key={v}><b>{v}</b></span>
                      ))}
                    </div>
                    <div className="bars-x" aria-hidden="true"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span><span>W8</span></div>
                  </div>
                </div>
                <p className="sample">Sample data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
