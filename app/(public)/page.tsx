"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui";
import {
  Shield,
  TrendingUp,
  Users,
  Wallet,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lock,
  Zap,
  Globe,
  Clock,
  ChevronDown,
  Star,
  Award,
  BadgeCheck,
  Sparkles,
  LineChart,
  PieChart,
  ArrowUpRight,
  Play,
  CircleDot,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Platform statistics
const platformStats = [
  { value: "$2.5M+", label: "Assets Under Management", icon: Wallet },
  { value: "10,000+", label: "Active Investors", icon: Users },
  { value: "99.9%", label: "Platform Uptime", icon: Zap },
  { value: "24/7", label: "Support Available", icon: Clock },
];

const features = [
  {
    icon: TrendingUp,
    title: "Strategic Investments",
    description: "Access professionally managed investment strategies designed for consistent portfolio growth.",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your assets are protected with military-grade encryption and multi-layer security protocols.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your portfolio performance with comprehensive dashboards and detailed reports.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Wallet,
    title: "Flexible Withdrawals",
    description: "Withdraw your funds anytime with transparent processing and clear status tracking.",
    gradient: "from-orange-500 to-amber-500"
  },
  {
    icon: Users,
    title: "Referral Program",
    description: "Earn rewards by inviting others to join through our tiered referral system.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Manage your investments anytime, anywhere with our always-available platform.",
    gradient: "from-indigo-500 to-violet-500"
  }
];

const steps = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up with your email and complete the verification process in minutes.",
    icon: Users
  },
  {
    number: "02",
    title: "Verify Identity",
    description: "Complete KYC verification to unlock full platform features and higher limits.",
    icon: BadgeCheck
  },
  {
    number: "03",
    title: "Fund Your Account",
    description: "Deposit USDT via multiple blockchain networks with instant confirmation.",
    icon: Wallet
  },
  {
    number: "04",
    title: "Start Earning",
    description: "Your funds work for you. Track returns and withdraw anytime.",
    icon: TrendingUp
  }
];

const certificates = [
  { name: "ISO 27001", subtitle: "Information Security", icon: Shield },
  { name: "SOC 2 Type II", subtitle: "Compliance Certified", icon: BadgeCheck },
  { name: "PCI DSS", subtitle: "Payment Security", icon: Lock },
  { name: "GDPR", subtitle: "Data Protection", icon: Shield },
  { name: "SSL/TLS", subtitle: "256-bit Encryption", icon: Lock },
  { name: "KYC/AML", subtitle: "Regulatory Compliance", icon: BadgeCheck },
];

// Fallback withdrawal certificates for the marquee (used if API fails)
const fallbackWithdrawalCertificates = [
  { name: "Michael C.", amount: "$2,450", date: "Jan 15, 2026", network: "TRC20" },
  { name: "Sarah W.", amount: "$5,200", date: "Jan 14, 2026", network: "ERC20" },
  { name: "David R.", amount: "$1,800", date: "Jan 13, 2026", network: "BEP20" },
  { name: "Emma L.", amount: "$3,750", date: "Jan 12, 2026", network: "TRC20" },
  { name: "James K.", amount: "$8,900", date: "Jan 11, 2026", network: "ERC20" },
  { name: "Lisa M.", amount: "$4,100", date: "Jan 10, 2026", network: "BEP20" },
];

// Profit share certificates for the marquee
const profitShareCertificates = [
  { name: "Robert A.", amount: "$1,245", period: "December 2025", percentage: "12.4%" },
  { name: "Jennifer M.", amount: "$3,890", period: "December 2025", percentage: "15.2%" },
  { name: "Thomas H.", amount: "$892", period: "December 2025", percentage: "11.8%" },
  { name: "Amanda S.", amount: "$2,150", period: "December 2025", percentage: "13.6%" },
  { name: "Christopher L.", amount: "$5,420", period: "December 2025", percentage: "14.1%" },
  { name: "Nicole P.", amount: "$1,780", period: "December 2025", percentage: "12.9%" },
  { name: "Daniel K.", amount: "$4,320", period: "December 2025", percentage: "16.3%" },
  { name: "Stephanie R.", amount: "$960", period: "December 2025", percentage: "10.5%" },
];

const testimonials = [
  {
    name: "Michael Chen",
    role: "Tech Entrepreneur",
    avatar: "MC",
    content: "The transparency and real-time tracking gives me confidence in every transaction. A well-designed platform with professional management.",
    rating: 5
  },
  {
    name: "Sarah Williams",
    role: "Financial Analyst",
    avatar: "SW",
    content: "Clean interface, straightforward processes, and responsive support. Everything I need to manage my investments effectively.",
    rating: 5
  },
  {
    name: "David Rodriguez",
    role: "Business Owner",
    avatar: "DR",
    content: "The referral program has been great for building passive income. The dashboard makes it easy to track everything.",
    rating: 5
  }
];

const faqs = [
  {
    question: "How do I get started?",
    answer: "Create an account, complete email verification, submit KYC documents, and make your first deposit. The minimum deposit is $50 USDT."
  },
  {
    question: "What cryptocurrencies are supported?",
    answer: "We currently support USDT deposits via ERC20 (Ethereum), TRC20 (Tron), and BEP20 (BSC) networks."
  },
  {
    question: "How are profits calculated?",
    answer: "Profits are calculated based on platform performance and distributed proportionally to your invested capital. Distributions occur automatically."
  },
  {
    question: "How do I withdraw my funds?",
    answer: "Submit a withdrawal request from your dashboard. Requests are processed within 24-48 hours after verification."
  },
  {
    question: "Is my investment secure?",
    answer: "We implement industry-standard security practices including encrypted data storage, secure authentication, and regular security audits."
  },
  {
    question: "How does the referral program work?",
    answer: "Share your unique referral code. When someone signs up and makes their first deposit, you earn a bonus based on your referral tier."
  }
];

// Components
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="border border-surface-800 rounded-2xl overflow-hidden bg-surface-900/50 backdrop-blur-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface-800/50 transition-colors"
      >
        <span className="font-medium text-white pr-4">{question}</span>
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
        <div className="px-6 pb-5 text-surface-400 leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CertificatesMarquee() {
  const [realCertificates, setRealCertificates] = useState<Array<{
    name: string;
    amount: string;
    date: string;
    network: string;
  }>>([]);

  useEffect(() => {
    // Fetch real certificates from API
    fetch('/api/certificates/public?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.certificates && data.certificates.length > 0) {
          const formatted = data.certificates.map((cert: { name: string; amount: number; date: string; network: string }) => ({
            name: cert.name,
            amount: `$${cert.amount.toLocaleString()}`,
            date: cert.date,
            network: cert.network,
          }));
          setRealCertificates(formatted);
        }
      })
      .catch(() => {
        // Use fallback on error
        setRealCertificates(fallbackWithdrawalCertificates);
      });
  }, []);

  const withdrawalCertificates = realCertificates.length > 0 ? realCertificates : fallbackWithdrawalCertificates;

  return (
    <div className="space-y-6">
      {/* Security Certificates Row */}
      <div className="marquee-container overflow-hidden">
        <div className="flex animate-marquee">
          {[...certificates, ...certificates].map((cert, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-3 px-5 py-3.5 bg-surface-900/80 border border-surface-800 rounded-xl flex items-center gap-3 min-w-[220px] hover:border-surface-700 transition-colors"
            >
              <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center">
                <cert.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{cert.name}</p>
                <p className="text-surface-400 text-xs">{cert.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit Share Certificates Row - Gold/Premium styling */}
      <div className="marquee-container overflow-hidden">
        <div className="flex animate-marquee-slow">
          {[...profitShareCertificates, ...profitShareCertificates].map((cert, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-3 px-5 py-4 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-4 min-w-[300px] hover:border-amber-400/50 transition-all profit-cert-glow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm">{cert.name}</p>
                    <BadgeCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-gradient-gold font-bold text-base">{cert.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 text-xs">{cert.period}</span>
                  <span className="text-amber-400 text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">{cert.percentage} ROI</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Payout Certificates Row - Premium design with geometric decoration */}
      <div className="marquee-container overflow-hidden">
        <div className="flex animate-marquee-reverse">
          {[...withdrawalCertificates, ...withdrawalCertificates].map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 mx-3 relative bg-[#0a0a0a] rounded-lg overflow-hidden min-w-[280px] hover:ring-1 hover:ring-cyan-500/30 transition-all"
            >
              {/* Geometric polygon decoration */}
              <div className="absolute left-0 top-0 bottom-0 w-10 overflow-hidden">
                <svg viewBox="0 0 40 100" width="40" height="100" className="h-full w-full" preserveAspectRatio="none">
                  <polygon points="0,0 30,15 20,30 30,45 15,60 28,75 18,90 0,100" fill="#0d4f5a" opacity="0.8"/>
                  <polygon points="0,8 22,23 14,38 24,53 10,68 20,83 0,95" fill="#1a7a8a" opacity="0.6"/>
                  <polygon points="0,18 16,32 10,48 18,64 0,78" fill="#22a5b5" opacity="0.4"/>
                </svg>
              </div>

              <div className="relative p-4 pl-12">
                {/* BLACKROCK branding */}
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded flex items-center justify-center">
                    <Award className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-white text-[10px] font-bold tracking-wider">BLACKROCK</span>
                  <span className="text-cyan-400 text-[8px] tracking-widest ml-1">CERTIFICATE</span>
                </div>

                {/* Content */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium" style={{ fontFamily: "Georgia, serif" }}>{cert.name}</p>
                    <p className="text-surface-500 text-[10px]">{cert.date} via {cert.network}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold text-lg">{cert.amount}</p>
                    <div className="flex items-center justify-end gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Gold seal */}
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-sm">
                    <Award className="w-3 h-3 text-amber-900" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Glow effect behind */}
      <div className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full" />

      {/* Dashboard mockup */}
      <div className="relative bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Browser header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-800/50 border-b border-surface-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-surface-900 rounded-lg text-surface-400 text-xs">
              www.blackrock5.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content mockup */}
        <div className="p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Balance", value: "$12,450.00", change: "+12.5%" },
              { label: "Monthly Profit", value: "$1,245.00", change: "+8.3%" },
              { label: "Active Trades", value: "24", change: "+3" },
              { label: "Total ROI", value: "34.2%", change: "+2.1%" },
            ].map((stat, i) => (
              <div key={i} className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/50">
                <p className="text-surface-400 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-emerald-400 text-xs">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bg-surface-800/30 rounded-xl p-4 border border-surface-700/50 h-48">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-medium">Portfolio Performance</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-brand-500/20 text-brand-400 rounded text-xs">1W</span>
                <span className="px-2 py-1 text-surface-400 rounded text-xs">1M</span>
                <span className="px-2 py-1 text-surface-400 rounded text-xs">1Y</span>
              </div>
            </div>
            {/* Fake chart line */}
            <svg className="w-full h-24" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,80 Q50,70 100,60 T200,40 T300,30 T400,20"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <path
                d="M0,80 Q50,70 100,60 T200,40 T300,30 T400,20 L400,100 L0,100 Z"
                fill="url(#chartGradient)"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-surface-400 hover:text-white transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-surface-400 hover:text-white transition-colors text-sm">How it Works</a>
              <a href="#testimonials" className="text-surface-400 hover:text-white transition-colors text-sm">Testimonials</a>
              <a href="#faq" className="text-surface-400 hover:text-white transition-colors text-sm">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-surface-300 hover:text-white transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link href="/signup">
                <motion.button
                  className="px-4 py-2 bg-white text-surface-900 rounded-lg text-sm font-semibold hover:bg-surface-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="bg-grid absolute inset-0 opacity-30" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-sm mb-6"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trusted by 10,000+ investors worldwide</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
                Build Your{" "}
                <span className="text-gradient bg-gradient-to-r from-brand-400 via-purple-400 to-brand-400">
                  Financial Future
                </span>{" "}
                With Confidence
              </h1>

              <p className="text-lg sm:text-xl text-surface-400 mb-8 max-w-xl leading-relaxed">
                A premium investment platform with real-time tracking, institutional-grade security,
                and transparent operations. Start building wealth today.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12"
              >
                <Link href="/signup">
                  <motion.button
                    className="px-6 py-3 bg-white text-surface-900 rounded-xl text-sm font-semibold hover:bg-surface-100 transition-all shadow-lg shadow-white/10 flex items-center gap-2"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Investing
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="/login" className="group">
                  <motion.button
                    className="px-6 py-3 bg-transparent border border-surface-700 text-white rounded-xl text-sm font-semibold hover:bg-surface-800/50 hover:border-surface-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Dashboard
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-surface-500 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span>KYC Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  <span>Regulated</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-surface-700 rounded-full flex items-start justify-center p-1"
          >
            <motion.div className="w-1.5 h-2.5 bg-surface-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-surface-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {platformStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-14 h-14 bg-surface-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-surface-700/50">
                  <stat.icon className="w-7 h-7 text-brand-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-surface-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certificates Marquee */}
      <section className="py-12 border-b border-surface-800/50 bg-surface-900/30">
        <div className="text-center mb-8">
          <p className="text-surface-500 text-sm uppercase tracking-wider">Trusted & Certified</p>
        </div>
        <CertificatesMarquee />
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-lg">
              Powerful tools and features designed for modern investors
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group bg-surface-900/50 border border-surface-800 rounded-2xl p-6 hover:border-surface-700 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-surface-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-28 sm:py-32 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Start in 4 Simple Steps
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-lg">
              Get started with your investment journey in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-surface-700 to-transparent" />
                )}

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-surface-800 border border-surface-700 rounded-2xl flex items-center justify-center mb-5 relative">
                    <step.icon className="w-8 h-8 text-brand-400" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-surface-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Full Width */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">Platform</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Powerful Dashboard at Your Fingertips
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-lg">
              Monitor your investments with our intuitive, feature-rich dashboard
            </p>
          </motion.div>

          <DashboardPreview />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Loved by Investors Worldwide
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-lg">
              See what our community has to say about their experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6 relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-surface-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-surface-300 leading-relaxed">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-surface-400 text-lg">
              Everything you need to know about the platform
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-surface-400 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of investors who trust BLACKROCK for their financial growth.
            Start with as little as $50.
          </p>
          <Link href="/signup">
            <motion.button
              className="px-8 py-4 bg-white text-surface-900 rounded-xl text-base font-semibold hover:bg-surface-100 transition-all shadow-lg shadow-white/10 inline-flex items-center gap-2"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-surface-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <Logo href="/" />
              <p className="text-surface-400 mt-4 text-sm leading-relaxed max-w-sm">
                A premium investment platform with institutional-grade security,
                transparent operations, and real-time portfolio tracking.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center hover:bg-surface-700 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5 text-surface-400" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-surface-400 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/forgot-password" className="hover:text-white transition-colors">Reset Password</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-surface-400 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-surface-400 text-sm">
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-surface-500 text-sm">
              &copy; {new Date().getFullYear()} BLACKROCK. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
