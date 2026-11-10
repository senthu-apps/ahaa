import { NextResponse } from "next/server";
import { EMAIL, LIMITS } from "@/components/book/book";
import { createBooking, getAvailability, getEventInfo, isSlotTaken, lunacalConfig } from "@/lib/lunacal";

/**
 * /api/schedule — the #book calendar's back end (LunaCal, see lib/lunacal.ts).
 *
 *   GET  ?from=ISO&to=ISO&tz=IANA                      → { configured, slots: ISO[], minutes, title }
 *   POST { start, tz, name, email, company?, notes? }  → { ok, uid } · 409 slot_taken
 *
 * Without LUNACAL_API_KEY + LUNACAL_EVENT_TYPE_ID, GET answers { configured: false } (the
 * page then shows sample availability) and POST books nothing: accepted in development so
 * the flow can be tried, 503 in production so nobody is told "booked" for a slot that was not.
 */

/** Widest range one call may ask for. */
const MAX_RANGE_DAYS = 45;

function isTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
function parseDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
const bad = (error: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ ok: false, error, ...extra }, { status });

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const from = parseDate(q.get("from"));
  const to = parseDate(q.get("to"));
  const tz = q.get("tz") ?? "";
  if (!from || !to || to <= from || to.getTime() - from.getTime() > MAX_RANGE_DAYS * 864e5 || !isTimeZone(tz)) return bad("bad_request", 400);

  const cfg = lunacalConfig();
  if (!cfg) return NextResponse.json({ ok: true, configured: false });

  try {
    const [slots, event] = await Promise.all([getAvailability(cfg, { from, to, timeZone: tz }), getEventInfo(cfg)]);
    return NextResponse.json({ ok: true, configured: true, slots, minutes: event.minutes, title: event.title }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error("[schedule] availability failed:", err);
    return bad("upstream", 502);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("bad_request", 400);
  }
  const src = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const str = (k: string) => (typeof src[k] === "string" ? (src[k] as string).trim() : "");

  // a bot filled the hidden field: thank it and drop the request
  if (str("website")) return NextResponse.json({ ok: true });

  const start = parseDate(src.start);
  const tz = str("tz");
  const name = str("name");
  const email = str("email");
  const company = str("company");
  const notes = str("notes");
  const topic = str("topic"); // "What would you like to automate?" — one of book.ts TIME_SINKS, free text tolerated

  const errors: Record<string, string> = {};
  if (!start || start.getTime() < Date.now()) errors.start = "Pick a time that is still ahead.";
  if (!isTimeZone(tz)) errors.tz = "That time zone is not recognised.";
  if (!name) errors.name = "Tell us who we are talking to.";
  else if (name.length > LIMITS.name) errors.name = "That name is a little long.";
  if (!email || email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "That email does not look right.";
  if (!company) errors.company = "Which business is this for?";
  else if (company.length > LIMITS.company) errors.company = "That name is a little long.";
  if (notes.length > LIMITS.notes) errors.notes = `Keep it under ${LIMITS.notes.toLocaleString("en-US")} characters.`;
  if (topic.length > LIMITS.company) errors.topic = "That is a little long.";
  if (!start || Object.keys(errors).length) return bad("invalid", 422, { errors });

  const cfg = lunacalConfig();
  if (!cfg) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[schedule] LunaCal is not configured — sample booking, nothing was booked:", { start: start.toISOString(), tz, name, email, company, notes });
      return NextResponse.json({ ok: true, sample: true });
    }
    console.error("[schedule] LUNACAL_API_KEY / LUNACAL_EVENT_TYPE_ID are not set — a booking could not be made.");
    return bad("not_configured", 503);
  }

  try {
    const event = await getEventInfo(cfg);
    // the host reads the topic in the booking's notes ("Is there anything else we should know…")
    const hostNotes = [topic && `Wants to automate: ${topic}`, notes].filter(Boolean).join("\n\n");
    const { uid } = await createBooking(cfg, { start, timeZone: tz, name, email, company, notes: hostNotes, event });
    return NextResponse.json({ ok: true, uid });
  } catch (err) {
    if (isSlotTaken(err)) return bad("slot_taken", 409);
    console.error("[schedule] booking failed:", err);
    return bad("delivery_failed", 502);
  }
}
