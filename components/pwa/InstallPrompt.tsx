"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Check, Chrome } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed the prompt before
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show prompt if never dismissed or dismissed more than 7 days ago
      if (!dismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show iOS guide if on iOS and not installed
    if (isIOSDevice && !window.matchMedia("(display-mode: standalone)").matches) {
      const iosPromptDismissed = localStorage.getItem("ios-install-dismissed");
      const dismissedTime = iosPromptDismissed ? parseInt(iosPromptDismissed) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      if (!iosPromptDismissed || daysSinceDismissed > 7) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("Install error:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    if (isIOS) {
      localStorage.setItem("ios-install-dismissed", Date.now().toString());
    }
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative p-4 bg-gradient-to-r from-brand-600/20 to-purple-600/20 border-b border-[#1a1a1a]">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-surface-400" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Install BLACKROCK App</h3>
                  <p className="text-surface-400 text-xs">Get the full app experience</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {isIOS ? (
                // iOS Installation Guide
                <div className="space-y-3">
                  <p className="text-surface-300 text-sm">
                    Install this app on your iPhone:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#141414]">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">1</div>
                      <span className="text-surface-300 text-sm">Tap the Share button</span>
                      <svg className="w-5 h-5 text-blue-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#141414]">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">2</div>
                      <span className="text-surface-300 text-sm">Scroll and tap "Add to Home Screen"</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#141414]">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">3</div>
                      <span className="text-surface-300 text-sm">Tap "Add" to install</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Android/Desktop Installation
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-300 text-sm">Works offline</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-300 text-sm">Faster loading & performance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-300 text-sm">Push notifications</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-surface-300 text-sm">Full-screen experience</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action */}
            {!isIOS && deferredPrompt && (
              <div className="p-4 pt-0">
                <button
                  onClick={handleInstall}
                  className="w-full py-3 px-4 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-brand-500/25"
                >
                  <Download className="w-5 h-5" />
                  Install Now
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 bg-[#0a0a0a] border-t border-[#1a1a1a]">
              <p className="text-center text-[#4a4a4a] text-xs">
                Free • No app store required
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
