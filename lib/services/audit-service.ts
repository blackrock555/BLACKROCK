/**
 * Audit Service
 *
 * Provides centralized audit logging for sensitive data access and admin operations.
 * Ensures compliance and provides an audit trail for security-critical actions.
 *
 * IMPORTANT: This service should NEVER log decrypted sensitive data.
 * It only logs metadata about the access (who, when, what type of data).
 */

import { AuditLog, AuditAction, IAuditLog } from '@/lib/db/models/AuditLog';
import mongoose from 'mongoose';

export interface AuditLogParams {
  action: AuditAction;
  adminId: string;
  targetId?: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    // Sanitize details to ensure no sensitive data is logged
    const sanitizedDetails = sanitizeDetails(params.details);

    await AuditLog.create({
      action: params.action,
      adminId: new mongoose.Types.ObjectId(params.adminId),
      targetId: params.targetId ? new mongoose.Types.ObjectId(params.targetId) : undefined,
      entityType: params.entityType,
      entityId: params.entityId ? new mongoose.Types.ObjectId(params.entityId) : undefined,
      details: sanitizedDetails,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the application
    console.error('[AuditService] Failed to create audit log:', error);
  }
}

/**
 * Log when admin views sensitive KYC data
 */
export async function logKYCDataViewed(
  adminId: string,
  targetUserId: string,
  kycRequestId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'KYC_DATA_VIEWED',
    adminId,
    targetId: targetUserId,
    entityType: 'KYCRequest',
    entityId: kycRequestId,
    details: {
      dataType: 'kyc',
      fieldsAccessed: ['fullName', 'dateOfBirth', 'nationality', 'address', 'idNumber', 'documents'],
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log when admin views user PII (personal identifiable information)
 */
export async function logUserPIIViewed(
  adminId: string,
  targetUserId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'USER_PII_VIEWED',
    adminId,
    targetId: targetUserId,
    entityType: 'User',
    entityId: targetUserId,
    details: {
      dataType: 'user_pii',
      fieldsAccessed: ['phone', 'kycData'],
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log when admin views wallet addresses
 */
export async function logWalletAddressViewed(
  adminId: string,
  targetUserId: string,
  withdrawalId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'WALLET_ADDRESS_VIEWED',
    adminId,
    targetId: targetUserId,
    entityType: 'WithdrawalRequest',
    entityId: withdrawalId,
    details: {
      dataType: 'wallet_address',
      fieldsAccessed: ['toAddress'],
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log when admin exports sensitive data
 */
export async function logSensitiveDataExported(
  adminId: string,
  exportType: string,
  recordCount: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'SENSITIVE_DATA_EXPORTED',
    adminId,
    details: {
      exportType,
      recordCount,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Log generic sensitive data access
 */
export async function logSensitiveDataViewed(
  adminId: string,
  entityType: string,
  entityId: string,
  dataTypes: string[],
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'SENSITIVE_DATA_VIEWED',
    adminId,
    entityType,
    entityId,
    details: {
      dataTypes,
      timestamp: new Date().toISOString(),
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Sanitize details object to remove any potentially sensitive data
 * This is a safety measure to prevent accidental logging of decrypted data
 */
function sanitizeDetails(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;

  const sanitized: Record<string, unknown> = {};
  const sensitivePatterns = [
    'password',
    'secret',
    'token',
    'key',
    'address',
    'phone',
    'ssn',
    'idnumber',
    'fullname',
    'dateofbirth',
    'nationality',
  ];

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();

    // Check if key matches sensitive patterns
    const isSensitive = sensitivePatterns.some((pattern) =>
      lowerKey.includes(pattern)
    );

    if (isSensitive) {
      // Replace sensitive values with a placeholder
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Get recent audit logs for an admin
 */
export async function getAdminAuditLogs(
  adminId: string,
  limit: number = 50
): Promise<IAuditLog[]> {
  return AuditLog.find({ adminId: new mongoose.Types.ObjectId(adminId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get recent audit logs for a target user
 */
export async function getTargetUserAuditLogs(
  targetUserId: string,
  limit: number = 50
): Promise<IAuditLog[]> {
  return AuditLog.find({ targetId: new mongoose.Types.ObjectId(targetUserId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get sensitive data access logs for compliance reporting
 */
export async function getSensitiveDataAccessLogs(
  startDate: Date,
  endDate: Date,
  limit: number = 1000
): Promise<IAuditLog[]> {
  return AuditLog.find({
    action: {
      $in: [
        'SENSITIVE_DATA_VIEWED',
        'SENSITIVE_DATA_EXPORTED',
        'KYC_DATA_VIEWED',
        'USER_PII_VIEWED',
        'WALLET_ADDRESS_VIEWED',
      ],
    },
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'name email')
    .populate('targetId', 'name email')
    .lean();
}
