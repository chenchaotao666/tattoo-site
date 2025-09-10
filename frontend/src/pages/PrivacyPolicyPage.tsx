import Layout from '../components/layout/Layout';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const PrivacyPolicyPage = () => {
  const { loading } = useAsyncTranslation('privacy');
  
  // 如果翻译还在加载中，不显示任何内容
  if (loading) {
    return (
      <div className="bg-white min-w-0 overflow-hidden">
        <Layout>
          <div className="w-full min-w-0 flex items-center justify-center min-h-[400px]">
            {/* 加载时不显示任何内容 */}
          </div>
        </Layout>
      </div>
    );
  }
  
  return (
    <div className="bg-[#030414] min-w-0 overflow-hidden">
      <SEOHead
        title="Privacy Policy | tattooinkai"
        description="Understand how tattooinkai protects your personal information. Our Privacy Policy explains how we handle your data, inputs for our AI tattoo generator, your rights (GDPR/CCPA), and our commitment to transparency."
        canonicalUrl="/privacy-policy"
      />
      <Layout>
        <div className="md:max-w-screen-sm lg:max-w-[992px] px-4 sm:px-6 lg:px-8 pb-12 md:pt-6 sm:pb-20 mx-auto">
          <div className="grid gap-4 md:gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
              <p className="mb-8 text-white text-xl">
                <strong>Effective Date: 2025.9</strong>
              </p>
              <p className="mb-8 text-white text-xl">
                Welcome to tattooinkai (<strong>"we,"</strong> <strong>"our,"</strong> or <strong>"us"</strong>). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, applications, and related services, which provide AI-powered tattoo design generation (collectively, the "Services").
              </p>
              <p className="mb-8 text-white">
                By accessing or using our Services, you agree to the terms of this Privacy Policy. If you do not agree with the terms, please do not access or use our services.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">1. Information We Collect</h2>
              <p className="mb-5 text-white">
                We collect information to provide and improve our Services. The categories of information we collect are:
              </p>
              
              <h3 className="font-semibold mb-2 text-white">a. Information You Provide Directly</h3>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Contact Information:</strong> Name, email address, and phone number.</li>
                <li className="mb-2 text-white"><strong>Account Information:</strong> Your username and password if you create an account.</li>
                <li className="mb-2 text-white"><strong>Payment Information:</strong> Billing details, which are securely processed by our third-party payment processors (e.g., Stripe). We do not store your full credit card information on our servers.</li>
              </ul>
              
              <h3 className="font-semibold mb-2 text-white">b. User Inputs and Generated Content</h3>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Inputs:</strong> Any tattoo ideas, text prompts, or images you voluntarily upload to the Services to generate a design.</li>
                <li className="mb-2 text-white"><strong>Outputs:</strong> The AI-generated tattoo designs and other content created by our Services based on your Inputs.</li>
                <li className="mb-2 text-white">We will never publicly display or share your uploaded tattoo images without your explicit consent.</li>
              </ul>
              
              <h3 className="font-semibold mb-2 text-white">c. Information Collected Automatically</h3>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Device and Usage Data:</strong> IP address, browser type, operating system, device identifiers, access times, pages viewed, referring URLs, and other log file data related to your use of the Services.</li>
              </ul>
              
              <h3 className="font-semibold mb-2 text-white">d. Cookies and Tracking Technologies</h3>
              <p className="mb-5 text-white">
                We use cookies, pixels, and similar technologies to operate and improve the Services. These help us authenticate your session, remember your preferences, and analyze site traffic and performance (e.g., via Google Analytics, Meta Pixel). Where required by law, we will obtain your consent before placing non-essential cookies. You can control cookies through your browser settings, but disabling them may affect the functionality of our Services.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">2. How We Use Your Information</h2>
              <p className="mb-3 text-white">We use the information we collect for the following purposes:</p>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>To Provide and Maintain Our Services:</strong> To operate our platform, generate and deliver your requested tattoo designs, and manage your account.</li>
                <li className="mb-2 text-white"><strong>To Process Transactions:</strong> To securely process payments for any services you purchase.</li>
                <li className="mb-2 text-white"><strong>To Improve and Personalize the Services:</strong> To understand how users interact with our Services, personalize your experience, and develop new features.</li>
                <li className="mb-2 text-white"><strong>To Improve and Train Our AI Models:</strong> To enhance accuracy, we may use anonymized and aggregated Inputs and Outputs for training purposes. We will not use any personally identifiable information for this purpose. You may opt out of contributing your data to model training in your account settings or by contacting us. Opting out will not affect your ability to use the Services.</li>
                <li className="mb-2 text-white"><strong>To Communicate With You:</strong> To send service-related notifications, updates, and promotional communications. You may opt out of marketing emails at any time by following the unsubscribe link.</li>
                <li className="mb-2 text-white"><strong>For Security and Compliance:</strong> To protect against fraud, comply with legal obligations, and enforce our Terms of Service.</li>
              </ul>
              
              <h2 className="text-lg font-semibold mb-2 text-white">3. Legal Basis for Processing (For EEA/UK Users)</h2>
              <p className="mb-3 text-white">If you are located in the European Economic Area (EEA) or the United Kingdom (UK), our legal basis for collecting and using your personal information includes:</p>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Performance of a Contract:</strong> To provide our Services as outlined in our Terms of Service.</li>
                <li className="mb-2 text-white"><strong>Legitimate Interests:</strong> To improve our Services, analyze usage, and ensure security, provided these interests are not overridden by your rights.</li>
                <li className="mb-2 text-white"><strong>Consent:</strong> For sending marketing communications or for other specific purposes where we ask for your consent. You may withdraw consent at any time.</li>
                <li className="mb-2 text-white"><strong>Legal Obligation:</strong> To comply with applicable laws and legal processes.</li>
              </ul>
              
              <h2 className="text-lg font-semibold mb-2 text-white">4. How We Share Your Information</h2>
              <p className="mb-3 text-white">We do not sell your personal information in the traditional sense. We may share your information in the following limited circumstances:</p>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Service Providers:</strong> With trusted third-party vendors who perform services on our behalf, such as cloud hosting (e.g., Amazon Web Services), payment processing, data analytics, and email delivery. These providers are contractually obligated to safeguard your data and are prohibited from using it for other purposes.</li>
                <li className="mb-2 text-white"><strong>Legal Compliance:</strong> Where required by law, subpoena, or other valid legal process, or if disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
                <li className="mb-2 text-white"><strong>Business Transfers:</strong> In connection with a merger, acquisition, reorganization, or sale of all or part of our assets.</li>
                <li className="mb-2 text-white"><strong>With Your Consent:</strong> Where you explicitly consent to sharing information with third parties.</li>
              </ul>
              
              <h2 className="text-lg font-semibold mb-2 text-white">5. Data Retention</h2>
              <p className="mb-3 text-white">We retain your personal information only as long as necessary for the purposes outlined in this Policy, unless longer retention is required by law.</p>
              <ul className="pl-10 list-disc marker:text-white mb-5">
                <li className="mb-2 text-white"><strong>Uploaded Content:</strong> Tattoo images and prompts are stored temporarily and automatically deleted after 30 days, unless you choose to save them to your account.</li>
                <li className="mb-2 text-white"><strong>Account Information:</strong> Retained as long as your account is active and for up to 90 days after closure, unless longer retention is legally required.</li>
              </ul>
              
              <h2 className="text-lg font-semibold mb-2 text-white">6. Security of Your Information</h2>
              <p className="mb-5 text-white">
                We implement industry-standard technical and organizational security measures, including encryption and access controls, to protect your information. However, no method of transmission or storage is entirely secure, and we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">7. International Data Transfers</h2>
              <p className="mb-5 text-white">
                Your information may be transferred to, and maintained on, servers located outside your jurisdiction. For EEA/UK users, this means data may be transferred outside the region. We take appropriate safeguards to protect your information, including using Standard Contractual Clauses approved by the European Commission and, where applicable, adequacy decisions.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">8. Your Privacy Rights</h2>
              <p className="mb-3 text-white">Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="pl-10 list-disc marker:text-white mb-3">
                <li className="mb-2 text-white"><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li className="mb-2 text-white"><strong>Right of Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                <li className="mb-2 text-white"><strong>Right of Deletion:</strong> Request deletion of your personal data.</li>
                <li className="mb-2 text-white"><strong>Right to Restrict/Object:</strong> Limit or object to our processing of your data.</li>
                <li className="mb-2 text-white"><strong>Right to Data Portability:</strong> Request your data in a machine-readable format.</li>
                <li className="mb-2 text-white"><strong>Right to Opt Out of Marketing:</strong> Unsubscribe from promotional communications at any time.</li>
              </ul>
              <p className="mb-3 text-white">
                <strong>Your California Privacy Rights (CCPA/CPRA):</strong> If you are a California resident, you have the right to know, delete, correct, and opt out of the "sale" or "sharing" of your personal information for purposes like cross-context behavioral advertising. While we do not sell your data for money, you can exercise your right to opt out of sharing by [e.g., managing your cookie preferences or contacting us]. We do not use or disclose sensitive personal information for purposes that would require us to offer a right to limit its use under California law.
              </p>
              <p className="mb-5 text-white">
                To exercise your rights, please contact us at [Insert Your Contact Email]. We may verify your identity before processing your request and will respond within the timeframes required by law. We will not discriminate against you for exercising your privacy rights.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">9. Children's Privacy</h2>
              <p className="mb-5 text-white">
                Our Services are not directed to children under 13 (or under 16 in the EEA/UK). We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child, we will take steps to delete it promptly. If you are a parent or guardian and believe your child has provided us with data, please contact us.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">10. Changes to This Privacy Policy</h2>
              <p className="mb-5 text-white">
                We may update this Privacy Policy from time to time. When we make changes, we will revise the "Effective Date" above. For significant changes, we may provide more prominent notice, such as a banner on our site or direct email notification. Continued use of our Services after updates indicates acceptance of the revised Policy.
              </p>
              
              <h2 className="text-lg font-semibold mb-2 text-white">11. Contact Us</h2>
              <p className="mb-3 text-white">
                If you have any questions, comments, or concerns about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mb-5 text-white">
                <p><strong>tattooinkai</strong></p>
                <p>Email: [Insert Your Contact Email]</p>
                <p>Website: <a className="text-white hover:underline" href="https://tattooinkai.com">https://tattooinkai.com</a></p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default PrivacyPolicyPage;