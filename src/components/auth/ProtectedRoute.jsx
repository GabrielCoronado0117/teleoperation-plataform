import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';

function ProtectedRoute({ children, requiredPermission, requireAdmin }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Verificando acceso...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && userData?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  if (requiredPermission && !userData?.permissions?.[requiredPermission]) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;
