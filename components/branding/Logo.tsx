'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  href?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

export function Logo({ size = 'md', showIcon = true, href, className = '' }: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[size]} relative`}>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-brand-500/20 blur-md rounded-lg" />

          {/* BLACKROCK Icon - Modern shield/monogram design */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10"
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="logoGradientPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="logoGradientSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3730a3" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Shield base shape */}
            <path
              d="M20 2L36 10V22C36 30 28 37 20 38C12 37 4 30 4 22V10L20 2Z"
              fill="url(#logoGradientPrimary)"
              filter="url(#logoGlow)"
            />

            {/* Inner shield layer */}
            <path
              d="M20 6L32 12V22C32 28 26 33 20 34C14 33 8 28 8 22V12L20 6Z"
              fill="url(#logoGradientSecondary)"
              opacity="0.7"
            />

            {/* BR Monogram - Stylized */}
            <text
              x="20"
              y="26"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontSize="14"
              fontWeight="bold"
              fill="white"
              opacity="0.95"
            >
              BR
            </text>

            {/* Top highlight */}
            <path
              d="M10 12L20 6L30 12"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />

            {/* Side accent lines */}
            <path
              d="M8 14V20"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.2"
            />
            <path
              d="M32 14V20"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.2"
            />
          </svg>
        </div>
      )}
      <span className={`font-bold tracking-tight ${sizeClasses[size]} text-surface-900 dark:text-white`}>
        BLACK<span className="text-brand-400">ROCK</span>
      </span>
    </div>
  );

  // Only wrap in Link if href is provided and not empty
  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

// Standalone icon component
export function LogoIcon({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <div className={`${iconSizes[size]} ${className} relative`}>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-brand-500/20 blur-md rounded-lg" />

      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <defs>
          <linearGradient id="logoIconGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="logoIconGradientInner" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3730a3" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {/* Shield base */}
        <path
          d="M20 2L36 10V22C36 30 28 37 20 38C12 37 4 30 4 22V10L20 2Z"
          fill="url(#logoIconGradientMain)"
        />
        {/* Inner shield */}
        <path
          d="M20 6L32 12V22C32 28 26 33 20 34C14 33 8 28 8 22V12L20 6Z"
          fill="url(#logoIconGradientInner)"
          opacity="0.7"
        />
        {/* BR Monogram */}
        <text
          x="20"
          y="26"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="bold"
          fill="white"
          opacity="0.95"
        >
          BR
        </text>
      </svg>
    </div>
  );
}
