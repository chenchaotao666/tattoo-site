import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const RefundPolicyPage = () => {
  const { loading } = useAsyncTranslation('refund');
  
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
        title="Refund Policy | tattooinkai"
        description="Review the official tattooinkai Refund Policy. Understand our terms for digital purchases, how to cancel your subscription, and the specific exceptions for billing errors or technical issues."
        canonicalUrl="/refund-policy"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6" style={{ color: 'white' }}>Refund Policy</h1>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                <strong>Effective Date: 2025.9</strong>
              </p>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                Thank you for using tattooinkai! We are committed to providing you with a high-quality AI tattoo design service. This Refund Policy explains the terms under which refunds may be issued for purchases made directly through our website.
              </p>
              <p className="mb-8 text-xl" style={{ color: 'white' }}>
                By purchasing a subscription or credits from tattooinkai, you agree to this Refund Policy.
              </p>
              
              <ol>
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>1. General Policy</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    Due to the nature of our digital services and the immediate access to resources (such as AI processing power and credits) upon purchase, all purchases made on tattooinkai are final and non-refundable, except as expressly provided in this Policy.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    We provide free trials or limited free access so you can evaluate our Services before committing to a purchase. We encourage you to take advantage of these opportunities to ensure the Services meet your needs.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>2. Subscription Services</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Cancellation:</strong> You may cancel your subscription at any time through your account settings. When you cancel, you will retain access until the end of the current billing period. Cancellation stops future charges but does not trigger a refund for the current or previous billing periods.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•No Prorated Refunds:</strong> We do not offer refunds or credits for partial subscription periods, unused time, or accidental purchases once a subscription has been activated.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>3. Credit Packs (One-Time Purchases)</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    All credit packs or one-time purchases are considered consumed at the time of purchase. These purchases are non-refundable.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    Any unused credits have no monetary value and cannot be redeemed for cash. To ensure active use, credits expire twelve (12) months after the date of purchase. Expired credits cannot be refunded or reinstated.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>4. Exceptions (When Refunds May Be Issued)</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    Refunds may be granted, at our sole discretion, in the following cases:
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Major Technical Failures:</strong> If you were unable to access or use the Services for a prolonged period due to a verifiable fault on our end. Issues caused by your internet connection, device, or third-party services do not qualify.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    <strong>•Billing Errors:</strong> If you were charged incorrectly due to a technical billing error on our part (e.g., duplicate charge), we will refund the erroneous charge. Refunds will only be issued to the original payment method used.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    Refund requests under this section must be submitted within 14 days of the transaction.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>5. For Users in the EU & UK</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    If you are a consumer in the European Union or United Kingdom, you may have a statutory right to withdraw from a purchase of digital content within 14 days of purchase (the "cooling-off period").
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    However, by purchasing a subscription or credits and using the Services to generate your first tattoo design or consume a credit, you expressly consent to the immediate delivery of digital content and acknowledge that you will lose your right of withdrawal.
                  </p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    This waiver does not affect your statutory rights regarding defective or misdescribed digital content.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>6. How to Request a Refund</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    If you believe you qualify for a refund under Section 4, please contact us at [Insert Support Email] with:
                  </p>
                  <ul className="pl-10 list-disc mb-5">
                    <li><p className="mb-2" style={{ color: 'white' }}>The email address associated with your tattooinkai account.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>The transaction ID or payment receipt.</p></li>
                    <li><p className="mb-2" style={{ color: 'white' }}>A detailed explanation of the issue.</p></li>
                  </ul>
                  <p className="mb-5" style={{ color: 'white' }}>
                    We will review your request within 5–7 business days and notify you of our decision. Depending on your payment provider, it may take additional time for refunded funds to appear in your account.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>7. Policy Changes</h2>
                  <p className="mb-5" style={{ color: 'white' }}>
                    We may update this Refund Policy from time to time. Any changes will be posted here with an updated "Effective Date." For significant changes, we may also notify you by email or within the Services.
                  </p>
                </li>
                
                <li>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>8. Contact Us</h2>
                  <p className="mb-5" style={{ color: 'white' }}>If you have any questions about this Refund Policy, please contact us at:</p>
                  <p className="mb-5" style={{ color: 'white' }}>
                    tattooinkai<br/>
                    Email: [Insert Support Email]<br/>
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

export default RefundPolicyPage;