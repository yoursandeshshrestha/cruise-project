import React from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { MapPin, Truck, CheckCircle, Clock, Phone, Key, ShieldCheck, PlayCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-dark/10"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h1>
          <p className="text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed">
            Our park and ride service is designed to be the easiest part of your holiday. 
            From the moment you arrive to the moment you leave, we handle the logistics so you can relax.
          </p>
        </div>
      </div>

      {/* Main Process Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Step 1: Arrival */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
            <div className="w-full md:w-1/2">
              <div className="bg-blue-50 rounded-2xl p-8 md:p-12 relative overflow-hidden h-full min-h-[300px] flex items-center justify-center">
                 {/* Illustration Placeholder */}
                 <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" className="text-primary"/>
                    </svg>
                 </div>
                 <div className="relative z-10 bg-white p-6 rounded-full shadow-medium">
                    <MapPin size={48} className="text-primary" />
                 </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-block bg-blue-100 text-primary font-bold px-4 py-1 rounded-full text-sm mb-4">STEP 1</div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Arrival & Drop-off</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Drive straight to our secure facility in Southampton. We are located just off the motorway, avoiding the worst of the city centre traffic.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">Pull into our arrival bays where a member of staff will greet you.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Key size={20} className="text-primary shrink-0 mt-1" />
                  <span className="text-gray-700">Check in at reception and hand over your keys. Your car is parked securely by our insured drivers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">Our team will help load your luggage onto the waiting shuttle bus.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2: The Transfer */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-20">
            <div className="w-full md:w-1/2">
               <div className="bg-blue-50 rounded-2xl p-8 md:p-12 relative overflow-hidden h-full min-h-[300px] flex items-center justify-center">
                 <div className="relative z-10 bg-white p-6 rounded-full shadow-medium">
                    <Truck size={48} className="text-primary" />
                 </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-block bg-blue-100 text-primary font-bold px-4 py-1 rounded-full text-sm mb-4">STEP 2</div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Shuttle to Terminal</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Skip the queues at the port. Our private shuttle buses run on demand to all Southampton cruise terminals.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock size={20} className="text-primary shrink-0 mt-1" />
                  <span className="text-gray-700">Transfer time is typically <strong>10-15 minutes</strong> depending on traffic.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">We drop you and your luggage directly at the baggage drop area.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">Our drivers know exactly which terminal your ship is docked at.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3: Return */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
               <div className="bg-blue-50 rounded-2xl p-8 md:p-12 relative overflow-hidden h-full min-h-[300px] flex items-center justify-center">
                 <div className="relative z-10 bg-white p-6 rounded-full shadow-medium">
                    <Phone size={48} className="text-primary" />
                 </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-block bg-blue-100 text-primary font-bold px-4 py-1 rounded-full text-sm mb-4">STEP 3</div>
              <h2 className="text-3xl font-bold text-brand-dark mb-4">The Return Journey</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                When you disembark, we'll be ready to whisk you back to your car so you can start your journey home.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone size={20} className="text-primary shrink-0 mt-1" />
                  <span className="text-gray-700">Once you have cleared customs and have your bags, give us a quick call.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">We will direct you to the nearby pick-up point (same place we dropped you off).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                  <span className="text-gray-700">Your car will be ready in the departure bay. If you booked a wash or charge, it's all done!</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Trust / FAQ Snippet */}
      <section className="bg-neutral-light py-20">
        <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Key size={20} className="text-primary" />
                        Do I need to leave my keys?
                    </h3>
                    <p className="text-gray-600">Yes. As we operate a secure block parking facility to maximise space and security, we require your keys. They are stored in a secure safe and your vehicle is only moved by fully insured staff to manage the car park or perform add-on services.</p>
                </div>
                
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-primary" />
                        Is my car safe?
                    </h3>
                    <p className="text-gray-600">Absolutely. Our facility is fully fenced with 24/7 CCTV monitoring, motion detection, and gated access. Staff are on-site during all operational hours.</p>
                </div>

                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        What if my ship is delayed?
                    </h3>
                    <p className="text-gray-600">Don't worry. We monitor all ship arrivals. If your ship is late docking, we will know and our shuttle service will continue to run until all passengers are collected. There are no extra charges for late ship arrivals.</p>
                </div>
            </div>

            <div className="text-center mt-12">
                <Link to="/faqs" className="text-primary font-bold hover:underline">View all FAQs</Link>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to book?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Secure your space today. It only takes 2 minutes.
            </p>
            <Link to="/book">
                <Button variant="primary" className="px-10 py-4 text-lg">
                    Get a Quote
                </Button>
            </Link>
        </div>
      </section>
    </Layout>
  );
};