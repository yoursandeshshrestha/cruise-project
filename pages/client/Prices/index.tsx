import React, { useEffect } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Droplets, Sparkles, Clock, Calendar, Truck } from 'lucide-react';
import { useAddOnsStore } from '../../../stores/addOnsStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';
import { FIRST_DAY_RATE, ADDITIONAL_DAY_RATE, VAN_SURCHARGE_MULTIPLIER } from '../../../constants';

export const Prices: React.FC = () => {
  const navigate = useNavigate();
  const { addOns, fetchActiveAddOns } = useAddOnsStore();
  const { addAddOn } = useBookingCartStore();

  useEffect(() => {
    fetchActiveAddOns();
  }, [fetchActiveAddOns]);

  // Pricing tiers with weekly bulk discounts
  const pricingTiers = [
    { days: 1, carPrice: 26.00, label: '1 Day' },
    { days: 2, carPrice: 39.00, label: '2 Days' },
    { days: 3, carPrice: 52.00, label: '3 Days' },
    { days: 4, carPrice: 65.00, label: '4 Days' },
    { days: 5, carPrice: 78.00, label: '5 Days' },
    { days: 6, carPrice: 91.00, label: '6 Days' },
    { days: 7, carPrice: 95.00, label: '1 Week' },
    { days: 14, carPrice: 160.00, label: '2 Weeks' },
    { days: 21, carPrice: 220.00, label: '3 Weeks' },
    { days: 28, carPrice: 310.00, label: '4 Weeks' },
  ];

  const getIconComponent = (slug: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'ev-charging': <Zap size={24} />,
      'exterior-wash': <Droplets size={24} />,
      'full-valet': <Sparkles size={24} />,
    };
    return iconMap[slug] || <Sparkles size={24} />;
  };

  const handleAddToBooking = (addOnSlug: string) => {
    addAddOn(addOnSlug);
    navigate('/book');
  };

  return (
    <Layout>
      <div className="bg-brand-dark text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Transparent Pricing</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          No hidden fees. Just simple, affordable rates for secure cruise parking.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Pricing Table Card */}
          <div className="bg-white rounded-2xl shadow-medium border border-gray-100 overflow-hidden col-span-1 md:col-span-2">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-2">Park & Ride Pricing</h2>
              <p className="text-gray-600 mb-6">
                All prices include secure parking and free shuttle transfers for all passengers.
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-semibold text-brand-dark">Duration</th>
                      <th className="text-right p-3 font-semibold text-brand-dark">Car</th>
                      <th className="text-right p-3 font-semibold text-amber-700">
                        <span className="flex items-center justify-end gap-1">
                          <Truck size={14} /> Van (+40%)
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pricingTiers.map((tier) => {
                      const vanPrice = Math.round(tier.carPrice * VAN_SURCHARGE_MULTIPLIER * 100) / 100;

                      return (
                        <tr key={tier.days} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-700">{tier.label}</td>
                          <td className="p-3 text-right font-bold text-brand-dark">£{tier.carPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-amber-700">£{vanPrice.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
                <Truck size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <p>Vans take up 1.5 parking spaces, so a 40% surcharge applies to the parking cost.</p>
              </div>

              <div className="mt-6">
                <Link to="/book">
                  <Button>Get a Quote</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-brand-dark rounded-2xl p-8 text-white flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-4">Why book direct?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="text-primary shrink-0" />
                <span className="text-sm text-gray-300">Best price guarantee when you book directly through our website.</span>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="text-primary shrink-0" />
                <span className="text-sm text-gray-300">Priority booking management and instant confirmation.</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="text-primary shrink-0" />
                <span className="text-sm text-gray-300">Exclusive access to valet and EV charging add-ons.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center">What's Included</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'Secure, CCTV monitored facility' },
              { label: 'Free shuttle to all terminals (10 mins)' },
              { label: 'Luggage assistance included' },
              { label: 'Flexible amendment policy' },
              { label: 'Nightly security patrols' },
              { label: 'ADT security system on site' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-gray-700">
                <Check size={18} className="text-green-500 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Ons */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-brand-dark mb-10 text-center">Optional Extras</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon) => (
              <div key={addon.id} className="bg-white p-6 rounded-xl shadow-light border border-gray-100 hover:shadow-medium transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-4">
                  {getIconComponent(addon.slug)}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{addon.description}</p>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <span className="text-2xl font-bold text-brand-dark">£{(addon.price / 100).toFixed(2)}</span>
                  <Button
                    variant="secondary"
                    className="px-4 py-2 text-sm cursor-pointer"
                    onClick={() => handleAddToBooking(addon.slug)}
                  >
                    Add to Booking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
            <h2 className="text-3xl font-bold text-brand-dark mb-8 text-center">Compare & Save</h2>
            <table className="w-full max-w-4xl mx-auto bg-white shadow-light rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-brand-dark">
                    <tr>
                        <th className="p-4 text-left">Feature</th>
                        <th className="p-4 text-center bg-blue-50 text-primary border-t-2 border-primary">Simple Cruise Parking</th>
                        <th className="p-4 text-center text-gray-500">On-Port Parking</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="p-4 font-medium">Cost per week (approx)</td>
                        <td className="p-4 text-center font-bold text-green-600">£104.00</td>
                        <td className="p-4 text-center text-gray-500">£140.00+</td>
                    </tr>
                    <tr>
                        <td className="p-4 font-medium">Shuttle Service</td>
                        <td className="p-4 text-center text-green-600 font-medium">Included (Door to Door)</td>
                        <td className="p-4 text-center text-gray-500">Walk required</td>
                    </tr>
                     <tr>
                        <td className="p-4 font-medium">Security</td>
                        <td className="p-4 text-center">24/7 CCTV & Guarded</td>
                        <td className="p-4 text-center">Open Public Access</td>
                    </tr>
                     <tr>
                        <td className="p-4 font-medium">EV Charging Available</td>
                        <td className="p-4 text-center text-green-600"><Check size={20} className="mx-auto" /></td>
                        <td className="p-4 text-center text-gray-400">-</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </Layout>
  );
};
