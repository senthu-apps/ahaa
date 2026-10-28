import { Arrow, Icon, Label, LOGO_PATH, SWOOSH_PATH } from "../icons";

export function Nav() {
  return (
    <header className="nav" id="nav">
      <nav className="nav-in" aria-label="Main">
        <ul className="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#faq">Questions</a></li>
        </ul>
        <a className="brand" href="#top" aria-label="AI Weavers, back to top">
          <svg viewBox="0 0 1756 283" role="img" aria-label="AI Weavers">
            <defs><clipPath id="navwipe"><rect id="navwipe-r" x="0" y="0" width="1756" height="283" /></clipPath></defs>
            <path fill="#224AC0" d={LOGO_PATH} />
            <path fill="#FE6854" clipPath="url(#navwipe)" d={SWOOSH_PATH} />
          </svg>
        </a>
        <div className="nav-cta">
          <a className="btn btn-ink btn-sm" href="#start">Book a session</a>
          <button className="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menu"><i></i><i></i></button>
        </div>
        <div className="menu-panel" id="menu" hidden>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#roi">Cost calculator</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">Questions</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

const LEDGER_ROWS = [
  ["RE: Pickup Tue, 3 skids to Ottawa", "Unread"],
  ["Stripe payout · 3,902.15", "Unmatched"],
  ["Web form · new lead, Burlington", "No reply, 2h"],
  ["INV-1052 · 14 days overdue", "Past due"],
];

const LEDGER_OUT = [
  "Order 2231 drafted and waiting for your approval",
  "Payout matched to invoice 1047 and marked paid",
  "Lead called, qualified and booked for Thursday 10:00",
  "Reminder sent for INV-1052 with a payment link",
];

export function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="kicker" data-intro=""><span className="pulse" aria-hidden="true"></span>AI automation, agents and custom software, on retainer</p>
          <h1 className="d" id="hero-title">Stop doing<br /> work software<br /> should do.</h1>
          <p className="lead" data-intro="">AI Weavers ties your apps, data and people together, then builds and runs the automated workflows, AI agents and custom software your business needs, for one flat monthly fee. Something new ships every week, and you own all of it.</p>
          <div className="cta-row" data-intro="">
            <a className="btn magnet" href="#start">Book your free Weave Session
              <Arrow /></a>
            <a className="ulink" href="#pricing">See pricing</a>
          </div>
          <p className="cta-note" data-intro="">A 30-minute call. You leave with a written plan, whether you hire us or not.</p>
          <ul className="assure" data-intro="">
            <li><Icon name="i-check" />Flat monthly fee</li>
            <li><Icon name="i-check" />Ships every week</li>
            <li><Icon name="i-check" />You own the code</li>
            <li><Icon name="i-check" />Pause anytime</li>
          </ul>
        </div>

        <div className="ledger" data-intro="" aria-label="Illustrative example of a morning handled by AI Weavers">
          <div className="ledger-in">
            <div className="l-head"><span className="l-title">What lands on your desk</span><span className="tag">Illustrative example</span></div>
            <ul className="l-rows" id="l-rows">
              {LEDGER_ROWS.map(([text, pending]) => (
                <li className="is-done" key={text}><span>{text}</span><span className="chip" data-p={pending}>Handled</span></li>
              ))}
            </ul>
          </div>
          <div className="l-mid"><span className="agent-pill"><span className="ring" aria-hidden="true"></span><Icon name="sw" />Weaver agents at work</span></div>
          <div className="ledger-wrap-out">
            <div className="ledger-out">
              <p className="o-kick">Your morning, by 9:02 AM</p>
              <p className="d o-title">Four jobs done before your first coffee.</p>
              <ul className="o-list" id="o-list">
                {LEDGER_OUT.map((text) => (
                  <li key={text}><span className="ck"><svg><use href="#i-check" /></svg></span>{text}</li>
                ))}
              </ul>
              <div className="o-foot"><span id="o-count" className="tnum">4 of 4 handled</span>
                <button className="replay" type="button" id="hero-replay"><Icon name="i-replay" />Replay the morning</button></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const INDUSTRIES = [
  "Logistics and freight",
  "Professional services",
  "Real estate",
  "Clinics and health",
  "Trades and field service",
  "Agencies",
  "Distribution",
  "Property management",
];

export function Industries() {
  return (
    <section className="industries" aria-label="Industries we serve">
      <div className="wrap ind">
        <p className="ind-label">Built for owner-led businesses in</p>
        <div className="marquee">
          <div className="track">
            <ul>
              {INDUSTRIES.map((name) => (
                <li key={name}>{name}<Icon name="sw" /></li>
              ))}
            </ul>
            <ul aria-hidden="true">
              {INDUSTRIES.map((name) => (
                <li key={name}>{name}<svg><use href="#sw" /></svg></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Thesis() {
  return (
    <section className="sec" id="why" aria-labelledby="why-h">
      <div className="wrap thesis-grid">
        <div><Label id="why-h">Why a retainer</Label></div>
        <div>
          <p className="thesis-text" id="thesis">Hourly billing pays agencies more when work goes slowly. AI has made building software many times faster, and that speed belongs to you. So AI Weavers charges one flat monthly fee, ships something every week, and hands you the keys to everything we build.</p>
          <div className="thesis-foot">
            <a className="ulink" href="#compare">Compare it with hourly work</a>
            <p>Retained like a firm. Priced like a subscription.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
