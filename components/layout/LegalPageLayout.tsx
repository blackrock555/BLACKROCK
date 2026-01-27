'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/branding/Logo';
import { ArrowLeft, Home, FileText, Shield, Scale, HelpCircle, Mail } from 'lucide-react';
import { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  icon?: 'terms' | 'privacy' | 'risk' | 'help' | 'contact';
  children: ReactNode;
}

const iconMap = {
  terms: Scale,
  privacy: Shield,
  risk: FileText,
  help: HelpCircle,
  contact: Mail,
};

export function LegalPageLayout({ title, subtitle, lastUpdated, icon = 'terms', children }: LegalPageLayoutProps) {
  const IconComponent = iconMap[icon] || FileText;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <Logo href="/" />
            <Link
              href="/dashboard"
              className="text-surface-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-900/50 to-transparent"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 rounded-2xl mb-6 border border-brand-500/20"
          >
            <IconComponent className="w-8 h-8 text-brand-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-surface-400 text-lg max-w-2xl mx-auto">{subtitle}</p>}
          {lastUpdated && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-surface-800/50 rounded-full border border-surface-700/50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-surface-400 text-sm">Last updated: {lastUpdated}</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-900/30 rounded-2xl border border-surface-800/50 p-6 sm:p-10">
            <div className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-semibold prose-headings:scroll-mt-20
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-surface-800
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-surface-200
              prose-p:text-surface-300 prose-p:leading-relaxed
              prose-li:text-surface-300 prose-li:marker:text-brand-500
              prose-ul:space-y-2
              prose-strong:text-white prose-strong:font-semibold
              prose-a:text-brand-400 prose-a:no-underline hover:prose-a:text-brand-300 prose-a:transition-colors
            ">
              {children}
            </div>
          </div>
        </div>
      </motion.main>

      {/* Quick Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-surface-800/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Related Pages</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/terms" className="p-4 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl border border-surface-700/50 transition-colors group">
              <Scale className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors mb-2" />
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors">Terms of Service</span>
            </Link>
            <Link href="/privacy" className="p-4 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl border border-surface-700/50 transition-colors group">
              <Shield className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors mb-2" />
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors">Privacy Policy</span>
            </Link>
            <Link href="/risk-disclosure" className="p-4 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl border border-surface-700/50 transition-colors group">
              <FileText className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors mb-2" />
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors">Risk Disclosure</span>
            </Link>
            <Link href="/contact" className="p-4 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl border border-surface-700/50 transition-colors group">
              <Mail className="w-5 h-5 text-surface-400 group-hover:text-brand-400 transition-colors mb-2" />
              <span className="text-sm text-surface-300 group-hover:text-white transition-colors">Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-surface-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} BLACKROCK. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-surface-400 text-sm">
            <Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
