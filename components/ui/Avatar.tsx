"use client";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-gradient-to-br from-brand-500 to-brand-600
        flex items-center justify-center
        text-white font-semibold
        ring-2 ring-white dark:ring-surface-900
        shadow-sm
        ${className}
      `}
      aria-label={`${name}'s avatar`}
    >
      {initials}
    </div>
  );
}
