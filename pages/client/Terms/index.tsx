import React from 'react';
import { Layout } from '../../../components/client/Layout';

export const Terms: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
            <p>Last updated: October 2023</p>
            
            <h3 className="text-xl font-bold text-brand-dark">1. Booking</h3>
            <p>1.1. Bookings made via this website are deemed confirmed only when a booking reference has been issued and payment received.</p>
            <p>1.2. Prices are subject to change. The price quoted at the time of booking is fixed.</p>

            <h3 className="text-xl font-bold text-brand-dark">2. Cancellations and Amendments</h3>
            <p>2.1. Customers may cancel their booking free of charge up to 48 hours prior to the arrival date.</p>
            <p>2.2. Cancellations made within 48 hours of arrival are non-refundable.</p>

            <h3 className="text-xl font-bold text-brand-dark">3. Liability</h3>
            <p>3.1. Vehicles are parked at the owner's risk. Simple Cruise Parking accepts no liability for loss or damage unless caused by the negligence of our employees.</p>
            <p>3.2. We do not accept liability for loose items left within the vehicle.</p>
            
            <h3 className="text-xl font-bold text-brand-dark">4. Vehicle Conditions</h3>
            <p>4.1. Vehicles must be roadworthy and hold a valid MOT and Tax.</p>
            <p>4.2. We reserve the right to refuse entry to vehicles that are deemed unsafe or too large for our bays.</p>
        </div>
      </div>
    </Layout>
  );
};