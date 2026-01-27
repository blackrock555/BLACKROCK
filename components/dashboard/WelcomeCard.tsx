"use client";

import { Card, CardBody } from "@/components/ui";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingUp, Calendar, Crown } from "lucide-react";
import Link from "next/link";

interface WelcomeCardProps {
  userName: string;
  totalBalance?: number;
  dailyChange?: number;
}

const tips = [
  "Diversify your investments for better stability.",
  "Keep tracking your progress daily for insights.",
  "Consider reinvesting profits for compound growth.",
  "Your referral program can boost your earnings.",
  "Complete KYC to unlock all platform features.",
];

export function WelcomeCard({ userName, totalBalance, dailyChange }: WelcomeCardProps) {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  // Get a "random" tip based on the day
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const tipOfTheDay = tips[dayOfYear % tips.length];

  return (
    <Card className="bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 border-amber-500/20 overflow-hidden relative h-full">
      {/* Premium gold glow effects */}
      <motion.div
        className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/8 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/5 to-transparent" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTIsMTc1LDU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />

      <CardBody className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-2.5 rounded-xl bg-amber-500/10 backdrop-blur-sm border border-amber-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400/90 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </div>
        </div>

        {/* Greeting */}
        <div className="flex-1">
          <motion.p
            className="text-surface-400 text-sm font-medium mb-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {greeting},
          </motion.p>
          <motion.h2
            className="text-2xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {userName}
          </motion.h2>

          {/* Date */}
          <motion.div
            className="flex items-center gap-2 text-surface-500 text-xs mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Calendar className="w-3.5 h-3.5" />
            {dateString}
          </motion.div>

          {/* Tip of the day */}
          <motion.div
            className="bg-surface-800/50 backdrop-blur-sm rounded-lg p-3 border border-surface-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-surface-300 text-xs leading-relaxed">
                {tipOfTheDay}
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5"
        >
          <Link href="/plans">
            <motion.button
              className="
                w-full inline-flex items-center justify-center gap-2
                px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-amber-500/20 to-amber-600/20
                hover:from-amber-500/30 hover:to-amber-600/30
                text-amber-300 border border-amber-500/30
                transition-all duration-200 group
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Investment Plans
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </Link>
        </motion.div>
      </CardBody>
    </Card>
  );
}
