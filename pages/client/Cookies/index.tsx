import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { SEO } from '../../../components/client/SEO';

export const Cookies: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Cookie Policy | Simple Cruise Parking Southampton"
        description="Cookie policy for Simple Cruise Parking. Learn about the cookies we use on our website and how to manage your preferences."
        canonicalPath="/cookies"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Cookie Policy', path: '/cookies' }]}
      />
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Simple Cruise Parking</p>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-700">

          <p>This Cookie Policy explains how Simple Cruise Parking uses cookies and similar technologies when you visit our website.</p>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">1. What Are Cookies?</h2>
            <p>Cookies are small text files placed on your device when you visit a website. They help the website function properly, improve user experience and provide information about how the site is used.</p>
            <p className="mt-2">Cookies may be stored temporarily during your session or remain on your device for a longer period.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">2. Types of Cookies We Use</h2>
            <p>We use the following categories of cookies:</p>

            <div className="mt-4 space-y-6">
              <div>
                <p className="font-semibold text-brand-dark">Essential Cookies</p>
                <p className="mt-1">These cookies are necessary for the website to function properly. They enable core features such as:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Booking form functionality</li>
                  <li>Secure login sessions</li>
                  <li>Payment processing</li>
                  <li>Website security</li>
                </ul>
                <p className="mt-2">Without these cookies, the website and booking system may not operate correctly.</p>
                <p className="mt-1">These cookies do not require your consent.</p>
              </div>

              <div>
                <p className="font-semibold text-brand-dark">Analytics Cookies</p>
                <p className="mt-1">These cookies help us understand how visitors interact with our website so we can improve performance and usability.</p>
                <p className="mt-2">They may collect information such as:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Pages visited</li>
                  <li>Time spent on pages</li>
                  <li>Browser type</li>
                  <li>Device type</li>
                </ul>
                <p className="mt-2">Where analytics tools such as Google Analytics are used, information may be anonymised where possible.</p>
                <p className="mt-1">These cookies are only used where consent is provided.</p>
              </div>

              <div>
                <p className="font-semibold text-brand-dark">Payment and Third-Party Cookies</p>
                <p className="mt-1">When you make a booking, payment is processed securely via Stripe.</p>
                <p className="mt-2">Stripe may use cookies or similar technologies to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Prevent fraud</li>
                  <li>Ensure payment security</li>
                  <li>Complete transactions</li>
                </ul>
                <p className="mt-2">These cookies are essential for payment processing.</p>
              </div>

              <div>
                <p className="font-semibold text-brand-dark">Hosting and Security Cookies</p>
                <p className="mt-1">Our website is hosted using modern cloud infrastructure. Security and performance tools may use cookies to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Protect against malicious traffic</li>
                  <li>Improve load times</li>
                  <li>Maintain site stability</li>
                </ul>
                <p className="mt-2">These cookies are considered essential.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">3. How Long Cookies Are Stored</h2>
            <p>Some cookies are deleted when you close your browser.</p>
            <p className="mt-2">Others may remain on your device for a set period depending on their purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">4. Managing Cookies</h2>
            <p>You can control and manage cookies through your browser settings.</p>
            <p className="mt-2">Most browsers allow you to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>View stored cookies</li>
              <li>Delete cookies</li>
              <li>Block certain categories of cookies</li>
            </ul>
            <p className="mt-3">Please note that disabling essential cookies may affect the functionality of the booking system and vehicle check-in services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">5. Updates to This Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements.</p>
            <p className="mt-2">The latest version will always be available on our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">6. Contact Us</h2>
            <p>If you have any questions about our use of cookies, please contact:</p>
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