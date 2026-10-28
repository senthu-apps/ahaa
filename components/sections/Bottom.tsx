import { Arrow, Icon, Label, LOGO_PATH, SWOOSH_PATH } from "../icons";

const STEPS = [
  ["01", "Book your Weave Session", "A free 30-minute call. We find your three biggest time sinks and show you what we would build first.", "Free, 30 minutes"],
  ["02", "Get your Automation Map", "A written plan ranked by hours saved. It is yours to keep, whether or not you hire us.", "Within two business days"],
  ["03", "Start your retainer", "Pick Core or Scale. Your lead is assigned and work starts the same week.", "Same week"],
  ["04", "Add requests", "Put anything on your board: an automation, an agent, a feature or a fix. Reorder whenever you like.", "Anytime"],
  ["05", "Ship weekly, run for good", "Working software every week. We monitor, fix and improve it for as long as you are with us.", "Every week"],
];

export function Process() {
  return (
    <section className="sec" id="how" style={{ paddingTop: 0 }} aria-labelledby="how-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>How it works</Label>
            <h2 className="d h2" id="how-h">From first call to first automation in a week.</h2>
          </div>
          <p className="lead">No discovery phase you pay for. No statement of work to negotiate. You talk to us, then things start getting done.</p>
        </div>
        <div className="proc-wrap"><span className="proc-line" aria-hidden="true"></span><span className="proc-fill" aria-hidden="true" id="proc-fill"></span>
          <ol className="proc">
            {STEPS.map(([n, title, body, foot]) => (
              <li className="step" key={n}><span className="step-n">{n}</span><h3 className="d">{title}</h3><p>{body}</p><span className="step-foot">{foot}</span></li>
            ))}
          </ol></div>
      </div>
    </section>
  );
}

export function Operators() {
  return (
    <section className="band cobalt ops" aria-labelledby="ops-h">
      <div className="wrap ops-grid">
        <div>
          <Label>Who does the work</Label>
          <h2 className="d h2" id="ops-h">Built by operators.</h2>
          <p className="lead">AI Weavers comes from Scale Shift Ventures, the studio behind the companies listed here. We have built, run and sold subscription businesses, so we automate like owners: start with what saves the most time, then keep it running.</p>
          <ul className="team">
            <li><Icon name="i-check" />One senior lead who knows your business and answers to you directly</li>
            <li><Icon name="i-check" />Engineers and product designers from the Kimp studio behind them</li>
            <li><Icon name="i-check" />AI speeds up the building. People make the calls and review every change</li>
          </ul>
        </div>
        <div>
          <ul className="cos">
            <li><h3 className="d">Kimp</h3><span className="tag">Design subscription</span><p>A flat-fee design subscription for brands and agencies. Its design and engineering team builds AI Weavers client work.</p></li>
            <li><h3 className="d">DesignDog.ai</h3><span className="tag">AI design</span><p>AI-powered design software. Brand-ready creative made in minutes, not days.</p></li>
            <li><h3 className="d">Repliers</h3><span className="tag">Data infrastructure</span><p>Real estate MLS data infrastructure. An API that brokerages and proptech products build on.</p></li>
            <li><h3 className="d">Buy.ca</h3><span className="tag">Proptech brokerage</span><p>A Canadian home-buying platform. Cash back toward the down payment and low-commission listings.</p></li>
            <li><h3 className="d">Botdog</h3><span className="tag">SaaS, acquired</span><p>LinkedIn automation software. Built, scaled and acquired.</p></li>
          </ul>
          <p className="ops-note">Same operators, now running your back office on the tools we use in our own.</p>
        </div>
      </div>
    </section>
  );
}

const CLAUSES = [
  ["Pause or cancel anytime", "No long contracts. Pause when the list is empty, resume when it is not."],
  ["You own everything", "Code, workflows, accounts and data are yours from day one."],
  ["Weekly delivery", "Working software every week, instead of status reports."],
  ["Upkeep included", "We host, monitor and fix what we build as part of the fee."],
  ["Outside costs at cost", "AI usage and paid software seats are passed through with no markup."],
];

export function Pricing() {
  return (
    <section className="sec" id="pricing" aria-labelledby="price-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>Pricing</Label>
            <h2 className="d h2" id="price-h">Two retainers. Prices on the page.</h2>
          </div>
          <p className="lead">No quotes, no hourly rates and no surprises on the invoice. Pick the pace that fits your list.</p>
        </div>
        <div className="plans">
          <article className="plan core" aria-labelledby="p-core">
            <div className="plan-top"><div><h3 className="d" id="p-core">Core</h3><p className="fit">For a business with a clear list of things to fix.</p></div><span className="badge">The usual starting point</span></div>
            <div className="price"><b className="tnum">$3,500</b><span>per month, USD</span></div>
            <p className="cap"><i aria-hidden="true"></i>One request in progress at a time</p>
            <ul className="incl">
              <li><Icon name="i-check" />Automations, AI agents and custom software</li>
              <li><Icon name="i-check" />Something shipped every week</li>
              <li><Icon name="i-check" />Hosting and upkeep for everything we build</li>
              <li><Icon name="i-check" />Monthly review call with your lead</li>
              <li><Icon name="i-check" />Shared request board</li>
            </ul>
            <a className="btn btn-ink btn-block" href="#start">Start with Core</a>
          </article>
          <article className="plan scale" aria-labelledby="p-scale">
            <div className="plan-top"><div><h3 className="d" id="p-scale">Scale</h3><p className="fit">For a business ready to rebuild how it runs.</p></div><span className="badge">Twice the capacity</span></div>
            <div className="price"><b className="tnum">$6,500</b><span>per month, USD</span></div>
            <p className="cap"><i aria-hidden="true"></i>Two requests in progress at a time</p>
            <ul className="incl">
              <li><Icon name="i-check" />Everything in Core</li>
              <li><Icon name="i-check" />Priority in the queue</li>
              <li><Icon name="i-check" />Monthly roadmap session with a strategist</li>
              <li><Icon name="i-check" />Larger builds like portals and internal apps</li>
              <li><Icon name="i-check" />AI usage reporting across your tools</li>
            </ul>
            <a className="btn btn-block" href="#start">Start with Scale</a>
          </article>
        </div>

        <div className="terms">
          <div className="terms-h"><h3 className="d h3">Terms of engagement</h3><p>The whole contract, in five lines.</p></div>
          <ol className="clauses">
            {CLAUSES.map(([title, body], i) => (
              <li key={title}><span className="n">§ {i + 1}</span><h4>{title}</h4><p>{body}</p></li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ["What counts as a request?", "One clear piece of work: an automation, an AI agent, a feature, a report or a fix. Bigger projects are split into weekly pieces, so you see progress every week."],
  ["Who actually does the work?", "A senior lead owns your account and talks to you directly. Engineers and product designers from the Kimp studio build with them. AI speeds up the building, and people review every change before it goes live."],
  ["Which AI models do you use?", "Whatever fits the job best. We build on Claude, OpenAI, Gemini and open models, and switch when a better one arrives. You are never locked to one vendor."],
  ["How soon will something be live?", "We aim to put your first automation live in the first week of your retainer, starting with the item on your Automation Map that saves the most hours."],
  ["What happens if I pause or cancel?", "You keep everything we built, with notes on how it works. Resume anytime and we pick up where we left off."],
  ["Are AI and software costs included?", "Our work, hosting and upkeep are included. Outside costs like AI usage, text messages or paid software seats are billed at cost, with no markup."],
  ["Where does my data live?", "In your own accounts wherever possible. When we host something, you choose the region, including Canada or the US. Agents only see the systems you approve."],
];

export function Faq() {
  return (
    <section className="sec" id="faq" style={{ paddingTop: 0 }} aria-labelledby="faq-h">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <Label>Questions</Label>
          <h2 className="d h2" id="faq-h">Straight answers.</h2>
          <p className="faq-note">Anything else, ask us on the call. We will tell you if a retainer is the wrong fit.</p>
        </div>
        <div className="qa" id="qa">
          {FAQS.map(([q, a], i) => (
            <div className="qa-item" key={q}><button className="qa-q" type="button" aria-expanded="false" aria-controls={`a${i + 1}`} id={`q${i + 1}`}>{q}<span className="pm" aria-hidden="true"><svg><use href="#i-plus" /></svg></span></button>
              <div className="qa-a" id={`a${i + 1}`} role="region" aria-labelledby={`q${i + 1}`} hidden><p>{a}</p></div></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Start() {
  return (
    <section className="band deep start" id="start" aria-labelledby="start-h">
      <div className="wrap start-grid">
        <div>
          <Label>Book your Weave Session</Label>
          <h2 className="d h2" id="start-h">Tell us what eats your week.</h2>
          <ul className="gets">
            <li><span>01</span>A 30-minute call with a senior lead, not a sales rep</li>
            <li><span>02</span>Your three biggest time sinks, named and sized</li>
            <li><span>03</span>A written Automation Map within two business days</li>
          </ul>
        </div>
        <div className="form-card">
          <form id="lead" noValidate>
            <div className="fgrid">
              <div className="field"><label htmlFor="f-name">Your name</label><input id="f-name" name="name" autoComplete="name" placeholder="Jordan Lee" required /></div>
              <div className="field"><label htmlFor="f-email">Work email</label><input id="f-email" name="email" type="email" autoComplete="email" placeholder="jordan@company.com" required />
                <p className="err" id="f-email-err" hidden>Enter your work email so we can reply.</p></div>
              <div className="field"><label htmlFor="f-co">Company</label><input id="f-co" name="company" autoComplete="organization" placeholder="Northline Supply" /></div>
              <div className="field"><label htmlFor="f-size">Team size</label>
                <select id="f-size" name="size" defaultValue="11 to 25"><option>1 to 10</option><option>11 to 25</option><option>26 to 50</option><option>51 to 200</option><option>More than 200</option></select></div>
              <div className="field full"><label htmlFor="f-sink">Biggest time sink</label>
                <select id="f-sink" name="sink"><option>Typing data between systems</option><option>Invoicing and collections</option><option>Answering customer questions</option><option>Reports and spreadsheets</option><option>Scheduling and follow-ups</option><option>Something else</option></select></div>
              <div className="field full"><label htmlFor="f-msg">Anything we should know? (optional)</label><textarea id="f-msg" name="msg" rows={3} placeholder="The tools you use, what you have tried, what keeps slipping."></textarea></div>
            </div>
            <div className="form-foot">
              <button className="btn btn-block magnet" type="submit">Request my Weave Session
                <Arrow /></button>
              <p>We reply within one business day. No sales sequence.</p>
            </div>
          </form>
          <div className="done" id="done" hidden tabIndex={-1}>
            <span className="ck"><svg><use href="#i-check" /></svg></span>
            <h3 className="d h3" id="done-h">Request received.</h3>
            <p id="done-p">We will email you within one business day with times for your Weave Session.</p>
            <p className="pv">Design preview: this form is not connected yet, so nothing was sent.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="wrap">
        <div className="f-cta">
          <h2 className="d h2">Ready to weave it all together?</h2>
          <div><p>Thirty minutes, three time sinks, one written plan. No obligation.</p>
            <a className="btn magnet" href="#start">Book your free Weave Session
              <Arrow /></a></div>
        </div>
        <div className="f-cols">
          <div><p className="f-blurb">We weave your tools, data and teams into automated workflows, AI agents and custom software for owner-led businesses, on one flat monthly retainer.</p></div>
          <div><h4>Services</h4><ul><li><a href="#services">Automations</a></li><li><a href="#services">AI agents</a></li><li><a href="#services">Custom software</a></li><li><a href="#roi">Cost calculator</a></li></ul></div>
          <div><h4>Firm</h4><ul><li><a href="#how">How it works</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#faq">Questions</a></li><li><a href="#start">Book a session</a></li></ul></div>
          <div><h4>Contact</h4><div className="mailrow"><span id="mail">hello@aiweavers.ai</span><button className="copy" type="button" id="copy-mail">Copy</button></div></div>
        </div>
        <div className="f-mark" aria-hidden="true">
          <svg viewBox="0 0 1756 283">
            <defs><clipPath id="fwipe"><rect id="fwipe-r" x="0" y="0" width="1756" height="283" /></clipPath></defs>
            <path fill="#F6F3EC" d={LOGO_PATH} />
            <path fill="#FE6854" clipPath="url(#fwipe)" d={SWOOSH_PATH} />
          </svg>
        </div>
        <div className="f-bar"><span>© 2026 AI Weavers. A Scale Shift Ventures company.</span><span>Ontario, Canada. Serving clients across North America.</span></div>
      </div>
    </footer>
  );
}
