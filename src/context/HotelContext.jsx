import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRooms, checkRoomAvailability } from '../firebase/roomService';
import { getServices } from '../firebase/serviceItemsService';
import { getTodayString, getTomorrowString } from '../utils/dateUtils';

const HotelContext = createContext(null);

export const HotelProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global search parameters prefilled with intelligent defaults
  const [searchParams, setSearchParams] = useState({
    checkIn: getTodayString(),
    checkOut: getTomorrowString(),
    guests: 2,
    roomType: 'All', // 'All', 'Single Room', 'Couple Room', 'Friends Room'
  });

  // Global notification toast state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedRooms, fetchedServices] = await Promise.all([
        getRooms({ onlyActive: false }),
        getServices({ onlyActive: false }),
      ]);
      setRooms(fetchedRooms);
      setServices(fetchedServices);
    } catch (err) {
      console.warn('Error loading hotel data:', err);
      addToast({
        type: 'error',
        message: 'Could not fetch initial data. Using offline catalog.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSearch = (newParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  };

  const isRoomAvailable = async (roomId, checkIn, checkOut) => {
    return await checkRoomAvailability(
      roomId,
      checkIn || searchParams.checkIn,
      checkOut || searchParams.checkOut
    );
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        services,
        loading,
        searchParams,
        updateSearch,
        refreshRooms: loadData,
        refreshServices: loadData,
        isRoomAvailable,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
};
