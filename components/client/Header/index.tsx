import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isBookingPage = location.pathname === '/book';

  const navItems = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Services', href: '/services' },
    { label: 'Prices', href: '/prices' },
    { label: 'Location', href: '/location' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-20 gap-8">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo(0, 0)}>
            <BrandLogo variant="color" />
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden lg:flex items-center justify-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-brand-dark hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/manage-booking" onClick={() => window.scrollTo(0, 0)}>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Manage Booking
              </button>
            </Link>

            {!isBookingPage && (
              <Link to="/book" onClick={() => window.scrollTo(0, 0)}>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer">
                  Book Parking
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-brand-dark justify-self-end"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white shadow-medium border-t border-gray-100 p-4 flex flex-col gap-4">
          {navItems.map((item) => (
             <Link
                key={item.label}
                to={item.href}
                className="text-base font-medium text-brand-dark py-2 border-b border-gray-50"
                onClick={handleNavClick}
              >
                {item.label}
              </Link>
          ))}
           
           <Link to="/manage-booking" onClick={handleNavClick}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Manage Booking
            </button>
          </Link>

           <Link to="/book" onClick={handleNavClick}>
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer">
              Book Parking
            </button>
          </Link>
        </div>
      )}
    </header>
  );
};