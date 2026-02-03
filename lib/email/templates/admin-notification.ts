import { getEmailLogoHeader } from './shared';

export type AdminNotificationType = 'NEW_USER' | 'NEW_DEPOSIT' | 'NEW_WITHDRAWAL' | 'NEW_TICKET';

interface AdminNotificationParams {
  type: AdminNotificationType;
  userName: string;
  userEmail: string;
  amount?: number;
  network?: string;
  subject?: string;
  ticketCategory?: string;
}

const typeConfig: Record<AdminNotificationType, { title: string; color: string; icon: string }> = {
  NEW_USER: { title: 'New User Registration', color: '#6366f1', icon: '👤' },
  NEW_DEPOSIT: { title: 'New Deposit Request', color: '#10b981', icon: '💰' },
  NEW_WITHDRAWAL: { title: 'New Withdrawal Request', color: '#f59e0b', icon: '📤' },
  NEW_TICKET: { title: 'New Support Ticket', color: '#3b82f6', icon: '🎫' },
};

export function getAdminNotificationEmailTemplate(params: AdminNotificationParams): string {
  const { type, userName, userEmail, amount, network, subject, ticketCategory } = params;
  const config = typeConfig[type];

  let detailsHtml = '';

  switch (type) {
    case 'NEW_USER':
      detailsHtml = `
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">Name</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">${userName}</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px;">Email</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; text-align: right;">${userEmail}</td>
        </tr>
      `;
      break;
    case 'NEW_DEPOSIT':
      detailsHtml = `
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">User</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">Amount</td>
          <td style="color: #10b981; font-size: 14px; font-weight: bold; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">$${amount?.toLocaleString() ?? '0'}</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px;">Network</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; text-align: right;">${network?.toUpperCase() ?? 'N/A'}</td>
        </tr>
      `;
      break;
    case 'NEW_WITHDRAWAL':
      detailsHtml = `
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">User</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">Amount</td>
          <td style="color: #f59e0b; font-size: 14px; font-weight: bold; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">$${amount?.toLocaleString() ?? '0'}</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px;">Network</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; text-align: right;">${network?.toUpperCase() ?? 'N/A'}</td>
        </tr>
      `;
      break;
    case 'NEW_TICKET':
      detailsHtml = `
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">User</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">${userName} (${userEmail})</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a;">Subject</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; border-bottom: 1px solid #27272a; text-align: right;">${subject ?? 'N/A'}</td>
        </tr>
        <tr>
          <td style="color: #71717a; font-size: 14px; padding: 8px 12px;">Category</td>
          <td style="color: #ffffff; font-size: 14px; padding: 8px 12px; text-align: right;">${ticketCategory ?? 'General'}</td>
        </tr>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - BLACKROCK Admin</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #18181b; border-radius: 12px; padding: 40px; border: 1px solid #27272a;">
          <!-- Logo -->
          ${getEmailLogoHeader()}

          <!-- Icon -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: ${config.color}20; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">${config.icon}</span>
            </div>
          </div>

          <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 10px 0; text-align: center;">
            ${config.title}
          </h2>

          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
            A new event requires your attention on the BLACKROCK platform.
          </p>

          <!-- Details Table -->
          <div style="background-color: #27272a; border-radius: 8px; overflow: hidden; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              ${detailsHtml}
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0 0 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://blackrock5.com'}/dashboard?admin=overview" style="display: inline-block; background-color: ${config.color}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View in Admin Panel
            </a>
          </div>
        </div>

        <p style="color: #52525b; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
          &copy; ${new Date().getFullYear()} BLACKROCK Admin Notification
        </p>
      </div>
    </body>
    </html>
  `;
}
