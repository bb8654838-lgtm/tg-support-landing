"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  /** Adds a subtle 3D press/tilt feel. */
  depth?: boolean;
}

const VARIANTS: Record<string, string> = {
  primary:
    "text-white bg-[linear-gradient(110deg,#6d5efc_0%,#4f46e5_45%,#0ea5e9_100%)] shadow-[0_10px_40px_-12px_rgba(109,94,252,0.85)] hover:shadow-[0_14px_50px_-10px_rgba(56,189,248,0.75)]",
  secondary:
    "text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-xl hover:bg-white/[0.09] hover:border-white/25",
  ghost: "text-white/70 hover:text-white hover:bg-white/[0.06]",
  danger: "text-white bg-red-500/90 hover:bg-red-500",
};

const SIZES: Record<string, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", depth = true, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-2xl font-semibold",
        "transition-all duration-300 will-change-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070f]",
        "disabled:pointer-events-none disabled:opacity-60",
        depth && "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {/* Sheen that sweeps across on hover */}
      {depth && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{props.children}</span>
    </button>
  )
);
Button.displayName = "Button";