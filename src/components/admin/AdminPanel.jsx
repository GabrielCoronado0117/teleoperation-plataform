// src/components/admin/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../hook/useAuth';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserPermissions, updateUserRole, userRoles } from '../../service/authService';
import { logActivity, ActivityTypes } from '../../service/logService';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData, reloadUserData } = useAuth();
  const navigate = useNavigate();
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setError(null);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar usuarios. Por favor, verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar usuarios inicialmente
  useEffect(() => {
    loadUsers();
  }, []);

  // Efecto para recargar usuarios periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      loadUsers();
    }, 5000); // Recargar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handlePermissionChange = async (userId, robotType, value) => {
    try {
      setError(null);
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('Usuario no encontrado');

      const newPermissions = {
        ...user.permissions,
        [robotType]: value
      };

      // Actualizar permisos en la base de datos
      await updateUserPermissions(userId, newPermissions);
      
      // Registrar el cambio de permisos
      await logActivity(userData.id, ActivityTypes.PERMISSION_CHANGE, {
        targetUser: user.email,
        robotType,
        newValue: value,
        updatedBy: userData.email
      });

      // Recargar usuarios y datos del usuario actual
      await loadUsers();
      if (userId === userData.id) {
        await reloadUserData(userId);
      }

    } catch (error) {
      console.error('Error updating permissions:', error);
      setError('Error al actualizar permisos. Por favor, inténtalo de nuevo.');
      
      // Registrar el error
      await logActivity(userData.id, ActivityTypes.ERROR, {
        action: 'permission_update',
        error: error.message,
        userEmail: userData.email
      });
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm('¿Estás seguro de cambiar el rol de este usuario?')) {
      return;
    }

    try {
      setError(null);
      const user = users.find(u => u.id === userId);
      const oldRole = user.role;

      // Actualizar rol en la base de datos
      await updateUserRole(userId, newRole);
      
      // Registrar el cambio de rol
      await logActivity(userData.id, ActivityTypes.ROLE_CHANGE, {
        targetUser: user.email,
        oldRole,
        newRole,
        updatedBy: userData.email
      });

      // Recargar usuarios y datos del usuario actual
      await loadUsers();
      if (userId === userData.id) {
        await reloadUserData(userId);
      }

    } catch (error) {
      console.error('Error updating role:', error);
      setError('Error al actualizar rol. Por favor, inténtalo de nuevo.');
      
      // Registrar el error
      await logActivity(userData.id, ActivityTypes.ERROR, {
        action: 'role_update',
        error: error.message,
        userEmail: userData.email
      });
    }
  };

  const handleRetry = () => {
    loadUsers();
  };

  // Verificación de admin mejorada
  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600">Acceso Denegado</h2>
          <p className="mt-2 text-gray-600">No tienes permisos para acceder a esta página.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  // El resto del JSX se mantiene igual...
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total de usuarios: {users.length}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/logs')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ver Bitácora
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={handleRetry}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pepper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dog
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TeleDriving
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Robot Arm
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className="text-sm border rounded p-1"
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          {Object.values(userRoles).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      {['pepper', 'spider', 'dog', 'teledriving', 'robotArm'].map((robot) => (
                        <td key={robot} className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={user.permissions?.[robot] || false}
                            onChange={(e) => handlePermissionChange(user.id, robot, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-600">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;