import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  fee: number;
  netAmount: number;
  toAddress: string;
  network: 'ERC20' | 'TRC20' | 'BEP20';
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  txHash?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [50, 'Minimum withdrawal is 50 USDT'],
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    toAddress: {
      type: String,
      required: [true, 'Withdrawal address is required'],
      trim: true,
    },
    network: {
      type: String,
      enum: ['ERC20', 'TRC20', 'BEP20'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNote: String,
    txHash: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });
withdrawalRequestSchema.index({ userId: 1, status: 1 });

export const WithdrawalRequest: Model<IWithdrawalRequest> =
  mongoose.models.WithdrawalRequest || mongoose.model<IWithdrawalRequest>('WithdrawalRequest', withdrawalRequestSchema);
