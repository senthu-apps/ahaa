/*
 * The emails /api/book sends for one request: the team's notification (every kind)
 * and, for a calculator estimate, the visitor's copy. Both follow the email design (Figma 183:4881),
 * which is the site's own look: a dark ink frame on the light canvas, hairline rules, the two-tone
 * heading, mono eyebrows, and signal orange only on the number that moves and the button's icon tile.
 * Tables and inline styles, because that is what email clients render. The words
 * live here, not in the route; the transport is src/lib/mail.ts.
 */
import { CALC, FOOTER } from "@/components/v2/content";
import { esc, type Attachment, type Mail } from "@/lib/mail";
import { LOGO_EMAIL_PNG_BASE64, LOGO_EMAIL_SIZE } from "@/lib/logo-email";

/** The wordmark, carried inside every email (logo-email.ts); the shell shows it as cid:logo. */
const LOGO_CID = "logo";
const LOGO: Attachment = { filename: "ai-weavers.png", content: LOGO_EMAIL_PNG_BASE64, contentType: "image/png", contentId: LOGO_CID };

export type InquiryKind = "booking" | "message" | "estimate";

/** The calculator's three sliders; the results are recomputed here from the page's constants. */
export type Estimate = { hours: number; rate: number; share: number };

export type Inquiry = {
  kind: InquiryKind;
  name: string;
  email: string;
  company: string;
  teamSize: string;
  biggestTimeSink: string;
  notes: string;
  estimate?: Estimate;
  source: string;
  submittedAt: string;
};

/* ------------------------------------------------------------------ tokens (globals.css) */
const SITE = "https://aiweavers.com";
const BOOK_URL = `${SITE}/#book`;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const C = {
  canvas: "#f6f6f7",
  surface: "#ffffff",
  sunken: "#f1f1f3",
  line: "#e4e4e8",
  ink: "#16161b",
  graphite: "#5c5c68",
  muted: "#8b8b96",
  soft: "#72727d", // the heading's first half (SectionHead)
  signal: "#f2541b",
  bar: "#d5d5dd", // the calculator's "year-one cost" bar
};

/* ------------------------------------------------------------------ figures */
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const perDollar = (n: number) => `$${n.toFixed(2)}`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "Nov 10, 2026, 5:42 p.m. ET" — the team reads in Toronto. */
function when(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" })} ET`;
}

/** The sliders' values from the request body, clamped to the calculator's ranges; undefined when absent or malformed. */
export function toEstimate(v: unknown): Estimate | undefined {
  if (!v || typeof v !== "object") return undefined;
  const src = v as Record<string, unknown>;
  const pick = (k: "hours" | "rate" | "share") => {
    const n = Number(src[k]);
    return Number.isFinite(n) ? Math.min(CALC[k].max, Math.max(CALC[k].min, n)) : NaN;
  };
  const e = { hours: pick("hours"), rate: pick("rate"), share: pick("share") };
  return Number.isNaN(e.hours) || Number.isNaN(e.rate) || Number.isNaN(e.share) ? undefined : e;
}

/** The calculator's four results, computed exactly as the page computes them. */
function results(e: Estimate) {
  const yearOne = CALC.setup + CALC.growthMonthly * 12;
  const cost = e.hours * e.rate * 52;
  const recover = cost * (e.share / 100);
  return { cost, recover, yearOne, ratio: recover / yearOne };
}

const sign = [FOOTER.company, `${FOOTER.address}, ${FOOTER.place}`, `${FOOTER.email} · ${FOOTER.phone}`];

/* ------------------------------------------------------------------ pieces */

/**
 * The shell every email shares (Figma 183:4881): a dark ink frame holding the white wordmark and a
 * mono eyebrow, the white card, and the signature centred below it, all on the light canvas.
 */
function shell({ eyebrow, preview, body, foot }: { eyebrow: string; preview: string; body: string; foot: string }) {
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><title>${esc(eyebrow)}</title></head>` +
    `<body style="margin:0;padding:0;background:${C.canvas};-webkit-text-size-adjust:100%">` +
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${esc(preview)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas}"><tr><td align="center" style="padding:36px 16px 40px">` +
    // the frame
    `<table role="presentation" width="608" cellpadding="0" cellspacing="0" border="0" style="width:608px;max-width:100%;background:${C.ink};border-radius:20px"><tr><td style="padding:24px 4px">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
    // the lockup and the eyebrow
    `<tr><td style="padding:0 16px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
    `<td><img src="cid:${LOGO_CID}" width="${LOGO_EMAIL_SIZE.width}" height="${LOGO_EMAIL_SIZE.height}" alt="AI Weavers" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO_EMAIL_SIZE.width}px;height:${LOGO_EMAIL_SIZE.height}px"></td>` +
    `<td align="right" style="font:11px/1 ${MONO};letter-spacing:0.06em;text-transform:uppercase;color:${C.muted}">${esc(eyebrow)}</td>` +
    `</tr></table></td></tr>` +
    // the card
    `<tr><td style="background:${C.surface};border:1px solid ${C.line};border-radius:18px;padding:40px 36px 36px">${body}</td></tr>` +
    // the signature
    `<tr><td align="center" style="padding:22px 16px 0;font:13px/1.6 ${FONT};color:${C.muted};text-align:center">${foot}</td></tr>` +
    `</table></td></tr></table>` +
    `</td></tr></table></body></html>`
  );
}

/** The two-tone section heading. */
const heading = (soft: string, strong: string) =>
  `<h1 style="margin:0;font:600 30px/1.12 ${FONT};letter-spacing:-0.035em;color:${C.ink}"><span style="color:${C.soft}">${esc(soft)}</span> ${esc(strong)}</h1>`;

const lede = (text: string) => `<p style="margin:14px 0 0;font:16px/1.6 ${FONT};color:${C.graphite}">${esc(text)}</p>`;

/** The site's primary button: an ink pill, the arrow on a signal tile. */
function button(label: string, href: string) {
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${C.ink};border-radius:14px;padding:9px 9px 9px 22px">` +
    `<a href="${href}" style="display:inline-block;font:600 15px/32px ${FONT};letter-spacing:-0.01em;color:#ffffff;text-decoration:none">${esc(label)}` +
    `<span style="display:inline-block;width:32px;height:32px;line-height:32px;margin-left:16px;border-radius:9px;background:${C.signal};color:#ffffff;text-align:center;font-size:15px;vertical-align:top">&#8599;</span></a>` +
    `</td></tr></table>`
  );
}

/** A ledger row: the label left, the figure right, a hairline above. */
function row(label: string, value: string, { dot = false, sub = "" } = {}) {
  const line = `border-top:1px solid ${C.line}`;
  return (
    `<tr><td style="padding:14px 16px 14px 0;${line};font:14px/1.45 ${FONT};color:${C.graphite}">${esc(label)}` +
    (sub ? `<br><span style="font:12px/1.5 ${FONT};color:${C.muted}">${esc(sub)}</span>` : "") +
    `</td><td align="right" style="padding:14px 0;${line};font:600 20px/1.2 ${FONT};letter-spacing:-0.03em;color:${C.ink};white-space:nowrap;font-variant-numeric:tabular-nums">` +
    (dot ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${C.signal};vertical-align:middle;margin:-2px 8px 0 0"></span>` : "") +
    `${esc(value)}</td></tr>`
  );
}

/** What a year costs against what comes back, on one scale: the calculator's two bars. */
function bars(yearOne: number, recover: number) {
  const max = Math.max(yearOne, recover);
  const bar = (label: string, value: number, color: string) => {
    const pct = Math.max(1, Math.round((value / max) * 100));
    return (
      `<tr><td style="padding:6px 12px 6px 0;font:500 12px/1.3 ${FONT};color:${C.graphite};white-space:nowrap">${esc(label)}</td>` +
      `<td width="100%" style="padding:6px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td width="${pct}%" style="height:10px;border-radius:5px;background:${color};font-size:0;line-height:0">&nbsp;</td><td style="font-size:0;line-height:0">&nbsp;</td>` +
      `</tr></table></td>` +
      `<td align="right" style="padding:6px 0 6px 12px;font:600 12px/1.3 ${FONT};color:${C.ink};white-space:nowrap">${usd(value)}</td></tr>`
    );
  };
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px">${bar("Year-one cost", yearOne, C.bar)}${bar("You can recover", recover, C.signal)}</table>`;
}

/* ------------------------------------------------------------------ the visitor's estimate */

const ESTIMATE_LEDE = "The numbers you entered on the cost calculator, and what they add up to. We confirm your real figures on the audit call.";
const ESTIMATE_NOTE = "30 minutes on video. No obligation. Questions? Just reply to this email.";

function estimateBody(q: Inquiry) {
  const e = q.estimate;
  let figures: string;
  if (e) {
    const r = results(e);
    const inputs: [string, string][] = [
      ["Hours a week", String(e.hours)],
      ["Cost per hour", `$${e.rate}`],
      ["Software can take over", `${e.share}%`],
    ];
    figures =
      // the three inputs, on a sunken strip
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;background:${C.sunken};border-radius:12px"><tr>` +
      inputs
        .map(
          ([k, v], i) =>
            `<td style="padding:14px 16px;${i ? `border-left:1px solid ${C.line};` : ""}font:11px/1.6 ${MONO};letter-spacing:0.04em;text-transform:uppercase;color:${C.muted}">${esc(k)}<br>` +
            `<span style="font:600 16px/1.4 ${FONT};letter-spacing:-0.02em;text-transform:none;color:${C.ink}">${esc(v)}</span></td>`,
        )
        .join("") +
      `</tr></table>` +
      // the headline figure
      `<p style="margin:32px 0 0;font:500 14px/1.4 ${FONT};color:${C.graphite}">${esc(CALC.results.cost)}</p>` +
      `<p style="margin:8px 0 0;font:600 52px/0.95 ${FONT};letter-spacing:-0.05em;color:${C.ink}">${usd(r.cost)}</p>` +
      `<p style="margin:10px 0 0;font:13px/1.4 ${FONT};color:${C.muted}">${esc(`${plural(e.hours, "hr", "hrs")} × $${e.rate} × 52 weeks`)}</p>` +
      // the ledger
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;border-bottom:1px solid ${C.line}">` +
      row(CALC.results.recover, usd(r.recover), { dot: true }) +
      row(CALC.results.yearOne, usd(r.yearOne), { sub: `${usd(CALC.setup)} + 12 × ${usd(CALC.growthMonthly)}` }) +
      row(CALC.results.ratio, perDollar(r.ratio)) +
      `</table>` +
      bars(r.yearOne, r.recover);
  } else {
    // an older page sent only the one-line summary
    figures = `<p style="margin:28px 0 0;padding:16px 18px;background:${C.sunken};border-radius:12px;font:15px/1.55 ${FONT};color:${C.ink}">${esc(q.notes)}</p>`;
  }
  return (
    heading("Your automation", "estimate.") +
    lede(ESTIMATE_LEDE) +
    figures +
    `<div style="margin-top:32px">${button(CALC.primary, BOOK_URL)}</div>` +
    `<p style="margin:18px 0 0;font:13px/1.55 ${FONT};color:${C.muted}">${esc(ESTIMATE_NOTE)}</p>`
  );
}

function estimateText(q: Inquiry) {
  const e = q.estimate;
  const lines = ["Your automation estimate", "", ESTIMATE_LEDE, ""];
  if (e) {
    const r = results(e);
    lines.push(
      `${plural(e.hours, "hour", "hours")} a week · $${e.rate} an hour · ${e.share}% software can take over`,
      "",
      `${CALC.results.cost}: ${usd(r.cost)}`,
      `${CALC.results.recover}: ${usd(r.recover)}`,
      `${CALC.results.yearOne}: ${usd(r.yearOne)}`,
      `${CALC.results.ratio}: ${perDollar(r.ratio)}`,
    );
  } else lines.push(q.notes);
  lines.push("", `${CALC.primary}: ${BOOK_URL}`, ESTIMATE_NOTE, "", ...sign);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ the team's notification */

const SUBJECT: Record<InquiryKind, (q: Inquiry) => string> = {
  booking: (q) => `Weave Session request · ${q.name}, ${q.company}`,
  message: (q) => `Message from ${q.name}, ${q.company}`,
  estimate: (q) => `Estimate request · ${q.company}`,
};
const TITLE: Record<InquiryKind, (q: Inquiry) => [string, string]> = {
  booking: (q) => ["Weave Session request from", `${q.name}.`],
  message: (q) => ["New message from", `${q.name}.`],
  estimate: (q) => ["Estimate request from", `${q.company}.`],
};
const INTRO: Record<InquiryKind, string> = {
  booking: "Sent from the booking form. Reply to this email and the answer goes to them.",
  message: "Sent from “Write to us instead” in the booking section. Reply to this email and the answer goes to them.",
  estimate: "They asked for their estimate by email from the cost calculator. Their copy is on its way; this is yours.",
};

/** The rows the team's email lists, in order; blanks are left out. */
function rows(q: Inquiry): [string, string][] {
  const e = q.estimate;
  const r = e ? results(e) : null;
  const figures: [string, string][] =
    e && r
      ? [
          ["Their numbers", `${plural(e.hours, "hour", "hours")} a week · $${e.rate} an hour · ${e.share}% recoverable`],
          [CALC.results.cost, usd(r.cost)],
          [CALC.results.recover, usd(r.recover)],
          [CALC.results.ratio, perDollar(r.ratio)],
        ]
      : [[q.kind === "estimate" ? "Estimate" : "Notes", q.notes]];
  const all: [string, string][] = [
    ["Name", q.name],
    ["Email", q.email],
    ["Company", q.company],
    ["Team size", q.teamSize],
    ["Wants to automate", q.biggestTimeSink],
    ...figures,
    ["From", q.source],
    ["Sent", when(q.submittedAt)],
  ];
  return all.filter(([, v]) => v.trim() !== "");
}

/** The visitor's first name, or the company when the form had no name (the calculator's). */
const firstName = (q: Inquiry) => q.name.trim().split(/\s+/)[0] || q.company;

/** A key/value table: mono labels, a hairline between rows. */
function kvTable(rs: [string, string][]) {
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;border-bottom:1px solid ${C.line}">` +
    rs
      .map(
        ([k, v]) =>
          `<tr><td style="padding:12px 16px 12px 0;border-top:1px solid ${C.line};font:11px/1.6 ${MONO};letter-spacing:0.04em;text-transform:uppercase;color:${C.muted};vertical-align:top" width="34%">${esc(k)}</td>` +
          `<td style="padding:12px 0;border-top:1px solid ${C.line};font:15px/1.5 ${FONT};color:${C.ink}">${esc(v)}</td></tr>`,
      )
      .join("") +
    `</table>`
  );
}

function teamBody(q: Inquiry, rs: [string, string][]) {
  const [soft, strong] = TITLE[q.kind](q);
  const first = firstName(q);
  const reply = `mailto:${esc(q.email)}?subject=${encodeURIComponent(`Re: your ${q.kind === "estimate" ? "estimate" : "message"} on aiweavers.com`)}`;
  return (
    heading(soft, strong) +
    lede(INTRO[q.kind]) +
    kvTable(rs) +
    `<div style="margin-top:28px">${button(`Reply to ${first}`, reply)}</div>`
  );
}

/* ------------------------------------------------------------------ the visitor's message receipt */

const MESSAGE_SUBJECT = "We have your message";
const MESSAGE_PROMISE = "We will reply within one business day.";
const MESSAGE_LEDE = "Thanks for writing to us. One of us will reply within one business day, usually with a couple of times for your free automation audit.";
const MESSAGE_NOTE = "30 minutes on video. No obligation. Questions in the meantime? Just reply to this email.";

/** What they told us, shown back to them. */
function messageRows(q: Inquiry): [string, string][] {
  const all: [string, string][] = [
    ["Name", q.name],
    ["Company", q.company],
    ["You would like to automate", q.biggestTimeSink],
  ];
  return all.filter(([, v]) => v.trim() !== "");
}

function messageBody(q: Inquiry) {
  return (
    heading("We have your", "message.") +
    lede(MESSAGE_LEDE) +
    kvTable(messageRows(q)) +
    `<div style="margin-top:28px">${button("Pick a time for your free audit", BOOK_URL)}</div>` +
    `<p style="margin:18px 0 0;font:13px/1.55 ${FONT};color:${C.muted}">${esc(MESSAGE_NOTE)}</p>`
  );
}

function messageText(q: Inquiry) {
  return [MESSAGE_SUBJECT, "", MESSAGE_LEDE, "", ...messageRows(q).map(([k, v]) => `${k}: ${v}`), "", `Pick a time for your free audit: ${BOOK_URL}`, MESSAGE_NOTE, "", ...sign].join("\n");
}

/* ------------------------------------------------------------------ */

/** The emails for one request: the team's, plus the visitor's copy of an estimate or receipt for a message. */
export function inquiryMails(q: Inquiry, to: string): Mail[] {
  const rs = rows(q);
  const r = q.estimate ? results(q.estimate) : null;
  const team: Mail = {
    to,
    replyTo: q.email, // "Reply" in the inbox answers the visitor
    subject: SUBJECT[q.kind](q),
    text: rs.map(([k, v]) => `${k}: ${v}`).join("\n"),
    attachments: [LOGO],
    html: shell({
      eyebrow: q.kind === "estimate" ? "Cost calculator · request" : "New request",
      preview: [q.name, q.company, q.biggestTimeSink || (r ? `${usd(r.recover)} recoverable a year` : q.notes)].filter(Boolean).join(" · "),
      body: teamBody(q, rs),
      foot: `${esc(FOOTER.company)}<br>Sent by the website's forms · ${esc(when(q.submittedAt))}`,
    }),
  };
  if (q.kind === "estimate") {
    // the visitor asked to be emailed the estimate they saw on the calculator
    return [
      team,
      {
        to: q.email,
        replyTo: to,
        subject: "Your automation estimate from AI Weavers",
        text: estimateText(q),
        attachments: [LOGO],
        html: shell({
          eyebrow: "Cost calculator",
          preview: r ? `Manual work costs you ${usd(r.cost)} a year. ${usd(r.recover)} of it is recoverable.` : q.notes,
          body: estimateBody(q),
          foot: `${sign.map(esc).join("<br>")}<br><br>You received this because you asked for an estimate at aiweavers.com.`,
        }),
      },
    ];
  }
  if (q.kind === "message") {
    // the visitor wrote in from "No time that suits?": tell them it arrived and what happens next
    return [
      team,
      {
        to: q.email,
        replyTo: to,
        subject: MESSAGE_SUBJECT,
        text: messageText(q),
        attachments: [LOGO],
        html: shell({
          eyebrow: "Your message",
          preview: `Thanks, ${firstName(q)}. ${MESSAGE_PROMISE}`,
          body: messageBody(q),
          foot: `${sign.map(esc).join("<br>")}<br><br>You received this because you wrote to us at aiweavers.com.`,
        }),
      },
    ];
  }
  return [team];
}

/** The html as a browser can show it: the inline logo swapped for a data URL (GET /api/book?preview=…). */
export function previewHtml(m: Mail): string {
  const html = m.html ?? `<pre>${esc(m.text)}</pre>`;
  return html.replaceAll(`cid:${LOGO_CID}`, `data:image/png;base64,${LOGO_EMAIL_PNG_BASE64}`);
}
