/**
 * Shared form validation — imported by BOTH the client form and the API route
 * so the rules can never drift apart.
 */

import { FORM_LIMITS } from "./config";

export interface SupportInput {
  name: string;
  contact: string;
  message: string;
  /** Honeypot — must stay empty. Bots fill this in. */
  website?: string;
}

export interface FieldErrors {
  name?: string;
  contact?: string;
  message?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: FieldErrors;
  /** Trimmed, safe values — only meaningful when ok === true. */
  value: { name: string; contact: string; message: string };
  /** Set when the submission was rejected as automated traffic. */
  spam?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_RE = /^@?[A-Za-z0-9_]{4,32}$/;

/** Reject strings that are mostly invisible/control characters. */
function hasControlChars(s: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(s);
}

export function validateSupport(raw: Partial<SupportInput>): ValidationResult {
  const name = (raw.name ?? "").trim();
  const contact = (raw.contact ?? "").trim();
  const message = (raw.message ?? "").trim();
  const website = (raw.website ?? "").trim();
  const errors: FieldErrors = {};

  // Honeypot: a real browser never fills a hidden "website" field.
  if (website) {
    return { ok: false, errors, value: { name, contact, message }, spam: true };
  }

  if (name.length < FORM_LIMITS.nameMin) {
    errors.name = `Please enter at least ${FORM_LIMITS.nameMin} characters.`;
  } else if (name.length > FORM_LIMITS.nameMax) {
    errors.name = `Please keep your name under ${FORM_LIMITS.nameMax} characters.`;
  } else if (hasControlChars(name)) {
    errors.name = "That name contains unsupported characters.";
  }

  // Contact accepts an @handle, a numeric Telegram id, or an email address.
  if (!contact) {
    errors.contact = "Add a Telegram handle or email so we can reply.";
  } else if (contact.length > 80) {
    errors.contact = "That contact is too long.";
  } else if (hasControlChars(contact)) {
    errors.contact = "That contact contains unsupported characters.";
  } else if (!EMAIL_RE.test(contact) && !TELEGRAM_RE.test(contact) && !/^\+?\d{6,15}$/.test(contact)) {
    errors.contact = "Use an @handle, a phone number, or an email address.";
  }

  if (message.length < FORM_LIMITS.messageMin) {
    errors.message = `Please add a little more detail (at least ${FORM_LIMITS.messageMin} characters).`;
  } else if (message.length > FORM_LIMITS.messageMax) {
    errors.message = `Please keep your message under ${FORM_LIMITS.messageMax} characters.`;
  } else if (hasControlChars(message)) {
    errors.message = "That message contains unsupported characters.";
  } else if (!/\S\s*\S/.test(message)) {
    errors.message = "Please write a slightly longer message.";
  }

  return { ok: Object.keys(errors).length === 0, errors, value: { name, contact, message } };
}

/**
 * Best-effort client IP from proxy headers. Used only to rate-limit and to
 * label the forwarded message — never stored by this app.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() ?? "";
}