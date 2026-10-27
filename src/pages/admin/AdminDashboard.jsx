import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CalendarCheck,
  BedDouble,
  Sliders,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { getAllBookings } from '../../firebase/bookingService';
import { formatPKR, maskCNIC } from '../../utils/formatters';

export const AdminDashboard = () => {
  const { rooms, services } = useHotel();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const all = await getAllBookings();
        setBookings(all);
      } catch (err) {
        console.warn('Error loading admin reservations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute analytics
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'checked-in');
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (Number(b.pricingSnapshot?.grandTotal) || 0),
    0
  );
  const activeRoomsCount = rooms.filter((r) => r.isActive !== false).length;
  const occupancyRate = rooms.length > 0 ? Math.min(100, Math.round((confirmedBookings.length / (rooms.length * 2)) * 100)) : 0;

  const statCards = [
    {
      label: 'Gross Booked Revenue',
      value: formatPKR(totalRevenue),
      subtext: 'From verified reservations',
      icon: DollarSign,
      color: 'text-gold-600',
      bgColor: 'bg-gold-50 border-gold-200',
    },
    {
      label: 'Total Active Bookings',
      value: confirmedBookings.length,
      subtext: `${bookings.length} total lifetime orders`,
      icon: CalendarCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Active Hotel Suites',
      value: `${activeRoomsCount} / ${rooms.length}`,
      subtext: 'Guest rooms & meeting spaces',
      icon: BedDouble,
      color: 'text-navy-900',
      bgColor: 'bg-navy-50 border-navy-200',
    },
    {
      label: 'Estimated Occupancy',
      value: `${occupancyRate}%`,
      subtext: 'Current booking pacing',
      icon: TrendingUp,
      color: 'text-gold-700',
      bgColor: 'bg-gold-50 border-gold-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
            Executive Overview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
            Operations Dashboard
          </h1>
          <p className="text-sm text-navy-700/80 mt-1">
            Real-time reservations, room inventory, and configurable hospitality services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/rooms"
            className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-ivory text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Manage Rooms
          </Link>
          <Link
            to="/admin/services"
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
          >
            Manage Services
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${card.bgColor} shadow-sm space-y-3 bg-white`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white border border-navy-100 flex items-center justify-center shadow-xs">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
                {card.value}
              </div>
              <p className="text-xs text-navy-500 font-medium">{card.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Reservations Table */}
      <div className="bg-white rounded-3xl border border-gold-500/20 shadow-luxury overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900">
              Recent Guest Reservations
            </h2>
            <p className="text-xs text-navy-600 mt-1">
              Latest bookings with verified price snapshots and sensitive CNIC masking.
            </p>
          </div>

          <Link
            to="/admin/reservations"
            className="text-xs font-bold text-gold-700 hover:text-gold-800 uppercase tracking-wider flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-navy-500 animate-pulse">
            Loading reservations registry...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-600">
            No guest bookings recorded yet. New reservations will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-navy-900">
              <thead className="bg-ivory border-b border-navy-100 uppercase tracking-wider text-[11px] text-navy-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Guest</th>
                  <th className="px-6 py-4 font-semibold">Suite &amp; Category</th>
                  <th className="px-6 py-4 font-semibold">Dates</th>
                  <th className="px-6 py-4 font-semibold">Grand Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gold-700">
                      {b.bookingReference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-navy-950">{b.guestDetails?.fullName}</p>
                      <span className="text-[11px] text-navy-500 font-mono">
                        CNIC: {maskCNIC(b.guestDetails?.cnic)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{b.roomSnapshot?.name}</p>
                      <span className="text-xs text-navy-500">{b.roomSnapshot?.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span>{b.checkIn} → {b.checkOut}</span>
                      <span className="block text-[11px] text-navy-500">
                        {b.nights} {b.roomSnapshot?.pricingUnit === 'day' ? 'day' : 'night'}{b.nights > 1 ? 's' : ''} ({b.guestCount} guests)
                      </span>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-navy-950">
                      {formatPKR(b.pricingSnapshot?.grandTotal)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-navy-100 text-navy-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
