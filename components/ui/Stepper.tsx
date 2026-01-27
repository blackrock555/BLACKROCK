'use client';

import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface Step {
  id?: string | number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: (Step | string)[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

// Normalize steps to always have id and label
function normalizeSteps(steps: (Step | string)[]): Step[] {
  return steps.map((step, index) => {
    if (typeof step === 'string') {
      return { id: index, label: step };
    }
    return { ...step, id: step.id ?? index };
  });
}

export function Stepper({ steps, currentStep, completedSteps, className = '' }: StepperProps) {
  const normalizedSteps = normalizeSteps(steps);

  const isStepCompleted = (index: number) => {
    if (completedSteps) {
      return completedSteps.includes(index + 1);
    }
    return index < currentStep - 1;
  };

  const isStepCurrent = (index: number) => {
    return index === currentStep - 1;
  };

  return (
    <div className={className}>
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between">
        {normalizedSteps.map((step, index) => {
          const isCompleted = isStepCompleted(index);
          const isCurrent = isStepCurrent(index);

          return (
            <div key={`step-${step.id}-${index}`} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step indicator */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors
                    ${isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-800 text-surface-400 border border-surface-700'
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent || isCompleted ? 'text-white' : 'text-surface-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-surface-500 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < normalizedSteps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 -mt-8
                    ${isCompleted ? 'bg-emerald-500' : 'bg-surface-700'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          {normalizedSteps.map((step, index) => {
            const isCompleted = isStepCompleted(index);
            const isCurrent = isStepCurrent(index);

            return (
              <div
                key={`mobile-step-${step.id}-${index}`}
                className={`
                  flex-1 h-1 rounded-full transition-colors
                  ${isCompleted
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-brand-500'
                      : 'bg-surface-700'
                  }
                `}
              />
            );
          })}
        </div>
        <p className="text-sm text-surface-400">
          Step {currentStep} of {normalizedSteps.length}:{' '}
          <span className="text-white font-medium">{normalizedSteps[currentStep - 1]?.label}</span>
        </p>
      </div>
    </div>
  );
}

// Step content wrapper
export function StepContent({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) {
  if (!isActive) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {children}
    </div>
  );
}
