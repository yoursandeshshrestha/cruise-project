import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';

export const MaintenancePage: React.FC = () => {
  const getSetting = useSystemSettingsStore((state) => state.getSetting);

  // Get company info values directly to avoid infinite loops
  const companyEmail = getSetting<string>('business', 'company_email', 'info@simplecruiseparking.com');
  const companyPhone = getSetting<string>('business', 'company_phone', '+44 (0) 23 8000 0000');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="color" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          We'll Be Right Back
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg text-gray-600 mb-10">
          Our site is currently undergoing scheduled maintenance.
          <br />
          We'll be back online shortly.
        </p>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-600 font-medium mb-4">
            Need immediate assistance?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`mailto:${companyEmail}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm">{companyEmail}</span>
            </a>
            <span className="hidden sm:inline text-gray-300">•</span>
            <a
              href={`tel:${companyPhone.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm">{companyPhone}</span>
            </a>
          </div>
        </div>
        </div>
      </div>

      {/* Footer with admin link */}
      <footer className="py-4 px-6">
        <div className="flex justify-end">
          <Link
            to="/admin/login"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
};
