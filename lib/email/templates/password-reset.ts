export function getPasswordResetEmailTemplate({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; font-weight: bold; margin: 0;">BLACKROCK</h1>
          </div>

          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
            Password Reset Request
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>

          <div style="border-top: 1px solid #27272a; margin-top: 30px; padding-top: 20px;">
            <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #6366f1; font-size: 12px; text-align: center; word-break: break-all; margin: 10px 0 0 0;">
              ${resetUrl}
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
