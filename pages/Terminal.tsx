import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { BookingWidget } from '../components/BookingWidget';
import { Button } from '../components/Button';
import { MapPin, Navigation, Clock, Shield } from 'lucide-react';

const TERMINAL_DATA: Record<string, { name: string; description: string; directions: string }> = {
  'ocean-terminal': {
    name: 'Ocean Cruise Terminal',
    description: 'Parking for Ocean Terminal Southampton (Dock Gate 4). We provide the fastest shuttle service directly to the baggage drop.',
    directions: 'Ocean Terminal is located in the Eastern Docks. Our shuttle enters via Dock Gate 4, getting you as close to the ship as possible.'
  },
  'mayflower-terminal': {
    name: 'Mayflower Cruise Terminal',
    description: 'Secure parking for Mayflower Terminal (Dock Gate 10). Perfect for P&O and Cunard passengers.',
    directions: 'Mayflower Terminal is in the Western Docks. It is one of the busiest terminals, but our shuttle drivers know the shortcuts to avoid the queues.'
  },
  'city-cruise-terminal': {
    name: 'City Cruise Terminal',
    description: 'Convenient parking for City Cruise Terminal (Dock Gate 8). Ideal for Royal Caribbean and MSC cruises.',
    directions: 'Located in the Western Docks, accessible via Dock Gate 8. Our drop-off point is right outside the main luggage hall.'
  },
  'qeii-terminal': {
    name: 'QEII Terminal',
    description: 'Off-site parking for the QEII Terminal (Dock Gate 4). Secure your car and enjoy a quick transfer.',
    directions: 'The QEII Terminal is situated in the Eastern Docks. Please note this terminal is often used for day visits and smaller vessels.'
  },
  'horizon-terminal': {
    name: 'Horizon Cruise Terminal',
    description: 'Parking for the new Horizon Terminal (Dock Gate 10). The newest facility in Southampton.',
    directions: 'Horizon is the newest terminal in Southampton, located near Mayflower in the Western Docks. Our shuttles have priority drop-off access.'
  }
};

export const Terminal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const terminal = id && TERMINAL_DATA[id] ? TERMINAL_DATA[id] : null;

  if (!terminal) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Terminal Not Found</h1>
          <Link to="/" className="text-primary underline mt-4 block">Return Home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-brand-dark text-white pt-16 pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Parking for {terminal.name}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {terminal.description}
          </p>
        </div>
      </div>

      {/* Booking Widget Overlay */}
      <div className="px-4 mb-20">
        <BookingWidget />
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Why park with us for {terminal.name}?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Avoid the expensive on-port parking rates. Our secure facility is located just minutes away from {terminal.name}, offering a park and ride service that is often faster than parking at the docks yourself.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded text-primary"><Clock size={20} /></div>
                  <div>
                    <h4 className="font-bold text-brand-dark">Fast Transfers</h4>
                    <p className="text-sm text-gray-600">Shuttles run continuously to {terminal.name}.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded text-primary"><Shield size={20} /></div>
                  <div>
                    <h4 className="font-bold text-brand-dark">Secure Facility</h4>
                    <p className="text-sm text-gray-600">Your car stays in our secure compound while you cruise.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-light border border-gray-100">
               <h3 className="text-xl font-bold text-brand-dark mb-3 flex items-center gap-2">
                 <Navigation size={20} className="text-primary" />
                 Directions to {terminal.name}
               </h3>
               <p className="text-gray-600 text-sm leading-relaxed">
                 {terminal.directions}
               </p>
               <div className="mt-4">
                 <p className="text-sm font-bold text-brand-dark mb-1">Transfer Time:</p>
                 <p className="text-primary font-bold text-lg">~10 Minutes</p>
               </div>
            </div>
          </div>

          {/* Placeholder Image/Map */}
          <div className="bg-gray-100 rounded-2xl min-h-[400px] flex items-center justify-center relative overflow-hidden">
             <div className="text-center p-6">
                <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Map of route to {terminal.name}</p>
             </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Book your {terminal.name} parking today</h2>
            <Link to="/book">
                <Button className="px-8">Get a Quote</Button>
            </Link>
        </div>
      </div>
    </Layout>
  );
};