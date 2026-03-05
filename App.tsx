import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/client/Home';
import { BookingFlow } from './pages/client/BookingFlow';
import { BookingSuccess } from './pages/client/BookingSuccess';
import { HowItWorks } from './pages/client/HowItWorks';
import { Prices } from './pages/client/Prices';
import { Services } from './pages/client/Services';
import { Location } from './pages/client/Location';
import { Contact } from './pages/client/Contact';
import { FAQs } from './pages/client/FAQs';
import { ManageBooking } from './pages/client/ManageBooking';
import { Terms } from './pages/client/Terms';
import { Privacy } from './pages/client/Privacy';
import { Cookies } from './pages/client/Cookies';
import { Terminal } from './pages/client/Terminal';
import { Reviews } from './pages/client/Reviews';
import { ScrollToTop } from './components/client/ScrollToTop';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { NotFound } from './pages/client/NotFound';
import { Toaster } from './components/admin/ui/sonner';
import { useAuthInit } from './hooks/useAuthInit';
import { MaintenancePage } from './components/client/MaintenancePage';
import { useSystemSettingsStore } from './stores/systemSettingsStore';
import { useAuthStore } from './stores/authStore';

const AdminLogin = React.lazy(() => import('./pages/admin/Login').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CruiseLines = React.lazy(() => import('./pages/admin/CruiseLines').then(m => ({ default: m.CruiseLines })));
const Terminals = React.lazy(() => import('./pages/admin/Terminals').then(m => ({ default: m.Terminals })));
const AddOns = React.lazy(() => import('./pages/admin/AddOns').then(m => ({ default: m.AddOns })));
const PromoCodes = React.lazy(() => import('./pages/admin/PromoCodes').then(m => ({ default: m.PromoCodes })));
const Pricing = React.lazy(() => import('./pages/admin/Pricing').then(m => ({ default: m.Pricing })));
const Bookings = React.lazy(() => import('./pages/admin/Bookings').then(m => ({ default: m.Bookings })));
const BookingDetail = React.lazy(() => import('./pages/admin/Bookings/Detail').then(m => ({ default: m.BookingDetail })));
const Payments = React.lazy(() => import('./pages/admin/Payments').then(m => ({ default: m.Payments })));
const Arrivals = React.lazy(() => import('./pages/admin/Arrivals').then(m => ({ default: m.Arrivals })));
const Analytics = React.lazy(() => import('./pages/admin/Analytics').then(m => ({ default: m.Analytics })));
const Settings = React.lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));
const Account = React.lazy(() => import('./pages/admin/Account').then(m => ({ default: m.Account })));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const ContactSubmissions = React.lazy(() => import('./pages/admin/ContactSubmissions').then(m => ({ default: m.ContactSubmissions })));
const BookingCalendar = React.lazy(() => import('./pages/admin/BookingCalendar').then(m => ({ default: m.BookingCalendar })));
const CapacityCalendar = React.lazy(() => import('./pages/admin/CapacityCalendar').then(m => ({ default: m.CapacityCalendar })));

const AdminLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
  </div>
);

const MaintenanceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getSetting = useSystemSettingsStore((state) => state.getSetting);
  const adminUser = useAuthStore((state) => state.adminUser);

  // Get maintenance mode value directly from settings
  const isMaintenanceMode = getSetting<boolean>('features', 'maintenance_mode', false);

  // If maintenance mode is on and user is not an admin, show maintenance page
  if (isMaintenanceMode && !adminUser) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  // Initialize auth and set up global auth state listener
  useAuthInit();

  // Initialize system settings once at app level
  const initialized = useSystemSettingsStore((state) => state.initialized);
  const fetchSettings = useSystemSettingsStore((state) => state.fetchSettings);

  React.useEffect(() => {
    if (!initialized) {
      fetchSettings();
    }
  }, []); // Empty deps - only run once on mount

  return (
    <Router>
      <ScrollToTop />
      <Toaster />
      <Routes>
        {/* Client Routes - wrapped with maintenance check */}
        <Route path="/" element={<MaintenanceWrapper><Home /></MaintenanceWrapper>} />
        <Route path="/book" element={<MaintenanceWrapper><BookingFlow /></MaintenanceWrapper>} />
        <Route path="/booking-success" element={<MaintenanceWrapper><BookingSuccess /></MaintenanceWrapper>} />
        <Route path="/how-it-works" element={<MaintenanceWrapper><HowItWorks /></MaintenanceWrapper>} />
        <Route path="/services" element={<MaintenanceWrapper><Services /></MaintenanceWrapper>} />
        <Route path="/prices" element={<MaintenanceWrapper><Prices /></MaintenanceWrapper>} />
        <Route path="/location" element={<MaintenanceWrapper><Location /></MaintenanceWrapper>} />
        <Route path="/contact" element={<MaintenanceWrapper><Contact /></MaintenanceWrapper>} />
        <Route path="/faqs" element={<MaintenanceWrapper><FAQs /></MaintenanceWrapper>} />
        <Route path="/reviews" element={<MaintenanceWrapper><Reviews /></MaintenanceWrapper>} />
        <Route path="/manage-booking" element={<MaintenanceWrapper><ManageBooking /></MaintenanceWrapper>} />
        <Route path="/terms" element={<MaintenanceWrapper><Terms /></MaintenanceWrapper>} />
        <Route path="/privacy" element={<MaintenanceWrapper><Privacy /></MaintenanceWrapper>} />
        <Route path="/cookies" element={<MaintenanceWrapper><Cookies /></MaintenanceWrapper>} />
        <Route path="/parking/:id" element={<MaintenanceWrapper><Terminal /></MaintenanceWrapper>} />

        {/* Admin Routes (lazy-loaded for performance) */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<Suspense fallback={<AdminLoadingFallback />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Analytics /></Suspense></ProtectedRoute>} />
        <Route path="/admin/cruise-lines" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><CruiseLines /></Suspense></ProtectedRoute>} />
        <Route path="/admin/terminals" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Terminals /></Suspense></ProtectedRoute>} />
        <Route path="/admin/add-ons" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AddOns /></Suspense></ProtectedRoute>} />
        <Route path="/admin/promo-codes" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><PromoCodes /></Suspense></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Pricing /></Suspense></ProtectedRoute>} />
        <Route path="/admin/bookings/:id" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><BookingDetail /></Suspense></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Bookings /></Suspense></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Payments /></Suspense></ProtectedRoute>} />
        <Route path="/admin/booking-calendar" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><BookingCalendar /></Suspense></ProtectedRoute>} />
        <Route path="/admin/capacity-calendar" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><CapacityCalendar /></Suspense></ProtectedRoute>} />
        <Route path="/admin/arrivals" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Arrivals /></Suspense></ProtectedRoute>} />
        <Route path="/admin/configuration" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Settings /></Suspense></ProtectedRoute>} />
        <Route path="/admin/account" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><Account /></Suspense></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><AdminUsers /></Suspense></ProtectedRoute>} />
        <Route path="/admin/contact-submissions" element={<ProtectedRoute><Suspense fallback={<AdminLoadingFallback />}><ContactSubmissions /></Suspense></ProtectedRoute>} />

        {/* 404 Not Found - Catch all */}
        <Route path="*" element={<MaintenanceWrapper><NotFound /></MaintenanceWrapper>} />
      </Routes>
    </Router>
  );
};

export default App;