import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Users,
  TrendingUp,
  FileText,
  Settings,
  MessageCircle,
  LucideIcon,
} from "lucide-react";

export type AdminView =
  | "overview"
  | "deposits"
  | "withdrawals"
  | "kyc"
  | "users"
  | "profit-share"
  | "support"
  | "audit-logs"
  | "settings";

export interface AdminNavItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
  description: string;
  badgeKey?: "pendingDeposits" | "pendingWithdrawals" | "pendingKYC";
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "overview",
    label: "Admin Overview",
    icon: LayoutDashboard,
    description: "Dashboard overview and stats",
  },
  {
    id: "deposits",
    label: "Pending Deposits",
    icon: ArrowDownToLine,
    description: "Review and approve deposits",
    badgeKey: "pendingDeposits",
  },
  {
    id: "withdrawals",
    label: "Pending Withdrawals",
    icon: ArrowUpFromLine,
    description: "Review and approve withdrawals",
    badgeKey: "pendingWithdrawals",
  },
  {
    id: "kyc",
    label: "Pending KYC",
    icon: ShieldCheck,
    description: "Review KYC submissions",
    badgeKey: "pendingKYC",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Manage platform users",
  },
  {
    id: "profit-share",
    label: "Profit Share",
    icon: TrendingUp,
    description: "Manage profit distributions",
  },
  {
    id: "support",
    label: "Support Tickets",
    icon: MessageCircle,
    description: "Manage support tickets",
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    icon: FileText,
    description: "View system audit logs",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Platform configuration settings",
  },
];
