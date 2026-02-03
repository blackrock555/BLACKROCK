"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogoIcon } from "@/components/branding/Logo";
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Users,
  TrendingUp,
  HandCoins,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/deposits", label: "Pending Deposits", icon: ArrowDownToLine },
  { href: "/admin/withdrawals", label: "Pending Withdrawals", icon: ArrowUpFromLine },
  { href: "/admin/kyc", label: "Pending KYC", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/profit-share", label: "Profit Share", icon: TrendingUp },
  { href: "/admin/custom-profit", label: "Custom Profit", icon: HandCoins },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Redirect non-admins
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    router.push("/login");
    return null;
  }

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-brand-600 text-white"
            : "text-surface-400 hover:bg-surface-800 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-surface-900 border-r border-surface-800 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-800">
          {!isCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <LogoIcon size="sm" />
              <span className="font-bold text-surface-900 dark:text-white">BLACK<span className="text-brand-400">ROCK</span></span>
              <span className="text-surface-400 text-sm">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-surface-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Back to App</span>}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-900 border-b border-surface-800 flex items-center justify-between px-4 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoIcon size="sm" />
          <span className="font-bold text-white">BLACK<span className="text-brand-400">ROCK</span></span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-800 text-surface-400"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-surface-900 border-r border-surface-800 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-surface-800">
              <Link
                href="/admin"
                className="flex items-center gap-2"
                onClick={() => setIsMobileOpen(false)}
              >
                <LogoIcon size="sm" />
                <span className="font-bold text-surface-900 dark:text-white">BLACK<span className="text-brand-400">ROCK</span></span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-800 text-surface-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
            <div className="p-3 border-t border-surface-800">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to App</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:p-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
