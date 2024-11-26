import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import AdminLayout from './components/layout/AdminLayout';
import UserLayout from './components/layout/UserLayout';
import Dashboard from './components/dashboard/Dashboard';
import PepperControl from './components/robots/pepper/PepperControl';
import DogControl from './components/robots/dog/DogControl';
import ArmControl from './components/robots/arm/ArmControl';
import SpiderControl from './components/robots/spider/SpiderControl';
import TeleDrivingControl from './components/robots/teledriving/TeleDrivingControl';
import ActivityLogs from './components/admin/ActivityLogs';
import AdminPanel from './components/admin/AdminPanel';
import { auth } from './firebase/config';
import { getUserData as getUser, createUserRecord } from './service/authService';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        try {
          let data = await getUser(user.uid);
          if (!data || (user.email === 'mirainnovationadm@gmail.com' && data.role !== 'admin')) {
            data = await createUserRecord(user);
          }
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ProtectedRoute = ({ children, requiredPermission, requireAdmin }) => {
    if (!user) {
      return <Navigate to="/" />;
    }

    if (user.email === 'mirainnovationadm@gmail.com') {
      return children;
    }

    if (requireAdmin && userData?.role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }

    if (requiredPermission && !userData?.permissions?.[requiredPermission]) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route 
          path="/" 
          element={
            !user ? <Login /> :
            user.email === 'mirainnovationadm@gmail.com' || userData?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" /> : 
            <Navigate to="/user/dashboard" />
          } 
        />

        {/* Rutas de Administrador */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout user={user} userData={userData} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<AdminPanel />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="robots/pepper" element={<PepperControl />} />
          <Route path="robots/dog" element={<DogControl />} />
          <Route path="robots/arm" element={<ArmControl />} />
          <Route path="robots/spider" element={<SpiderControl />} />
          <Route path="robots/teledriving" element={<TeleDrivingControl />} />
        </Route>

        {/* Rutas de Usuario Normal */}
        <Route path="/user" element={
          <ProtectedRoute>
            <UserLayout user={user} userData={userData} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="pepper"
            element={
              <ProtectedRoute requiredPermission="pepper">
                <PepperControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="dog"
            element={
              <ProtectedRoute requiredPermission="dog">
                <DogControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="arm"
            element={
              <ProtectedRoute requiredPermission="robotArm">
                <ArmControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="spider"
            element={
              <ProtectedRoute requiredPermission="spider">
                <SpiderControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="teledriving"
            element={
              <ProtectedRoute requiredPermission="teledriving">
                <TeleDrivingControl />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Ruta para páginas no encontradas */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-red-600">
                  Página no encontrada
                </h2>
                <p className="mt-2 text-gray-600">
                  La página que buscas no existe.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Volver
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;