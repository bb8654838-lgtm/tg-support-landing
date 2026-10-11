import { NextResponse } from "next/server";
import {
  miniAppUrl,
  sendChatAction,
  sendMessage,
  publicUrl,
  type ReplyKeyboard,
} from "@/lib/bot";

/**
 * POST /api/telegram/webhook
 *
 * Receives Bot API updates. Handles the commands a customer actually types:
 *   /start /support /help /channel /free
 *
 * Every reply carries an inline `web_app` button, which is what opens the 3D
 * landing page inside Telegram. The menu button (configured separately via
 * setChatMenuButton) provides the same entry point without typing anything.
 *
 * Security: Telegram echoes the secret we registered with setWebhook in the
 * X-Telegram-Bot-Api-Secret-Token header. Requests without it are dropped.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Inline keyboard that opens the Mini App.
 *
 * Two entry points on purpose:
 *   · `web_app` — the proper Mini App launch (needs the app registered in
 *     BotFather; provides initData, theme, full-screen and haptics)
 *   · `url` — a plain link that opens the same page in Telegram's in-app
 *     browser. It always works, so a customer is never left with a dead
 *     button if the Mini App registration is missing or the client is old.
 */
function appKeyboard(): ReplyKeyboard {
  return {
    inline_keyboard: [
      [{ text: "🛟 Open Support App", web_app: { url: miniAppUrl() } }],
      [
        { text: "📣 Official Channel", url: "https://t.me/+TC0elDjaFC1hNzA9" },
        { text: "🎁 Free Stuff", url: "https://tinyurl.com/cswfchke" },
      ],
      [{ text: "🌐 Open in browser", url: miniAppUrl() }],
    ],
  };
}

const WELCOME = [
  "<b>👋 Welcome to official customer support</b>",
  "",
  "Have a question or ready to place an order? Open the support app below — you can send a message straight to the admin, browse the channel, and grab the free resources.",
  "",
  "<b>What you can do here</b>",
  "• 💬 Contact the admin about an order",
  "• 🎯 Discuss a custom request",
  "• 🔥 See current offers",
  "",
  "Tap <b>Open Support App</b> to start.",
].join("\n");

const HELP = [
  "<b>How this bot works</b>",
  "",
  "/start — open the support app",
  "/support — contact the admin",
  "/channel — official channel",
  "/free — free resources",
  "",
  "Messages sent through the support app arrive directly with the admin. You can also just type your question here.",
].join("\n");

export async function POST(req: Request) {
  // ---- authenticate the caller -------------------------------------------
  const expected = (process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim();
  if (expected) {
    const got = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (got !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  let update: {
    message?: {
      chat?: { id?: number };
      text?: string;
      message_thread_id?: number;
      from?: { first_name?: string };
    };
  };
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // never make Telegram retry junk
  }

  const msg = update.message;
  const chatId = msg?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true }); // ignore non-message updates

  const text = (msg?.text ?? "").trim();
  const threadId = msg?.message_thread_id;
  const firstName = msg?.from?.first_name ?? "there";

  // `/cmd@BotName` is valid syntax — strip the mention.
  const command = text.split(/\s+/)[0].toLowerCase().replace(/@[\w_]+$/, "");

  await sendChatAction(chatId);

  switch (command) {
    case "/start":
      await sendMessage(chatId, WELCOME, { replyMarkup: appKeyboard(), threadId });
      break;

    case "/support": {
      const configured = (process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "").trim();
      const adminUrl = configured ? `https://t.me/${configured.replace(/^@/, "")}` : null;
      await sendMessage(
        chatId,
        [
          `<b>💬 Contact the admin</b>`,
          "",
          `${firstName}, open the support app to send your message — it reaches the admin directly.`,
          adminUrl ? "" : "",
          adminUrl ? `Direct chat: ${adminUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        { replyMarkup: appKeyboard(), threadId }
      );
      break;
    }

    case "/channel":
      await sendMessage(chatId, "<b>📣 Official channel</b>\n\nAnnouncements, new drops and updates.", {
        replyMarkup: {
          inline_keyboard: [[{ text: "📣 Join Official Channel", url: "https://t.me/+TC0elDjaFC1hNzA9" }]],
        },
        threadId,
      });
      break;

    case "/free":
      await sendMessage(chatId, "<b>🎁 Free stuff</b>\n\nGrab the free resources and offers.", {
        replyMarkup: {
          inline_keyboard: [[{ text: "🎁 Get Free Stuff", url: "https://tinyurl.com/cswfchke" }]],
        },
        threadId,
      });
      break;

    case "/help":
      await sendMessage(chatId, HELP, { replyMarkup: appKeyboard(), threadId });
      break;

    default:
      // Free-form text: route it to the support app rather than ignoring it.
      if (text) {
        await sendMessage(
          chatId,
          [
            `<b>📨 Got it${firstName ? `, ${firstName}` : ""}.</b>`,
            "",
            "Open the support app to send this to the admin with your order details, or wait here — replies come through this chat.",
          ].join("\n"),
          { replyMarkup: appKeyboard(), threadId }
        );
      }
      break;
  }

  return NextResponse.json({ ok: true });
}

/** Telegram health check / manual inspection. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    webhook: "POST here",
    appUrl: miniAppUrl(),
    site: publicUrl(),
  });
}