# Telegram Support Landing

Premium 3D customer-support landing page for a Telegram bot. Built with
Next.js 15 (App Router), React Three Fiber, Framer Motion and Tailwind CSS.

**Live:** https://tg-support-landing.vercel.app

---

## What it does

- **Hero** with a procedurally generated holographic "support console" — no 3D
  model files to download, everything is built from geometry at runtime.
- **Three CTAs**: Contact Admin (primary), Join Official Channel, Get Free Stuff.
- **Real support form** that relays messages straight to the admin's Telegram
  chat through the Bot API. No database, no polling process.
- **Sections**: Why Choose Us, Quick Access, Trust & Support, Footer.
- **Bot integration**: the landing page opens inside Telegram from the bot's
  menu button and from `/start`.

## Bot integration

Two routes connect the bot to the site:

| Route | Purpose |
| --- | --- |
| `POST /api/telegram/webhook` | Handles `/start`, `/support`, `/help`, `/channel`, `/free` and free-form text. Every reply carries an inline `web_app` button that opens the 3D app inside Telegram. |
| `GET|POST /api/telegram/setup?key=SETUP_KEY` | One-shot configuration: menu button (`web_app` type), command list, profile text, webhook registration. |

Set `SETUP_KEY` and `TELEGRAM_WEBHOOK_SECRET`, deploy, then hit the setup route
once:

```bash
curl "https://<your-domain>/api/telegram/setup?key=$SETUP_KEY"
```

Incoming webhook calls are authenticated with Telegram's
`X-Telegram-Bot-Api-Secret-Token` header; requests without it are rejected with
`401`. The setup route refuses to run without `SETUP_KEY`, so nobody else can
reconfigure the bot.

Once configured, the bot shows a **🛟 Support** menu button that opens the app,
and `/start` replies with an **Open Support App** inline button.

### ⚠️ Required: register the Mini App in BotFather

`setChatMenuButton` and inline `web_app` buttons configure *where* the entry
point is, but they do **not** register the app. Telegram only launches a Mini
App that is attached to the bot in BotFather, and **there is no Bot API method
that performs this registration** — the Bot API exposes only `setWebhook` and
`getWebhookInfo` for web-related setup. Until the app is registered, a
`web_app` button renders but the tap is a **silent no-op**: no error, no
message, nothing in `getWebhookInfo`.

Verify with:

```bash
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" | grep has_main_web_app
# "has_main_web_app": false  → not registered yet
```

Register it once, in the Telegram app:

1. Open **@BotFather** → send `/newapp`
2. Pick **Svbshopbot**
3. **App name:** `Support`
4. **App title:** `Support Desk`
5. **Photo:** skip (send `/empty` or skip the step)
6. **Web App URL:** `https://tg-support-landing.vercel.app`
7. **Short name:** `support` → this makes `https://t.me/Svbshopbot/support` work

Alternatively: `/mybots` → **Svbshopbot** → **Bot Settings** →
**Configure Mini App** → **Enable Mini App** → send the URL.

After registration `has_main_web_app` becomes `true` and every entry point
works: the menu button, the `/start` inline button, and the direct link.

## 3D performance

The scene runs in two tiers and picks between them automatically:

| Tier | Content | When |
| --- | --- | --- |
| `full` | distorted core, glass slab, message cards, particles, dpr ≤ 1.75 | capable devices |
| `lite` | core + slab + cards, no particles, dpr = 1 | phones, weak GPUs |

The tier is chosen from device heuristics (Telegram's Android `PERFORMANCE_CLASS`
User-Agent hint, CPU cores, device memory) and is downgraded at runtime if the
measured frame rate stays below 28fps. Rendering pauses entirely while the tab is
hidden, and the OS reduced-motion setting is honoured.

## Configuration

Everything user-facing lives in `lib/config.ts`. Secrets never do.

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_ADMIN_USERNAME` | public | Admin handle for the Contact Admin button, e.g. `Svbshopbot` |
| `NEXT_PUBLIC_ADMIN_URL` | public | Full `https://t.me/...` override for the above |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL used in metadata |
| `TELEGRAM_BOT_TOKEN` | **server only** | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | **server only** | Chat that receives support messages |
| `TELEGRAM_MESSAGE_THREAD_ID` | **server only** | Optional topic id for forum groups |

Copy `.env.example` to `.env.local` for local development. Only variables
prefixed `NEXT_PUBLIC_` reach the browser; the token is read exclusively inside
`app/api/support/route.ts`.

If `NEXT_PUBLIC_ADMIN_USERNAME` is empty the Contact Admin button falls back to
the official channel and the page shows a notice — it never invents a handle.

## API

`POST /api/support` with `{ name, contact, message, website }` (the last field is
a honeypot and must stay empty).

| Status | Meaning |
| --- | --- |
| `200 { ok: true }` | Delivered to Telegram |
| `400 { ok: false, errors }` | Field validation failed |
| `405` | Wrong method |
| `429` | Rate limited |
| `502` | Telegram rejected the send |
| `503 { error: "relay_not_configured" }` | Bot token / chat id missing — the response includes a `fallback` link |

Validation rules live in `lib/validation.ts` and are imported by both the client
form and the route handler, so they cannot drift apart.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
npm run build && npm start   # production check
```

## Deploy

Linked to Vercel — pushing to `main` deploys automatically. Set the environment
variables above in the Vercel project settings first.

---

Built with Next.js · React Three Fiber · Framer Motion · Tailwind CSS