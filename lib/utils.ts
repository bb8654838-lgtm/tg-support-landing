import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coarse device-capability probe used to pick a 3D quality tier.
 * Returns true for phones and constrained WebViews where bloom and dense
 * particle fields would cost more than they add.
 */
export function isConstrainedDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth < 768;

  // Telegram appends the Android performance class to its User-Agent.
  const cls = ua.match(/PERFORMANCE_CLASS_(\w+)/i)?.[1]?.toUpperCase();
  if (cls) return cls.startsWith("LOW") || cls === "MEDIUM_LOW";

  // Hardware hints where the browser exposes them.
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  return mobile || cores <= 4 || memory <= 4;
}

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Open a URL, preferring a new tab and never leaking the referrer. */
export function openExternal(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}