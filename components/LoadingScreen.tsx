"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "blackrock_initial_load_shown";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if this is the initial visit for this session
    const hasShown = sessionStorage.getItem(STORAGE_KEY);

    if (!hasShown) {
      setIsVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "true");

      // Start fade out after 2 seconds
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 2000);

      // Fully hide after fade animation (0.5s)
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 2500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-surface-950 flex flex-col items-center justify-center ${
        isFading ? "loading-fade-out" : ""
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with pulse animation */}
        <div className="loading-logo-pulse mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              BLACKROCK
            </span>
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-surface-400 text-sm mb-8 tracking-wide">
          Preparing your dashboard...
        </p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 relative">
            {/* Shimmer effect */}
            <div className="absolute inset-0 loading-progress-shimmer">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Subtle dots animation */}
        <div className="flex gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Footer text */}
      <div className="absolute bottom-8 text-surface-600 text-xs">
        Secure Investment Platform
      </div>
    </div>
  );
}
