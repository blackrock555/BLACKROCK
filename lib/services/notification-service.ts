import { connectDB } from "@/lib/db/connect";
import { Notification, type NotificationType } from "@/lib/db/models";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  await connectDB();

  const notification = await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    amount: params.amount,
    metadata: params.metadata,
    read: false,
  });

  return notification;
}

// Helper functions for common notification types
export async function notifyDepositPending(userId: string, amount: number, network: string) {
  return createNotification({
    userId,
    type: "deposit_pending",
    title: "Deposit Submitted",
    message: `Your deposit of $${amount.toLocaleString()} via ${network.toUpperCase()} is being processed.`,
    amount,
    metadata: { network },
  });
}

export async function notifyDepositApproved(userId: string, amount: number) {
  return createNotification({
    userId,
    type: "deposit_approved",
    title: "Deposit Approved",
    message: `Your deposit of $${amount.toLocaleString()} has been approved and added to your balance.`,
    amount,
  });
}

export async function notifyDepositRejected(userId: string, amount: number, reason?: string) {
  return createNotification({
    userId,
    type: "deposit_rejected",
    title: "Deposit Rejected",
    message: reason
      ? `Your deposit of $${amount.toLocaleString()} was rejected: ${reason}`
      : `Your deposit of $${amount.toLocaleString()} was rejected. Please contact support.`,
    amount,
    metadata: { reason },
  });
}

export async function notifyWithdrawalPending(userId: string, amount: number, network: string) {
  return createNotification({
    userId,
    type: "withdrawal_pending",
    title: "Withdrawal Requested",
    message: `Your withdrawal of $${amount.toLocaleString()} via ${network.toUpperCase()} is being processed.`,
    amount,
    metadata: { network },
  });
}

export async function notifyWithdrawalApproved(userId: string, amount: number) {
  return createNotification({
    userId,
    type: "withdrawal_approved",
    title: "Withdrawal Approved",
    message: `Your withdrawal of $${amount.toLocaleString()} has been approved and sent to your wallet.`,
    amount,
  });
}

export async function notifyWithdrawalRejected(userId: string, amount: number, reason?: string) {
  return createNotification({
    userId,
    type: "withdrawal_rejected",
    title: "Withdrawal Rejected",
    message: reason
      ? `Your withdrawal of $${amount.toLocaleString()} was rejected: ${reason}`
      : `Your withdrawal of $${amount.toLocaleString()} was rejected. Please contact support.`,
    amount,
    metadata: { reason },
  });
}

export async function notifyProfitShare(userId: string, amount: number, percentage: number) {
  return createNotification({
    userId,
    type: "profit_share",
    title: "Profit Share Received",
    message: `You received a ${percentage}% profit share of $${amount.toLocaleString()}.`,
    amount,
    metadata: { percentage },
  });
}

export async function notifyReferralBonus(userId: string, amount: number, referredUser: string) {
  return createNotification({
    userId,
    type: "referral_bonus",
    title: "Referral Bonus",
    message: `You earned a referral bonus of $${amount.toLocaleString()} from ${referredUser}'s activity.`,
    amount,
    metadata: { referredUser },
  });
}

export async function notifyKYCApproved(userId: string) {
  return createNotification({
    userId,
    type: "kyc_approved",
    title: "KYC Verified",
    message: "Your identity verification has been approved. You now have full access to all features.",
  });
}

export async function notifyKYCRejected(userId: string, reason?: string) {
  return createNotification({
    userId,
    type: "kyc_rejected",
    title: "KYC Rejected",
    message: reason
      ? `Your identity verification was rejected: ${reason}`
      : "Your identity verification was rejected. Please resubmit with valid documents.",
    metadata: { reason },
  });
}

export async function notifyWelcome(userId: string, userName: string) {
  return createNotification({
    userId,
    type: "welcome",
    title: "Welcome to BLACKROCK",
    message: `Welcome ${userName}! Your account is ready. Start by making your first deposit to begin investing.`,
    metadata: { userName },
  });
}

export async function notifySystem(userId: string, title: string, message: string) {
  return createNotification({
    userId,
    type: "system",
    title,
    message,
  });
}
