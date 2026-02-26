import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield } from 'lucide-react';

const CONSENT_KEY = 'scp_cookie_consent';

type ConsentLevel = 'all' | 'essential';

interface StoredConsent {
  level: ConsentLevel;
  timestamp: string;
}

function getStoredConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function storeConsent(level: ConsentLevel) {
  const consent: StoredConsent = { level, timestamp: new Date().toISOString() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    storeConsent('all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    storeConsent('essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-brand-dark/30 backdrop-blur-sm z-[9998]" />
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-medium border border-gray-200 overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Cookie size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-brand-dark mb-1">We value your privacy</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to improve your experience, analyse site traffic, and personalise content.
                  You can accept all cookies or choose essential cookies only.{' '}
                  <Link
                    to="/cookies"
                    className="text-primary font-medium hover:underline"
                  >
                    Read our Cookie Policy
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
              <button
                onClick={handleEssentialOnly}
                className="px-5 py-2.5 rounded-lg font-medium text-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield size={16} />
                Essential Only
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-lg font-medium text-sm bg-primary text-white hover:bg-primary-dark shadow-light hover:shadow-medium transition-all cursor-pointer"
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
