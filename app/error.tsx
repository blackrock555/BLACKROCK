'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (without sensitive details)
    console.error('Application error:', error.digest || 'Unknown error');
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong
        </h1>

        <p className="text-surface-400 mb-6">
          We encountered an unexpected error. Our team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
          >
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-surface-800 hover:bg-surface-700 text-white font-medium rounded-xl transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-surface-600 text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
