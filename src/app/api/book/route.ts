import { NextResponse } from "next/server";
import { toLead, validate } from "@/components/book/book";
import { inquiryMails, previewHtml, toEstimate, type Inquiry } from "@/lib/book-mail";
import { mailConfig, sendMail } from "@/lib/mail";

/**
 * POST /api/book — a request from the site's forms: the #book "Write to us
 * instead" message, the calculator's "Email me this estimate", or the older
 * booking form.
 *
 * Validates with the same rules as the forms, then emails it through Resend
 * (src/lib/mail.ts): every request goes to MAIL_TO, and an estimate also goes
 * to the visitor who asked for it. Without RESEND_API_KEY and MAIL_TO the
 * request is NOT delivered anywhere: in development it is logged and accepted
 * so the forms can be tried; in production it fails (503) so nobody is told
 * "sent" for a request that went nowhere.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const lead = toLead(body);
  // a bot filled the hidden field: thank it and drop the request
  if (lead.website) return NextResponse.json({ ok: true });

  // the booking form sends every field; the "Write to us instead" message has no team size, and
  // the calculator's estimate request has no team size, time sink or name
  const kind = (body as { kind?: unknown }).kind;
  const relaxed = kind === "message" ? ["team"] : kind === "estimate" ? ["team", "sink", "name"] : [];
  const errors = validate(lead);
  for (const k of relaxed) delete errors[k as keyof typeof errors];
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, error: "invalid", errors }, { status: 422 });

  const inquiry: Inquiry = {
    kind: kind === "message" || kind === "estimate" ? kind : "booking",
    name: lead.name.trim(),
    email: lead.email.trim(),
    company: lead.company.trim(),
    teamSize: lead.team,
    biggestTimeSink: lead.sink,
    notes: lead.notes.trim(),
    estimate: toEstimate((body as { estimate?: unknown }).estimate), // the calculator's sliders, when it is one
    source: kind === "estimate" ? "aiweavers.com/#calculator" : "aiweavers.com/#book",
    submittedAt: new Date().toISOString(),
  };

  const mail = mailConfig();
  const to = process.env.MAIL_TO?.trim();
  if (!mail || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[book] RESEND_API_KEY / MAIL_TO are not set — logged here, not sent:", inquiry);
      return NextResponse.json({ ok: true, sent: false }); // the forms only read `ok`; `sent` says so when testing by hand
    }
    console.error("[book] RESEND_API_KEY / MAIL_TO are not set — a request could not be delivered.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    await sendMail(mail, inquiryMails(inquiry, to));
  } catch (err) {
    console.error("[book] delivery failed:", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent: true });
}

/**
 * GET /api/book?preview=estimate|message|booking&as=team|visitor — development only.
 * Renders the email such a request would send, to look at in the browser while
 * working on the templates in src/lib/book-mail.ts. Nothing is sent.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("preview");
  if (kind !== "estimate" && kind !== "message" && kind !== "booking") {
    return NextResponse.json({ ok: false, error: "preview=estimate|message|booking, as=team|visitor" }, { status: 400 });
  }
  const sample: Inquiry = {
    kind,
    name: kind === "estimate" ? "" : "Jordan Lee",
    email: "jordan@northway.example",
    company: "Northway Logistics",
    teamSize: kind === "booking" ? "11–25" : "",
    biggestTimeSink: kind === "estimate" ? "" : "Chasing missing documents",
    notes: kind === "booking" ? "We lose most of Monday to re-keying orders into the CRM." : "",
    estimate: kind === "estimate" ? { hours: 32, rate: 50, share: 60 } : undefined,
    source: kind === "estimate" ? "aiweavers.com/#calculator" : "aiweavers.com/#book",
    submittedAt: new Date().toISOString(),
  };
  const mails = inquiryMails(sample, "hello@aiweavers.com");
  const mail = url.searchParams.get("as") === "visitor" ? (mails[1] ?? mails[0]) : mails[0];
  return new NextResponse(previewHtml(mail), { headers: { "content-type": "text/html; charset=utf-8" } });
}
