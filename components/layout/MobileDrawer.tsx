'use client';

import { useEffect, useCallback, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Layers, ArrowDownToLine, ArrowUpFromLine, History, Users, Settings, LogOut, ChevronRight, Award, Smartphone, Download, CheckCircle, Share, HelpCircle, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';
import { signOut, useSession } from 'next-auth/react';
import FocusTrap from 'focus-trap-react';
import { ADMIN_NAV_ITEMS, AdminView } from '@/lib/adminNavConfig';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Plans', href: '/plans', icon: <Layers className="w-5 h-5" /> },
  { label: 'Deposit', href: '/deposit', icon: <ArrowDownToLine className="w-5 h-5" /> },
  { label: 'Withdraw', href: '/withdraw', icon: <ArrowUpFromLine className="w-5 h-5" /> },
  { label: 'Transactions', href: '/transactions', icon: <History className="w-5 h-5" /> },
  { label: 'Certificates', href: '/certificates', icon: <Award className="w-5 h-5" /> },
  { label: 'Affiliate', href: '/affiliate', icon: <Users className="w-5 h-5" /> },
  { label: 'FAQ', href: '/faq', icon: <HelpCircle className="w-5 h-5" /> },
  { label: 'Support', href: '/support', icon: <MessageCircle className="w-5 h-5" /> },
  { label: 'Get App', href: '/download', icon: <Smartphone className="w-5 h-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

interface AdminStats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileDrawerContent({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const currentAdminView = searchParams.get('admin') as AdminView | null;

  // Fetch admin stats for badges
  useEffect(() => {
    if (isAdmin && isOpen) {
      fetch('/api/admin/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) {
            setAdminStats({
              pendingDeposits: data.stats.pendingDeposits || 0,
              pendingWithdrawals: data.stats.pendingWithdrawals || 0,
              pendingKYC: data.stats.pendingKYC || 0,
            });
          }
        })
        .catch(console.error);
    }
  }, [isAdmin, isOpen]);

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname, searchParams]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleAdminNavClick = (viewId: AdminView) => {
    router.push(`/dashboard?admin=${viewId}`);
    onClose();
  };

  const getBadgeCount = (badgeKey?: 'pendingDeposits' | 'pendingWithdrawals' | 'pendingKYC'): number => {
    if (!badgeKey || !adminStats) return 0;
    return adminStats[badgeKey] || 0;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <FocusTrap>
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700/50">
                <Logo size="lg" href="/dashboard" />
                <motion.button
                  onClick={onClose}
                  className="p-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const isDashboardActive = item.href === '/dashboard' && pathname === '/dashboard' && !currentAdminView;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`
                          flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl
                          transition-all duration-200
                          ${(item.href === '/dashboard' ? isDashboardActive : isActive)
                            ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20'
                            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/80'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={(item.href === '/dashboard' ? isDashboardActive : isActive) ? 'text-brand-500 dark:text-brand-400' : 'text-surface-500'}>
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-brand-500/20 text-brand-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {(item.href === '/dashboard' ? isDashboardActive : isActive) && <ChevronRight className="w-4 h-4 text-brand-400" />}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Admin Navigation Section */}
                {isAdmin && (
                  <>
                    {/* Admin Nav Items */}
                    {ADMIN_NAV_ITEMS.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = currentAdminView === item.id;
                      const badgeCount = getBadgeCount(item.badgeKey);

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (navItems.length + 1 + index) * 0.05 }}
                        >
                          <button
                            onClick={() => handleAdminNavClick(item.id)}
                            className={`
                              flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl w-full text-left
                              transition-all duration-200
                              ${isActive
                                ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20'
                                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800/80'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isActive ? 'text-brand-500 dark:text-brand-400' : 'text-surface-500'}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {badgeCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full min-w-[20px] text-center">
                                  {badgeCount}
                                </span>
                              )}
                              {isActive && <ChevronRight className="w-4 h-4 text-brand-400" />}
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-surface-200 dark:border-surface-700/50 space-y-2">
                {/* Install App Section */}
                {isInstalled ? (
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <span className="font-medium block">App Installed</span>
                        <span className="text-[10px] text-emerald-400/70">You're using the app</span>
                      </div>
                    </div>
                  </div>
                ) : canInstall ? (
                  <motion.button
                    onClick={install}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all w-full"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" />
                      <div className="text-left">
                        <span className="font-medium block">Install App</span>
                        <span className="text-[10px] text-emerald-400/70">Add to home screen</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4" />
                  </motion.button>
                ) : isIOS ? (
                  <>
                    <motion.button
                      onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 hover:from-emerald-500/20 hover:to-cyan-500/20 transition-all w-full"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5" />
                        <div className="text-left">
                          <span className="font-medium block">Install App</span>
                          <span className="text-[10px] text-emerald-400/70">Add to home screen</span>
                        </div>
                      </div>
                      <Share className="w-4 h-4" />
                    </motion.button>
                    {showIOSInstructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-3 bg-surface-100 dark:bg-surface-800 rounded-lg text-sm text-surface-600 dark:text-surface-400"
                      >
                        <p className="font-medium mb-2">To install on iOS:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Tap the <Share className="w-3 h-3 inline" /> Share button</li>
                          <li>Scroll and tap "Add to Home Screen"</li>
                          <li>Tap "Add" to confirm</li>
                        </ol>
                      </motion.div>
                    )}
                  </>
                ) : null}

                <div className="px-4 py-2">
                  <p className="text-xs text-surface-500 uppercase tracking-wider">Account</p>
                </div>
                <motion.button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.aside>
          </FocusTrap>
        </div>
      )}
    </AnimatePresence>
  );
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <Suspense fallback={null}>
      <MobileDrawerContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}
