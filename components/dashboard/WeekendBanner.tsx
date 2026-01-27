"use client";

import { motion } from "framer-motion";
import { CalendarX, Clock, PauseCircle, PlayCircle } from "lucide-react";

interface WeekendBannerProps {
  title: string;
  message: string;
}

export function WeekendBanner({ title, message }: WeekendBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-900 via-surface-900 to-surface-950 border border-amber-500/30 shadow-xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Amber glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative p-6 md:p-8">
        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <CalendarX className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Weekend Notice</span>
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left: Clock Animation */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Clock className="w-12 h-12 md:w-16 md:h-16 text-amber-400" />
                </motion.div>
              </div>
              {/* Pulsing indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-surface-900"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {title}
            </h2>
            <p className="text-surface-300 text-base md:text-lg leading-relaxed mb-6">
              {message}
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <PauseCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Profit Sharing Paused</p>
                  <p className="text-surface-400 text-xs mt-0.5">No distributions during weekends</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <PlayCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Markets Reopen Monday</p>
                  <p className="text-surface-400 text-xs mt-0.5">Normal operations resume</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
