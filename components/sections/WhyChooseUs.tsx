"use client";

import { motion } from "framer-motion";
import { Gauge, UserCheck, ShoppingBag, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WHY_US } from "@/lib/config";
import { TiltCard } from "@/components/ui/TiltCard";

const ICONS: Record<string, LucideIcon> = { Gauge, UserCheck, ShoppingBag, MessagesSquare };

export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
            Why Choose Us
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Support that actually{" "}
            <span className="bg-[linear-gradient(105deg,#22d3ee,#818cf8,#c084fc)] bg-clip-text text-transparent">
              reaches a person
            </span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((w, i) => {
            const Icon = ICONS[w.icon] ?? Gauge;
            return (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <TiltCard className="h-full" max={6}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-400/25">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/15 blur-2xl" />
                    <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(14,165,233,0.3),rgba(109,94,252,0.3))] text-cyan-200">
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </div>
                    <h3 className="relative mt-5 font-display text-base font-semibold text-white">{w.title}</h3>
                    <p className="relative mt-2 text-[13px] leading-relaxed text-white/55">{w.desc}</p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}