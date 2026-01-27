'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-surface-900 border border-surface-800 rounded-xl shadow-xl
          animate-in fade-in slide-in-from-bottom-4 duration-300
          max-h-[90vh] overflow-hidden flex flex-col
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-surface-800">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-surface-400">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// Modal footer component for actions
export function ModalFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        flex flex-col-reverse sm:flex-row sm:justify-end gap-3
        pt-4 mt-4 border-t border-surface-800
        ${className}
      `}
    >
      {children}
    </div>
  );
}
