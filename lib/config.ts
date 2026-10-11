/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIG — single source of truth for every customisable value.
 *
 *  Change things here, not in the components. Anything that is a secret
 *  (bot token, chat id) lives in environment variables and is only ever read
 *  on the server — see `lib/telegram-server.ts`.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Trim + validate an env value, returning "" when unset/placeholder. */
const env = (v: string | undefined): string => {
  const s = (v ?? "").trim();
  // Treat leftover template values as "not configured".
  if (!s || /^(your|xxx|changeme|todo)/i.test(s)) return "";
  return s;
};

/**
 * Admin contact.
 *
 * `username` is deliberately EMPTY by default — set NEXT_PUBLIC_ADMIN_USERNAME
 * (without the @) to your real admin handle. Until then the Contact Admin
 * button reports that the contact route is not configured yet instead of
 * silently sending people to a made-up account.
 */
export const ADMIN = {
  username: env(process.env.NEXT_PUBLIC_ADMIN_USERNAME), // e.g. "MyAdminHandle"
  /** Full URL override — wins over `username` when set. */
  url: env(process.env.NEXT_PUBLIC_ADMIN_URL),
} as const;

/** Resolved admin deep link, or null when no admin route is configured. */
export const ADMIN_LINK: string | null =
  ADMIN.url || (ADMIN.username ? `https://t.me/${ADMIN.username.replace(/^@/, "")}` : null);

/** Public channels and offers — safe to expose. */
export const LINKS = {
  channel: "https://t.me/+TC0elDjaFC1hNzA9",
  freeStuff: "https://tinyurl.com/cswfchke",
} as const;

export const SITE = {
  name: "Support Desk",
  title: "Official Customer Support",
  eyebrow: "OFFICIAL CUSTOMER SUPPORT",
  heading: "Have a Question or Ready to Place an Order?",
  description:
    "Drop your message below and connect directly with the admin for quick assistance, order support, custom requests, and exclusive offers.",
  /** Falls back to the deployment URL when NEXT_PUBLIC_SITE_URL is unset. */
  url: env(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000",
  supportTitle: "Send your message below to get started.",
} as const;

/** The four hero feature cards. */
export const HERO_FEATURES = [
  {
    icon: "Zap",
    emoji: "⚡",
    title: "Fast Responses",
    desc: "Get assistance with your questions.",
  },
  {
    icon: "ShoppingCart",
    emoji: "🛒",
    title: "Order Assistance",
    desc: "Get help with orders and purchasing.",
  },
  {
    icon: "Target",
    emoji: "🎯",
    title: "Custom Requests",
    desc: "Discuss your specific requirements.",
  },
  {
    icon: "Flame",
    emoji: "🔥",
    title: "Exclusive Offers",
    desc: "Discover special deals and updates.",
  },
] as const;

/** "Why Choose Us?" — factual capabilities only, no invented metrics. */
export const WHY_US = [
  {
    icon: "Gauge",
    title: "Fast Support",
    desc: "Messages reach the admin directly, so questions do not sit in a queue.",
  },
  {
    icon: "UserCheck",
    title: "Personalised Assistance",
    desc: "You talk to a person who can actually make decisions about your order.",
  },
  {
    icon: "ShoppingBag",
    title: "Easy Ordering",
    desc: "Send what you need in one message and get the details back in the same chat.",
  },
  {
    icon: "MessagesSquare",
    title: "Direct Communication",
    desc: "No ticket numbers and no middle layer — just a straight conversation.",
  },
] as const;

/** "Quick Access" shortcuts. */
export const QUICK_ACCESS = [
  {
    icon: "Megaphone",
    title: "Official Channel",
    desc: "Announcements, new drops and updates.",
    href: LINKS.channel,
    kind: "telegram" as const,
  },
  {
    icon: "Gift",
    title: "Free Stuff",
    desc: "Grab the free resources and offers.",
    href: LINKS.freeStuff,
    kind: "external" as const,
  },
  {
    icon: "Headset",
    title: "Contact Admin",
    desc: "Talk to a human about your order.",
    href: ADMIN_LINK,
    kind: "telegram" as const,
  },
] as const;

/** "Trust & Support" points — plain statements, no certifications claimed. */
export const TRUST_POINTS = [
  {
    icon: "MessageSquareReply",
    title: "Clear Communication",
    desc: "Instructions, prices and delivery details are stated up front — you always know what happens next.",
  },
  {
    icon: "LifeBuoy",
    title: "Support That Stays Open",
    desc: "Questions before, during and after an order are welcome in the same chat.",
  },
  {
    icon: "ShieldCheck",
    title: "Straightforward Assistance",
    desc: "If something is unclear or goes wrong, say so and it gets looked at directly.",
  },
] as const;

/** Support form field limits — enforced on the client AND in the API route. */
export const FORM_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  messageMin: 10,
  messageMax: 1200,
  /** Client-side cooldown between submissions, in milliseconds. */
  cooldownMs: 20_000,
} as const;