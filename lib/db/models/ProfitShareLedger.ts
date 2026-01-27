import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfitShareLedger extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  balanceSnapshot: number;
  tier: string;
  percentage: number;
  amount: number;
  credited: boolean;
  isCustom?: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const profitShareLedgerSchema = new Schema<IProfitShareLedger>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    balanceSnapshot: {
      type: Number,
      required: true,
    },
    tier: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    credited: {
      type: Boolean,
      default: false,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index to prevent double-crediting for same day
profitShareLedgerSchema.index({ userId: 1, date: 1 }, { unique: true });
profitShareLedgerSchema.index({ date: -1 });
profitShareLedgerSchema.index({ credited: 1 });

export const ProfitShareLedger: Model<IProfitShareLedger> =
  mongoose.models.ProfitShareLedger || mongoose.model<IProfitShareLedger>('ProfitShareLedger', profitShareLedgerSchema);
