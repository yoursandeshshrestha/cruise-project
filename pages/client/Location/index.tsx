import React from 'react';
import { Layout } from '../../../components/client/Layout';
import { SEO } from '../../../components/client/SEO';
import { MapPin, Car, Bus } from 'lucide-react';
import { Button } from '../../../components/client/Button';

export const Location: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Our Location | Simple Cruise Parking Southampton"
        description="Find Simple Cruise Parking near Southampton docks. Easy access from the M27 and M3, just minutes from all cruise terminals."
        canonicalPath="/location"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Location', path: '/location' }]}
      />
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
                    Unit 9 Northbrook Industrial Estate<br />
                    Vincent Avenue<br />
                    Southampton<br />
                    <strong>SO16 6PB</strong>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href="https://www.google.com/maps/search/?api=1&query=50.931932,-1.427666" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="text-sm py-2 px-4">Open in Google Maps</Button>
                    </a>
                    <a href="https://maps.apple.com/?ll=50.931932,-1.427666&q=Simple+Cruise+Parking" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="text-sm py-2 px-4">Open in Apple Maps</Button>
                    </a>
                    <a href="https://waze.com/ul?ll=50.931932,-1.427666&navigate=yes" target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" className="text-sm py-2 px-4">Open in Waze</Button>
                    </a>
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
                    Follow the M3 southbound towards Southampton. At Junction 14, take the A33 exit towards Southampton. Continue south on the A33 (Winchester Road) for approximately 1.5 miles. At the junction with Hollybrook Road, turn left onto Hollybrook Road, then take the first right onto Vincent Avenue. Northbrook Industrial Estate is on your right.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">From the East/West (M27)</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Exit the M27 at Junction 3 onto the M271 southbound towards Southampton. At the end of the M271, join the A33 northbound towards the city centre. Continue on the A33 (Winchester Road) for approximately 1 mile, then turn right onto Hollybrook Road, followed by the first left onto Vincent Avenue. Northbrook Industrial Estate is on your right.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">From Southampton City Centre</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Head north on the A33 (Winchester Road) from the city centre. After approximately 2 miles, turn right onto Hollybrook Road, then take the first right onto Vincent Avenue. Northbrook Industrial Estate is on your right.
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
                    { name: 'Ocean Terminal', time: '9 mins' },
                    { name: 'Mayflower Terminal', time: '9 mins' },
                    { name: 'City Cruise Terminal', time: '9 mins' },
                    { name: 'QEII Terminal', time: '14 mins' },
                    { name: 'Horizon Terminal', time: '12 mins' },
                 ].map(t => (
                    <div key={t.name} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                        <span className="font-medium text-sm">{t.name}</span>
                        <span className="text-primary font-bold text-sm">{t.time}</span>
                    </div>
                 ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">These times vary depending on traffic conditions.</p>
            </div>
          </div>

          {/* Map Side */}
          <div className="h-full min-h-[400px] lg:min-h-[600px] rounded-2xl overflow-hidden shadow-medium border border-gray-200 relative bg-gray-100">
            <iframe
              title="Simple Cruise Parking Location"
              src="https://maps.google.com/maps?q=50.931932,-1.427666&z=16&output=embed"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>
    </Layout>
  );
};