"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValues, setLocalValues] = useState<string[]>(
    value.split("").concat(Array(length).fill("")).slice(0, length)
  );

  useEffect(() => {
    // Update local values when external value changes
    setLocalValues(
      value.split("").concat(Array(length).fill("")).slice(0, length)
    );
  }, [value, length]);

  useEffect(() => {
    // Auto focus first input
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newValues = [...localValues];
    newValues[index] = digit;
    setLocalValues(newValues);

    const newOtp = newValues.join("");
    onChange(newOtp);

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (localValues[index]) {
        // Clear current input
        handleChange(index, "");
      } else if (index > 0) {
        // Move to previous input and clear it
        focusInput(index - 1);
        handleChange(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      handleChange(index, "");
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);

    if (pastedData) {
      const newValues = pastedData.split("").concat(Array(length).fill("")).slice(0, length);
      setLocalValues(newValues);
      onChange(pastedData);

      // Focus the input after the last pasted digit
      const focusIndex = Math.min(pastedData.length, length - 1);
      focusInput(focusIndex);
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={localValues[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-bold rounded-lg
            bg-surface-800 border-2 text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand-500/50
            ${disabled
              ? "opacity-50 cursor-not-allowed border-surface-700"
              : "border-surface-600 hover:border-surface-500 focus:border-brand-500"
            }
          `}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default OTPInput;
