// Weave Session requests from the booking form, sent to the team through Resend.
const TO = ["senthu@kimp.com", "tibin@kimp.com", "ven@kimp.com"];
const FROM = process.env.RESEND_FROM ?? "AI Weavers <sessions@aiweavers.com>";

const FIELDS = [
  ["name", "Name"],
  ["email", "Work email"],
  ["company", "Company"],
  ["size", "Team size"],
  ["sink", "Biggest time sink"],
  ["msg", "Anything we should know"],
] as const;

type Field = (typeof FIELDS)[number][0];

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set");
    return Response.json({ error: "Email is not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  // hidden field only bots fill in: pretend it worked, send nothing
  if (typeof body.website === "string" && body.website !== "") return Response.json({ ok: true });

  const v = {} as Record<Field, string>;
  for (const [k] of FIELDS) {
    const raw = typeof body[k] === "string" ? (body[k] as string).trim() : "";
    v[k] = raw.slice(0, k === "msg" ? 4000 : 200);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
    return Response.json({ error: "A valid work email is required" }, { status: 400 });
  }

  const who = [v.name, v.company].filter(Boolean).join(", ") || v.email;
  const subject = `Weave Session request: ${who}`.replace(/[\r\n]+/g, " ");
  const rows = FIELDS.filter(([k]) => v[k]);
  const text = rows.map(([k, label]) => `${label}: ${v[k]}`).join("\n");
  const html = `<h2 style="font-family:sans-serif">New Weave Session request</h2><table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(([k, label]) => `<tr><td style="color:#5E6479;vertical-align:top;white-space:nowrap">${label}</td><td style="white-space:pre-wrap">${escape(v[k])}</td></tr>`)
    .join("")}</table><p style="font-family:sans-serif;font-size:13px;color:#5E6479">Reply to this email to answer ${escape(v.name || v.email)} directly.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: TO, reply_to: v.email, subject, text, html }),
  });
  if (!res.ok) {
    console.error("Resend rejected the email", res.status, await res.text());
    return Response.json({ error: "Could not send" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
