import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const TermsPage = () => {
  const { t, loading } = useAsyncTranslation('terms');
  
  if (loading) {
    return (
      <div style={{ backgroundColor: '#030414', color: 'white' }} className="min-w-0 overflow-hidden">
        <Layout>
          <div className="w-full min-w-0 flex items-center justify-center min-h-[400px]">
            {/* 加载时不显示任何内容 */}
          </div>
        </Layout>
      </div>
    );
  }
  
  return (
    <div style={{ backgroundColor: '#030414', color: 'white' }} className="min-w-0 overflow-hidden">
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
        canonicalUrl="/terms"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6" style={{ color: 'white' }}>{t('title')}</h1>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                <strong>{t('effectiveDate')}</strong>
              </p>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                {t('intro.welcome')}
              </p>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                {t('intro.agreement')}
              </p>
              
              <ol>
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{t('sections.1.title')}</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.1.content')}
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.1.notice')}
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{t('sections.2.title')}</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.2.eligibility')}
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.2.creation')}
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.2.responsibility')}
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.2.termination')}
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>{t('sections.3.title')}</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    {t('sections.3.ownership')}
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Your Inputs:</strong> You retain ownership of your Inputs. You grant us a limited, worldwide, royalty-free license to use, reproduce, and process your Inputs solely to provide and improve the Services.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Your Outputs:</strong> Subject to compliance with these Terms, we assign to you all rights, title, and interest in and to the Outputs you generate. You may use them for personal or commercial purposes.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Important Caveats:</strong> Due to the nature of AI, Outputs may resemble third-party content. We cannot guarantee Outputs will not infringe on third-party rights. You are solely responsible for ensuring your use of Outputs does not violate any law or third-party rights. We disclaim any liability for such use.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>4. Acceptable Use Policy</h2>
                  <p className="mb-5" style={{ color: 'white' }}>You agree not to use the Services to create, upload, or share content that:</p>
                  <ul className="pl-10 list-disc mb-5">
                    <li><p className="mb-2" style={{ color: 'white' }}>Is illegal, harmful, harassing, defamatory, hateful, or discriminatory.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Violates privacy or publicity rights of others.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Contains nudity, sexually explicit content, or non-consensual sexual material.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Promotes extreme violence, terrorism, or self-harm.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Is fraudulent, false, or misleading.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Infringes third-party IP rights (e.g., trademarks, copyrights).</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Generates medical, financial, or legal advice, or other professional guidance.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Attempts to reverse-engineer, decompile, or bypass safety mechanisms.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Uses automated bots, scrapers, or unauthorized tools to access the Services.</p></li>
                  </ul>
                  <p className="mb-5" style={{ color: 'white' }}>
                    We may monitor activity, remove violating content, and suspend or terminate accounts without prior notice.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>5. Payments, Subscriptions, and Refunds</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Fees:</strong> Certain features require payment. All fees are in [e.g., U.S. Dollars] and non-refundable, except as required by law or outlined in our Refund Policy.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Billing:</strong> Payments are processed by third-party providers (e.g., Stripe) subject to their terms.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Automatic Renewal:</strong> Subscriptions renew automatically unless canceled before the renewal date.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Price Changes:</strong> We may update prices with reasonable prior notice.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Refunds:</strong> Except where required by law (e.g., EU cooling-off rights), all fees are non-refundable.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>6. Termination</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•By You:</strong> You may terminate your account at any time.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•By Us:</strong> We may suspend or terminate access if you breach these Terms or if required by law.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Data After Termination:</strong> Upon termination, we may delete or restrict access to your Inputs and Outputs. We are not obligated to retain data unless required by law.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>7. Disclaimers of Warranties</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE ERROR-FREE, UNINTERRUPTED, OR THAT OUTPUTS WILL BE ACCURATE, ORIGINAL, OR FIT FOR A PARTICULAR PURPOSE. YOU USE THE SERVICES AT YOUR OWN RISK.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>8. Limitation of Liability</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUE. OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE GREATER OF: (i) THE AMOUNT YOU PAID TO US IN THE SIX (6) MONTHS PRIOR TO THE CLAIM, OR (ii) FIFTY (50) U.S. DOLLARS IF NO PAYMENTS WERE MADE.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>9. Indemnification</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    You agree to defend, indemnify, and hold harmless tattooinkai and its affiliates, officers, employees, and agents from any claims, damages, liabilities, and expenses (including legal fees) arising from:
                  </p>
                  <ul className="pl-10 list-disc mb-5">
                    <li><p className="mb-2" style={{ color: 'white' }}>Your use of the Services,</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Your Inputs or Outputs, or</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>Your violation of these Terms or applicable laws</p></li>
                  </ul>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>10. Governing Law and Dispute Resolution</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    These Terms are governed by the laws of [Your Country/State], without regard to conflict of law principles.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Arbitration:</strong> Any dispute shall be resolved through binding arbitration under the rules of [e.g., AAA, JAMS], in [Your City/State].
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Language:</strong> Proceedings will be conducted in English.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Small Claims:</strong> You may pursue qualifying claims in small claims court.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Class Action Waiver:</strong> You agree to resolve disputes only on an individual basis. You waive the right to participate in class or representative actions.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>11. Changes to These Terms</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    We may modify these Terms at any time. Updates will be posted with a revised "Effective Date." For material changes, we may provide additional notice (e.g., email or site banner). Continued use after changes indicates acceptance.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>12. Miscellaneous</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Entire Agreement:</strong> These Terms and our Privacy Policy form the entire agreement between you and tattooinkai.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Severability:</strong> If any provision is invalid, the remaining terms remain in effect.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Assignment:</strong> You may not assign these Terms or your account. We may assign our rights without restriction.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Force Majeure:</strong> We are not liable for delays or failures caused by events beyond our reasonable control (e.g., natural disasters, internet outages, government actions).
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>13. Contact Us</h2>
                  <p className="mb-5" style={{ color: 'white' }}>If you have any questions, please contact us at:</p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    tattooinkai<br/>
                    Email: [Insert Your Contact Email]<br/>
                    Website: <a className="hover:underline" style={{ color: 'white' }} href="https://tattooinkai.com">https://tattooinkai.com</a>
                  </p>
                </li>
              </ol>
              
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default TermsPage;