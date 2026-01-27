import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PROFIT_SHARE' | 'REFERRAL_REWARD' | 'ADMIN_ADJUSTMENT' | 'BONUS';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  metadata?: {
    description?: string;
    referenceId?: string;
    adminNote?: string;
    previousBalance?: number;
    newBalance?: number;
    txHash?: string;
    network?: string;
    walletAddress?: string;
    depositRequestId?: mongoose.Types.ObjectId;
    withdrawalRequestId?: mongoose.Types.ObjectId;
    percentage?: number;
    toAddress?: string;
    fee?: number;
    netAmount?: number;
    referredUserId?: mongoose.Types.ObjectId;
    referredUserName?: string;
    referredUserEmail?: string;
    isCustom?: boolean;
    appliedBy?: string;
    grantedBy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'PROFIT_SHARE', 'REFERRAL_REWARD', 'ADMIN_ADJUSTMENT', 'BONUS'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    metadata: {
      description: String,
      referenceId: String,
      adminNote: String,
      previousBalance: Number,
      newBalance: Number,
      txHash: String,
      network: String,
      walletAddress: String,
      depositRequestId: Schema.Types.ObjectId,
      withdrawalRequestId: Schema.Types.ObjectId,
      percentage: Number,
      toAddress: String,
      fee: Number,
      netAmount: Number,
      referredUserId: Schema.Types.ObjectId,
      referredUserName: String,
      referredUserEmail: String,
      isCustom: Boolean,
      appliedBy: String,
      grantedBy: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
