import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepositRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  proofUrl: string;
  cloudinaryId?: string;
  network: 'erc20' | 'trc20' | 'bep20' | 'ERC20' | 'TRC20' | 'BEP20';
  txHash?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const depositRequestSchema = new Schema<IDepositRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [50, 'Minimum deposit is 50 USDT'],
    },
    proofUrl: {
      type: String,
      required: [true, 'Payment proof is required'],
    },
    cloudinaryId: String,
    network: {
      type: String,
      enum: ['erc20', 'trc20', 'bep20', 'ERC20', 'TRC20', 'BEP20'],
      required: true,
    },
    txHash: String,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNote: String,
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
depositRequestSchema.index({ status: 1, createdAt: -1 });
depositRequestSchema.index({ userId: 1, status: 1 });

export const DepositRequest: Model<IDepositRequest> =
  mongoose.models.DepositRequest || mongoose.model<IDepositRequest>('DepositRequest', depositRequestSchema);
