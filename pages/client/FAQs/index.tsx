import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { Accordion } from '../../../components/client/Accordion';
import { Link } from 'react-router-dom';

export const FAQs: React.FC = () => {
  const faqItems = [
    {
        title: "Do I need to leave my car keys?",
        content: "Yes, we operate a block parking system to ensure maximum security and efficiency within our compound. Your keys are tagged and stored securely off site. Your vehicle is only moved by our fully insured professional drivers for parking management or add-on services."
    },
    {
        title: "How often do the shuttle buses run?",
        content: "Our shuttles run on demand. As soon as you are checked in and your luggage is loaded, we will get you moving. We operate multiple minibuses to ensure wait times are kept to an absolute minimum, typically departing every 10-15 minutes."
    },
    {
        title: "Is the car park secure?",
        content: "Security is our top priority. Our facility is protected by ADT security systems, surrounded by perimeter fencing, monitored by 24/7 CCTV, and has gated access. We also have staff on-site during all operational hours and conduct nightly patrols with a security dog. All car keys are stored securely off site. We have been awarded the Park Mark Safer Parking award."
    },
    {
        title: "What time should I arrive?",
        content: "We recommend arriving at our car park approximately 30-45 minutes before your scheduled cruise check-in time. This gives you plenty of time to check in with us, load your luggage, and take the short transfer to the terminal."
    },
    {
        title: "Can I charge my electric vehicle?",
        content: "Yes! We offer EV charging as an add-on service. Simply select it during the booking process. We will ensure your car is fully charged ready for your departure."
    },
    {
        title: "What happens if my cruise is delayed returning?",
        content: "We monitor all ship movements. If your ship is delayed, we will be aware and will adjust our staffing accordingly. You will not be charged extra for late returns caused by ship delays."
    },
    {
        title: "Do you have disabled access?",
        content: "Our shuttle buses are accessible, and our staff are happy to assist with luggage and boarding. If you have specific accessibility requirements, please contact us after booking so we can ensure everything is prepared for your arrival."
    },
    {
        title: "What is the cancellation policy?",
        content: "You can cancel or amend your booking for free up to 48 hours before your arrival date. Cancellations made within 48 hours may be subject to a cancellation fee."
    }
  ];

  return (
    <Layout>
       <div className="bg-neutral-light py-16">
        <div className="max-w-3xl mx-auto px-4 text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-dark mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
                Everything you need to know about parking with Simple Cruise Parking.
            </p>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-20">
            <Accordion items={faqItems} />
            
            <div className="mt-12 text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                <Link to="/contact" className="text-primary font-bold hover:underline">Contact Us</Link>
            </div>
        </div>
      </div>
    </Layout>
  );
};