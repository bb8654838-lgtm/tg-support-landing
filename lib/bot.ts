/**
 * Server-only Telegram Bot API helper.
 *
 * Used by the webhook route to reply to commands. The token is read from the
 * environment here and never reaches the browser.
 */

const API = "https://api.telegram.org";

export function botToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
}

export function publicUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
  return raw || "https://tg-support-landing.vercel.app";
}

/** The Mini App URL Telegram should open from the menu button and inline buttons. */
export function miniAppUrl(): string {
  return publicUrl();
}

export interface TgReplyMarkup {
  inline_keyboard: {
    text: string;
    url?: string;
    web_app?: { url: string };
    callback_data?: string;
  }[][];
}

/** Low-level Bot API call. Returns the parsed result or null on failure. */
export async function callBot<T = unknown>(
  method: string,
  payload: Record<string, unknown>
): Promise<T | null> {
  const token = botToken();
  if (!token) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch(`${API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; result?: T } | null;
    return data?.ok ? ((data.result ?? null) as T | null) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------- chat layer */

export type ReplyKeyboard =
  | { inline_keyboard: { text: string; url?: string; web_app?: { url: string } }[][] }
  | { keyboard: { text: string; web_app?: { url: string } }[][]; resize_keyboard?: boolean; is_persistent?: boolean }
  | { remove_keyboard: true };

export async function sendMessage(
  chatId: number | string,
  text: string,
  opts: {
    replyMarkup?: ReplyKeyboard;
    disablePreview?: boolean;
    threadId?: number;
  } = {}
): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: opts.disablePreview ?? true,
  };
  if (opts.replyMarkup) body.reply_markup = opts.replyMarkup;
  if (opts.threadId) body.message_thread_id = opts.threadId;

  const res = await callBot("sendMessage", body);
  return res !== null;
}

/** Send the "chat" action so the user sees a typing indicator while we work. */
export async function sendChatAction(chatId: number | string, action = "typing"): Promise<void> {
  await callBot("sendChatAction", { chat_id: chatId, action });
}

/* ------------------------------------------------------- bot configuration */

/**
 * Point the bot's menu button at the Mini App.
 *
 * `type: "web_app"` makes the button open the landing page inside Telegram
 * rather than exposing a plain link — this is the "Launch app" entry point.
 */
export async function setMenuButton(): Promise<boolean> {
  const res = await callBot("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "🛟 Support",
      web_app: { url: miniAppUrl() },
    },
  });
  return res !== null;
}

/** Register the slash-command list shown when a user types "/". */
export async function setCommands(): Promise<boolean> {
  const res = await callBot("setMyCommands", {
    commands: [
      { command: "start", description: "Open the support app" },
      { command: "support", description: "Contact the admin" },
      { command: "channel", description: "Official channel" },
      { command: "free", description: "Get free stuff" },
      { command: "help", description: "How this bot works" },
    ],
  });
  return res !== null;
}

/** Bot profile text. */
export async function setDescription(): Promise<boolean> {
  const a = await callBot("setMyDescription", {
    description:
      "Official customer support desk.\n\nTap the button below to open the support app — questions, orders, custom requests and offers, all in one place.",
  });
  const b = await callBot("setMyShortDescription", {
    short_description: "Official support — questions, orders and custom requests.",
  });
  return a !== null && b !== null;
}

/** Install the webhook Telegram should POST updates to. */
export async function setWebhook(secret: string): Promise<{ ok: boolean; detail: string }> {
  const url = `${publicUrl()}/api/telegram/webhook`;
  const res = await callBot<boolean | string>("setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  if (res === null) return { ok: false, detail: "setWebhook failed (check token / URL reachability)" };
  return { ok: true, detail: url };
}