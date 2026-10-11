"use client";

import { MessageCircle, Megaphone, Gift } from "lucide-react";
import { SITE, LINKS, ADMIN_LINK } from "@/lib/config";
import { openExternal } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Contact Admin", icon: MessageCircle, href: ADMIN_LINK ?? LINKS.channel },
    { label: "Official Channel", icon: Megaphone, href: LINKS.channel },
    { label: "Free Stuff", icon: Gift, href: LINKS.freeStuff },
  ];

  return (
    <footer className="relative border-t border-white/[0.07] py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.35),rgba(139,92,246,0.35),transparent)]" />
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(140deg,#6d5efc,#0ea5e9)] shadow-[0_8px_30px_-10px_rgba(109,94,252,0.9)]">
              <MessageCircle className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">{SITE.name}</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            {links.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => openExternal(l.href)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-white/65 backdrop-blur-xl transition-colors hover:border-white/20 hover:text-white"
              >
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[11px] text-white/35 sm:flex-row">
            <span>
              © {year} {SITE.name}. All rights reserved.
            </span>
            <span>Built with Next.js · React Three Fiber</span>
          </div>
        </div>
      </div>
    </footer>
  );
}