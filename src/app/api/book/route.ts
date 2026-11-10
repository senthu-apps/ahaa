import { NextResponse } from "next/server";
import { toLead, validate } from "@/components/book/book";

/**
 * POST /api/book — a Weave Session request from the #book form.
 *
 * Validates with the same rules as the form, then forwards the request as
 * JSON to BOOK_WEBHOOK_URL (a Zapier/Make hook, a Slack or Teams incoming
 * webhook, a CRM endpoint…). Without that variable the request is NOT
 * delivered anywhere: in development it is logged and accepted so the form
 * can be tried; in production it fails (503) so nobody is told "sent" for a
 * request that went nowhere.
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

  // the booking form sends every field; the "Write to us instead" message has no team size or
  // time sink, and the calculator's estimate request has no name either
  const kind = (body as { kind?: unknown }).kind;
  const relaxed = kind === "message" ? ["team", "sink"] : kind === "estimate" ? ["team", "sink", "name"] : [];
  const errors = validate(lead);
  for (const k of relaxed) delete errors[k as keyof typeof errors];
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, error: "invalid", errors }, { status: 422 });

  const request = {
    name: lead.name.trim(),
    email: lead.email.trim(),
    company: lead.company.trim(),
    teamSize: lead.team,
    biggestTimeSink: lead.sink,
    notes: lead.notes.trim(),
    kind: kind === "message" || kind === "estimate" ? kind : "booking",
    source: kind === "estimate" ? "aiweavers.com/#calculator" : "aiweavers.com/#book",
    submittedAt: new Date().toISOString(),
  };

  const hook = process.env.BOOK_WEBHOOK_URL;
  if (!hook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[book] BOOK_WEBHOOK_URL is not set — logged here, not delivered:", request);
      return NextResponse.json({ ok: true });
    }
    console.error("[book] BOOK_WEBHOOK_URL is not set — a Weave Session request could not be delivered.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`webhook answered ${res.status}`);
  } catch (err) {
    console.error("[book] delivery failed:", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
