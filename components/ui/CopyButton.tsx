'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function CopyButton({
  value,
  className = '',
  size = 'md',
  showLabel = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5 rounded-lg
        bg-surface-800 hover:bg-surface-700
        text-surface-400 hover:text-white
        transition-colors duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className={`${iconSizes[size]} text-emerald-400`} />
      ) : (
        <Copy className={iconSizes[size]} />
      )}
      {showLabel && (
        <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
      )}
    </button>
  );
}

// Variant with full text display
export function CopyableText({
  value,
  displayValue,
  className = '',
}: {
  value: string;
  displayValue?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        bg-surface-800 hover:bg-surface-700
        text-surface-300 hover:text-white
        transition-colors duration-200 text-left
        ${className}
      `}
    >
      <span className="font-mono text-sm truncate flex-1">
        {displayValue || value}
      </span>
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      ) : (
        <Copy className="w-4 h-4 flex-shrink-0" />
      )}
    </button>
  );
}
