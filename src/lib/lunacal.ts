/*
 * LunaCal (app.lunacal.ai): the scheduler behind #book. Server side only — the
 * API key must never reach the browser, so the page talks to /api/schedule.
 *
 * Every LunaCal route is POST + JSON, authenticated with
 *   Authorization: Bearer <key>          (LunaCal → Settings → Developer → Create API key)
 *   /api/event-types/get   { id }                                        → title, length, …
 *   /api/availability      { startTime, endTime, timeZone, eventTypeId } → open slots
 *   /api/bookings/create   { eventTypeId, start, timeZone, responses… }  → the booking
 * Docs: https://help.lunacal.ai/api/introduction.md
 *
 * The docs show no response bodies ("the same the LunaCal platform returns"), so the
 * parsers accept the shapes a Cal.com-style backend produces and peel wrappers off.
 * In development every response is logged (trimmed) so the shape can be settled once
 * a real key is in .env.local.
 */

type Dict = Record<string, unknown>;
const isDict = (v: unknown): v is Dict => !!v && typeof v === "object" && !Array.isArray(v);

const BASE = (process.env.LUNACAL_API_BASE || "https://app.lunacal.ai").replace(/\/+$/, "");

export type LunacalConfig = { key: string; eventTypeId: number };

/** Both variables set and sane, else null: the calendar then shows sample availability. */
export function lunacalConfig(): LunacalConfig | null {
  const key = process.env.LUNACAL_API_KEY?.trim();
  const eventTypeId = Number(process.env.LUNACAL_EVENT_TYPE_ID);
  return key && Number.isInteger(eventTypeId) && eventTypeId > 0 ? { key, eventTypeId } : null;
}

export class LunacalError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly body: unknown,
  ) {
    super(`LunaCal ${path} answered ${status}`);
    this.name = "LunacalError";
  }
}

async function post(cfg: LunacalConfig, path: string, body: Dict): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  const text = await res.text();
  let json: unknown = text;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON: keep the text for the error */
  }
  if (process.env.NODE_ENV !== "production") console.info(`[lunacal] ${path} → ${res.status}`, text.slice(0, 800));
  if (!res.ok) throw new LunacalError(res.status, path, json);
  return json;
}

/** Peel the wrappers a response may come in: tRPC's result.data.json, {data}, {success, data}. */
function unwrap(json: unknown): unknown {
  let v = json;
  for (let i = 0; i < 5 && isDict(v); i++) {
    const next = isDict(v.result)
      ? v.result
      : "json" in v
        ? v.json
        : "data" in v && !("slots" in v) && (isDict(v.data) || Array.isArray(v.data))
          ? v.data
          : undefined;
    if (next === undefined) break;
    v = next;
  }
  return v;
}

const TIME_KEYS = ["time", "start", "startTime", "utcStart", "startsAt"];
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T/;

/**
 * Slot start times as UTC ISO strings, sorted, from any of the usual shapes:
 *   { slots: { "2026-11-11": [{ time }] } } · { "2026-11-11": [{ start }] } · [{ startTime }] · ["2026-11-11T14:00:00Z"]
 */
export function parseSlots(json: unknown): string[] {
  const root = unwrap(json);
  const bag = isDict(root) && "slots" in root ? root.slots : root;
  const items: unknown[] = Array.isArray(bag) ? bag : isDict(bag) ? Object.values(bag).flat() : [];
  const out = new Set<string>();
  for (const it of items) {
    const raw = isDict(it) ? TIME_KEYS.map((k) => it[k]).find((x) => x != null) : it;
    if (typeof raw !== "string" || !ISO_DATETIME.test(raw)) continue;
    const t = new Date(raw);
    if (!Number.isNaN(t.getTime())) out.add(t.toISOString());
  }
  return [...out].sort();
}

/** One booking question of the event type (Cal.com-style `bookingFields`). */
export type BookingField = { name: string; type: string; required: boolean; label: string | null };
export type EventInfo = { title: string | null; minutes: number | null; slug: string | null; fields: BookingField[] };

export function parseEventType(json: unknown): EventInfo {
  const root = unwrap(json);
  const e: Dict = isDict(root) ? (isDict(root.eventType) ? root.eventType : root) : {};
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const num = (v: unknown) => (typeof v === "number" && v > 0 ? v : typeof v === "string" && /^\d+$/.test(v) ? Number(v) : null);
  const fields: BookingField[] = Array.isArray(e.bookingFields)
    ? e.bookingFields
        .filter(isDict)
        .map((f) => ({ name: str(f.name) ?? "", type: str(f.type) ?? "", required: f.required === true, label: str(f.label) ?? str(f.defaultLabel) }))
        .filter((f) => f.name)
    : [];
  return { title: str(e.title), minutes: num(e.length) ?? num(e.duration) ?? num(e.lengthInMinutes), slug: str(e.slug), fields };
}

const NONE: EventInfo = { title: null, minutes: null, slug: null, fields: [] };
let eventCache: { id: number; at: number; info: EventInfo } | null = null;

/** The event type's title and length, cached ten minutes; empty (not an error) if the lookup fails. */
export async function getEventInfo(cfg: LunacalConfig): Promise<EventInfo> {
  if (eventCache && eventCache.id === cfg.eventTypeId && Date.now() - eventCache.at < 600_000) return eventCache.info;
  try {
    const info = parseEventType(await post(cfg, "/api/event-types/get", { id: cfg.eventTypeId }));
    eventCache = { id: cfg.eventTypeId, at: Date.now(), info };
    return info;
  } catch (err) {
    console.error("[lunacal] event type lookup failed:", err);
    return NONE;
  }
}

/** Open slots between `from` and `to`, as UTC ISO strings, sorted. */
export async function getAvailability(cfg: LunacalConfig, range: { from: Date; to: Date; timeZone: string }): Promise<string[]> {
  const json = await post(cfg, "/api/availability", {
    startTime: range.from.toISOString(),
    endTime: range.to.toISOString(),
    timeZone: range.timeZone,
    eventTypeId: cfg.eventTypeId,
  });
  const lo = range.from.getTime();
  const hi = range.to.getTime();
  return parseSlots(json).filter((s) => {
    const t = Date.parse(s);
    return t >= lo && t < hi;
  });
}

export type BookingRequest = {
  start: Date;
  timeZone: string;
  name: string;
  email: string;
  company: string;
  notes: string;
  /** the event type: its length gives `end`, its booking questions shape `responses` */
  event: EventInfo;
};

/**
 * Book `start` for the attendee. Does not check availability: call getAvailability first.
 * `responses` must answer every required booking question by field name. Besides name and
 * email, LunaCal requires the system field `title` (the booking's title; this account labels
 * it "Company Name"), so the company goes there, the attendee's name if none was given.
 */
export async function createBooking(cfg: LunacalConfig, b: BookingRequest): Promise<{ uid: string | null }> {
  const responses: Dict = { name: b.name, email: b.email, title: b.company || b.name };
  if (b.notes) responses.notes = b.notes;
  // a single-location event needs no `location` answer; anything else required and unanswered will be refused upstream
  const unanswered = b.event.fields.filter((f) => f.required && f.name !== "location" && !(f.name in responses)).map((f) => f.name);
  if (unanswered.length) console.warn(`[lunacal] required booking questions without an answer (make them optional in LunaCal or map them here): ${unanswered.join(", ")}`);
  const json = await post(cfg, "/api/bookings/create", {
    eventTypeId: cfg.eventTypeId,
    start: b.start.toISOString(),
    ...(b.event.minutes ? { end: new Date(b.start.getTime() + b.event.minutes * 60_000).toISOString() } : {}),
    timeZone: b.timeZone,
    language: "en",
    metadata: { source: "aiweavers.com/#book", ...(b.company ? { company: b.company } : {}) },
    responses,
    bookingUids: [],
    slots: [],
  });
  const root = unwrap(json);
  const booking = isDict(root) && isDict(root.booking) ? root.booking : root;
  return { uid: isDict(booking) && typeof booking.uid === "string" ? booking.uid : null };
}

/** A slot taken between the calendar loading and the confirm: a 409, or a 4xx that says so. */
export function isSlotTaken(err: unknown): boolean {
  if (!(err instanceof LunacalError) || err.status < 400 || err.status >= 500) return false;
  return err.status === 409 || /no longer available|not available|already (?:has a )?booking|conflict|taken/i.test(JSON.stringify(err.body ?? ""));
}
