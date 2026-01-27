'use client';

import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = 'Select an option',
      size = 'md',
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-1.5">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full rounded-lg border bg-surface-900 text-white
              appearance-none cursor-pointer
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-surface-700 hover:border-surface-600'}
              ${sizeClasses[size]}
              ${icon ? 'pl-10' : ''}
              pr-10
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-400' : 'text-surface-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
