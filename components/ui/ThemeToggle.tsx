"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ showLabel = false, size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme, resolvedTheme, mounted } = useTheme();

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-surface-800/50`}>
        <div className={`${iconSizes[size]} animate-pulse bg-surface-700 rounded`} />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative ${sizeClasses[size]} rounded-xl
        bg-surface-100 dark:bg-surface-800
        hover:bg-surface-200 dark:hover:bg-surface-700
        border border-surface-200 dark:border-surface-700
        text-surface-600 dark:text-surface-300
        hover:text-surface-900 dark:hover:text-white
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-500/50
        ${showLabel ? 'flex items-center gap-2' : ''}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: -10, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Sun className={iconSizes[size]} />
          ) : (
            <Moon className={iconSizes[size]} />
          )}
        </motion.div>
      </AnimatePresence>
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </motion.button>
  );
}

// Advanced theme selector with system option
export function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className="flex gap-1 p-1 rounded-xl bg-surface-800/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-8 h-8 rounded-lg bg-surface-700 animate-pulse" />
        ))}
      </div>
    );
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
      {options.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative px-3 py-1.5 rounded-lg text-sm font-medium
            flex items-center gap-1.5
            transition-colors duration-200
            ${theme === value
              ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm"
              : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={`Use ${label} theme`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
