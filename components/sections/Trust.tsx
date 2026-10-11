"use client";

import { motion } from "framer-motion";
import { MessageSquareReply, LifeBuoy, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TRUST_POINTS } from "@/lib/config";

const ICONS: Record<string, LucideIcon> = { MessageSquareReply, LifeBuoy, ShieldCheck };

export function Trust() {
  return (
    <section id="trust" className="relative scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-xl">
            Trust &amp; Support
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Straight answers, no runaround
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TRUST_POINTS.map((t, i) => {
            const Icon = ICONS[t.icon] ?? ShieldCheck;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(16,22,40,0.9),rgba(8,11,22,0.9))] p-6 backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-[linear-gradient(90deg,transparent,rgba(52,211,153,0.6),transparent)]" />
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-white">{t.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}