import React from 'react';
import { Layout } from '../../../components/client/Layout';

export const Cookies: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 text-brand-dark">
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
            <p>Simple Cruise Parking uses cookies to enhance your browsing experience.</p>
            
            <h3 className="text-xl font-bold text-brand-dark">1. What are cookies?</h3>
            <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and login status.</p>

            <h3 className="text-xl font-bold text-brand-dark">2. Cookies We Use</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g. booking flow).</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (e.g. Google Analytics).</li>
            </ul>

            <h3 className="text-xl font-bold text-brand-dark">3. Managing Cookies</h3>
            <p>You can control and manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of the booking system.</p>
        </div>
      </div>
    </Layout>
  );
};