import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Edit,
  Power,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Eye,
  Star,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { addRoom, updateRoom, toggleRoomStatus } from '../../firebase/roomService';
import { formatPKR } from '../../utils/formatters';

export const AdminRooms = () => {
  const { rooms, refreshRooms, addToast } = useHotel();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    category: 'Couple Room',
    capacity: 2,
    pricePerNight: 8500,
    pricingUnit: 'night',
    size: '450 sq ft',
    bedType: '1 King Bed',
    view: 'Garden View',
    description: '',
    amenities: 'High-Speed Wi-Fi, Smart TV, Climate Control, Ensuite Rain Shower',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      roomNumber: `${rooms.length + 101}`,
      category: 'Couple Room',
      capacity: 2,
      pricePerNight: 8500,
      pricingUnit: 'night',
      size: '450 sq ft',
      bedType: '1 King Bed',
      view: 'Garden View',
      description: 'Elegant luxury suite tailored for absolute comfort.',
      amenities: 'High-Speed Wi-Fi, Smart TV, Climate Control, Ensuite Rain Shower',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      roomNumber: room.roomNumber,
      category: room.category,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      pricingUnit: room.pricingUnit || 'night',
      size: room.size || '450 sq ft',
      bedType: room.bedType || '1 King Bed',
      view: room.view || 'Resort Grounds',
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      imageUrl: room.images?.[0] || '',
      isActive: room.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (roomId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await toggleRoomStatus(roomId, newStatus);
      await refreshRooms();
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `Room status set to ${newStatus ? 'Active' : 'Deactivated'}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.message,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const roomPayload = {
        name: formData.name,
        roomNumber: formData.roomNumber,
        category: formData.category,
        capacity: Number(formData.capacity),
        pricePerNight: Number(formData.pricePerNight),
        pricingUnit: formData.pricingUnit,
        size: formData.size,
        bedType: formData.bedType,
        view: formData.view,
        description: formData.description,
        amenities: amenitiesArray,
        images: [formData.imageUrl],
        isActive: formData.isActive,
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomPayload);
        addToast({
          type: 'success',
          title: 'Room Updated',
          message: `${roomPayload.name} modified successfully.`,
        });
      } else {
        await addRoom(roomPayload);
        addToast({
          type: 'success',
          title: 'Room Created',
          message: `${roomPayload.name} added to hotel inventory.`,
        });
      }

      await refreshRooms();
      setModalOpen(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-600 font-bold block mb-1">
            Inventory Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
            Rooms &amp; Suites Directory
          </h1>
          <p className="text-sm text-navy-700/80 mt-1">
            Configure room categories, capacities, nightly rates, photography, and availability status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-navy-950 font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95"
        >
          <Plus className="w-4 h-4 text-navy-950" />
          <span>Add New Suite</span>
        </button>
      </div>

      {/* Room Table */}
      <div className="bg-white rounded-3xl border border-gold-500/20 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-navy-900">
            <thead className="bg-ivory border-b border-navy-100 uppercase tracking-wider text-[11px] text-navy-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Suite &amp; Photo</th>
                <th className="px-6 py-4 font-semibold">Number</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Price / Night or Day</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rooms.map((room) => {
                const isActive = room.isActive !== false;
                return (
                  <tr key={room.id} className="hover:bg-ivory/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gold-500/20"
                        />
                        <div>
                          <p className="font-bold text-navy-950">{room.name}</p>
                          <span className="text-[11px] text-navy-500">{room.bedType || 'King Bed'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gold-700">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-navy-100 text-navy-800">
                        {room.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-semibold text-navy-900">
                        <Users className="w-3.5 h-3.5 text-gold-600" />
                        {room.capacity} Guest{room.capacity > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-navy-950">
                      {formatPKR(room.pricePerNight)} / {room.pricingUnit === 'day' ? 'day' : 'night'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(room)}
                          className="p-1.5 rounded-lg border border-navy-200 hover:bg-gold-50 text-navy-700 hover:text-gold-700"
                          title="Edit Room Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(room.id, isActive)}
                          className={`p-1.5 rounded-lg border ${
                            isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={isActive ? 'Deactivate Room' : 'Activate Room'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-gold-500/30 p-6 sm:p-8 shadow-luxury-lg space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-navy-100">
              <h2 className="font-serif text-2xl font-bold text-navy-900">
                {editingRoom ? `Edit ${editingRoom.name}` : 'Add New Luxury Suite'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-navy-600 hover:bg-navy-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Suite Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const category = e.target.value;
                      setFormData({
                        ...formData,
                        category,
                        pricingUnit: category === 'Meeting Rooms' ? 'day' : 'night',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-navy-200 text-xs font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  >
                    <option value="Single Room">Single Room (1 Guest)</option>
                    <option value="Couple Room">Couple Room (2 Guests)</option>
                    <option value="Friends Room">Friends Room (Up to 5 Guests)</option>
                    <option value="Meeting Rooms">Meeting Rooms</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Capacity (Guests) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Price / {formData.pricingUnit === 'day' ? 'Day' : 'Night'} (PKR) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={100}
                    required
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Bed Type
                  </label>
                  <input
                    type="text"
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Room Size
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                    Window View
                  </label>
                  <input
                    type="text"
                    value={formData.view}
                    onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Image URL (Unsplash or CDN link) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Amenities (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy-200 text-sm text-navy-900 bg-ivory focus:ring-2 focus:ring-gold-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-navy-300 text-navy-700 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gold-gradient text-navy-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRoom ? 'Update Suite' : 'Create Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
