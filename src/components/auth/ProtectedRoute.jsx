// src/components/auth/ProtectedRoute.jsx
// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hook/useAuth';

function ProtectedRoute({ children, requiredPermission, requireAdmin }) {
 const { user, userData, loading, error, isAdmin } = useAuth();

 if (loading) {
   return (
     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
       <div className="text-gray-600">Verificando acceso...</div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
         <p>Error al verificar acceso: {error}</p>
         <button 
           onClick={() => window.location.reload()}
           className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
         >
           Reintentar
         </button>
       </div>
     </div>
   );
 }

 if (!user || !userData) {
   return <Navigate to="/" />;
 }

 if (requireAdmin && !isAdmin()) {
   return <Navigate to="/dashboard" />;
 }

 if (requireAdmin && userData?.role !== 'admin') {
  return <Navigate to="/dashboard" />;
}

 return children;
}

export default ProtectedRoute;