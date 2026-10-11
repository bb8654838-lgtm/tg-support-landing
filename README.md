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