/*
 * Email, through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * A thin fetch wrapper rather than the SDK: one endpoint, one header. The API key
 * stays on the server. Without RESEND_API_KEY nothing is sent; the caller decides
 * what that means (development logs the request, production refuses it).
 *
 *   RESEND_API_KEY   resend.com → API Keys
 *   MAIL_FROM        the sender, on a domain verified in Resend, e.g. "AI Weavers <hello@aiweavers.com>".
 *                    Default: Resend's test sender, which only delivers to the account's own address.
 */

export type Attachment = {
  filename: string;
  /** The file, base64. */
  content: string;
  contentType?: string;
  /** Set to show the file inside the message: <img src="cid:<contentId>"> in the html. */
  contentId?: string;
};

export type Mail = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export type MailConfig = { apiKey: string; from: string };

const API = "https://api.resend.com";
const TEST_SENDER = "AI Weavers <onboarding@resend.dev>";
/** Resend allows two requests a second; consecutive sends stay this far apart. */
const GAP_MS = 600;

/** The transport settings, or null when RESEND_API_KEY is not set. */
export function mailConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, from: process.env.MAIL_FROM?.trim() || TEST_SENDER };
}

/**
 * Sends the emails one request each, in order, spaced for Resend's rate limit. (The batch
 * endpoint would take them together, but it carries no attachments, and the logo is one.)
 * Throws with Resend's answer when one is not a 2xx; the ones before it have already gone,
 * so callers list the one that matters most first.
 */
export async function sendMail(cfg: MailConfig, mails: Mail[]): Promise<void> {
  for (const [i, m] of mails.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, GAP_MS));
    const res = await fetch(`${API}/emails`, {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: cfg.from,
        to: m.to,
        subject: m.subject,
        text: m.text,
        html: m.html,
        reply_to: m.replyTo,
        attachments: m.attachments?.map((a) => ({ filename: a.filename, content: a.content, content_type: a.contentType, content_id: a.contentId })),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend answered ${res.status}: ${detail.slice(0, 300)}`);
    }
  }
}

/** Text, made safe for an HTML body. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}
