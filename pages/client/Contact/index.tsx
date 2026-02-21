import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Input } from '../../../components/client/Input';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="bg-brand-dark text-white py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          We're here to help. Get in touch with our friendly team.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Details */}
          <div>
             <h2 className="text-2xl font-bold text-brand-dark mb-6">Get in touch</h2>
             <p className="text-gray-600 mb-8 leading-relaxed">
                Whether you have a question about an existing booking, need help with directions, or want to know more about our services, our Southampton-based team is ready to assist.
             </p>

             <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Phone</h3>
                        <p className="text-gray-600 text-sm mb-1">Mon-Sun, 8am - 8pm</p>
                        <a href="tel:02380000000" className="text-primary font-semibold hover:underline">023 8000 0000</a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Email</h3>
                        <p className="text-gray-600 text-sm mb-1">We usually reply within 2 hours.</p>
                        <a href="mailto:support@simplecruiseparking.co.uk" className="text-primary font-semibold hover:underline">support@simplecruiseparking.co.uk</a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Office & Car Park</h3>
                        <p className="text-gray-600 text-sm">
                            Unit 5, West Quay Industrial Estate<br/>
                            Southampton, SO15 1GZ
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Opening Hours</h3>
                        <p className="text-gray-600 text-sm">
                            Open 24/7 for arrivals and departures based on cruise schedules.
                        </p>
                    </div>
                </div>
             </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-light border border-gray-100">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Send us a message</h2>
            <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label="First Name" placeholder="John" />
                    <Input label="Last Name" placeholder="Doe" />
                </div>
                <Input label="Email Address" type="email" placeholder="john@example.com" />
                <Input label="Booking Reference (Optional)" placeholder="SCP-XXXX" />
                
                <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-semibold text-brand-dark">Message</label>
                    <textarea 
                        rows={4} 
                        className="w-full p-3 border border-brand-dark/30 rounded-md text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="How can we help?"
                    ></textarea>
                </div>

                <Button type="submit" fullWidth>Send Message</Button>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
};