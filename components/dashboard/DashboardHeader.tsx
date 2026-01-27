"use client";

import { Avatar, ThemeToggle } from "@/components/ui";
import { Bell, Search, Menu, ChevronDown } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-surface-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  Overview &amp; Analytics
                </p>
              </div>
            </div>
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search..."
                className="input pl-10 py-2 text-sm bg-surface-100 dark:bg-surface-800 border-transparent focus:bg-white dark:focus:bg-surface-900"
              />
            </div>
          </div>

          {/* Right side - Actions and Avatar */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors md:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-950" />
            </button>

            <ThemeToggle />

            <div className="hidden sm:block w-px h-6 bg-surface-200 dark:bg-surface-800 mx-1" />

            <button
              className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="User menu"
            >
              <Avatar name={userName} size="sm" />
              <span className="hidden lg:block text-sm font-medium text-surface-900 dark:text-white max-w-[120px] truncate">
                {userName}
              </span>
              <ChevronDown className="hidden lg:block w-4 h-4 text-surface-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
