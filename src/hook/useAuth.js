// src/hook/useAuth.js// src/hook/useAuth.js
// src/hook/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData, createUserRecord } from '../service/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reloadUserData = useCallback(async (uid) => {
    try {
      const data = await getUserData(uid);
      if (data) {
        const isAdminUser = auth.currentUser?.email === 'mirainnovationadm@gmail.com';
        setUserData({ ...data, role: isAdminUser ? 'admin' : data.role });
      }
      return data;
    } catch (error) {
      console.error('Error reloading user data:', error);
      setError(error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!mounted) return;

          if (user) {
            try {
              let data = await getUserData(user.uid);
              const isAdminUser = user.email === 'mirainnovationadm@gmail.com';
              
              if (!data || (isAdminUser && data.role !== 'admin')) {
                data = await createUserRecord(user);
              }
              
              if (mounted) {
                setUser(user);
                setUserData({ ...data, role: isAdminUser ? 'admin' : data.role });
                setLoading(false);
              }
            } catch (error) {
              if (mounted) {
                console.error('Error loading user data:', error);
                setError(error.message);
                setLoading(false);
              }
            }
          } else {
            if (mounted) {
              setUser(null);
              setUserData(null);
              setLoading(false);
            }
          }
        });
      } catch (error) {
        if (mounted) {
          console.error('Auth initialization error:', error);
          setError(error.message);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    initializeAuth();
    
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUserData(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = useCallback(() => {
    const isAdminEmail = user?.email === 'mirainnovationadm@gmail.com';
    return isAdminEmail || userData?.role === 'admin';
  }, [user, userData]);

  return {
    user,
    userData,
    loading,
    error,
    logout,
    reloadUserData,
    checkPermission: useCallback((robotType) => userData?.permissions?.[robotType] || false, [userData]),
    isAdmin
  };
}