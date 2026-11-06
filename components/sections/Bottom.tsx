import { Arrow, Icon, Label, LOGO_PATH, SWOOSH_PATH } from "../icons";

const STEPS = [
  ["01", "Book your Weave Session", "A free 30-minute call. We find your three biggest time sinks and show you what we would build first.", "Free, 30 minutes"],
  ["02", "Get your Automation Map", "A written plan ranked by hours saved, with a fixed price for each project. It is yours to keep, whether or not you hire us.", "Within two business days"],
  ["03", "Approve your first project", "Half the setup fee starts the build. Your lead is assigned and work starts the same week.", "Same week"],
  ["04", "Go live", "We build it, test it and launch it. The second half of the setup fee is due, and your retainer starts.", "At launch"],
  ["05", "Keep it running", "We host, monitor, fix and improve it for as long as you are with us. When you find the next thing to fix, it gets its own quote.", "Every month"],
];

export function Process() {
  return (
    <section className="sec" id="how" style={{ paddingTop: 0 }} aria-labelledby="how-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>How it works</Label>
            <h2 className="d h2" id="how-h">From first call to a fixed price, then live.</h2>
          </div>
          <p className="lead">No discovery phase you pay for. No hourly billing. You talk to us, you get a price, then things start getting done.</p>
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
          <p className="lead">AI Weavers comes from Scale Shift Ventures, the studio behind the companies listed here. We run a home-buying platform, an MLS data company and a design subscription, and we built and sold a SaaS business. So we automate like owners: start with what saves the most time, then keep it running.</p>
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
  ["Fixed price per project", "Quoted after your free Weave Session. Half up front, half at launch."],
  ["Three-month minimum", "The retainer runs for three months, then month to month."],
  ["You own your data and the work", "It runs on our infrastructure. Cancel the retainer and we hand over an export, and it stops running on ours."],
  ["Upkeep in the retainer", "Hosting, monitoring and fixes for what we build are part of the monthly fee."],
  ["Outside costs at cost", "AI usage and paid software seats are passed through with no markup."],
];

const PLANS = [
  {
    id: "growth",
    tone: "core",
    btn: "btn btn-ink btn-block",
    name: "Growth",
    fit: "For a business with one clear area to fix.",
    badge: "The usual starting point",
    price: "$1,495",
    level: 1,
    running: "A full workflow stack or an AI agent",
    incl: ["Hosting, monitoring and fixes", "A few hours of improvements a month", "Monthly hours-saved report"],
  },
  {
    id: "pro",
    tone: "core",
    btn: "btn btn-ink btn-block",
    name: "Pro",
    fit: "For a business that runs on what we build.",
    badge: "Adds priority",
    price: "$2,995",
    level: 2,
    running: "Custom software and several agents",
    incl: ["Everything in Growth", "Priority in the queue", "Monthly review with your lead"],
  },
  {
    id: "scale",
    tone: "scale",
    btn: "btn btn-block",
    name: "Scale",
    fit: "For a business ready to rebuild how it runs.",
    badge: "Adds a strategist",
    price: "$4,995",
    level: 3,
    running: "Several systems across your teams",
    incl: ["Everything in Pro", "More improvement hours each month", "Monthly roadmap session with a strategist", "AI usage reporting across your tools"],
  },
];

export function Pricing() {
  return (
    <section className="sec" id="pricing" aria-labelledby="price-h">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Label>Pricing</Label>
            <h2 className="d h2" id="price-h">Pay once to build. Pay monthly to keep it running.</h2>
          </div>
          <p className="lead">No hourly rates and no surprises on the invoice. Each project gets a fixed price, then a flat retainer looks after it.</p>
        </div>

        <article className="fee" aria-labelledby="fee-setup">
          <div>
            <span className="fee-n">01</span>
            <h3 className="d" id="fee-setup">Setup fee</h3>
            <div className="price"><b className="tnum">$3,000&ndash;$15,000</b><span>once per project, USD</span></div>
          </div>
          <p>A fixed price for each project, quoted after your free Weave Session. You pay half up front and half at launch.</p>
        </article>

        <div className="plans-h">
          <span className="fee-n">02</span>
          <h3 className="d">Monthly retainer</h3>
          <p>Starts at launch. Hosting, monitoring, fixes and small improvements. It runs on our systems, so the retainer is what keeps it switched on.</p>
        </div>
        <div className="plans">
          {PLANS.map((plan) => (
            <article className={`plan ${plan.tone}`} aria-labelledby={`p-${plan.id}`} key={plan.id}>
              <div className="plan-top"><div><h3 className="d" id={`p-${plan.id}`}>{plan.name}</h3><p className="fit">{plan.fit}</p></div><span className="badge">{plan.badge}</span></div>
              <div className="price"><b className="tnum">{plan.price}</b><span>per month, USD</span></div>
              <p className="cap"><i aria-hidden="true">{[1, 2, 3].map((n) => <span className={n <= plan.level ? "on" : undefined} key={n}></span>)}</i>{plan.running}</p>
              <ul className="incl">
                {plan.incl.map((item) => (
                  <li key={item}><Icon name="i-check" />{item}</li>
                ))}
              </ul>
              <a className={plan.btn} href="#start">Start with {plan.name}</a>
            </article>
          ))}
        </div>

        <article className="fee fee-next" aria-labelledby="fee-next">
          <div>
            <span className="fee-n">03</span>
            <h3 className="d" id="fee-next">Next project</h3>
            <p className="fee-big">A new setup fee</p>
          </div>
          <p>Once something works, you will find the next thing to fix. Each new project is quoted on its own.</p>
        </article>

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
  ["What does the setup fee cover?", "Building and launching one project, like a text-back for missed calls, a reminder that chases missing documents, an AI agent or a client portal. Setup fees run from $3,000 to $15,000 USD, and you get a fixed price after your free Weave Session. You pay half up front and half at launch."],
  ["What does the retainer cover?", "Hosting, monitoring, fixes and small improvements for what we build. It starts at launch and runs from $1,495 to $4,995 USD a month, depending on what is running. New projects are quoted separately."],
  ["Who actually does the work?", "A senior lead owns your account and talks to you directly. Engineers and product designers from the Kimp studio build with them. AI speeds up the building, and people review every change before it goes live."],
  ["Which AI models do you use?", "Whatever fits the job best. We build on Claude, OpenAI, Gemini and open models, and switch when a better one arrives. You are never locked to one vendor."],
  ["How soon will something be live?", "It depends on the project, and your quote includes a target launch date before you pay anything. We start with the item on your Automation Map that saves the most hours."],
  ["What happens if I cancel?", "The retainer has a three-month minimum, then runs month to month. You own your data and the work. If you cancel, we hand over an export, and it stops running on our infrastructure."],
  ["Are AI and software costs included?", "Hosting and upkeep are in your retainer. Outside costs like AI usage, text messages or paid software seats are billed at cost, with no markup."],
  ["Does anything go out without our approval?", "Only what you choose. Client emails, documents, filings and payments wait for a person on your team to approve them. Routine steps, like a reminder or a receipt, can run on their own once you trust them. Every action is logged."],
  ["Is client information kept confidential?", "Yes. Agents only see the systems and files you approve, and we are happy to sign your confidentiality agreement before we start. We work within the rules you already follow, like FINTRAC records, trust accounting and CRA deadlines, and your team stays responsible for compliance. Agents are set up not to give legal, tax or mortgage advice. That stays with your lawyers, brokers and accountants."],
  ["Do we have to switch software?", "No. We build on what you already run, like your CRM, practice management, accounting and job software. If a tool cannot be connected, we tell you in the Weave Session."],
  ["Where does my data live?", "What we build runs on our infrastructure, and you choose the region, including Canada or the US. Your data stays in your own accounts wherever possible, and agents only see the systems you approve."],
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
              <div className="field"><label htmlFor="f-co">Company</label><input id="f-co" name="company" autoComplete="organization" placeholder="Lakeshore & Co." /></div>
              <div className="field"><label htmlFor="f-size">Team size</label>
                <select id="f-size" name="size" defaultValue="11 to 25"><option>1 to 10</option><option>11 to 25</option><option>26 to 50</option><option>51 to 200</option><option>More than 200</option></select></div>
              <div className="field full"><label htmlFor="f-sink">Biggest time sink</label>
                <select id="f-sink" name="sink"><option>Typing data between systems</option><option>Invoicing and collections</option><option>Answering client questions</option><option>Reports and spreadsheets</option><option>Chasing documents and signatures</option><option>New inquiries and bookings</option><option>Something else</option></select></div>
              <div className="hp" aria-hidden="true"><label htmlFor="f-web">Website</label><input id="f-web" name="website" tabIndex={-1} autoComplete="off" /></div>
              <div className="field full"><label htmlFor="f-msg">Anything we should know? (optional)</label><textarea id="f-msg" name="msg" rows={3} placeholder="Your tools (CRM, QuickBooks, practice or job software), what you have tried, what keeps slipping."></textarea></div>
            </div>
            <div className="form-foot">
              <button className="btn btn-block magnet" type="submit">Request my Weave Session
                <Arrow /></button>
              <p className="err" id="lead-err" role="alert" hidden>Your request did not go through. Please try again in a minute.</p>
              <p>We reply within one business day. No sales sequence.</p>
            </div>
          </form>
          <div className="done" id="done" hidden tabIndex={-1}>
            <span className="ck"><svg><use href="#i-check" /></svg></span>
            <h3 className="d h3" id="done-h">Request received.</h3>
            <p id="done-p">We will email you within one business day with times for your Weave Session.</p>
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
          <div><p className="f-blurb">We weave your tools, data and teams into automated workflows, AI agents and custom software for owner-led businesses. A fixed setup fee for each project, then a flat monthly retainer.</p></div>
          <div><h4>Services</h4><ul><li><a href="#services">Automations</a></li><li><a href="#services">AI agents</a></li><li><a href="#services">Custom software</a></li><li><a href="#roi">Cost calculator</a></li></ul></div>
          <div><h4>Firm</h4><ul><li><a href="#how">How it works</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#faq">Questions</a></li><li><a href="#start">Book a session</a></li></ul></div>
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
