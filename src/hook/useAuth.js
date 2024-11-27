// src/hook/useAuth.js
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

  // Función para recargar datos del usuario
  const reloadUserData = useCallback(async (uid) => {
    try {
      const data = await getUserData(uid);
      setUserData(data);
      return data;
    } catch (error) {
      console.error('Error reloading user data:', error);
      setError(error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    let unsubscribe;
    
    const initializeAuth = async () => {
      setLoading(true);
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          if (user) {
            try {
              let data = await getUserData(user.uid);
              
              if (!data || (user.email === 'mirainnovationadm@gmail.com' && data.role !== 'admin')) {
                data = await createUserRecord(user);
              }
              
              setUserData(data);
            } catch (error) {
              console.error('Error loading user data:', error);
              setError(error.message);
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    initializeAuth();
    return () => unsubscribe?.();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    logout,
    reloadUserData,
    checkPermission: (robotType) => userData?.permissions?.[robotType] || false,
    isAdmin: () => userData?.role === 'admin' || user?.email === 'mirainnovationadm@gmail.com'
  };
}