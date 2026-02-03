import { getEmailLogoHeader } from './shared';

export function getDepositApprovedEmailTemplate({
  name,
  amount,
}: {
  name: string;
  amount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deposit Approved - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          ${getEmailLogoHeader()}

          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #10b98120; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #10b981; font-size: 30px;">✓</span>
            </div>
          </div>

          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
            Deposit Approved!
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Hi ${name}, great news! Your deposit has been approved and credited to your account.
          </p>

          <div style="background-color: #27272a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 5px 0;">Amount Credited</p>
            <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">$${amount.toLocaleString()}</p>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            Your funds are now available for investment. Log in to your dashboard to view your updated balance.
          </p>
        </div>

        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
          &copy; ${new Date().getFullYear()} BLACKROCK. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function getWithdrawalApprovedEmailTemplate({
  name,
  amount,
  toAddress,
}: {
  name: string;
  amount: number;
  toAddress: string;
}): string {
  const maskedAddress = `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Approved - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          ${getEmailLogoHeader()}

          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #10b98120; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #10b981; font-size: 30px;">✓</span>
            </div>
          </div>

          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
            Withdrawal Approved!
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Hi ${name}, your withdrawal request has been approved and is being processed.
          </p>

          <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <div style="text-align: center; margin-bottom: 15px;">
              <p style="color: #71717a; font-size: 14px; margin: 0 0 5px 0;">Amount</p>
              <p style="color: #10b981; font-size: 28px; font-weight: bold; margin: 0;">$${amount.toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <p style="color: #71717a; font-size: 14px; margin: 0 0 5px 0;">Destination</p>
              <p style="color: #ffffff; font-size: 14px; font-family: monospace; margin: 0;">${maskedAddress}</p>
            </div>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            Funds will be transferred to your wallet within 24 hours. You'll receive a confirmation once the transfer is complete.
          </p>
        </div>

        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
          &copy; ${new Date().getFullYear()} BLACKROCK. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function getRequestRejectedEmailTemplate({
  name,
  type,
  reason,
}: {
  name: string;
  type: 'deposit' | 'withdrawal' | 'kyc';
  reason?: string;
}): string {
  const typeLabels = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    kyc: 'KYC Verification',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${typeLabels[type]} Request Update - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          ${getEmailLogoHeader()}

          <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
            ${typeLabels[type]} Request Update
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Hi ${name}, unfortunately your ${type} request could not be approved at this time.
          </p>

          ${reason ? `
          <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #71717a; font-size: 14px; margin: 0 0 10px 0;">Reason:</p>
            <p style="color: #ffffff; font-size: 14px; margin: 0;">${reason}</p>
          </div>
          ` : ''}

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            Please review the feedback and submit a new request. If you have questions, contact our support team.
          </p>
        </div>

        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
          &copy; ${new Date().getFullYear()} BLACKROCK. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}
