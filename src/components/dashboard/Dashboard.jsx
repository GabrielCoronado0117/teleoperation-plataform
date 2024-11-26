import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hook/useAuth';
import { getUserData as getUser } from '../../service/authService';
import { logActivity, ActivityTypes } from '../../service/logService';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión: ' + error.message);
    }
  };

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        if (user) {
          const userData = await getUser(user.uid);
          setUserPermissions(userData?.permissions || {});
          
          // Registrar acceso al dashboard
          await logActivity(user.uid, ActivityTypes.ROBOT_ACCESS, {
            action: 'dashboard_access',
            userEmail: user.email
          });
        }
      } catch (err) {
        setError('Error al cargar permisos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);


  const handleRobotAccess = async (robotType) => {
    try {
      await logActivity(user.uid, ActivityTypes.ROBOT_ACCESS, {
        robotType,
        action: 'robot_selection',
        userEmail: user.email
      });
      navigate(`/${robotType}`);
    } catch (error) {
      console.error('Error logging robot access:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
              {userPermissions?.isAdmin && (
                <button
                  onClick={() => window.location.hash = 'admin'}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Panel Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Robot Pepper */}
          {userPermissions?.pepper && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Pepper</h2>
              <p className="text-gray-600 mb-4">
                Control y monitoreo del robot Pepper
              </p>
              <button
                onClick={() => handleRobotAccess('pepper')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Acceder
              </button>
            </div>
          )}

          {/* Robot Araña */}
          {userPermissions?.spider && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Araña</h2>
              <p className="text-gray-600 mb-4">
                Control y monitoreo del robot Araña
              </p>
              <button
                onClick={() => handleRobotAccess('spider')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Acceder
              </button>
            </div>
          )}

          {/* Robot Perro */}
          {userPermissions?.dog && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Perro</h2>
              <p className="text-gray-600 mb-4">
                Control y monitoreo del robot Perro
              </p>
              <button
                onClick={() => handleRobotAccess('dog')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Acceder
              </button>
            </div>
          )}

          {/* TeleDriving */}
          {userPermissions?.teledriving && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">TeleDriving</h2>
              <p className="text-gray-600 mb-4">
                Control remoto de vehículo
              </p>
              <button
                onClick={() => handleRobotAccess('teledriving')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Acceder
              </button>
            </div>
          )}

          {/* Brazo Robot */}
          {userPermissions?.robotArm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Brazo Robot</h2>
              <p className="text-gray-600 mb-4">
                Control del brazo robótico
              </p>
              <button
                onClick={() => handleRobotAccess('arm')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Acceder
              </button>
            </div>
          )}
        </div>

        {/* Mensaje si no tiene permisos */}
        {Object.values(userPermissions || {}).every(permission => !permission) && (
          <div className="bg-yellow-50 p-4 rounded-lg mt-6">
            <h3 className="text-yellow-800 font-medium">Sin acceso a robots</h3>
            <p className="text-yellow-700 mt-1">
              No tienes permisos asignados para acceder a ningún robot. 
              Contacta al administrador para solicitar acceso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;