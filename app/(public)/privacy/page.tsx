import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata = {
  title: 'Privacy Policy | BLACKROCK',
  description: 'Learn how BLACKROCK collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us. Learn how we collect, use, and protect your data."
      lastUpdated="January 15, 2026"
      icon="privacy"
    >
      <h2>1. Introduction</h2>
      <p>
        BLACKROCK ("we," "our," or "us") is committed to protecting your privacy. This Privacy
        Policy explains how we collect, use, disclose, and safeguard your information when you
        use our platform and services.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Personal Information</h3>
      <p>
        We collect personal information that you voluntarily provide, including:
      </p>
      <ul>
        <li>Name and contact information (email address)</li>
        <li>Identity verification documents (for KYC compliance)</li>
        <li>Date of birth, nationality, and address</li>
        <li>Financial information related to transactions</li>
        <li>Cryptocurrency wallet addresses</li>
      </ul>

      <h3>2.2 Automatically Collected Information</h3>
      <p>
        When you access our Platform, we automatically collect:
      </p>
      <ul>
        <li>IP address and device information</li>
        <li>Browser type and operating system</li>
        <li>Usage patterns and platform interactions</li>
        <li>Session duration and frequency of visits</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        We use collected information for the following purposes:
      </p>
      <ul>
        <li>To provide and maintain our Platform services</li>
        <li>To process transactions and manage your account</li>
        <li>To verify your identity and comply with KYC/AML regulations</li>
        <li>To communicate with you about your account and our services</li>
        <li>To detect and prevent fraud, unauthorized access, and illegal activities</li>
        <li>To improve our Platform and develop new features</li>
        <li>To comply with legal obligations and regulatory requirements</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your information:
      </p>
      <ul>
        <li>256-bit SSL encryption for data transmission</li>
        <li>Encrypted data storage with secure access controls</li>
        <li>Regular security audits and vulnerability assessments</li>
        <li>Multi-factor authentication options for account access</li>
        <li>Employee access restrictions and security training</li>
      </ul>

      <h2>5. Data Sharing and Disclosure</h2>
      <p>
        We do not sell your personal information. We may share your information in limited circumstances:
      </p>
      <ul>
        <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our Platform</li>
        <li><strong>Legal Compliance:</strong> When required by law, regulation, or legal process</li>
        <li><strong>Security:</strong> To protect the rights, property, or safety of BLACKROCK and our users</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal information for as long as necessary to:
      </p>
      <ul>
        <li>Provide our services to you</li>
        <li>Comply with legal and regulatory requirements</li>
        <li>Resolve disputes and enforce our agreements</li>
      </ul>
      <p>
        After account termination, we may retain certain information for legal compliance purposes.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the following rights:
      </p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal information</li>
        <li><strong>Correction:</strong> Request correction of inaccurate information</li>
        <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
        <li><strong>Portability:</strong> Request transfer of your data in a portable format</li>
        <li><strong>Objection:</strong> Object to certain processing of your information</li>
      </ul>

      <h2>8. Cookies and Tracking</h2>
      <p>
        We use cookies and similar technologies to:
      </p>
      <ul>
        <li>Remember your preferences and settings</li>
        <li>Authenticate your sessions</li>
        <li>Analyze Platform usage and performance</li>
        <li>Provide personalized experiences</li>
      </ul>
      <p>
        You can control cookie settings through your browser preferences.
      </p>

      <h2>9. Third-Party Links</h2>
      <p>
        Our Platform may contain links to third-party websites. We are not responsible for the
        privacy practices of these external sites. We encourage you to review their privacy policies.
      </p>

      <h2>10. Children's Privacy</h2>
      <p>
        Our Platform is not intended for individuals under 18 years of age. We do not knowingly
        collect personal information from minors.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your own.
        We ensure appropriate safeguards are in place for such transfers.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify you of material changes
        by posting the updated policy on our Platform with a new effective date.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For questions about this Privacy Policy or our data practices, please contact us through
        our <a href="/contact">Contact Page</a>.
      </p>
    </LegalPageLayout>
  );
}
