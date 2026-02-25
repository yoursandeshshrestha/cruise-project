import React, { useState } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Input } from '../../../components/client/Input';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useContactStore } from '../../../stores/contactStore';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';

export const Contact: React.FC = () => {
  const { submitContactForm, isLoading } = useContactStore();
  const { getCompanyInfo } = useSystemSettingsStore();
  const companyInfo = getCompanyInfo();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    bookingReference: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');

    try {
      await submitContactForm({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message,
        booking_reference: formData.bookingReference || null,
        status: 'new'
      });

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        bookingReference: ''
      });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
    }
  };

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
                        <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="text-primary font-semibold hover:underline cursor-pointer">{companyInfo.phone}</a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Email</h3>
                        <p className="text-gray-600 text-sm mb-1">We usually reply within 2 hours.</p>
                        <a href={`mailto:${companyInfo.email}`} className="text-primary font-semibold hover:underline cursor-pointer">{companyInfo.email}</a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full text-primary shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-dark">Office & Car Park</h3>
                        <p className="text-gray-600 text-sm">
                            {companyInfo.address}
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

            {status === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Message sent successfully!</p>
                  <p className="text-xs mt-1">We'll get back to you as soon as possible.</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-semibold">Failed to send message. Please try again.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label={<><span className="text-red-600">*</span> First Name</>}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label={<><span className="text-red-600">*</span> Last Name</>}
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                </div>
                <Input
                  label={<><span className="text-red-600">*</span> Email Address</>}
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Optional"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Booking Reference"
                  placeholder="e.g. SCP-1234 (if applicable)"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                />
                <Input
                  label="Subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />

                <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-semibold text-brand-dark">
                      <span className="text-red-600">*</span> Message
                    </label>
                    <textarea
                        rows={4}
                        className="w-full p-3 border border-brand-dark/30 rounded-md text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="How can we help?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                    ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
};