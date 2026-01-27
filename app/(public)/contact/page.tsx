'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/branding/Logo';
import { Button, Input, Select, Alert } from '@/components/ui';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Clock,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Globe,
  Shield,
} from 'lucide-react';

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'account', label: 'Account Issues' },
  { value: 'deposits', label: 'Deposits' },
  { value: 'withdrawals', label: 'Withdrawals' },
  { value: 'kyc', label: 'KYC Verification' },
  { value: 'security', label: 'Security Concerns' },
  { value: 'referrals', label: 'Referral Program' },
  { value: 'technical', label: 'Technical Issues' },
  { value: 'other', label: 'Other' },
];

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return undefined;
      case 'category':
        if (!value) return 'Please select a category';
        return undefined;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length < 20) return 'Message must be at least 20 characters';
        return undefined;
      default:
        return undefined;
    }
  }, []);

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (['name', 'email', 'category', 'message'] as const).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({ name: true, email: true, category: true, message: true });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
      setTouched({});
      setErrors({});
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <Logo href="/" />
            <Link href="/help-center">
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help Center</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/10 rounded-2xl mb-6 border border-brand-500/20"
            >
              <MessageSquare className="w-8 h-8 text-brand-400" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              Have a question or need assistance? Fill out the form below and our support team will get back to you as soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-surface-800/50 border border-surface-700/50 rounded-2xl p-6 hover:border-brand-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                <p className="text-surface-400 text-sm mb-3">
                  Send us an email and we'll respond within 24-48 hours.
                </p>
                <p className="text-brand-400 text-sm font-medium">support@blackrock.com</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-surface-800/50 border border-surface-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
                <p className="text-surface-400 text-sm mb-3">
                  Our team is available during business hours.
                </p>
                <p className="text-surface-300 text-sm">Mon - Fri: 9:00 AM - 6:00 PM (UTC)</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-surface-800/50 border border-surface-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Global Support</h3>
                <p className="text-surface-400 text-sm mb-3">
                  We support users worldwide in multiple languages.
                </p>
                <p className="text-surface-300 text-sm">English, Spanish, French, German</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-2xl p-6"
              >
                <div className="w-10 h-10 bg-brand-500/20 rounded-lg flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Help Center</h3>
                <p className="text-surface-400 text-sm mb-4">
                  Check our help center for instant answers to common questions.
                </p>
                <Link href="/help-center" className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors group">
                  Browse Help Articles
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-surface-800/50 border border-surface-700 rounded-2xl p-8">
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                    <p className="text-surface-400 mb-6">
                      Thank you for contacting us. We'll get back to you within 24-48 hours.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => setSubmitStatus('idle')}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <Input
                          label="Full Name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          error={touched.name ? errors.name : undefined}
                        />
                      </div>
                      <div>
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          error={touched.email ? errors.email : undefined}
                        />
                      </div>
                    </div>

                    <div>
                      <Select
                        label="Category"
                        options={categories}
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        onBlur={() => handleBlur('category')}
                        error={touched.category ? errors.category : undefined}
                      />
                    </div>

                    <Input
                      label="Subject (Optional)"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                    />

                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        placeholder="Describe your question or issue in detail (minimum 20 characters)..."
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        rows={5}
                        className={`w-full px-4 py-3 bg-surface-900/50 border rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none transition-colors ${
                          touched.message && errors.message
                            ? 'border-red-500/50 focus:border-red-500/50'
                            : 'border-surface-700 focus:border-brand-500/50'
                        }`}
                      />
                      <AnimatePresence>
                        {touched.message && errors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-1.5 text-sm text-red-400"
                          >
                            {errors.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <p className="mt-1.5 text-xs text-surface-500">
                        {formData.message.length}/20 characters minimum
                      </p>
                    </div>

                    <div className="bg-surface-800/30 border border-surface-700/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-surface-300">
                            Your information is secure and will only be used to respond to your inquiry.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isSubmitting}
                      icon={<Send className="w-5 h-5" />}
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-surface-800 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} BLACKROCK. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-surface-400 text-sm">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
