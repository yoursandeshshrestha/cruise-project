import React from 'react';
import { Layout } from '../../../components/client/Layout';

export const Terms: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Simple Cruise Parking</p>

        <div className="prose prose-blue max-w-none space-y-8 text-gray-700">

          <p>These Terms and Conditions govern your use of the services provided by Simple Cruise Parking. By making a booking with us, you agree to the following terms.</p>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">1. About Us</h2>
            <p>Simple Cruise Parking operates a vehicle parking service in Southampton.</p>
            <address className="not-italic mt-3 text-gray-600 leading-relaxed">
              Unit 9 Northbrook Industrial Estate<br />
              Vincent Avenue<br />
              Southampton<br />
              SO16 6PB<br />
              <br />
              Telephone: <a href="tel:02382444286" className="text-primary hover:underline">02382444286</a><br />
              Email: <a href="mailto:info@simplecruiseparking.com" className="text-primary hover:underline">info@simplecruiseparking.com</a>
            </address>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">2. Booking and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All bookings must be made in advance via our website.</li>
              <li>Full payment is required at the time of booking.</li>
              <li>Your booking is confirmed once payment has been successfully processed and you receive a confirmation email.</li>
              <li>It is your responsibility to ensure all booking details are accurate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">3. Arrival and Vehicle Check-In</h2>
            <p>Upon arrival, a vehicle condition report will be completed.</p>
            <p className="mt-2">This may include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Recording mileage and fuel level</li>
              <li>Photographing the vehicle</li>
              <li>Noting any visible existing damage</li>
              <li>Customer signature to confirm accuracy</li>
            </ul>
            <p className="mt-3">You must ensure that any existing damage is declared and visible at the time of check-in.</p>
            <p className="mt-2">Once signed, the condition report will be considered an accurate record of your vehicle's condition at drop-off.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">4. Liability</h2>
            <p>We take reasonable care of all vehicles parked with us.</p>
            <p className="mt-2">However:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>We are not responsible for pre-existing damage not recorded at check-in.</li>
              <li>We are not liable for mechanical or electrical failure unrelated to our actions.</li>
              <li>We are not liable for loss or damage to personal belongings left inside the vehicle.</li>
            </ul>
            <p className="mt-3">Vehicles are parked at the owner's risk, subject to applicable law.</p>
            <p className="mt-2">Our liability is limited to direct loss caused by proven negligence on our part.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">5. Personal Belongings</h2>
            <p>Customers are advised not to leave valuables inside their vehicle.</p>
            <p className="mt-2">We accept no responsibility for loss, theft or damage to personal items left in vehicles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">6. Keys</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vehicle keys must be handed to staff at check-in unless otherwise agreed.</li>
              <li>Keys will be stored securely.</li>
              <li>We are not responsible for faults or issues arising from worn or damaged keys.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">7. EV Charging and Additional Services</h2>
            <p>Where EV charging or vehicle washing services are requested:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>These services are carried out with reasonable care.</li>
              <li>We are not liable for manufacturer defects or pre-existing issues.</li>
              <li>Charging times may vary depending on vehicle type and battery condition.</li>
            </ul>
            <p className="mt-3">Service availability may be subject to operational conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">8. Security</h2>
            <p>Our site operates security measures including CCTV and patrols.</p>
            <p className="mt-2">While we take reasonable precautions to protect vehicles, we do not guarantee protection against events beyond our control, including but not limited to severe weather, vandalism or third-party criminal acts.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">9. Cancellations and Amendments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cancellations made more than 48 hours before drop-off may be eligible for a refund.</li>
              <li>Cancellations made within 48 hours of drop-off may be non-refundable.</li>
            </ul>
            <p className="mt-3">Amendments are subject to availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">10. Late Returns</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Customers must inform us of any delays to cruise return times as soon as possible.</li>
              <li>Additional charges may apply for vehicles not collected on the agreed return date.</li>
              <li>Failure to collect a vehicle within a reasonable time may result in further storage charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">11. Refusal of Service</h2>
            <p>We reserve the right to refuse service where:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Booking details are incorrect or misleading</li>
              <li>The vehicle is deemed unsafe or unroadworthy</li>
              <li>Customer behaviour is abusive or threatening</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">12. Complaints</h2>
            <p>If you believe your vehicle has been damaged while in our care, you must notify us immediately upon collection.</p>
            <p className="mt-2">Claims reported after leaving the premises may be more difficult to investigate.</p>
            <p className="mt-2">All complaints should be submitted in writing to:</p>
            <p className="mt-2">
              <a href="mailto:info@simplecruiseparking.com" className="text-primary hover:underline">info@simplecruiseparking.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">13. Limitation of Liability</h2>
            <p>Nothing in these terms excludes liability for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any liability that cannot legally be excluded under UK law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">14. Governing Law</h2>
            <p>These Terms and Conditions are governed by the laws of England and Wales.</p>
            <p className="mt-2">Any disputes shall be subject to the jurisdiction of the English courts.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-brand-dark mb-3">15. Updates</h2>
            <p>We reserve the right to amend these Terms and Conditions at any time.</p>
            <p className="mt-2">The version in force at the time of booking will apply to your reservation.</p>
          </section>

        </div>
      </div>
    </Layout>
  );
};