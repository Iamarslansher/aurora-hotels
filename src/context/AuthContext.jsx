import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  sendPasswordReset,
  changePassword,
} from '../firebase/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and listen to persistent Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile from Firestore:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

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
      return { success: true, profile };
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

  const updateProfileData = async (data) => {
    if (!user) throw new Error('Not authenticated.');
    const updated = await updateUserProfile(user.uid, data);
    setUserProfile(updated);
    return updated;
  };

  const resetUserPassword = async (email) => {
    return await sendPasswordReset(email);
  };

  const changeUserPassword = async (newPassword) => {
    return await changePassword(newPassword);
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
        updateProfileData,
        resetUserPassword,
        changeUserPassword,
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
