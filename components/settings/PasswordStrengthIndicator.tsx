"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements: Requirement[] = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "One lowercase letter", met: /[a-z]/.test(password) },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One number", met: /[0-9]/.test(password) },
      { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (metCount === 3) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (metCount === 4) return { level: 3, label: "Good", color: "bg-yellow-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-surface-400">Password Strength</span>
          <span
            className={`font-medium ${
              strength.level === 1
                ? "text-red-400"
                : strength.level === 2
                ? "text-orange-400"
                : strength.level === 3
                ? "text-yellow-400"
                : strength.level === 4
                ? "text-green-400"
                : "text-surface-500"
            }`}
          >
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`flex-1 rounded-full transition-all duration-300 ${
                level <= strength.level ? strength.color : "bg-surface-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs ${
              req.met ? "text-green-400" : "text-surface-500"
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordStrengthIndicator;
