import { getEmailLogoHeader } from './shared';

export function getOTPVerificationEmailTemplate({
  name,
  otp,
}: {
  name: string;
  otp: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification Code - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          <!-- Logo -->
          ${getEmailLogoHeader()}

          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
            Verify Your Email
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Hi ${name}, use the following verification code to confirm your email address.
          </p>

          <!-- OTP Code Display -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #27272a; border-radius: 12px; padding: 20px 40px; border: 2px dashed #6366f1;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff; font-family: monospace;">
                ${otp}
              </span>
            </div>
          </div>

          <!-- Expiry Warning -->
          <div style="background-color: #422006; border: 1px solid #854d0e; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
            <p style="color: #fbbf24; font-size: 14px; margin: 0; text-align: center;">
              This code will expire in 10 minutes
            </p>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            If you did not request this verification code, please ignore this email. Do not share this code with anyone.
          </p>

          <!-- Security Note -->
          <div style="border-top: 1px solid #27272a; margin-top: 30px; padding-top: 20px;">
            <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
              For your security, BLACKROCK will never ask for your password or full verification code via email or phone.
            </p>
          </div>
        </div>

        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
          &copy; ${new Date().getFullYear()} BLACKROCK. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}
