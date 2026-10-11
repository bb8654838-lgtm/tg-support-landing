"use client";

import { motion } from "framer-motion";
import { Megaphone, Gift, Headset, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QUICK_ACCESS } from "@/lib/config";
import { openExternal } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { Megaphone, Gift, Headset };

export function QuickAccess() {
  return (
    <section id="quick-access" className="relative scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300 backdrop-blur-xl">
            Quick Access
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One tap to everything
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {QUICK_ACCESS.map((q, i) => {
            const Icon = ICONS[q.icon] ?? Megaphone;
            const configured = q.href !== null;
            const Card = (
              <>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(109,94,252,0.14),transparent_55%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200 transition-colors group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan-300" />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-semibold text-white">{q.title}</h3>
                <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/55">{q.desc}</p>
                {!configured && (
                  <p className="relative mt-3 text-xs text-amber-300/80">Not configured yet — opens the channel instead.</p>
                )}
              </>
            );

            return (
              <motion.button
                key={q.title}
                type="button"
                onClick={() => {
                  // Never open a null href; fall back to the official channel.
                  const target = q.href ?? "https://t.me/+TC0elDjaFC1hNzA9";
                  openExternal(target);
                }}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_18px_50px_-20px_rgba(109,94,252,0.7)] active:scale-[0.99]"
              >
                {Card}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}