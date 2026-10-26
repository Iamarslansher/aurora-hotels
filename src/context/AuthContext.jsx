import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  promoteToAdmin,
} from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseConfigured() && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUserProfile(profile);
          } catch (err) {
            console.warn('Failed to load user profile:', err);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });
    } else {
      // Local demo mode check
      const stored = localStorage.getItem('aurora_demo_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.fullName });
          setUserProfile(parsed);
        } catch {
          // ignore error
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const signup = async (details) => {
    setLoading(true);
    try {
      const { user: newUser, profile } = await registerUser(details);
      setUser(newUser);
      setUserProfile(profile);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { user: loggedInUser, profile } = await loginUser(credentials);
      setUser(loggedInUser);
      setUserProfile(profile);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Quick switch for reviewing Customer vs Admin capabilities
  const quickDemoLogin = (role = 'customer') => {
    const demoProfile = role === 'admin'
      ? {
          uid: 'demo-admin-aurora',
          email: 'admin@aurorahotels.com',
          fullName: 'Arsalan Sher (Admin Concierge)',
          role: 'admin',
          phone: '03001234567',
        }
      : {
          uid: 'demo-customer-aurora',
          email: 'guest@aurorahotels.com',
          fullName: 'Syed Hamza Ali (Valued Guest)',
          role: 'customer',
          phone: '03219876543',
        };

    localStorage.setItem('aurora_demo_user', JSON.stringify(demoProfile));
    setUser({ uid: demoProfile.uid, email: demoProfile.email, displayName: demoProfile.fullName });
    setUserProfile(demoProfile);
  };

  const claimAdminRole = async (masterCode) => {
    if (!user) throw new Error('You must be logged in to claim administrator privileges.');
    await promoteToAdmin(user.uid, masterCode);
    const updated = await getUserProfile(user.uid);
    setUserProfile(updated);
    return true;
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        quickDemoLogin,
        claimAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
