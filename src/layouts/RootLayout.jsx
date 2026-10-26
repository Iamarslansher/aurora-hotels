import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ToastContainer } from '../components/common/ToastContainer';

export const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-navy-950 font-sans selection:bg-gold-500 selection:text-white">
      <Navbar />
      <ToastContainer />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
