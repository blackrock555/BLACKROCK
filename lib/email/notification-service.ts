import { sendEmail, isEmailConfigured } from './transporter';
import {
  getWelcomeEmailTemplate,
  getKYCApprovedEmailTemplate,
  getDepositApprovedEmailTemplate,
  getWithdrawalApprovedEmailTemplate,
  getOTPVerificationEmailTemplate,
} from './templates';

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Sends a welcome email to a user after they verify their email
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('[Email] Skipping welcome email - SMTP not configured');
    return false;
  }

  try {
    const html = getWelcomeEmailTemplate({
      name,
      dashboardUrl: `${APP_URL}/dashboard`,
    });

    await sendEmail({
      to: email,
      subject: 'Welcome to BLACKROCK - Your Account is Ready!',
      html,
      text: `Welcome to BLACKROCK, ${name}! Your email has been verified and your account is now active. Visit your dashboard at ${APP_URL}/dashboard to get started.`,
    });

    console.log(`[Email] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${email}:`, error);
    return false;
  }
}

/**
 * Sends a KYC approval notification email
 */
export async function sendKYCApprovedEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('[Email] Skipping KYC approval email - SMTP not configured');
    return false;
  }

  try {
    const html = getKYCApprovedEmailTemplate({
      name,
      dashboardUrl: `${APP_URL}/dashboard`,
    });

    await sendEmail({
      to: email,
      subject: 'KYC Verification Approved - BLACKROCK',
      html,
      text: `Congratulations ${name}! Your KYC verification has been approved. You now have full access to all BLACKROCK features. Visit your dashboard at ${APP_URL}/dashboard.`,
    });

    console.log(`[Email] KYC approval email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send KYC approval email to ${email}:`, error);
    return false;
  }
}

/**
 * Sends a deposit approval confirmation email
 */
export async function sendDepositApprovedEmail({
  email,
  name,
  amount,
}: {
  email: string;
  name: string;
  amount: number;
}): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('[Email] Skipping deposit approval email - SMTP not configured');
    return false;
  }

  try {
    const html = getDepositApprovedEmailTemplate({
      name,
      amount,
    });

    await sendEmail({
      to: email,
      subject: `Deposit Confirmed: $${amount.toLocaleString()} Credited - BLACKROCK`,
      html,
      text: `Hi ${name}, your deposit of $${amount.toLocaleString()} has been approved and credited to your account. Your funds are now available for investment.`,
    });

    console.log(`[Email] Deposit approval email sent to ${email} for $${amount}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send deposit approval email to ${email}:`, error);
    return false;
  }
}

/**
 * Sends a withdrawal approval confirmation email
 */
export async function sendWithdrawalApprovedEmail({
  email,
  name,
  amount,
  toAddress,
}: {
  email: string;
  name: string;
  amount: number;
  toAddress: string;
}): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('[Email] Skipping withdrawal approval email - SMTP not configured');
    return false;
  }

  try {
    const html = getWithdrawalApprovedEmailTemplate({
      name,
      amount,
      toAddress,
    });

    await sendEmail({
      to: email,
      subject: `Withdrawal Approved: $${amount.toLocaleString()} Processing - BLACKROCK`,
      html,
      text: `Hi ${name}, your withdrawal of $${amount.toLocaleString()} has been approved and is being processed. Funds will be transferred to your wallet within 24 hours.`,
    });

    console.log(`[Email] Withdrawal approval email sent to ${email} for $${amount}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send withdrawal approval email to ${email}:`, error);
    return false;
  }
}

/**
 * Sends an OTP verification email
 */
export async function sendOTPEmail({
  email,
  name,
  otp,
}: {
  email: string;
  name: string;
  otp: string;
}): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('[Email] Skipping OTP email - SMTP not configured');
    return false;
  }

  try {
    const html = getOTPVerificationEmailTemplate({
      name,
      otp,
    });

    await sendEmail({
      to: email,
      subject: 'Your Verification Code - BLACKROCK',
      html,
      text: `Hi ${name}, your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
    });

    console.log(`[Email] OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send OTP email to ${email}:`, error);
    return false;
  }
}
