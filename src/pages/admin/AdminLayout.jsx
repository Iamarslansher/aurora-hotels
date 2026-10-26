import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Sliders,
  CalendarCheck,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Database,
  Menu,
  X,
  MessageSquareQuote,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { AuroraLogo } from '../../components/common/AuroraLogo';
import { seedInitialRooms } from '../../firebase/roomService';
import { seedInitialServices } from '../../firebase/serviceItemsService';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { addToast, refreshRooms, refreshServices } = useHotel();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Room Management', path: '/admin/rooms', icon: BedDouble },
    { label: 'Configurable Services', path: '/admin/services', icon: Sliders },
    { label: 'All Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Guest Reviews', path: '/admin/reviews', icon: MessageSquareQuote },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const handleSeedDatabase = async () => {
    if (!window.confirm('Populate Firestore collections with initial luxury rooms and services?')) {
      return;
    }
    setSeeding(true);
    try {
      await Promise.all([seedInitialRooms(), seedInitialServices()]);
      await Promise.all([refreshRooms(), refreshServices()]);
      addToast({
        type: 'success',
        title: 'Catalog Seeded',
        message: 'Rooms and extra services populated into Firestore successfully.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Seed Error',
        message: err.message || 'Could not seed database collections.',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-ivory flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy-900 border-b border-gold-500/20 p-4 flex items-center justify-between">
        <AuroraLogo variant="light" size="small" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-navy-800 text-ivory hover:text-gold-400"
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-navy-900/95 border-r border-gold-500/20 z-40 p-5 flex flex-col justify-between transition-transform duration-300 backdrop-blur-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div className="pb-4 border-b border-navy-800">
            <AuroraLogo variant="light" size="default" />
            <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin Operations Hub</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-gold-gradient text-navy-950 shadow-sm font-bold'
                        : 'text-ivory-300 hover:text-ivory hover:bg-navy-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-4 border-t border-navy-800 text-xs">
          {/* Seed button */}
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedDatabase}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-950 border border-gold-500/30 hover:border-gold-400 text-gold-300 font-medium transition-colors text-[11px]"
          >
            <Database className="w-3.5 h-3.5 text-gold-400" />
            <span>{seeding ? 'Seeding...' : 'Seed / Sync Firestore'}</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-ivory-300 hover:text-ivory transition-colors text-[11px]"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/40 text-[11px] font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 bg-ivory text-navy-950 min-h-screen p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
