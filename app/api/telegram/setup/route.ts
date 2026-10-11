import { NextResponse } from "next/server";
import { setCommands, setDescription, setMenuButton, setWebhook, miniAppUrl } from "@/lib/bot";

/**
 * GET|POST /api/telegram/setup
 *
 * One-shot configuration: points the bot's menu button at the Mini App,
 * registers the slash commands, fills in the profile text, and installs the
 * webhook.
 *
 * Protected by SETUP_KEY — pass it as `?key=...` or the `x-setup-key` header.
 * Without the key the route refuses to run, so the endpoint cannot be used by
 * anyone else to hijack the bot's configuration.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function run(req: Request) {
  const expected = (process.env.SETUP_KEY ?? "").trim();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "setup_key_not_configured", hint: "Set SETUP_KEY in the environment first." },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const provided = (url.searchParams.get("key") ?? req.headers.get("x-setup-key") ?? "").trim();
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const results: Record<string, boolean | string> = {};

  results.menuButton = await setMenuButton();
  results.commands = await setCommands();
  results.description = await setDescription();

  // The webhook secret must be the SAME value the webhook route validates
  // against, otherwise Telegram's own calls come back 401.
  const webhookSecret = (process.env.TELEGRAM_WEBHOOK_SECRET ?? "").trim() || expected;
  const hook = await setWebhook(webhookSecret);
  results.webhook = hook.detail;
  results.webhookOk = hook.ok;

  results.miniAppUrl = miniAppUrl();

  const allOk = Boolean(results.menuButton && results.commands && results.description && hook.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 502 });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}