import React, { ReactNode } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { CookieConsent } from '../CookieConsent';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-light font-sans text-brand-dark">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <CookieConsent />
    </div>
  );
};
