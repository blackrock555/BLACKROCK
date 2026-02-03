import { getEmailLogoHeader } from './shared';

export function getKYCApprovedEmailTemplate({
  name,
  dashboardUrl,
}: {
  name: string;
  dashboardUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KYC Approved - BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          <!-- Logo -->
          ${getEmailLogoHeader()}

          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background-color: #10b98120; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>

          <h2 style="color: #ffffff; font-size: 26px; margin: 0 0 20px 0; text-align: center;">
            Your Account is Verified!
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Congratulations ${name}! Your KYC verification has been approved. Your account now has full access to all BLACKROCK features.
          </p>

          <!-- Benefits Card -->
          <div style="background: linear-gradient(135deg, #10b98115 0%, #10b98105 100%); border: 1px solid #10b98130; border-radius: 8px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #10b981; font-size: 16px; margin: 0 0 16px 0;">What You Can Now Do:</h3>

            <div style="margin-bottom: 12px; display: flex; align-items: center;">
              <span style="color: #10b981; margin-right: 10px;">✓</span>
              <span style="color: #ffffff; font-size: 14px;">Make unlimited deposits</span>
            </div>

            <div style="margin-bottom: 12px; display: flex; align-items: center;">
              <span style="color: #10b981; margin-right: 10px;">✓</span>
              <span style="color: #ffffff; font-size: 14px;">Request withdrawals without limits</span>
            </div>

            <div style="margin-bottom: 12px; display: flex; align-items: center;">
              <span style="color: #10b981; margin-right: 10px;">✓</span>
              <span style="color: #ffffff; font-size: 14px;">Access all investment plans</span>
            </div>

            <div style="display: flex; align-items: center;">
              <span style="color: #10b981; margin-right: 10px;">✓</span>
              <span style="color: #ffffff; font-size: 14px;">Participate in the referral program</span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Investing Now
            </a>
          </div>

          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            Thank you for completing the verification process. Your security is our priority.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #52525b; font-size: 12px; margin: 0;">
            If you have any questions, our support team is here to help.
          </p>
          <p style="color: #52525b; font-size: 12px; margin: 10px 0 0 0;">
            &copy; ${new Date().getFullYear()} BLACKROCK. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
