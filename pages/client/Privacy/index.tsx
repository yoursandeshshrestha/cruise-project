import React from 'react';
import { Layout } from '../../../components/client/Layout';

export const Privacy: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
            <p>At Simple Cruise Parking, we are committed to protecting your privacy.</p>
            
            <h3 className="text-xl font-bold text-brand-dark">1. Information We Collect</h3>
            <p>We collect information you provide directly to us when you make a booking, including name, email, phone number, and vehicle details.</p>

            <h3 className="text-xl font-bold text-brand-dark">2. How We Use Your Information</h3>
            <p>We use your information to facilitate your booking, communicate with you regarding your service, and improve our website.</p>

            <h3 className="text-xl font-bold text-brand-dark">3. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or disclosure.</p>

            <h3 className="text-xl font-bold text-brand-dark">4. Third Parties</h3>
            <p>We do not sell your personal data. We may share data with service providers (e.g., payment processors) strictly for the purpose of fulfilling our service to you.</p>
        </div>
      </div>
    </Layout>
  );
};