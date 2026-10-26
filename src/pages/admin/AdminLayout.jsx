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
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';
import { AuroraLogo } from '../../components/common/AuroraLogo';
import { seedInitialRooms } from '../../firebase/roomService';
import { seedInitialServices } from '../../firebase/serviceItemsService';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, isAdmin, claimAdminRole, quickDemoLogin, logout } = useAuth();
  const { addToast, refreshRooms, refreshServices } = useHotel();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [seeding, setSeeding] = useState(false);

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Room Management', path: '/admin/rooms', icon: BedDouble },
    { label: 'Configurable Services', path: '/admin/services', icon: Sliders },
    { label: 'All Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const handleClaimAdmin = async (e) => {
    e.preventDefault();
    try {
      await claimAdminRole(adminPasscode);
      addToast({
        type: 'success',
        title: 'Admin Privileges Granted',
        message: 'Your profile has been elevated to Aurora Administrator.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Elevation Failed',
        message: err.message || 'Invalid administrator master key.',
      });
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Populate or reset Firestore collections with initial luxury rooms and services?')) {
      return;
    }
    setSeeding(true);
    try {
      await Promise.all([seedInitialRooms(), seedInitialServices()]);
      await Promise.all([refreshRooms(), refreshServices()]);
      addToast({
        type: 'success',
        title: 'Catalog Seeded',
        message: 'Initial rooms and extra services populated successfully.',
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

  // If user is not authorized as admin, show protected access screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy-950 text-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-900 border border-gold-500/30 rounded-3xl p-8 shadow-luxury-lg text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold text-ivory">
              Administrator Portal
            </h1>
            <p className="text-xs text-ivory-300 mt-2 leading-relaxed">
              This environment is protected for Aurora executive staff. Sensitive guest identities
              and reservation databases are restricted.
            </p>
          </div>

          {/* Master Key Elevation Form */}
          <form onSubmit={handleClaimAdmin} className="space-y-3 pt-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Enter Admin Setup Master Key
            </label>
            <input
              type="password"
              placeholder="e.g. AURORA_ADMIN_2026"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-gold-500/40 text-ivory text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
            >
              Verify Master Key
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-navy-800 space-y-2">
            <span className="text-[11px] text-ivory-400 block">
              Or test instantly using evaluator admin profile:
            </span>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin')}
              className="w-full py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/60 transition-colors"
            >
              Sign In as Demo Admin
            </button>
          </div>

          <div className="pt-2">
            <Link to="/" className="text-xs text-gold-400 hover:underline">
              ← Return to Guest Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <span>Admin Management Hub</span>
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
            <span>{seeding ? 'Seeding...' : 'Seed / Reset Firestore'}</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-ivory-300 hover:text-ivory transition-colors text-[11px]"
          >
            <span>Hotel Guest View</span>
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
