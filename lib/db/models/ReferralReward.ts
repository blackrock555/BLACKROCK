import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralReward extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // The user receiving the reward (referrer)
  referredUserId: mongoose.Types.ObjectId; // The user who was referred
  amount: number;
  status: 'PENDING' | 'CREDITED' | 'EXPIRED';
  triggerEvent: 'signup' | 'email_verified' | 'first_deposit' | 'kyc_approved';
  tierAtTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const referralRewardSchema = new Schema<IReferralReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CREDITED', 'EXPIRED'],
      default: 'PENDING',
    },
    triggerEvent: {
      type: String,
      enum: ['signup', 'email_verified', 'first_deposit', 'kyc_approved'],
      required: true,
    },
    tierAtTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index - one reward per referral relationship
referralRewardSchema.index({ userId: 1, referredUserId: 1 }, { unique: true });
referralRewardSchema.index({ userId: 1, status: 1 });

export const ReferralReward: Model<IReferralReward> =
  mongoose.models.ReferralReward || mongoose.model<IReferralReward>('ReferralReward', referralRewardSchema);
