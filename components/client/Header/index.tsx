import React, { useState } from 'react';
import { Menu, X, UserCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white shadow-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop layout */}
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center h-20 gap-8">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo(0, 0)}>
            <BrandLogo variant="color" />
          </Link>

          <nav className="flex items-center justify-center gap-6">
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

          <div className="flex items-center gap-3">
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
        </div>

        {/* Mobile layout */}
        <div className="lg:hidden flex items-center h-16 gap-3">
          {/* Hamburger */}
          <button
            className="p-2 text-brand-dark shrink-0"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>
            <BrandLogo variant="color" />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Book Parking button */}
          {!isBookingPage && (
            <Link to="/book" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }}>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                Book Parking
              </button>
            </Link>
          )}

          {/* Avatar / Manage Booking */}
          <Link to="/manage-booking" onClick={() => { setIsOpen(false); window.scrollTo(0, 0); }} aria-label="Manage Booking">
            <UserCircle size={30} className="text-brand-dark hover:text-primary transition-colors" />
          </Link>
        </div>

      </div>

      {/* Mobile Menu — full-screen slide-in from left */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsOpen(false)}
        />

        {/* Panel */}
        <div className="relative h-full w-full bg-white flex flex-col shadow-xl">
          {/* Header row */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 shrink-0">
            <Link to="/" onClick={handleNavClick}>
              <BrandLogo variant="color" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="p-2 text-brand-dark hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-xl font-medium text-brand-dark hover:text-primary transition-colors py-3 border-b border-gray-100 last:border-0"
                onClick={handleNavClick}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons pinned to bottom */}
          <div className="px-5 py-6 flex flex-col gap-3 border-t border-gray-100 shrink-0">
            <Link to="/manage-booking" onClick={handleNavClick} className="w-full">
              <button className="w-full px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Manage Booking
              </button>
            </Link>
            <Link to="/book" onClick={handleNavClick} className="w-full">
              <button className="w-full px-4 py-3 text-base font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors cursor-pointer">
                Book Parking
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};