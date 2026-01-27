"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui";
import {
  Download,
  Smartphone,
  Shield,
  Zap,
  Wifi,
  Bell,
  Check,
  Chrome,
  Apple,
  MonitorSmartphone,
  ArrowRight,
  Star,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install error:", error);
    }
    setInstalling(false);
  };

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant loading with optimized performance",
    },
    {
      icon: Wifi,
      title: "Works Offline",
      description: "Access your portfolio even without internet",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Get alerts for trades and transactions",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-grade encryption for your data",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="border-b border-[#141414] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] border border-[#1a1a1a] mb-8"
            >
              <Smartphone className="w-4 h-4 text-brand-400" />
              <span className="text-surface-300 text-sm font-medium">Mobile App Available</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              Download{" "}
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
                BLACKROCK
              </span>{" "}
              App
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-surface-400 mb-10 max-w-2xl mx-auto"
            >
              Get instant access to your investment portfolio. Install our app directly from your browser - no app store required.
            </motion.p>

            {/* Install Button / Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isInstalled ? (
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">App Installed Successfully!</span>
                </div>
              ) : deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="group px-8 py-4 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl shadow-brand-500/25 disabled:opacity-50"
                >
                  <Download className={`w-6 h-6 ${installing ? "animate-bounce" : ""}`} />
                  {installing ? "Installing..." : "Install App Now"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-surface-400 mb-4">
                    {isIOS
                      ? "Tap the Share button and select 'Add to Home Screen'"
                      : "Open this page in Chrome browser to install"}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-surface-500">
                    {isIOS ? (
                      <Apple className="w-5 h-5" />
                    ) : (
                      <Chrome className="w-5 h-5" />
                    )}
                    <span className="text-sm">
                      {isIOS ? "iOS Safari" : "Chrome Browser"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Platform Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 mt-10"
            >
              <div className="flex items-center gap-2 text-surface-500">
                <Smartphone className="w-5 h-5" />
                <span className="text-sm">Android</span>
              </div>
              <div className="w-px h-4 bg-[#2a2a2a]" />
              <div className="flex items-center gap-2 text-surface-500">
                <Apple className="w-5 h-5" />
                <span className="text-sm">iOS</span>
              </div>
              <div className="w-px h-4 bg-[#2a2a2a]" />
              <div className="flex items-center gap-2 text-surface-500">
                <MonitorSmartphone className="w-5 h-5" />
                <span className="text-sm">Desktop</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 border-t border-[#141414]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Why Install the App?
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              Enjoy a seamless, native-like experience with these exclusive benefits
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#141414] hover:border-[#2a2a2a] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-surface-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Install Section */}
      <section className="py-16 sm:py-24 border-t border-[#141414] bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              How to Install
            </h2>
            <p className="text-surface-400">
              Follow these simple steps based on your device
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Android/Chrome */}
            <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#141414]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Chrome className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Android / Chrome</h3>
                  <p className="text-surface-500 text-sm">Chrome Browser</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold flex-shrink-0">1</div>
                  <p className="text-surface-300 text-sm">Open this page in Chrome browser</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold flex-shrink-0">2</div>
                  <p className="text-surface-300 text-sm">Click the "Install App Now" button above</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs text-brand-400 font-bold flex-shrink-0">3</div>
                  <p className="text-surface-300 text-sm">Tap "Install" in the popup dialog</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-surface-300 text-sm">App icon appears on your home screen!</p>
                </div>
              </div>
            </div>

            {/* iOS/Safari */}
            <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#141414]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Apple className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">iPhone / iPad</h3>
                  <p className="text-surface-500 text-sm">Safari Browser</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">1</div>
                  <p className="text-surface-300 text-sm">Open this page in Safari browser</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">2</div>
                  <p className="text-surface-300 text-sm">Tap the Share button (square with arrow)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold flex-shrink-0">3</div>
                  <p className="text-surface-300 text-sm">Scroll and tap "Add to Home Screen"</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-surface-300 text-sm">Tap "Add" to complete installation!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 border-t border-[#141414]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-surface-400 mb-8">
              "The best investment platform I've used. The app makes managing my portfolio so easy!"
            </p>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#141414] bg-[#0a0a0a]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-surface-600 text-sm">
            © {new Date().getFullYear()} BLACKROCK. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
