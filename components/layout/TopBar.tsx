'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Check,
  CheckCheck,
  Trash2,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Gift,
  Shield,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { KYCBadge } from '@/components/ui/Badge';
import { useNotifications, type NotificationType } from '@/contexts/NotificationContext';

interface TopBarProps {
  onMenuClick?: () => void;
  className?: string;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  deposit_pending: <ArrowDownToLine className="w-4 h-4" />,
  deposit_approved: <ArrowDownToLine className="w-4 h-4" />,
  deposit_rejected: <ArrowDownToLine className="w-4 h-4" />,
  withdrawal_pending: <ArrowUpFromLine className="w-4 h-4" />,
  withdrawal_approved: <ArrowUpFromLine className="w-4 h-4" />,
  withdrawal_rejected: <ArrowUpFromLine className="w-4 h-4" />,
  reward_received: <Gift className="w-4 h-4" />,
  profit_share: <TrendingUp className="w-4 h-4" />,
  kyc_approved: <Shield className="w-4 h-4" />,
  kyc_rejected: <Shield className="w-4 h-4" />,
  referral_bonus: <Gift className="w-4 h-4" />,
  system: <AlertCircle className="w-4 h-4" />,
  welcome: <Sparkles className="w-4 h-4" />,
};

const notificationColors: Record<NotificationType, string> = {
  deposit_pending: "bg-amber-500/10 text-amber-500",
  deposit_approved: "bg-emerald-500/10 text-emerald-500",
  deposit_rejected: "bg-red-500/10 text-red-500",
  withdrawal_pending: "bg-amber-500/10 text-amber-500",
  withdrawal_approved: "bg-emerald-500/10 text-emerald-500",
  withdrawal_rejected: "bg-red-500/10 text-red-500",
  reward_received: "bg-purple-500/10 text-purple-500",
  profit_share: "bg-cyan-500/10 text-cyan-500",
  kyc_approved: "bg-emerald-500/10 text-emerald-500",
  kyc_rejected: "bg-red-500/10 text-red-500",
  referral_bonus: "bg-purple-500/10 text-purple-500",
  system: "bg-blue-500/10 text-blue-500",
  welcome: "bg-brand-500/10 text-brand-500",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function TopBar({ onMenuClick, className = '' }: TopBarProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const user = session?.user;

  return (
    <header
      className={`
        sticky top-0 z-40
        flex items-center justify-between gap-4
        px-4 sm:px-6 py-3
        bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl
        border-b border-surface-200 dark:border-surface-800
        shadow-sm dark:shadow-none
        ${className}
      `}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title or breadcrumbs could go here */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* KYC Status Badge */}
        {user && (
          <Link href="/settings?tab=kyc" className="hidden sm:block">
            <KYCBadge status={user.kycStatus} />
          </Link>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl shadow-xl dark:shadow-elevation-2 z-50 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-surface-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-brand-500/10 text-brand-500 text-xs font-medium rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className="p-1.5 text-surface-500 hover:text-brand-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllNotifications();
                        }}
                        className="p-1.5 text-surface-500 hover:text-red-500 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                        title="Clear all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications list */}
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-surface-400" />
                      </div>
                      <p className="text-surface-500 dark:text-surface-400 text-sm">
                        No notifications yet
                      </p>
                      <p className="text-surface-400 dark:text-surface-500 text-xs mt-1">
                        You'll see updates about your activity here
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer group ${
                            !notification.read ? "bg-brand-500/5" : ""
                          }`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification._id);
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            {/* Icon */}
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                notificationColors[notification.type] || "bg-surface-100 dark:bg-surface-700 text-surface-500"
                              }`}
                            >
                              {notificationIcons[notification.type] || <Bell className="w-4 h-4" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium ${!notification.read ? "text-surface-900 dark:text-white" : "text-surface-700 dark:text-surface-300"}`}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-brand-500 rounded-full" />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification._id);
                                    }}
                                    className="p-1 text-surface-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-surface-400 dark:text-surface-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                {notification.amount && (
                                  <span className="text-[10px] font-medium text-emerald-500">
                                    ${notification.amount.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-surface-200 dark:border-surface-700/50">
                    <Link
                      href="/settings?tab=notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block w-full text-center text-sm text-brand-500 hover:text-brand-600 font-medium"
                    >
                      Notification Settings
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 sm:pr-3 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <span className="hidden sm:block text-sm font-medium max-w-32 truncate">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="hidden sm:block w-4 h-4 text-surface-500 dark:text-surface-400" />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl shadow-xl dark:shadow-elevation-2 z-50 overflow-hidden">
                <div className="p-3 border-b border-surface-200 dark:border-surface-700/50">
                  <p className="font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <Link
                    href="/settings?tab=kyc"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm">Verification</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>
                <div className="p-1.5 border-t border-surface-200 dark:border-surface-700/50">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
