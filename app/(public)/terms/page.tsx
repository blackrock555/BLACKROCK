import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata = {
  title: 'Terms of Service | BLACKROCK',
  description: 'Terms and conditions for using the BLACKROCK investment platform.',
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using our platform"
      lastUpdated="January 15, 2026"
      icon="terms"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the BLACKROCK platform ("Platform"), you agree to be bound by these
        Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use
        the Platform. These Terms constitute a legally binding agreement between you and BLACKROCK.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        To use our Platform, you must be at least 18 years old and have the legal capacity to enter
        into binding contracts. By using the Platform, you represent and warrant that you meet these
        eligibility requirements.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To access certain features of the Platform, you must create an account. You agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information during registration</li>
        <li>Maintain and promptly update your account information</li>
        <li>Keep your password secure and confidential</li>
        <li>Accept responsibility for all activities under your account</li>
        <li>Notify us immediately of any unauthorized use of your account</li>
      </ul>

      <h2>4. KYC Verification</h2>
      <p>
        We require Know Your Customer (KYC) verification to comply with applicable regulations and
        to protect the integrity of our Platform. You agree to provide valid identification documents
        and any additional information we may reasonably request.
      </p>

      <h2>5. Platform Services</h2>
      <p>
        BLACKROCK provides investment management services through the Platform. Our services include:
      </p>
      <ul>
        <li>Portfolio management and tracking</li>
        <li>Deposit and withdrawal processing</li>
        <li>Performance reporting and analytics</li>
        <li>Referral program participation</li>
      </ul>

      <h2>6. Deposits and Withdrawals</h2>
      <p>
        Deposits are accepted in USDT via supported blockchain networks (ERC20, TRC20, BEP20).
        Withdrawal requests are processed within 24-48 hours following verification. We reserve
        the right to implement withdrawal limits and additional verification for security purposes.
      </p>

      <h2>7. Fees</h2>
      <p>
        Fee structures are disclosed on the Platform. We reserve the right to modify fees with
        reasonable notice. Blockchain network fees are determined by the respective networks and
        are your responsibility.
      </p>

      <h2>8. Prohibited Activities</h2>
      <p>
        You agree not to:
      </p>
      <ul>
        <li>Use the Platform for any illegal purpose or in violation of any laws</li>
        <li>Provide false or misleading information</li>
        <li>Attempt to gain unauthorized access to the Platform or other accounts</li>
        <li>Use the Platform to launder money or finance illegal activities</li>
        <li>Interfere with or disrupt the Platform's functionality</li>
        <li>Circumvent any security features of the Platform</li>
      </ul>

      <h2>9. Intellectual Property</h2>
      <p>
        All content, features, and functionality of the Platform are owned by BLACKROCK and are
        protected by intellectual property laws. You may not reproduce, distribute, or create
        derivative works without our express written permission.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, BLACKROCK shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from your use of the Platform.
        Our total liability shall not exceed the amount of funds you have deposited on the Platform.
      </p>

      <h2>11. Disclaimer of Warranties</h2>
      <p>
        The Platform is provided "as is" and "as available" without warranties of any kind. We do
        not guarantee that the Platform will be uninterrupted, secure, or error-free.
      </p>

      <h2>12. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless BLACKROCK and its affiliates from any claims,
        damages, losses, or expenses arising from your use of the Platform or violation of these Terms.
      </p>

      <h2>13. Termination</h2>
      <p>
        We may suspend or terminate your account at any time for violation of these Terms or for
        any other reason at our sole discretion. Upon termination, your right to use the Platform
        will immediately cease.
      </p>

      <h2>14. Modifications to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Changes will be effective upon
        posting to the Platform. Your continued use of the Platform constitutes acceptance of
        the modified Terms.
      </p>

      <h2>15. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with applicable laws, without
        regard to conflicts of law principles.
      </p>

      <h2>16. Contact Information</h2>
      <p>
        For questions about these Terms, please contact us through our{' '}
        <a href="/contact">Contact Page</a> or email support.
      </p>
    </LegalPageLayout>
  );
}
