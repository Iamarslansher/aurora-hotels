import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Users,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Filter,
  Lock,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { getAllBookings, updateBookingStatus } from '../../firebase/bookingService';
import { formatPKR, maskCNIC } from '../../utils/formatters';

export const AdminReservations = () => {
  const { addToast } = useHotel();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Revealed CNICs state for authorized audit inspection
  const [revealedCNICMap, setRevealedCNICMap] = useState({});

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const all = await getAllBookings();
      setBookings(all);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Reservation status updated to ${newStatus}.`,
      });
      fetchReservations();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message,
      });
    }
  };

  const toggleRevealCNIC = (bookingId) => {
    setRevealedCNICMap((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const refMatch = b.bookingReference?.toLowerCase().includes(q);
      const nameMatch = b.guestDetails?.fullName?.toLowerCase().includes(q);
      const phoneMatch = b.guestDetails?.phone?.toLowerCase().includes(q);
      const roomMatch = b.roomSnapshot?.name?.toLowerCase().includes(q);
      if (!refMatch && !nameMatch && !phoneMatch && !roomMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
          Guest Log &amp; Front Desk
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
          Reservations &amp; Availability Register
        </h1>
        <p className="text-sm text-navy-700/80 mt-1">
          Review guest identities, locked rate snapshots, requested amenities, and update check-in statuses.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gold-500/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by guest, phone, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-navy-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-navy-200 text-xs sm:text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
          >
            <option value="all">All Reservation Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-gold-500/20 shadow-luxury overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-navy-500 animate-pulse">
            Loading reservations register...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-600">
            No reservations match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-navy-900">
              <thead className="bg-ivory border-b border-navy-100 uppercase tracking-wider text-[11px] text-navy-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference &amp; Dates</th>
                  <th className="px-6 py-4 font-semibold">Guest Identity &amp; CNIC</th>
                  <th className="px-6 py-4 font-semibold">Room &amp; Guests</th>
                  <th className="px-6 py-4 font-semibold">Requested Services</th>
                  <th className="px-6 py-4 font-semibold">Locked Total</th>
                  <th className="px-6 py-4 font-semibold">Status Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {filteredBookings.map((b) => {
                  const isRevealed = Boolean(revealedCNICMap[b.id]);
                  return (
                    <tr key={b.id} className="hover:bg-ivory/60 transition-colors">
                      {/* Ref & Dates */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded text-xs">
                          {b.bookingReference}
                        </span>
                        <p className="font-semibold text-navy-950 mt-1.5">
                          {b.checkIn} → {b.checkOut}
                        </p>
                        <span className="text-[11px] text-navy-500">
                          {b.nights} {b.roomSnapshot?.pricingUnit === 'day' ? 'Day' : 'Night'}{b.nights > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Guest Details & Protected CNIC */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-navy-950">{b.guestDetails?.fullName}</p>
                        <p className="text-xs text-navy-600">{b.guestDetails?.phone}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] font-mono text-navy-700 bg-ivory px-2 py-0.5 rounded border border-navy-200">
                            {isRevealed
                              ? b.guestDetails?.cnic || 'N/A'
                              : maskCNIC(b.guestDetails?.cnic)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealCNIC(b.id)}
                            className="text-navy-500 hover:text-gold-700 p-0.5"
                            title={isRevealed ? 'Mask CNIC' : 'Reveal for Check-in Audit'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Room & Guests */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy-950">{b.roomSnapshot?.name}</p>
                        <span className="text-xs text-gold-700 font-medium">{b.roomSnapshot?.category}</span>
                        <span className="block text-[11px] text-navy-500">
                          Room {b.roomSnapshot?.roomNumber} • {b.guestCount} Guest{b.guestCount > 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Requested Services */}
                      <td className="px-6 py-4">
                        {b.servicesSnapshot && b.servicesSnapshot.length > 0 ? (
                          <div className="space-y-1">
                            {b.servicesSnapshot.map((s, idx) => (
                              <div key={idx} className="text-[11px] text-navy-700 flex items-center justify-between gap-2">
                                <span>• {s.name}</span>
                                <span className="font-semibold text-gold-700">{formatPKR(s.calculatedCost)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-navy-400 italic">No extra services</span>
                        )}
                        {b.specialRequests && (
                          <p className="mt-1 text-[11px] text-navy-500 italic bg-ivory p-1.5 rounded">
                            "{b.specialRequests}"
                          </p>
                        )}
                      </td>

                      {/* Grand Total */}
                      <td className="px-6 py-4 font-serif font-bold text-navy-950 text-base">
                        {formatPKR(b.pricingSnapshot?.grandTotal)}
                        <span className="block text-[10px] font-sans font-normal text-emerald-700 mt-0.5">
                          {b.paymentStatus || 'Pay on Arrival'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border focus:outline-none ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : b.status === 'checked-in'
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : b.status === 'checked-out'
                              ? 'bg-navy-50 border-navy-300 text-navy-800'
                              : 'bg-red-50 border-red-300 text-red-800'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="checked-in">Checked In</option>
                          <option value="checked-out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
