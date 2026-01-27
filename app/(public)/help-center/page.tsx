'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/branding/Logo';
import { Button } from '@/components/ui';
import {
  ArrowLeft,
  Search,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Shield,
  Users,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Lock,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react';

const categories = [
  {
    icon: Wallet,
    title: 'Getting Started',
    description: 'Learn how to create and set up your account',
    articles: [
      'How to create an account',
      'Email verification process',
      'Understanding the dashboard',
      'Setting up two-factor authentication',
    ],
    color: 'brand',
  },
  {
    icon: ArrowDownToLine,
    title: 'Deposits',
    description: 'Everything about funding your account',
    articles: [
      'Supported cryptocurrencies and networks',
      'How to make a deposit',
      'Minimum deposit requirements',
      'Deposit confirmation times',
    ],
    color: 'green',
  },
  {
    icon: ArrowUpFromLine,
    title: 'Withdrawals',
    description: 'Guide to withdrawing your funds',
    articles: [
      'How to request a withdrawal',
      'Withdrawal processing times',
      'Withdrawal limits and fees',
      'Common withdrawal issues',
    ],
    color: 'purple',
  },
  {
    icon: Shield,
    title: 'KYC Verification',
    description: 'Identity verification requirements',
    articles: [
      'Why KYC is required',
      'Required documents',
      'How to submit KYC documents',
      'KYC review timeline',
    ],
    color: 'yellow',
  },
  {
    icon: Users,
    title: 'Referral Program',
    description: 'Earn rewards by inviting others',
    articles: [
      'How the referral program works',
      'Referral tiers and bonuses',
      'Finding your referral code',
      'Tracking referral earnings',
    ],
    color: 'blue',
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Keep your account safe',
    articles: [
      'Password best practices',
      'Recognizing phishing attempts',
      'Securing your account',
      'What to do if compromised',
    ],
    color: 'red',
  },
];

const popularArticles = [
  { title: 'How to make your first deposit', category: 'Deposits' },
  { title: 'Understanding profit distributions', category: 'Earnings' },
  { title: 'Completing KYC verification', category: 'Verification' },
  { title: 'Withdrawal processing times', category: 'Withdrawals' },
  { title: 'Using the referral program', category: 'Referrals' },
];

const colorClasses = {
  brand: 'bg-brand-500/10 text-brand-400',
  green: 'bg-green-500/10 text-green-400',
  purple: 'bg-purple-500/10 text-purple-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  blue: 'bg-blue-500/10 text-blue-400',
  red: 'bg-red-500/10 text-red-400',
};

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Search functionality
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat =>
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.articles.some(article => article.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { title: string; category: string }[] = [];
    categories.forEach(cat => {
      cat.articles.forEach(article => {
        if (article.toLowerCase().includes(query)) {
          results.push({ title: article, category: cat.title });
        }
      });
    });
    return results.slice(0, 5);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <Logo href="/" />
            <Link href="/contact">
              <Button variant="secondary" size="sm">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contact Support</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-surface-900/50 to-transparent"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 rounded-2xl mb-6 border border-brand-500/20"
          >
            <BookOpen className="w-8 h-8 text-brand-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-surface-400 text-lg mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-surface-800/50 border border-surface-700 rounded-xl text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-surface-800 border border-surface-700 rounded-xl overflow-hidden shadow-xl z-10"
                >
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-700/50 transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <div>
                        <p className="text-white text-sm">{result.title}</p>
                        <p className="text-surface-400 text-xs">{result.category}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Browse by Category</h2>
            {searchQuery && (
              <p className="text-surface-400 text-sm">
                {filteredCategories.length} categories found
              </p>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-surface-800/50 border border-surface-700/50 rounded-2xl p-6 hover:border-brand-500/30 hover:bg-surface-800/70 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 ${colorClasses[category.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-brand-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-surface-400 text-sm mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-surface-300 text-sm hover:text-white transition-colors cursor-pointer group/item">
                        <ChevronRight className="w-3 h-3 text-surface-500 group-hover/item:text-brand-400 group-hover/item:translate-x-0.5 transition-all" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-surface-600" />
              </div>
              <p className="text-surface-400">No categories found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-medium"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="flex items-center gap-4 p-4 bg-surface-800/50 border border-surface-700 rounded-xl hover:border-brand-500/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{article.title}</p>
                  <p className="text-surface-400 text-sm">{article.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-surface-400 mb-8">
            Our support team is here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg">
              Contact Support
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-surface-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} BLACKROCK. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-surface-400 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
