// Re-export all types
export * from './next-auth';

// Common types used across the application

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'PROFIT_SHARE' | 'REFERRAL_REWARD' | 'ADMIN_ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type KYCStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface DashboardStats {
  balance: number;
  depositBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfitShare: number;
  totalReferralRewards: number;
  roi: number;
}

export interface AdminDashboardStats {
  totalApprovedDeposits: number;
  totalApprovedWithdrawals: number;
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalProfitSharePaid: number;
}
