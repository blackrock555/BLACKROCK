'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Users,
  Settings,
  ChevronLeft,
  LogOut,
  Award,
  HelpCircle,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { Logo, LogoIcon } from '@/components/branding/Logo';
import { signOut } from 'next-auth/react';
import { ADMIN_NAV_ITEMS, AdminView } from '@/lib/adminNavConfig';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
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

interface SidebarProps {
  className?: string;
}

function SidebarContent({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const currentAdminView = searchParams.get('admin') as AdminView | null;

  // Fetch admin stats for badges
  useEffect(() => {
    if (isAdmin) {
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
  }, [isAdmin]);

  const handleAdminNavClick = (viewId: AdminView) => {
    router.push(`/dashboard?admin=${viewId}`);
  };

  const getBadgeCount = (badgeKey?: 'pendingDeposits' | 'pendingWithdrawals' | 'pendingKYC'): number => {
    if (!badgeKey || !adminStats) return 0;
    return adminStats[badgeKey] || 0;
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
        shadow-sm dark:shadow-none
        transition-all duration-300
        ${className}
      `}
    >
      {/* Logo */}
      <div className={`p-4 ${isCollapsed ? 'px-4' : 'px-5'}`}>
        {isCollapsed ? (
          <LogoIcon size="lg" />
        ) : (
          <Logo size="lg" href="/dashboard" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isDashboardActive = item.href === '/dashboard' && pathname === '/dashboard' && !currentAdminView;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors duration-200
                ${(item.href === '/dashboard' ? isDashboardActive : isActive)
                  ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="font-medium text-sm flex-1">{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* Admin Navigation Section */}
        {isAdmin && (
          <>
            {/* Admin Nav Items */}
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentAdminView === item.id;
              const badgeCount = getBadgeCount(item.badgeKey);

              return (
                <button
                  key={item.id}
                  onClick={() => handleAdminNavClick(item.id)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full min-w-[20px] text-center">
                          {badgeCount}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && badgeCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-700/50">
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800
            transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
          {!isCollapsed && <span className="font-medium text-sm">Collapse</span>}
        </button>

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mt-1
            text-red-400 hover:text-red-300 hover:bg-red-500/10
            transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({ className = '' }: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className={`hidden lg:flex flex-col w-64 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 ${className}`}>
        <div className="p-4 px-5 animate-pulse">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-32"></div>
        </div>
      </aside>
    }>
      <SidebarContent className={className} />
    </Suspense>
  );
}
