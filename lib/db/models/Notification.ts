import mongoose, { Schema, Document } from "mongoose";

export type NotificationType =
  | "deposit_pending"
  | "deposit_approved"
  | "deposit_rejected"
  | "withdrawal_pending"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "reward_received"
  | "profit_share"
  | "kyc_approved"
  | "kyc_rejected"
  | "referral_bonus"
  | "system"
  | "welcome";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "deposit_pending",
        "deposit_approved",
        "deposit_rejected",
        "withdrawal_pending",
        "withdrawal_approved",
        "withdrawal_rejected",
        "reward_received",
        "profit_share",
        "kyc_approved",
        "kyc_rejected",
        "referral_bonus",
        "system",
        "welcome",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
