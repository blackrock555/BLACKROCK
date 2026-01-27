import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const metadata = {
  title: 'Risk Disclosure | BLACKROCK',
  description: 'Important risk information about cryptocurrency investments on the BLACKROCK platform.',
};

export default function RiskDisclosurePage() {
  return (
    <LegalPageLayout
      title="Risk Disclosure"
      subtitle="Important information about investment risks. Please read carefully before investing."
      lastUpdated="January 15, 2026"
      icon="risk"
    >
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
        <p className="text-red-400 font-semibold mb-2">Important Warning</p>
        <p className="text-surface-300">
          Cryptocurrency investments involve significant risks. You should carefully consider
          whether such investments are suitable for you in light of your financial condition
          and ability to bear financial risks. You may lose some or all of your invested capital.
        </p>
      </div>

      <h2>1. General Investment Risks</h2>
      <p>
        Investing in digital assets and cryptocurrency-related products involves substantial risk
        of loss. Before making any investment decisions, you should:
      </p>
      <ul>
        <li>Carefully consider your investment objectives and risk tolerance</li>
        <li>Only invest funds you can afford to lose</li>
        <li>Seek independent financial advice if necessary</li>
        <li>Understand that past performance does not guarantee future results</li>
      </ul>

      <h2>2. Market Volatility</h2>
      <p>
        Cryptocurrency markets are highly volatile. The value of digital assets can fluctuate
        significantly in short periods due to:
      </p>
      <ul>
        <li>Market sentiment and speculation</li>
        <li>Regulatory announcements and policy changes</li>
        <li>Technological developments and security incidents</li>
        <li>Macroeconomic factors and geopolitical events</li>
        <li>Liquidity conditions and market manipulation</li>
      </ul>

      <h2>3. Regulatory Risks</h2>
      <p>
        The regulatory environment for cryptocurrencies is evolving and uncertain:
      </p>
      <ul>
        <li>Regulations vary significantly across jurisdictions</li>
        <li>New laws may restrict or prohibit cryptocurrency activities</li>
        <li>Regulatory changes may affect the value and accessibility of digital assets</li>
        <li>Compliance requirements may change without notice</li>
      </ul>

      <h2>4. Technology Risks</h2>
      <p>
        Digital assets and blockchain technology are subject to technical risks:
      </p>
      <ul>
        <li>Smart contract vulnerabilities and bugs</li>
        <li>Network congestion and transaction delays</li>
        <li>Protocol changes and hard forks</li>
        <li>Cybersecurity threats and hacking incidents</li>
        <li>System failures and technical malfunctions</li>
      </ul>

      <h2>5. Liquidity Risks</h2>
      <p>
        Cryptocurrency markets may experience liquidity challenges:
      </p>
      <ul>
        <li>Difficulty buying or selling assets at desired prices</li>
        <li>Wide bid-ask spreads during market stress</li>
        <li>Withdrawal delays during high-volume periods</li>
        <li>Market depth limitations for large transactions</li>
      </ul>

      <h2>6. Counterparty Risks</h2>
      <p>
        When using any platform or service, you are exposed to counterparty risks:
      </p>
      <ul>
        <li>Platform insolvency or business failure</li>
        <li>Fraud or mismanagement by service providers</li>
        <li>Custodial risks associated with digital asset storage</li>
        <li>Third-party service provider failures</li>
      </ul>

      <h2>7. Operational Risks</h2>
      <p>
        Platform operations involve inherent risks:
      </p>
      <ul>
        <li>System outages and maintenance periods</li>
        <li>Human errors in transaction processing</li>
        <li>Communication failures and delays</li>
        <li>Data loss or corruption</li>
      </ul>

      <h2>8. Security Risks</h2>
      <p>
        Despite security measures, risks remain:
      </p>
      <ul>
        <li>Unauthorized access to accounts</li>
        <li>Loss of login credentials</li>
        <li>Phishing and social engineering attacks</li>
        <li>Malware and device compromise</li>
      </ul>

      <h2>9. Tax Implications</h2>
      <p>
        Cryptocurrency transactions may have tax consequences:
      </p>
      <ul>
        <li>Tax treatment varies by jurisdiction</li>
        <li>You are responsible for reporting and paying applicable taxes</li>
        <li>Tax laws regarding digital assets are complex and evolving</li>
        <li>Consult a tax professional for guidance</li>
      </ul>

      <h2>10. No Guarantees</h2>
      <p>
        We do not guarantee:
      </p>
      <ul>
        <li>Any specific returns on investments</li>
        <li>The future value of any digital assets</li>
        <li>Continuous or uninterrupted platform availability</li>
        <li>Complete protection against all risks</li>
      </ul>

      <h2>11. Your Responsibilities</h2>
      <p>
        By using our Platform, you acknowledge and accept:
      </p>
      <ul>
        <li>You have read and understood these risk disclosures</li>
        <li>You are making investment decisions based on your own judgment</li>
        <li>You have conducted your own research and due diligence</li>
        <li>You accept full responsibility for any investment losses</li>
        <li>You will seek professional advice when needed</li>
      </ul>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions about these risks or need clarification, please{' '}
        <a href="/contact">contact us</a> before making any investment decisions.
      </p>

      <div className="bg-surface-800/50 border border-surface-700 rounded-xl p-6 mt-8">
        <p className="text-surface-400">
          <strong className="text-white">Disclaimer:</strong> This risk disclosure is not exhaustive
          and does not describe all risks associated with cryptocurrency investments. Additional
          risks may exist that are not currently known or considered significant.
        </p>
      </div>
    </LegalPageLayout>
  );
}
