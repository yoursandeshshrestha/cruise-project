import React, { useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';
import { useTerminalsStore } from '../../../stores/terminalsStore';

export const Footer: React.FC = () => {
  const { getCompanyInfo } = useSystemSettingsStore();
  const companyInfo = getCompanyInfo();
  const { terminals, fetchActiveTerminals } = useTerminalsStore();

  useEffect(() => {
    fetchActiveTerminals();
  }, [fetchActiveTerminals]);

  const getTerminalSlug = (terminalName: string) => {
    return terminalName.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                <BrandLogo variant="white" />
              </Link>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Safe, secure and stress-free parking for Southampton cruise passengers. Offering complete peace of mind in our secure facilities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/book" className="hover:text-primary transition-colors">Book Parking</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link to="/manage-booking" className="hover:text-primary transition-colors">Manage Booking</Link></li>
              <li><Link to="/prices" className="hover:text-primary transition-colors">Prices</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Terminals */}
          <div>
            <h4 className="font-bold text-lg mb-4">Cruise Terminals</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {terminals.map((terminal) => (
                <li key={terminal.id}>
                  <Link
                    to={`/parking/${getTerminalSlug(terminal.name)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {terminal.name} Parking
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-1" />
                <span>{companyInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`}>{companyInfo.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Simple Cruise Parking Ltd. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="cursor-pointer hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="cursor-pointer hover:text-white">Terms & Conditions</Link>
            <Link to="/cookies" className="cursor-pointer hover:text-white">Cookie Policy</Link>
            <Link to="/admin" className="cursor-pointer hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};