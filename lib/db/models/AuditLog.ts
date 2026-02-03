import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Audit action types
 *
 * Includes actions for:
 * - Financial operations (deposits, withdrawals)
 * - User management (KYC, suspension, role changes)
 * - Sensitive data access (for encryption audit trail)
 */
export type AuditAction =
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'USER_UNLOCKED'
  | 'BALANCE_ADJUSTED'
  | 'BONUS_GRANTED'
  | 'PROFIT_SHARE_MANUAL_RUN'
  | 'USER_ROLE_CHANGED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'SETTINGS_UPDATED'
  // Sensitive data access audit actions
  | 'SENSITIVE_DATA_VIEWED'
  | 'SENSITIVE_DATA_EXPORTED'
  | 'KYC_DATA_VIEWED'
  | 'USER_PII_VIEWED'
  | 'WALLET_ADDRESS_VIEWED'
  | 'CUSTOM_PROFIT_SHARE';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: AuditAction;
  adminId: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'DEPOSIT_APPROVED',
        'DEPOSIT_REJECTED',
        'WITHDRAWAL_APPROVED',
        'WITHDRAWAL_REJECTED',
        'KYC_APPROVED',
        'KYC_REJECTED',
        'USER_SUSPENDED',
        'USER_ACTIVATED',
        'USER_UNLOCKED',
        'BALANCE_ADJUSTED',
        'BONUS_GRANTED',
        'PROFIT_SHARE_MANUAL_RUN',
        'USER_ROLE_CHANGED',
        'USER_CREATED',
        'USER_UPDATED',
        'SETTINGS_UPDATED',
        // Sensitive data access audit actions
        'SENSITIVE_DATA_VIEWED',
        'SENSITIVE_DATA_EXPORTED',
        'KYC_DATA_VIEWED',
        'USER_PII_VIEWED',
        'WALLET_ADDRESS_VIEWED',
        'CUSTOM_PROFIT_SHARE',
      ],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    entityType: String, // 'DepositRequest', 'WithdrawalRequest', 'KYCRequest', 'User'
    entityId: Schema.Types.ObjectId,
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for querying
auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ targetId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
