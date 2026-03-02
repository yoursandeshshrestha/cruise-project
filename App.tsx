import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/client/Home';
import { BookingFlow } from './pages/client/BookingFlow';
import { BookingSuccess } from './pages/client/BookingSuccess';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/Login';
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
import { CruiseLines } from './pages/admin/CruiseLines';
import { Terminals } from './pages/admin/Terminals';
import { AddOns } from './pages/admin/AddOns';
import { PromoCodes } from './pages/admin/PromoCodes';
import { Pricing } from './pages/admin/Pricing';
import { Bookings } from './pages/admin/Bookings';
import { BookingDetail } from './pages/admin/Bookings/Detail';
import { Arrivals } from './pages/admin/Arrivals';
import { Analytics } from './pages/admin/Analytics';
import { Settings } from './pages/admin/Settings';
import { Account } from './pages/admin/Account';
import { AdminUsers } from './pages/admin/AdminUsers';
import { ContactSubmissions } from './pages/admin/ContactSubmissions';
import { BookingCalendar } from './pages/admin/BookingCalendar';
import { CapacityCalendar } from './pages/admin/CapacityCalendar';
import { Toaster } from './components/admin/ui/sonner';
import { useAuthInit } from './hooks/useAuthInit';
import { MaintenancePage } from './components/client/MaintenancePage';
import { useSystemSettingsStore } from './stores/systemSettingsStore';
import { useAuthStore } from './stores/authStore';

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

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cruise-lines"
          element={
            <ProtectedRoute>
              <CruiseLines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/terminals"
          element={
            <ProtectedRoute>
              <Terminals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-ons"
          element={
            <ProtectedRoute>
              <AddOns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promo-codes"
          element={
            <ProtectedRoute>
              <PromoCodes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/booking-calendar"
          element={
            <ProtectedRoute>
              <BookingCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/capacity-calendar"
          element={
            <ProtectedRoute>
              <CapacityCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/arrivals"
          element={
            <ProtectedRoute>
              <Arrivals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configuration"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact-submissions"
          element={
            <ProtectedRoute>
              <ContactSubmissions />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found - Catch all */}
        <Route path="*" element={<MaintenanceWrapper><NotFound /></MaintenanceWrapper>} />
      </Routes>
    </Router>
  );
};

export default App;