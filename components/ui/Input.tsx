'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      prefix,
      suffix,
      size = 'md',
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const hasLeftAddon = icon && iconPosition === 'left';
    const hasRightAddon = (icon && iconPosition === 'right') || isPassword;

    return (
      <div className={`${className}`}>
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">{label}</label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 text-sm font-medium">
              {prefix}
            </div>
          )}
          {hasLeftAddon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={`
              w-full rounded-lg border
              bg-white dark:bg-surface-900
              text-surface-900 dark:text-white
              placeholder-surface-400 dark:placeholder-surface-500
              shadow-soft-sm focus:shadow-soft
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600'}
              ${sizeClasses[size]}
              ${prefix ? 'pl-8' : ''}
              ${hasLeftAddon ? 'pl-10' : ''}
              ${hasRightAddon ? 'pr-10' : ''}
              ${suffix ? 'pr-12' : ''}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 text-sm">
              {suffix}
            </div>
          )}
          {hasRightAddon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400">
              {icon}
            </div>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-500 dark:text-red-400' : 'text-surface-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
