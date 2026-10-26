import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import { RootLayout } from './layouts/RootLayout';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';

// Public & Customer Pages
import { HomePage } from './pages/HomePage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { AiPlannerPage } from './pages/AiPlannerPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
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
import { AdminReviews } from './pages/admin/AdminReviews';
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
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<CustomerProfilePage />} />
                <Route path="customer/bookings" element={<CustomerBookingsPage />} />
                <Route path="booking-confirmation/:id" element={<BookingConfirmationPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Separate Protected Admin Portal Layout */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="rooms" element={<AdminRooms />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Route>
          </Routes>
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
