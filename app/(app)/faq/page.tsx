"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui";
import {
  HelpCircle,
  ChevronDown,
  Search,
  DollarSign,
  Shield,
  CreditCard,
  Users,
  Settings,
  Clock,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  { id: "all", label: "All", icon: HelpCircle },
  { id: "getting-started", label: "Getting Started", icon: Users },
  { id: "deposits", label: "Deposits", icon: CreditCard },
  { id: "withdrawals", label: "Withdrawals", icon: DollarSign },
  { id: "security", label: "Security", icon: Shield },
  { id: "account", label: "Account", icon: Settings },
];

const FAQS: FAQ[] = [
  {
    category: "getting-started",
    question: "How do I get started with BLACKROCK?",
    answer:
      "Getting started is simple: 1) Create an account with your email, 2) Verify your email address, 3) Complete KYC verification, 4) Make your first deposit of at least $50 USDT. Once verified, you can start earning daily returns on your investment.",
  },
  {
    category: "getting-started",
    question: "What is the minimum deposit amount?",
    answer:
      "The minimum deposit amount is $50 USDT. This allows you to start your investment journey and begin earning daily returns based on your tier level.",
  },
  {
    category: "getting-started",
    question: "How does the tier system work?",
    answer:
      "Your tier is determined by your total deposit balance. Higher tiers offer better daily return rates. Starter tier starts at $50-$999, Bronze at $1,000-$4,999, Silver at $5,000-$24,999, and Gold at $25,000+. Each tier unlocks better rates and additional benefits.",
  },
  {
    category: "deposits",
    question: "What payment methods are accepted?",
    answer:
      "We accept USDT (Tether) deposits via three blockchain networks: ERC20 (Ethereum), TRC20 (Tron), and BEP20 (Binance Smart Chain). Choose the network that best suits your needs based on speed and fees.",
  },
  {
    category: "deposits",
    question: "How long does a deposit take to process?",
    answer:
      "Deposits are typically processed within 1-24 hours after receiving blockchain confirmation. Once confirmed on the blockchain, our team will verify and credit your account. You'll receive an email notification when your deposit is approved.",
  },
  {
    category: "deposits",
    question: "What happens if I send funds to the wrong network?",
    answer:
      "Please always double-check the network before sending funds. If you accidentally send to the wrong network, contact our support team immediately with your transaction details. Recovery may not always be possible depending on the situation.",
  },
  {
    category: "withdrawals",
    question: "How do I withdraw my funds?",
    answer:
      "Navigate to the Withdraw page from your dashboard, enter the amount you wish to withdraw, select your preferred network, and provide your wallet address. Submit the request and our team will process it within 24-48 hours.",
  },
  {
    category: "withdrawals",
    question: "Are there withdrawal fees?",
    answer:
      "Yes, network fees apply to all withdrawals to cover blockchain transaction costs. Fees vary by network: ERC20 has higher fees but wider compatibility, TRC20 and BEP20 typically have lower fees. The exact fee is displayed before you confirm your withdrawal.",
  },
  {
    category: "withdrawals",
    question: "Is there a minimum withdrawal amount?",
    answer:
      "Yes, the minimum withdrawal amount is $10 USDT. This ensures that your withdrawal covers the network fees while still providing you with meaningful value.",
  },
  {
    category: "withdrawals",
    question: "Can I withdraw my profits without touching my principal?",
    answer:
      "Yes, you can withdraw your profits at any time while keeping your principal invested. Simply request a withdrawal amount up to your available profit balance.",
  },
  {
    category: "security",
    question: "Is my investment secure?",
    answer:
      "We implement industry-leading security measures including 256-bit SSL encryption, secure data storage, two-factor authentication options, and regular security audits. Your account is protected by multiple layers of security.",
  },
  {
    category: "security",
    question: "What is KYC and why is it required?",
    answer:
      "KYC (Know Your Customer) is a verification process required by financial regulations. It helps prevent fraud and ensures the security of all users. You'll need to provide a valid government ID and proof of address to complete verification.",
  },
  {
    category: "security",
    question: "How is my personal information protected?",
    answer:
      "Your personal information is encrypted and stored securely. We never share your data with third parties without your consent. All KYC documents are handled with strict confidentiality and in compliance with data protection regulations.",
  },
  {
    category: "account",
    question: "How do I change my password?",
    answer:
      "Go to Settings from your dashboard and select the Security tab. You can change your password there by entering your current password and your new desired password.",
  },
  {
    category: "account",
    question: "What is the referral program?",
    answer:
      "Our referral program rewards you for inviting friends. Share your unique referral code, and when someone signs up and makes their first deposit, you'll earn a bonus. The bonus amount increases based on your referral tier.",
  },
  {
    category: "account",
    question: "How do I contact support?",
    answer:
      "You can contact our support team by creating a support ticket from the Support page in your dashboard. Our team typically responds within 24 hours. For urgent matters, please mark your ticket as high priority.",
  },
];

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-surface-800 rounded-xl overflow-hidden bg-surface-900/50"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-800/50 transition-colors"
      >
        <span className="font-medium text-white pr-4">{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-surface-400" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 text-surface-400 leading-relaxed text-sm">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFAQs = FAQS.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-brand-400" />
          Frequently Asked Questions
        </h1>
        <p className="text-surface-400 mt-1">
          Find answers to common questions about our platform
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
        <input
          type="text"
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface-900 border border-surface-800 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {FAQ_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "bg-surface-800 text-surface-400 hover:text-white hover:bg-surface-700 border border-surface-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* FAQs List */}
      {filteredFAQs.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <HelpCircle className="w-12 h-12 text-surface-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
            <p className="text-surface-400">
              Try a different search term or category
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </div>
      )}

      {/* Still Need Help */}
      <Card className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-brand-500/20">
        <CardBody className="text-center py-8">
          <Clock className="w-10 h-10 text-brand-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
          <p className="text-surface-400 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/support/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
        </CardBody>
      </Card>
    </div>
  );
}
