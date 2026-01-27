# Security Documentation

## Overview

This document outlines the security measures implemented in the BLACKROCK application and provides guidance for secure deployment.

## Pre-Deployment Checklist

### 1. Environment Variables

**CRITICAL: Before deploying to production, you MUST:**

1. Generate new secrets for all sensitive environment variables:
   ```bash
   # Generate NEXTAUTH_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Generate FIELD_ENCRYPTION_KEY
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Generate CRON_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Use a proper secrets manager (Vercel Secrets, AWS Secrets Manager, etc.)

3. Never commit `.env.local` or `.env.production` to version control

4. Rotate all secrets if you suspect they may have been exposed

### 2. OAuth Configuration

For Google OAuth to work:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

### 3. Database Security

- Use a strong MongoDB connection string with authentication
- Enable MongoDB Atlas IP whitelist for production
- Regularly backup your database
- Use field-level encryption for sensitive data (KYC information)

## Security Features Implemented

### Authentication
- JWT-based sessions with 2-hour expiry
- bcrypt password hashing with salt rounds
- Email verification required before login
- Account lockout after failed attempts
- OTP verification with rate limiting

### Authorization
- Role-based access control (USER, ADMIN)
- Admin-only routes protected on both client and server
- Session validation on each API request

### Input Validation
- Zod schema validation for all API inputs
- Wallet address format validation (ERC20, TRC20, BEP20)
- SQL/NoSQL injection prevention
- XSS prevention via React's built-in escaping

### Rate Limiting
- Redis-based rate limiting (with in-memory fallback)
- Different limits for auth vs general API endpoints
- Protection against brute force attacks

### Data Protection
- Sensitive fields excluded from queries by default (`select: false`)
- Field-level encryption available for PII
- Passwords never returned in API responses
- KYC data protected with restricted access

### HTTP Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy

## Known Limitations

### CSP and TradingView
The TradingView widget requires `'unsafe-eval'` and `'unsafe-inline'` in the script-src directive. This is a known limitation of the TradingView embed. If you disable the TradingView chart, you can remove these directives for stricter CSP.

### NPM Vulnerabilities
There are known vulnerabilities in dev dependencies that require major version upgrades:
- `eslint-config-next` (high) - Development only, not in production build
- `next` Image Optimizer (moderate) - Mitigated by strict remotePatterns config

To check for updates: `npm audit`

## Security Reporting

If you discover a security vulnerability, please report it responsibly by contacting the development team directly rather than creating a public issue.

## Audit Log

The application maintains an audit log for administrative actions:
- User status changes
- KYC approvals/rejections
- Deposit/withdrawal processing
- Settings modifications

All admin actions are logged with timestamps and admin IDs for accountability.

## Recommended Production Settings

```env
# Use HTTPS only
NEXTAUTH_URL=https://your-domain.com

# Strong session secret (32+ bytes)
NEXTAUTH_SECRET=<generated-secret>

# Enable strict mode
NODE_ENV=production

# Configure Redis for rate limiting
REDIS_URL=redis://your-redis-url

# Enable field encryption
FIELD_ENCRYPTION_KEY=<generated-key>
```

## Regular Maintenance

1. **Weekly**: Check for npm security updates
2. **Monthly**: Review audit logs for suspicious activity
3. **Quarterly**: Rotate secrets and API keys
4. **Annually**: Full security audit and penetration testing
