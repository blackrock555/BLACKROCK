export function getWelcomeEmailTemplate({
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
      <title>Welcome to BLACKROCK</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 28px; font-weight: bold; margin: 0;">BLACKROCK</h1>
          </div>

          <!-- Welcome Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: #ffffff; font-size: 40px;">🎉</span>
            </div>
          </div>

          <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
            Welcome to BLACKROCK, ${name}!
          </h2>

          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
            Your email has been verified and your account is now active. You're ready to start your investment journey with us.
          </p>

          <!-- Next Steps -->
          <div style="background-color: #27272a; border-radius: 8px; padding: 24px; margin: 30px 0;">
            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">Get Started in 3 Easy Steps:</h3>

            <div style="margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 28px; height: 28px; background-color: #6366f1; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #ffffff; font-size: 14px; font-weight: bold;">1</span>
                </div>
                <div>
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Complete KYC Verification</p>
                  <p style="color: #71717a; font-size: 13px; margin: 0;">Verify your identity to unlock all features</p>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 28px; height: 28px; background-color: #6366f1; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #ffffff; font-size: 14px; font-weight: bold;">2</span>
                </div>
                <div>
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Make Your First Deposit</p>
                  <p style="color: #71717a; font-size: 13px; margin: 0;">Fund your account with USDT via multiple networks</p>
                </div>
              </div>
            </div>

            <div>
              <div style="display: flex; align-items: flex-start;">
                <div style="width: 28px; height: 28px; background-color: #6366f1; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px;">
                  <span style="color: #ffffff; font-size: 14px; font-weight: bold;">3</span>
                </div>
                <div>
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 4px 0; font-weight: 600;">Start Earning</p>
                  <p style="color: #71717a; font-size: 13px; margin: 0;">Watch your portfolio grow with our trading strategies</p>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>

          <!-- Features -->
          <div style="border-top: 1px solid #27272a; margin-top: 30px; padding-top: 30px;">
            <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 16px 0; text-align: center;">What You Get With BLACKROCK</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
              <div style="text-align: center; padding: 12px;">
                <div style="color: #10b981; font-size: 24px; margin-bottom: 8px;">📈</div>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Daily Profit Share</p>
              </div>
              <div style="text-align: center; padding: 12px;">
                <div style="color: #10b981; font-size: 24px; margin-bottom: 8px;">🔒</div>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Secure Platform</p>
              </div>
              <div style="text-align: center; padding: 12px;">
                <div style="color: #10b981; font-size: 24px; margin-bottom: 8px;">💸</div>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Easy Withdrawals</p>
              </div>
              <div style="text-align: center; padding: 12px;">
                <div style="color: #10b981; font-size: 24px; margin-bottom: 8px;">🤝</div>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Referral Rewards</p>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #52525b; font-size: 12px; margin: 0;">
            Need help? Contact our support team anytime.
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
