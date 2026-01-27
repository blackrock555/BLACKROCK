# MongoDB Atlas Migration & Field-Level Encryption Guide

## Overview

This guide covers the migration from self-hosted MongoDB to MongoDB Atlas with client-side field-level encryption (CSFLE) implementation.

## Security Architecture

### Encryption Approach
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 128 bits (unique per encryption)
- **Authentication Tag**: 128 bits (integrity verification)

### What Gets Encrypted

| Model | Encrypted Fields |
|-------|-----------------|
| User | phone, kycData.fullName, kycData.dateOfBirth, kycData.nationality, kycData.address, kycData.idNumber |
| KYCRequest | fields.fullName, fields.dateOfBirth, fields.nationality, fields.address, fields.idNumber, docsUrls.*, adminNote |
| WithdrawalRequest | toAddress, adminNote |
| DepositRequest | adminNote |
| Transaction | metadata.walletAddress, metadata.adminNote |
| WithdrawalCertificate | toAddress, qrCodeData |

### What Stays Unencrypted (by design)
- **email**: Required for login lookup
- **passwordHash**: Already secured with bcrypt
- **referralCode**: Required for referral lookup
- **status/role/kycStatus**: Required for query filtering
- **amount/balance fields**: Required for calculations

## Migration Steps

### Step 1: MongoDB Atlas Setup

1. **Create Atlas Account**
   ```
   https://www.mongodb.com/cloud/atlas
   ```

2. **Create Cluster**
   - Choose your preferred tier (M0 free tier for testing)
   - Select region closest to your server

3. **Configure Security**
   - Create database user with strong password
   - Add IP whitelist (your server IP only)
   - Enable Network Encryption (TLS) - enabled by default

4. **Get Connection String**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blackrock?retryWrites=true&w=majority
   ```

### Step 2: Generate Encryption Key

```bash
# Generate a 64-character hex key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANT**: Store this key securely. Losing it means losing access to encrypted data.

### Step 3: Update Environment Variables

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/blackrock?retryWrites=true&w=majority

# Encryption Key (64 hex characters)
FIELD_ENCRYPTION_KEY=your-generated-64-char-hex-key
```

### Step 4: Deploy Code Changes

1. Update your deployment with the new code
2. Ensure environment variables are set
3. Application will validate encryption on startup

### Step 5: Run Data Migration

```bash
# Backup existing data first!

# Run migration script
npx tsx scripts/migrate-encrypt-data.ts
```

### Step 6: Verify Encryption

```bash
# Run verification script
npx tsx scripts/verify-encryption.ts
```

## Verification Checklist

### MongoDB Atlas Verification

- [ ] Login to MongoDB Atlas dashboard
- [ ] Navigate to Collections > users
- [ ] Verify `phone` field shows `ENC:v1:...` format
- [ ] Verify `kycData.fullName` shows encrypted value
- [ ] Check kycrequests collection - all PII fields encrypted
- [ ] Check withdrawalrequests - `toAddress` is encrypted

### Application Verification

- [ ] Application starts without encryption errors
- [ ] Admin panel shows decrypted user data
- [ ] Admin panel shows decrypted KYC data
- [ ] Admin panel shows decrypted withdrawal addresses
- [ ] User profile page shows decrypted user data
- [ ] User KYC status page shows decrypted data
- [ ] User withdrawal history shows decrypted addresses

### Security Verification

- [ ] Raw MongoDB query returns encrypted values only
- [ ] Database export contains encrypted data only
- [ ] No plaintext PII visible in Atlas UI
- [ ] Application logs do not contain decrypted PII

## Rollback Procedure

If migration fails:

1. **Restore Database Backup**
   ```bash
   mongorestore --uri="mongodb+srv://..." /path/to/backup
   ```

2. **Revert Code Changes**
   - Deploy previous version without encryption

3. **Remove Encryption Key**
   - Remove `FIELD_ENCRYPTION_KEY` from environment

## Key Rotation Procedure

To rotate the encryption key:

1. **Generate New Key**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Create Re-encryption Script**
   - Decrypt data with old key
   - Re-encrypt with new key
   - Update documents atomically

3. **Update Environment**
   - Deploy new key
   - Verify application works
   - Securely delete old key

## Troubleshooting

### "Encryption key not configured"
- Ensure `FIELD_ENCRYPTION_KEY` is set
- Must be exactly 64 hex characters
- Verify no whitespace in value

### "Decryption failed"
- Key mismatch - using wrong key
- Data corruption - restore from backup
- Format issue - data may not be encrypted

### "Connection failed to Atlas"
- Check network connectivity
- Verify IP whitelist includes server
- Check username/password
- Ensure TLS is supported

## File Reference

```
lib/
├── encryption/
│   ├── index.ts           # Main exports
│   ├── crypto.ts          # Core encryption functions
│   ├── fields-config.ts   # Field definitions
│   ├── service.ts         # Model-specific helpers
│   └── mongoose-plugin.ts # Mongoose middleware
├── db/
│   ├── connect.ts         # Atlas connection (updated)
│   └── models/            # All models (updated)
└── services/
    └── audit-service.ts   # Audit logging

scripts/
├── migrate-encrypt-data.ts   # Data migration
└── verify-encryption.ts      # Verification

docs/
└── ENCRYPTION_MIGRATION_GUIDE.md  # This file
```

## Security Considerations

1. **Key Management**
   - Never commit keys to version control
   - Use secrets management (AWS Secrets Manager, Vault)
   - Implement key rotation policy

2. **Access Control**
   - Only ADMIN role can view decrypted data
   - Regular users see only their own data
   - Audit all sensitive data access

3. **Backup Security**
   - Encrypted data in backups is still encrypted
   - Store key backups separately from data backups
   - Test restore procedures regularly

4. **Compliance**
   - Document data handling procedures
   - Maintain audit logs
   - Regular security reviews

## Support

For issues with this implementation:
1. Check troubleshooting section
2. Review application logs
3. Contact development team with:
   - Error messages
   - Steps to reproduce
   - Environment details
