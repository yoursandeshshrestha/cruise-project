import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { MapPin, Navigation, Car, Bus } from 'lucide-react';
import { Button } from '../../../components/client/Button';

export const Location: React.FC = () => {
  return (
    <Layout>
      <div className="bg-brand-dark text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Us</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Easy access from the M27 and M3. Just minutes from all cruise terminals.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Info Side */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-light border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-full text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-2">Our Address</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Simple Cruise Parking<br />
                    Unit 5, West Quay Industrial Estate<br />
                    Southampton<br />
                    Hampshire<br />
                    <strong>SO15 1GZ</strong>
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button variant="secondary" className="text-sm py-2 px-4">Open in Google Maps</Button>
                    <Button variant="secondary" className="text-sm py-2 px-4">Open in Waze</Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Car className="text-primary" /> Driving Directions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">From the North (M3)</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Follow M3 towards Southampton. At junction 14, exit onto A33 towards Southampton. 
                    Continue straight on A33 for approx 4 miles. Look for signs for "West Quay Industrial Estate" on your right.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">From the East/West (M27)</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Exit M27 at Junction 3 onto M271 towards Southampton. Follow signs for the Docks. 
                    At the Redbridge Roundabout, take the A33/A35 exit. Continue for 2 miles until you see our signage.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Bus className="text-primary" /> Distance to Terminals
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                    { name: 'Ocean Terminal', time: '10 mins' },
                    { name: 'Mayflower Terminal', time: '8 mins' },
                    { name: 'City Cruise Terminal', time: '8 mins' },
                    { name: 'QEII Terminal', time: '12 mins' },
                    { name: 'Horizon Terminal', time: '10 mins' },
                 ].map(t => (
                    <div key={t.name} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="font-medium text-sm">{t.name}</span>
                        <span className="text-primary font-bold text-sm">{t.time}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Map Side */}
          <div className="h-full min-h-[400px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-medium border border-gray-200 relative bg-gray-100">
            {/* Mock Map View */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                    <MapPin size={48} className="mx-auto text-primary mb-2 animate-bounce" />
                    <p className="text-gray-500 font-medium">Interactive Map Placeholder</p>
                    <p className="text-xs text-gray-400">(Google Maps Embed would go here)</p>
                </div>
            </div>
            {/* Overlay Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                    <Navigation size={24} className="text-blue-500" />
                    <div>
                        <p className="font-bold text-brand-dark">Simple Cruise Parking</p>
                        <p className="text-xs text-gray-500">4.8 Rating (2.1k Reviews)</p>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};