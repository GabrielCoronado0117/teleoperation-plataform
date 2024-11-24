//src/hook/useAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData } from '../service/authService';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
        } catch (error) {
          setError(error.message);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkPermission = (robotType) => {
    return userData?.permissions?.[robotType] || false;
  };

  const isAdmin = () => {
    return userData?.role === 'admin';
  };

  return {
    user,
    userData,
    loading,
    error,
    checkPermission,
    isAdmin
  };
}