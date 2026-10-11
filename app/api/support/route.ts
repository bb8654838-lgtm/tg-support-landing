import { NextResponse } from "next/server";
import { clientIp, validateSupport } from "@/lib/validation";
import { formatMessage, getRelayConfig, sendToAdmin } from "@/lib/telegram-server";

/**
 * POST /api/support
 *
 * Validates a support submission and relays it to the admin's Telegram chat.
 *
 * Responses:
 *   200 { ok: true }                       — delivered
 *   400 { ok: false, errors }              — field validation failed
 *   429 { ok: false, error: "rate_limited" } — too many submissions
 *   503 { ok: false, error: "relay_not_configured", fallback } — no bot token set
 *   502 { ok: false, error: "delivery_failed" } — Telegram rejected the send
 *
 * The 503 path is intentional: when the relay credentials are missing we say so
 * plainly and hand the client a deep link, rather than pretending the message
 * was delivered.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------- rate limit */

/**
 * In-memory sliding-window limiter.
 *
 * This is per-instance, which is the right trade-off for a single landing page:
 * it stops casual flooding without needing Redis or a database. A distributed
 * deployment would swap this for a shared store.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

/* ------------------------------------------------------------------ route */

export async function POST(req: Request) {
  const ip = clientIp(req.headers) || "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many messages. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Reject payloads that are not plausible form submissions.
  const asString = (v: unknown): string => (typeof v === "string" ? v : "");
  const result = validateSupport({
    name: asString(body.name),
    contact: asString(body.contact),
    message: asString(body.message),
    website: asString(body.website),
  });

  if (result.spam) {
    // Answer 200 so automated senders cannot distinguish this from success.
    return NextResponse.json({ ok: true });
  }

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "validation_failed", errors: result.errors }, { status: 400 });
  }

  // Relay not wired up yet → tell the truth and give the client a way out.
  if (!getRelayConfig()) {
    const admin = (process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "").trim();
    const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL ?? "").trim();
    const fallback = adminUrl || (admin ? `https://t.me/${admin.replace(/^@/, "")}` : null);
    return NextResponse.json(
      {
        ok: false,
        error: "relay_not_configured",
        message: "Direct messaging is not wired up yet. Use one of the buttons above to reach the admin.",
        fallback,
      },
      { status: 503 }
    );
  }

  const text = formatMessage(result.value, {
    ip,
    ua: req.headers.get("user-agent") ?? undefined,
  });

  const sent = await sendToAdmin(text);
  if (!sent.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "delivery_failed",
        message: "The message could not be delivered just now. Please try the buttons above.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: sent.messageId });
}

/** Reject anything other than POST with a useful hint. */
export function GET() {
  return NextResponse.json(
    { ok: false, error: "method_not_allowed", hint: "POST { name, contact, message } to this endpoint." },
    { status: 405, headers: { Allow: "POST" } }
  );
}