import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { SEO } from '../../../components/client/SEO';

export const Privacy: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Privacy Policy | Simple Cruise Parking Southampton"
        description="Simple Cruise Parking privacy policy. Learn how we collect, use and protect your personal data when you use our website and services."
        canonicalPath="/privacy"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]}
      />
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Simple Cruise Parking</p>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-700">

          <p>At Simple Cruise Parking, we are committed to protecting your personal data and respecting your privacy. This policy explains how we collect, use and protect your information when you use our website or services.</p>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">1. Who We Are</h2>
            <p>Simple Cruise Parking is a vehicle parking service operating in Southampton.</p>
            <address className="not-italic mt-3 text-gray-600 leading-relaxed">
              Unit 9 Northbrook Industrial Estate<br />
              Vincent Avenue<br />
              Southampton<br />
              SO16 6PB<br />
              <br />
              Telephone: <a href="tel:02382444286" className="text-primary hover:underline">02382444286</a><br />
              Email: <a href="mailto:info@simplecruiseparking.com" className="text-primary hover:underline">info@simplecruiseparking.com</a>
            </address>
            <p className="mt-3">For the purposes of UK data protection law, we are the data controller of your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">2. Information We Collect</h2>
            <p>We may collect the following information when you make a booking or use our services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Emergency contact details</li>
              <li>Vehicle registration</li>
              <li>Vehicle make, model and colour</li>
              <li>Mileage and fuel level</li>
              <li>EV charge level (if applicable)</li>
              <li>Payment details (processed securely via Stripe)</li>
              <li>Vehicle condition photographs taken at check-in</li>
              <li>Signatures provided during vehicle check-in</li>
            </ul>
            <p className="mt-3">We may also collect limited technical information such as IP address and browser type when you use our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and manage your booking</li>
              <li>Contact you about your reservation</li>
              <li>Provide vehicle check-in condition reports</li>
              <li>Protect against damage disputes and insurance claims</li>
              <li>Process payments</li>
              <li>Improve our website and services</li>
              <li>Comply with legal and insurance obligations</li>
            </ul>
            <p className="mt-3">We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">4. Lawful Basis for Processing</h2>
            <p>Under UK GDPR, we rely on the following lawful bases:</p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="font-semibold text-brand-dark">Contractual necessity</p>
                <p>To fulfil your booking and provide our parking service.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-dark">Legal obligation</p>
                <p>To meet insurance and legal responsibilities.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-dark">Legitimate interests</p>
                <p>To protect our business from fraudulent or false claims and to improve our services.</p>
              </div>
              <div>
                <p className="font-semibold text-brand-dark">Consent</p>
                <p>Where required for marketing communications. You may withdraw consent at any time.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">5. Vehicle Condition Reports and Photographs</h2>
            <p>When you drop off your vehicle, we create a digital condition report. This may include photographs of your vehicle and visible damage markings.</p>
            <p className="mt-2">These records are used for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Insurance purposes</li>
              <li>Dispute resolution</li>
              <li>Legal protection for both parties</li>
            </ul>
            <p className="mt-3">These reports are stored securely and only accessed when required.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">6. Data Sharing</h2>
            <p>We may share your data with trusted service providers where necessary to operate our business. These may include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Stripe (payment processing)</li>
              <li>Email service providers</li>
              <li>Cloud storage providers</li>
              <li>IT and website hosting providers</li>
            </ul>
            <p className="mt-3">We only share information necessary to deliver our service. We require all providers to protect your data appropriately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">7. International Transfers</h2>
            <p>Some of our service providers may store or process data outside the United Kingdom.</p>
            <p className="mt-2">Where this occurs, we ensure appropriate safeguards are in place to protect your information in accordance with UK data protection law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">8. Data Retention</h2>
            <p>We retain personal data only for as long as necessary.</p>
            <p className="mt-2">Booking and transaction records are typically retained for up to 6 years for accounting and legal purposes.</p>
            <p className="mt-2">Vehicle condition reports and associated images may be retained for a reasonable period to protect against insurance or damage claims.</p>
            <p className="mt-2">When data is no longer required, it is securely deleted.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">9. Data Security</h2>
            <p>We implement appropriate technical and organisational measures to protect your data from unauthorised access, loss or misuse.</p>
            <p className="mt-2">However, no system can be guaranteed to be completely secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">10. Your Rights</h2>
            <p>Under UK data protection law, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request access to your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data in certain circumstances</li>
              <li>Restrict or object to processing</li>
              <li>Request transfer of your data</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us using the details below.</p>
            <p className="mt-2">You also have the right to lodge a complaint with the Information Commissioner's Office (ICO):</p>
            <p className="mt-1">
              <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.ico.org.uk</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">11. Cookies</h2>
            <p>Our website may use cookies to improve functionality and user experience. You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or how we handle your data, please contact:</p>
            <address className="not-italic mt-3 text-gray-600 leading-relaxed">
              Email: <a href="mailto:info@simplecruiseparking.com" className="text-primary hover:underline">info@simplecruiseparking.com</a><br />
              Telephone: <a href="tel:02382444286" className="text-primary hover:underline">02382444286</a><br />
              Address: Unit 9 Northbrook Industrial Estate, Vincent Avenue, Southampton, SO16 6PB
            </address>
          </section>

        </div>
      </div>
    </Layout>
  );
};