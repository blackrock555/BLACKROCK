import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  avatarPublicId?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  balance: number;
  depositBalance: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralCount: number;
  kycStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  kycData?: {
    fullName?: string;
    dateOfBirth?: Date;
    nationality?: string;
    address?: string;
    idNumber?: string;
  };
  dateOfBirth?: Date;
  emailVerified?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  welcomeEmailSent?: boolean;
  lastProfitShareAt?: Date;
  provider: 'credentials' | 'google';
  phone?: string;
  country?: string;
  // OTP Verification fields
  emailOtpHash?: string;
  emailOtpExpires?: Date;
  emailOtpAttempts: number;
  emailOtpLastSentAt?: Date;
  emailOtpLockedUntil?: Date;
  // Password security tracking
  passwordChangeAttempts: number;
  passwordChangeLockedUntil?: Date;
  lastPasswordChangeAt?: Date;
  // Notification preferences
  notificationPreferences?: {
    depositApproved?: boolean;
    withdrawalApproved?: boolean;
    withdrawalRequested?: boolean;
    profitShare?: boolean;
    securityAlerts?: boolean;
    marketingEmails?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      select: false, // Don't include in queries by default
    },
    image: String,
    avatarPublicId: String,
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'LOCKED'],
      default: 'ACTIVE',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    depositBalance: {
      type: Number,
      default: 0,
      min: [0, 'Deposit balance cannot be negative'],
    },
    referralCode: {
      type: String,
      unique: true,
      required: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    kycStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_SUBMITTED',
    },
    kycData: {
      fullName: String,
      dateOfBirth: Date,
      nationality: String,
      address: String,
      idNumber: String,
    },
    dateOfBirth: Date,
    emailVerified: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    welcomeEmailSent: {
      type: Boolean,
      default: false,
    },
    lastProfitShareAt: Date,
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    phone: String,
    country: String,
    // OTP Verification fields
    emailOtpHash: {
      type: String,
      select: false,
    },
    emailOtpExpires: Date,
    emailOtpAttempts: {
      type: Number,
      default: 0,
    },
    emailOtpLastSentAt: Date,
    emailOtpLockedUntil: Date,
    // Password security tracking
    passwordChangeAttempts: {
      type: Number,
      default: 0,
    },
    passwordChangeLockedUntil: Date,
    lastPasswordChangeAt: Date,
    // Notification preferences
    notificationPreferences: {
      depositApproved: { type: Boolean, default: true },
      withdrawalApproved: { type: Boolean, default: true },
      withdrawalRequested: { type: Boolean, default: true },
      profitShare: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: email and referralCode already have unique:true which creates indexes
userSchema.index({ referredBy: 1 });
userSchema.index({ kycStatus: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

// Virtual for full referral link
userSchema.virtual('referralLink').get(function () {
  return `${process.env.NEXTAUTH_URL}/signup?ref=${this.referralCode}`;
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
