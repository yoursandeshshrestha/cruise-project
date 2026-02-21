import React, { useEffect } from 'react';
import { Layout } from '../../../components/client/Layout';
import { Button } from '../../../components/client/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Droplets, Sparkles, Clock, Calendar } from 'lucide-react';
import { usePricingStore } from '../../../stores/pricingStore';
import { useAddOnsStore } from '../../../stores/addOnsStore';
import { useBookingCartStore } from '../../../stores/bookingCartStore';

export const Prices: React.FC = () => {
  const navigate = useNavigate();
  const { activePricingRule, initialized, fetchActivePricingRule } = usePricingStore();
  const { addOns, fetchActiveAddOns } = useAddOnsStore();
  const { addAddOn } = useBookingCartStore();

  useEffect(() => {
    if (!initialized) {
      fetchActivePricingRule();
    }
    fetchActiveAddOns();
  }, [initialized, fetchActivePricingRule, fetchActiveAddOns]);

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

  // Convert pence to pounds
  const dailyRate = activePricingRule ? (activePricingRule.price_per_day / 100) : 12.50;
  const minStayCost = activePricingRule ? (activePricingRule.minimum_charge / 100) : 45.00;
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
          
          {/* Standard Rate Card */}
          <div className="bg-white rounded-2xl shadow-medium border border-gray-100 overflow-hidden col-span-1 md:col-span-2 flex flex-col md:flex-row">
            <div className="p-8 md:w-2/3">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Park & Ride Standard Rate</h2>
              <p className="text-gray-600 mb-6">
                Our standard daily rate applies to all bookings. Includes secure parking and free shuttle transfers for all passengers.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" />
                  Secure, CCTV monitored facility
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" />
                  Free shuttle to all terminals (10 mins)
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" />
                  Luggage assistance included
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check size={18} className="text-green-500" />
                  Flexible amendment policy
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 p-8 md:w-1/3 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-gray-100">
              <span className="text-gray-500 font-medium mb-1">From only</span>
              <div className="text-5xl font-bold text-primary mb-2">£{dailyRate.toFixed(2)}</div>
              <span className="text-gray-500 mb-6">per day</span>
              <Link to="/book" className="w-full">
                <Button fullWidth>Get a Quote</Button>
              </Link>
              <p className="text-xs text-gray-400 mt-4">Minimum stay charge £{minStayCost.toFixed(2)} applies.</p>
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
                        <td className="p-4 text-center font-bold text-green-600">£87.50</td>
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