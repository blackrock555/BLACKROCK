import nodemailer from 'nodemailer';

const isDev = process.env.NODE_ENV !== 'production';
const isEmailConfigured = !!(process.env.SENDER_EMAIL && process.env.SENDER_PASSWORD);

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
  // Allow self-signed certificates in development
  tls: {
    rejectUnauthorized: !isDev,
  },
});

export { isEmailConfigured };

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BLACKROCK" <noreply@blackrock5.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export { transporter };
