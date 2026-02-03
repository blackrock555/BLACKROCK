/**
 * Shared email header with inline SVG logo for BLACKROCK emails.
 * Uses inline SVG since hosted images may not load in all email clients.
 */
export function getEmailLogoHeader(): string {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
          <tr>
            <td style="vertical-align: middle; padding-right: 10px;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 10px; display: inline-block; text-align: center; line-height: 40px;">
                <span style="color: #ffffff; font-size: 18px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">BR</span>
              </div>
            </td>
            <td style="vertical-align: middle;">
              <span style="color: #ffffff; font-size: 24px; font-weight: bold; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 2px;">BLACKROCK</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}
