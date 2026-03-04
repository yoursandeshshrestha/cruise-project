import React, { useEffect } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Bus, Zap, Droplets, Sparkles, Clock, Key, Accessibility } from 'lucide-react';
import { useAddOnsStore } from '../../../stores/addOnsStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const { addOns, fetchActiveAddOns } = useAddOnsStore();
  const { addAddOn } = useBookingCartStore();

  useEffect(() => {
    fetchActiveAddOns();
  }, [fetchActiveAddOns]);

  const getIconComponent = (slug: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'ev-charging': <Zap size={32} />,
      'exterior-wash': <Droplets size={32} />,
      'full-valet': <Sparkles size={32} />,
    };
    return iconMap[slug] || <Sparkles size={32} />;
  };

  const handleAddToBooking = (addOnSlug: string) => {
    addAddOn(addOnSlug);
    navigate('/book');
  };
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            More than just parking. We offer a comprehensive range of services to make your cruise holiday seamless from start to finish.
          </p>
        </div>
      </div>

      {/* Main Service: Park & Ride */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
                <div className="bg-blue-50 rounded-2xl p-12 min-h-[320px] flex items-center justify-center border border-blue-100">
                    <Bus size={80} className="text-primary" />
                </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">Premium Park & Ride</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our core service is designed for efficiency and peace of mind. We operate a dedicated fleet of shuttle buses running continuously between our secure facility and all Southampton cruise terminals.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="bg-green-100 p-3 rounded-full text-green-700 h-fit shrink-0"><Shield size={20}/></div>
                  <div>
                    <h4 className="font-bold text-brand-dark text-lg">Secure Block Parking</h4>
                    <p className="text-sm text-gray-600 mt-1">Your car is checked in and parked by professional, insured drivers in our secure, CCTV-monitored compound.</p>
                  </div>
                </li>
                 <li className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-full text-primary h-fit shrink-0"><Clock size={20}/></div>
                  <div>
                    <h4 className="font-bold text-brand-dark text-lg">On-Demand Transfers</h4>
                    <p className="text-sm text-gray-600 mt-1">No strict schedules or waiting around. We run shuttles continuously based on customer arrival times.</p>
                  </div>
                </li>
                 <li className="flex gap-4">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-700 h-fit shrink-0"><Accessibility size={20}/></div>
                  <div>
                    <h4 className="font-bold text-brand-dark text-lg">Assisted Travel</h4>
                    <p className="text-sm text-gray-600 mt-1">Our drivers assist with luggage handling at both ends of the journey. Our buses are accessible and comfortable.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Add Ons */}
      <section className="bg-neutral-light py-20">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-brand-dark mb-4">Optional Extras</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Why not treat your car while you're away? Customise your booking with these convenient add-ons during the checkout process.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {addOns.map(addon => (
                    <div key={addon.id} className="bg-white p-8 rounded-xl shadow-light border border-gray-100 hover:shadow-medium transition-shadow flex flex-col">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6">
                            {getIconComponent(addon.slug)}
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark mb-3">{addon.name}</h3>
                        <p className="text-gray-600 mb-8 grow">{addon.description}</p>
                        <div className="flex items-end justify-between border-t border-gray-50 pt-6">
                            <div>
                                <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">From</span>
                                <div className="text-2xl font-bold text-brand-dark">£{(addon.price / 100).toFixed(2)}</div>
                            </div>
                            <Button
                                variant="secondary"
                                className="text-sm px-6 cursor-pointer"
                                onClick={() => handleAddToBooking(addon.slug)}
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Key Handling Info */}
       <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
             <div className="w-20 h-20 bg-brand-dark text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Key size={36} />
             </div>
             <h2 className="text-3xl font-bold text-brand-dark mb-6">Key Management Policy</h2>
             <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                To maximise capacity and security within our facility, we operate a <strong>block parking system</strong>. All customers are required to leave their car keys with us at check-in — keys are <strong>not returned until you collect your vehicle</strong>.
             </p>
             <div className="bg-blue-50 p-6 rounded-xl text-left max-w-2xl mx-auto border border-blue-100">
                <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-brand-dark">
                        <span className="text-primary font-bold">•</span>
                        Keys are tagged with your unique booking reference immediately upon arrival.
                    </li>
                    <li className="flex items-start gap-3 text-brand-dark">
                        <span className="text-primary font-bold">•</span>
                        Keys are kept securely on site during opening hours and stored off site overnight.
                    </li>
                    <li className="flex items-start gap-3 text-brand-dark">
                        <span className="text-primary font-bold">•</span>
                        Your vehicle is only moved by fully insured drivers to organise the car park or to perform any valeting/charging services.
                    </li>
                </ul>
             </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-20 text-center">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to upgrade your parking experience?</h2>
            <p className="text-blue-50 mb-10 text-lg">Secure your parking space and select your extras today.</p>
            <Link to="/book">
                <Button 
                    variant="secondary" 
                    className="bg-white border-white text-primary hover:bg-blue-50 shadow-lg px-10 py-4 text-lg"
                >
                    Get a Quote
                </Button>
            </Link>
         </div>
      </section>
    </Layout>
  );
};