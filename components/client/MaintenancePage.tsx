import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Lock } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 relative">
      {/* Main Content */}
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
              <Wrench size={64} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          We'll Be Right Back!
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          We're currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          Our team is working hard to get things up and running as soon as possible.
        </p>

        {/* Info Box */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What's happening?</h2>
          <ul className="text-left text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>System upgrades and improvements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Enhanced security measures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Performance optimizations</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Need Immediate Assistance?</h3>
          <p className="text-blue-100 mb-3">
            If you have an urgent booking inquiry or need to manage an existing booking:
          </p>
          <a
            href="tel:+442380123456"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            Call: 023 8012 3456
          </a>
          <p className="text-blue-100 text-sm mt-3">
            Or email us at:{' '}
            <a href="mailto:info@simplecruiseparking.com" className="underline hover:text-white cursor-pointer">
              info@simplecruiseparking.com
            </a>
          </p>
        </div>

        {/* Thank You Message */}
        <p className="text-gray-600 mt-8">
          Thank you for your patience and understanding.
        </p>
      </div>

      {/* Admin Link - Bottom Right */}
      <Link
        to="/admin/login"
        className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all hover:shadow-xl cursor-pointer group"
      >
        <Lock size={18} className="group-hover:scale-110 transition-transform" />
        <span className="font-medium">Admin</span>
      </Link>
    </div>
  );
};
