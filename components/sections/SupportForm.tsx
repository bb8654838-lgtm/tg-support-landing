"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FORM_LIMITS, SITE } from "@/lib/config";
import { validateSupport, type FieldErrors } from "@/lib/validation";
import { cn } from "@/lib/utils";

/**
 * Support form.
 *
 * Posts to /api/support, which relays the message to the admin's Telegram chat.
 * Every state is real:
 *   · client-side validation mirrors the server rules
 *   · a server cooldown is surfaced as a countdown
 *   · when the relay has no bot token the API answers 503 and we show the
 *     configured fallback link instead of claiming success
 */

type Status = "idle" | "sending" | "sent" | "error" | "not_configured";

interface FieldState {
  name: string;
  contact: string;
  message: string;
  website: string; // honeypot
}

const EMPTY: FieldState = { name: "", contact: "", message: "", website: "" };

export function SupportForm() {
  const [form, setForm] = useState<FieldState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [notice, setNotice] = useState("");
  const [fallback, setFallback] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const set = (k: keyof FieldState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof FieldErrors]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (status === "error" || status === "sent") {
      setStatus("idle");
      setNotice("");
    }
  };

  const startCooldown = () => {
    setCooldown(Math.ceil(FORM_LIMITS.cooldownMs / 1000));
    const id = window.setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || cooldown > 0) return;

    // Validate locally first so obvious mistakes never hit the network.
    const local = validateSupport(form);
    if (!local.ok) {
      setErrors(local.errors);
      setStatus("error");
      setNotice("Please fix the highlighted fields.");
      return;
    }

    setStatus("sending");
    setNotice("");
    setErrors({});

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
        errors?: FieldErrors;
        fallback?: string | null;
      };

      if (res.ok && data.ok) {
        setStatus("sent");
        setNotice("Message delivered. The admin will get back to you in this chat.");
        setForm(EMPTY);
        startCooldown();
        return;
      }

      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus("error");
        setNotice(data.message ?? "Please check the fields and try again.");
        return;
      }

      if (res.status === 429) {
        setStatus("error");
        setNotice(data.message ?? "Too many messages. Please wait a moment.");
        startCooldown();
        return;
      }

      if (res.status === 503 && data.error === "relay_not_configured") {
        setStatus("not_configured");
        setNotice(data.message ?? "Direct messaging is not wired up yet.");
        setFallback(data.fallback ?? null);
        return;
      }

      setStatus("error");
      setNotice(data.message ?? "Something went wrong. Please try again in a moment.");
    } catch {
      setStatus("error");
      setNotice("Network problem — check your connection and try again.");
    }
  };

  const disabled = status === "sending" || cooldown > 0;

  return (
    <section id="support" className="relative scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-2xl sm:p-9"
        >
          {/* holographic border glow */}
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.9),rgba(139,92,246,0.9),transparent)]" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Send your message below to get started.
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Order support, custom requests, or a question — it reaches the admin directly.
            </p>

            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="name"
                  label="Your name"
                  value={form.name}
                  error={errors.name}
                  maxLength={FORM_LIMITS.nameMax}
                  placeholder="e.g. Alex"
                  autoComplete="name"
                  onChange={(v) => set("name", v)}
                />
                <Field
                  id="contact"
                  label="Telegram handle or email"
                  value={form.contact}
                  error={errors.contact}
                  maxLength={80}
                  placeholder="@username  or  you@mail.com"
                  autoComplete="username"
                  onChange={(v) => set("contact", v)}
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-white/60">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={form.message}
                  maxLength={FORM_LIMITS.messageMax}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us what you need — product, quantity, or your question."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-black/25 px-4 py-3 text-sm text-white outline-none transition-colors",
                    "placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30",
                    errors.message ? "border-red-400/60" : "border-white/10"
                  )}
                />
                <div className="mt-1.5 flex items-start justify-between gap-4">
                  <p id="message-error" role="alert" className="text-xs text-red-300">
                    {errors.message ?? ""}
                  </p>
                  <span className="shrink-0 text-[11px] tabular-nums text-white/30">
                    {form.message.length}/{FORM_LIMITS.messageMax}
                  </span>
                </div>
              </div>

              {/* Honeypot — hidden from humans, irresistible to bots */}
              <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={disabled}>
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-[18px] w-[18px] animate-spin" /> Sending…
                  </>
                ) : cooldown > 0 ? (
                  <>Please wait {cooldown}s</>
                ) : (
                  <>
                    <Send className="h-[18px] w-[18px]" /> Send Message
                  </>
                )}
              </Button>

              {/* ── State feedback ─────────────────────────────────────── */}
              {notice && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm",
                    status === "sent" && "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
                    status === "error" && "border-red-400/25 bg-red-500/10 text-red-200",
                    status === "not_configured" && "border-amber-400/25 bg-amber-500/10 text-amber-200"
                  )}
                >
                  {status === "sent" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span className="leading-relaxed">{notice}</span>
                </div>
              )}

              {status === "not_configured" && fallback && (
                <a
                  href={fallback}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                >
                  Open the admin chat instead →
                </a>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- field ui */

function Field({
  id,
  label,
  value,
  error,
  onChange,
  placeholder,
  maxLength,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-white/60">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        required
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border bg-black/25 px-4 text-sm text-white outline-none transition-colors",
          "placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30",
          error ? "border-red-400/60" : "border-white/10"
        )}
      />
      <p id={`${id}-error`} role="alert" className="mt-1.5 min-h-[16px] text-xs text-red-300">
        {error ?? ""}
      </p>
    </div>
  );
}