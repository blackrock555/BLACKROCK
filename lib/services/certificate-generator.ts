import { WithdrawalCertificate } from "@/lib/db/models";
import mongoose from "mongoose";

interface CertificateData {
  withdrawalId: string;
  userId: string;
  userName: string;
  amount: number;
  network: "ERC20" | "TRC20" | "BEP20";
  toAddress: string;
  approvedBy: string;
}

/**
 * Generate a withdrawal certificate
 */
export async function generateWithdrawalCertificate(
  data: CertificateData
): Promise<{
  certificate: typeof WithdrawalCertificate.prototype;
  certificateNumber: string;
}> {
  // Generate unique certificate number
  const certificateNumber = await (
    WithdrawalCertificate as typeof WithdrawalCertificate & {
      generateCertificateNumber: () => Promise<string>;
    }
  ).generateCertificateNumber();

  // Generate QR code data (verification URL)
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.blackrock5.com"}/verify/${certificateNumber}`;
  const qrCodeData = JSON.stringify({
    certificateNumber,
    verificationUrl,
    amount: data.amount,
    network: data.network,
    issueDate: new Date().toISOString(),
  });

  // Create certificate
  const certificate = await WithdrawalCertificate.create({
    withdrawalId: new mongoose.Types.ObjectId(data.withdrawalId),
    userId: new mongoose.Types.ObjectId(data.userId),
    certificateNumber,
    userName: data.userName,
    amount: data.amount,
    network: data.network.toUpperCase() as "ERC20" | "TRC20" | "BEP20",
    toAddress: data.toAddress,
    issueDate: new Date(),
    approvedBy: new mongoose.Types.ObjectId(data.approvedBy),
    qrCodeData,
    status: "ACTIVE",
  });

  return { certificate, certificateNumber };
}

/**
 * Get certificate HTML template for PDF generation
 */
export function getCertificateHTML(certificate: {
  certificateNumber: string;
  userName: string;
  amount: number;
  network: string;
  toAddress: string;
  issueDate: Date;
  qrCodeData: string;
}): string {
  const formattedDate = certificate.issueDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(certificate.amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Withdrawal Certificate - ${certificate.certificateNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&family=Great+Vibes&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0e1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .certificate {
      width: 900px;
      background: linear-gradient(135deg, #0d1225 0%, #0a0e1a 50%, #0d1225 100%);
      border: 3px solid #1a2035;
      border-right: 4px solid #3b5998;
      border-bottom: 4px solid #3b5998;
      position: relative;
      padding: 50px 60px;
      overflow: hidden;
    }

    /* Watermark Logo */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 200px;
      font-weight: 900;
      color: rgba(59, 89, 152, 0.04);
      pointer-events: none;
      white-space: nowrap;
      font-family: 'Playfair Display', serif;
      letter-spacing: 10px;
    }

    /* Laurel Wreaths */
    .laurel-left, .laurel-right {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 120px;
      height: 300px;
      opacity: 0.15;
    }
    .laurel-left {
      left: 30px;
    }
    .laurel-right {
      right: 30px;
      transform: translateY(-50%) scaleX(-1);
    }
    .laurel-svg {
      fill: #8b9dc3;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 30px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-icon svg {
      width: 24px;
      height: 24px;
      fill: #0a0e1a;
    }
    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      color: #d4af37;
      letter-spacing: 2px;
    }

    /* Title Section */
    .title-section {
      margin-bottom: 20px;
    }
    .payout-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 10px;
    }
    .payout-line {
      width: 80px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #4a5568, transparent);
    }
    .payout-text {
      color: #8b9dc3;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .certificate-title {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 8px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    /* Amount Section */
    .amount-section {
      text-align: center;
      margin: 30px 0;
    }
    .amount-label {
      color: #8b9dc3;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .amount {
      font-family: 'Playfair Display', serif;
      font-size: 72px;
      font-weight: 700;
      color: #d4af37;
      text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
    }

    /* Description */
    .description {
      text-align: center;
      color: #8b9dc3;
      font-size: 14px;
      line-height: 1.8;
      max-width: 600px;
      margin: 30px auto;
      padding: 0 20px;
    }

    /* Recipient Name */
    .recipient-section {
      text-align: center;
      margin: 40px 0;
      position: relative;
    }
    .recipient-name {
      font-family: 'Great Vibes', cursive;
      font-size: 52px;
      color: #ffffff;
      margin-bottom: 5px;
    }
    .recipient-line {
      width: 300px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #4a5568, transparent);
      margin: 0 auto;
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(74, 85, 104, 0.3);
      position: relative;
      z-index: 1;
    }
    .footer-item {
      text-align: left;
    }
    .footer-label {
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .footer-value {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
    }
    .footer-value.signature {
      font-family: 'Great Vibes', cursive;
      font-size: 22px;
    }

    /* Seal */
    .seal {
      width: 80px;
      height: 80px;
      border: 2px solid #3b5998;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .seal::before {
      content: '';
      position: absolute;
      width: 70px;
      height: 70px;
      border: 1px solid #3b5998;
      border-radius: 50%;
    }
    .seal-inner {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #1a2035 0%, #0d1225 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #3b5998;
    }
    .seal-icon {
      width: 24px;
      height: 24px;
      fill: #3b5998;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">B</div>

    <!-- Laurel Wreaths SVG -->
    <svg class="laurel-left" viewBox="0 0 100 250">
      <g class="laurel-svg">
        <ellipse cx="70" cy="50" rx="25" ry="12" transform="rotate(30 70 50)"/>
        <ellipse cx="65" cy="80" rx="25" ry="12" transform="rotate(20 65 80)"/>
        <ellipse cx="60" cy="110" rx="25" ry="12" transform="rotate(10 60 110)"/>
        <ellipse cx="60" cy="140" rx="25" ry="12" transform="rotate(-10 60 140)"/>
        <ellipse cx="65" cy="170" rx="25" ry="12" transform="rotate(-20 65 170)"/>
        <ellipse cx="70" cy="200" rx="25" ry="12" transform="rotate(-30 70 200)"/>
        <path d="M50 30 Q55 125 50 220" stroke="#8b9dc3" stroke-width="3" fill="none"/>
      </g>
    </svg>
    <svg class="laurel-right" viewBox="0 0 100 250">
      <g class="laurel-svg">
        <ellipse cx="70" cy="50" rx="25" ry="12" transform="rotate(30 70 50)"/>
        <ellipse cx="65" cy="80" rx="25" ry="12" transform="rotate(20 65 80)"/>
        <ellipse cx="60" cy="110" rx="25" ry="12" transform="rotate(10 60 110)"/>
        <ellipse cx="60" cy="140" rx="25" ry="12" transform="rotate(-10 60 140)"/>
        <ellipse cx="65" cy="170" rx="25" ry="12" transform="rotate(-20 65 170)"/>
        <ellipse cx="70" cy="200" rx="25" ry="12" transform="rotate(-30 70 200)"/>
        <path d="M50 30 Q55 125 50 220" stroke="#8b9dc3" stroke-width="3" fill="none"/>
      </g>
    </svg>

    <div class="header">
      <div class="logo-container">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z"/></svg>
        </div>
        <span class="logo-text">BLACKROCK</span>
      </div>

      <div class="title-section">
        <div class="payout-label">
          <span class="payout-line"></span>
          <span class="payout-text">Payout</span>
          <span class="payout-line"></span>
        </div>
        <h1 class="certificate-title">Certificate</h1>
      </div>
    </div>

    <div class="amount-section">
      <p class="amount-label">For the Amount of</p>
      <p class="amount">${formattedAmount}</p>
    </div>

    <p class="description">
      This investor has successfully completed a withdrawal, demonstrating their commitment
      to smart investment strategies. Their disciplined approach to portfolio management
      has culminated in this achievement, proving their success with BLACKROCK.
    </p>

    <div class="recipient-section">
      <p class="recipient-name">${certificate.userName}</p>
      <div class="recipient-line"></div>
    </div>

    <div class="footer">
      <div class="footer-item">
        <p class="footer-label">Date</p>
        <p class="footer-value">${formattedDate}</p>
      </div>
      <div class="footer-item">
        <p class="footer-label">Certificate #</p>
        <p class="footer-value">${certificate.certificateNumber.split('-').pop()}</p>
      </div>
      <div class="footer-item">
        <p class="footer-label">Network</p>
        <p class="footer-value">${certificate.network}</p>
      </div>
      <div class="footer-item">
        <p class="footer-label">CEO</p>
        <p class="footer-value signature">James Mitchell</p>
      </div>
      <div class="seal">
        <div class="seal-inner">
          <svg class="seal-icon" viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 9.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z"/></svg>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Verify a certificate by its number
 */
export async function verifyCertificate(certificateNumber: string) {
  const certificate = await WithdrawalCertificate.findOne({
    certificateNumber,
  })
    .populate("userId", "name email")
    .populate("approvedBy", "name");

  if (!certificate) {
    return { valid: false, message: "Certificate not found" };
  }

  if (certificate.status === "REVOKED") {
    return {
      valid: false,
      message: "This certificate has been revoked",
      certificate,
    };
  }

  return {
    valid: true,
    message: "Certificate is valid",
    certificate,
  };
}
