import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { RootLayout } from './layouts/RootLayout';

// Public & Customer Pages
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { AiPlannerPage } from './pages/AiPlannerPage';
import { CustomerBookingsPage } from './pages/CustomerBookingsPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRooms } from './pages/admin/AdminRooms';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminReservations } from './pages/admin/AdminReservations';
import { AdminReports } from './pages/admin/AdminReports';

// Smooth Scroll to Top on Route Change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <ScrollToTop />
          <Routes>
            {/* Public and Customer Portal Routes with Main Navbar & Footer */}
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="rooms/:id" element={<RoomDetailPage />} />
              <Route path="ai-planner" element={<AiPlannerPage />} />
              <Route path="customer/bookings" element={<CustomerBookingsPage />} />
              <Route path="booking-confirmation/:id" element={<BookingConfirmationPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Separate Protected Admin Portal Layout */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
          </Routes>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
