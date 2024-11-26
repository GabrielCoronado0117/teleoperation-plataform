// src/hook/useAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData, createUserRecord } from '../service/authService';

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
          // Intentar obtener los datos del usuario
          let data = await getUserData(user.uid);
          
          // Si el usuario no existe en la base de datos, crearlo
          if (!data) {
            data = await createUserRecord(user);
          } else if (user.email === 'mirainnovationadm@gmail.com' && data.role !== 'admin') {
            // Si es el email de admin pero no tiene rol admin, recrear el usuario
            data = await createUserRecord(user);
          }
          
          setUserData(data);
        } catch (error) {
          console.error('Error al cargar datos de usuario:', error);
          setError(error.message);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  const checkPermission = (robotType) => {
    return userData?.permissions?.[robotType] || false;
  };

  const isAdmin = () => {
    // Verificar tanto el rol como el email
    return userData?.role === 'admin' || user?.email === 'mirainnovationadm@gmail.com';
  };

  return {
    user,
    userData,
    loading,
    error,
    logout,
    checkPermission,
    isAdmin
  };
}