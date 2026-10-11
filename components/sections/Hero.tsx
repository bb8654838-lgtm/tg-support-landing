"use client";

import { motion } from "framer-motion";
import { MessageCircle, Megaphone, Gift, Sparkles, AlertCircle } from "lucide-react";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { HeroFeatures } from "./HeroFeatures";
import { Button } from "@/components/ui/Button";
import { SITE, ADMIN_LINK, LINKS } from "@/lib/config";
import { openExternal } from "@/lib/utils";

export function Hero() {
  /** Contact Admin — primary CTA. Falls back to the channel when unconfigured. */
  const contactAdmin = () => {
    if (ADMIN_LINK) {
      openExternal(ADMIN_LINK);
      return;
    }
    // No invented username: send people somewhere useful and say why.
    openExternal(LINKS.channel);
  };

  return (
    <section className="relative overflow-hidden pb-20 pt-24 sm:pt-28 lg:pt-32">
      <HeroCanvas />

      {/* Layered atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(109,94,252,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-42 bg-gradient-to-t from-[#05070f] to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-5">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-cyan-300 backdrop-blur-xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            {SITE.eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-6 font-display text-[2rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Have a Question or{" "}
            <span className="bg-[linear-gradient(105deg,#22d3ee_0%,#818cf8_45%,#c084fc_100%)] bg-clip-text text-transparent">
              Ready to Place an Order?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/60 sm:text-base"
          >
            {SITE.description}
          </motion.p>

          {/* ── CTA buttons ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.26 }}
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center"
          >
            <Button size="lg" onClick={contactAdmin} className="sm:min-w-[210px]">
              <MessageCircle className="h-[18px] w-[18px]" />
              Contact Admin
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => openExternal(LINKS.channel)}
              className="sm:min-w-[210px]"
            >
              <Megaphone className="h-[18px] w-[18px]" />
              Join Official Channel
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => openExternal(LINKS.freeStuff)}
              className="sm:min-w-[190px]"
            >
              <Gift className="h-[18px] w-[18px]" />
              Get Free Stuff
            </Button>
          </motion.div>

          {/* Honest notice while the admin route is not configured yet. */}
          {!ADMIN_LINK && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-4 flex max-w-xl items-start justify-center gap-2 text-left text-xs leading-relaxed text-amber-300/80"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Direct admin contact is not configured yet. Set{" "}
                <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11px]">
                  NEXT_PUBLIC_ADMIN_USERNAME
                </code>{" "}
                to open a real chat — until then Contact Admin opens the official channel.
              </span>
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Encrypted and private by default
          </motion.div>
        </div>

        <HeroFeatures />
      </div>
    </section>
  );
}