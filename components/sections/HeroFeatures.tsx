"use client";

import { motion } from "framer-motion";
import { Zap, ShoppingCart, Target, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HERO_FEATURES } from "@/lib/config";
import { TiltCard } from "@/components/ui/TiltCard";

const ICONS: Record<string, LucideIcon> = { Zap, ShoppingCart, Target, Flame };

export function HeroFeatures() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {HERO_FEATURES.map((f, i) => {
        const Icon = ICONS[f.icon] ?? Zap;
        return (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
          >
            <TiltCard className="h-full">
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition-colors duration-300 hover:border-violet-400/30">
                {/* corner glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-60" />
                <div className="relative flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[linear-gradient(140deg,rgba(109,94,252,0.35),rgba(14,165,233,0.25))] text-cyan-300">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </span>
                  <span className="text-lg" aria-hidden>
                    {f.emoji}
                  </span>
                </div>
                <h3 className="relative mt-4 font-display text-base font-semibold text-white">{f.title}</h3>
                <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/55">{f.desc}</p>
              </div>
            </TiltCard>
          </motion.div>
        );
      })}
    </div>
  );
}