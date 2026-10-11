/**
 * Server-only helpers for relaying support messages to Telegram.
 *
 * The bot token is read here and never leaves the server. Nothing in this file
 * may be imported from a client component — it is only ever reached through
 * the /api/support route handler.
 */

const API = "https://api.telegram.org";

export interface RelayConfig {
  token: string;
  chatId: string;
  threadId?: string;
}

/** Read relay credentials from the environment, or null when unconfigured. */
export function getRelayConfig(): RelayConfig | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID ?? "").trim();
  if (!token || !chatId) return null;
  const threadId = (process.env.TELEGRAM_MESSAGE_THREAD_ID ?? "").trim();
  return { token, chatId, threadId: threadId || undefined };
}

/** Escape the characters Telegram's HTML parser treats as markup. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface SupportPayload {
  name: string;
  contact: string;
  message: string;
  /** Where the visitor came from, for triage. */
  source?: string;
}

/** Format a support submission as a Telegram HTML message. */
export function formatMessage(p: SupportPayload, meta: { ip?: string; ua?: string }): string {
  const lines = [
    "<b>🆘 New support message</b>",
    "",
    `<b>Name:</b> ${escapeHtml(p.name)}`,
    `<b>Contact:</b> ${escapeHtml(p.contact)}`,
    "",
    "<b>Message:</b>",
    escapeHtml(p.message),
    "",
    `<i>Source:</i> <code>${escapeHtml(p.source ?? "landing")}</code>`,
  ];
  if (meta.ip) lines.push(`<i>IP:</i> <code>${escapeHtml(meta.ip)}</code>`);
  if (meta.ua) lines.push(`<i>UA:</i> <code>${escapeHtml(meta.ua.slice(0, 160))}</code>`);
  return lines.join("\n");
}

export interface SendResult {
  ok: boolean;
  /** Populated when ok === false. */
  error?: string;
  /** Populated when ok === true. */
  messageId?: number;
}

/**
 * Push a message to the admin chat.
 *
 * Uses the plain HTTPS Bot API rather than a heavyweight framework: one fetch,
 * no polling process, nothing to keep alive.
 */
export async function sendToAdmin(text: string): Promise<SendResult> {
  const cfg = getRelayConfig();
  if (!cfg) return { ok: false, error: "relay_not_configured" };

  const body: Record<string, unknown> = {
    chat_id: cfg.chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (cfg.threadId) body.message_thread_id = Number(cfg.threadId);

  // Abort rather than hang the serverless invocation.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8_000);

  try {
    const res = await fetch(`${API}/bot${cfg.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; description?: string; result?: { message_id?: number } }
      | null;

    if (!res.ok || !data?.ok) {
      // Surface the Bot API's own description; it is safe (no token echo).
      return { ok: false, error: data?.description ?? `telegram_http_${res.status}` };
    }
    return { ok: true, messageId: data.result?.message_id };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return { ok: false, error: aborted ? "telegram_timeout" : "telegram_unreachable" };
  } finally {
    clearTimeout(timer);
  }
}