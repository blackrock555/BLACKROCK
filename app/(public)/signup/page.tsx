'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { User, Mail, Lock, Gift, Loader2 } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';
import { Button, Input, Alert } from '@/components/ui';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: refCode,
    agreeTerms: false,
  });

  const handleContinue = () => {
    setError(null);
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-surface-950 to-surface-950" />

        <div className="relative w-full max-w-md">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-surface-400 mb-6">
              We've sent a verification link to <strong className="text-white">{formData.email}</strong>.
              Please click the link to verify your account.
            </p>
            <Button href="/login" variant="primary" fullWidth>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-surface-950 to-surface-950" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="xl" href="/" />
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">Create Account</h1>
            <p className="text-surface-400 mt-1">Start your investment journey</p>
          </div>

          {/* Error message */}
          {error && (
            <Alert variant="danger" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Referral notice */}
          {refCode && (
            <Alert variant="info" className="mb-6">
              You were referred by a friend! You'll both receive bonus rewards.
            </Alert>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-4
              bg-white dark:bg-surface-800
              border border-surface-200 dark:border-surface-700
              rounded-xl font-medium text-sm
              text-surface-700 dark:text-surface-200
              hover:bg-surface-50 dark:hover:bg-surface-700
              focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-surface-900
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-xs text-surface-500 uppercase">or sign up with email</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4" />}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleContinue}
                  className="mt-6"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 8 characters"
                  icon={<Lock className="w-4 h-4" />}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Must contain uppercase, lowercase, and number"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  icon={<Lock className="w-4 h-4" />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />

                <Input
                  label="Referral Code (Optional)"
                  type="text"
                  placeholder="Enter referral code"
                  icon={<Gift className="w-4 h-4" />}
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                />

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-surface-700 bg-surface-800 text-brand-500 focus:ring-brand-500/50"
                  />
                  <span className="text-sm text-surface-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-brand-400 hover:text-brand-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-brand-400 hover:text-brand-300">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  className="mt-6"
                >
                  Create Account
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="w-full text-center text-sm text-surface-400 hover:text-surface-300 transition-colors mt-2"
                >
                  Back to previous step
                </button>
              </>
            )}
          </form>

          {/* Login link */}
          <p className="text-center text-surface-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Risk Warning */}
        <p className="text-center text-surface-500 text-xs mt-6 px-4">
          Investment involves risk. Past performance does not guarantee future results.
          Only invest what you can afford to lose.
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
