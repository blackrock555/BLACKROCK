'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  href?: string;
  children: ReactNode;
  animate?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-brand-600 to-brand-500
    hover:from-brand-500 hover:to-brand-400
    text-white font-semibold
    shadow-md hover:shadow-lg
    active:shadow-sm active:from-brand-700 active:to-brand-600
    disabled:from-brand-500/50 disabled:to-brand-400/50 disabled:shadow-none
    border border-brand-500/20
  `,
  secondary: `
    bg-surface-100 dark:bg-surface-800
    hover:bg-surface-200 dark:hover:bg-surface-700
    text-surface-700 dark:text-surface-100 font-medium
    border border-surface-300 dark:border-surface-700
    hover:border-surface-400 dark:hover:border-surface-600
    shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-lg
    active:bg-surface-200 dark:active:bg-surface-800
    disabled:bg-surface-100/50 dark:disabled:bg-surface-800/50 disabled:text-surface-400 disabled:border-surface-200
  `,
  ghost: `
    bg-transparent
    hover:bg-surface-100 dark:hover:bg-surface-800
    text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white
    font-medium
    active:bg-surface-200 dark:active:bg-surface-700
    disabled:text-surface-400 dark:disabled:text-surface-600 disabled:hover:bg-transparent
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-500
    hover:from-red-500 hover:to-red-400
    text-white font-semibold
    shadow-md hover:shadow-lg
    active:shadow-sm active:from-red-700 active:to-red-600
    disabled:from-red-500/50 disabled:to-red-400/50 disabled:shadow-none
    border border-red-500/20
  `,
  outline: `
    bg-transparent
    border-2 border-brand-500
    text-brand-600 dark:text-brand-400 font-semibold
    hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-600 dark:hover:border-brand-400
    hover:text-brand-700 dark:hover:text-brand-300
    active:bg-brand-100 dark:active:bg-brand-500/20
    disabled:border-brand-300 dark:disabled:border-brand-500/30 disabled:text-brand-400 dark:disabled:text-brand-500/30 disabled:hover:bg-transparent
  `,
  gradient: `
    bg-gradient-to-r from-brand-600 via-purple-500 to-brand-500
    hover:from-brand-500 hover:via-purple-400 hover:to-brand-400
    text-white font-semibold
    shadow-lg hover:shadow-xl
    active:shadow-md
    disabled:opacity-50 disabled:shadow-none
    border border-white/10
    bg-[length:200%_100%] hover:bg-[position:100%_0]
    transition-all duration-500
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md',
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2 rounded-xl',
  xl: 'px-8 py-4 text-lg gap-3 rounded-xl',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      href,
      children,
      className = '',
      disabled,
      animate = true,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-950
      disabled:cursor-not-allowed disabled:pointer-events-none
      select-none
    `;

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
      fullWidth ? 'w-full' : ''
    } ${className}`.replace(/\s+/g, ' ').trim();

    const iconClass = iconSizeClasses[size];

    const content = (
      <>
        {isLoading ? (
          <Loader2 className={`${iconClass} animate-spin`} />
        ) : (
          icon && iconPosition === 'left' && (
            <span className={`flex-shrink-0 ${iconClass} [&>svg]:w-full [&>svg]:h-full`}>
              {icon}
            </span>
          )
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className={`flex-shrink-0 ${iconClass} [&>svg]:w-full [&>svg]:h-full`}>
            {icon}
          </span>
        )}
      </>
    );

    const motionProps = animate ? {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { type: 'spring' as const, stiffness: 400, damping: 17 }
    } : {};

    if (href && !disabled) {
      return (
        <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
          <Link href={href} className={classes}>
            {content}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref as any}
        className={classes}
        disabled={disabled || isLoading}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant for compact actions
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconPosition'> {
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const sizeMap: Record<ButtonSize, string> = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-2.5',
      xl: 'p-3',
    };

    return (
      <Button
        ref={ref}
        size={size}
        icon={icon}
        className={`${sizeMap[size]} !gap-0 ${className}`}
        {...props}
      >
        <span className="sr-only">{props['aria-label']}</span>
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
