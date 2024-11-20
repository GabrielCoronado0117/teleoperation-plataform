import React from 'react';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

function Dashboard() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Sistema de Teleoperación
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {auth.currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta Robot Pepper */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Pepper</h2>
            <p className="text-gray-600 mb-4">
              Control y monitoreo del robot Pepper
            </p>
            <button 
                onClick={() => {
                    // Por ahora usaremos una variable en window para cambiar entre componentes
                    window.location.hash = 'pepper';
                }} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                Acceder
                </button>
          </div>

          {/* Tarjeta Robot Araña */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Araña</h2>
            <p className="text-gray-600 mb-4">
              Control y monitoreo del robot Araña
            </p>
            <button 
                onClick={() => {
                    // Por ahora usaremos una variable en window para cambiar entre componentes
                    window.location.hash = 'spider';
                }} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                Acceder
                </button>
          </div>

          {/* Tarjeta Robot Perro */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Robot Perro</h2>
            <p className="text-gray-600 mb-4">
              Control y monitoreo del robot Perro
            </p>
            <button 
            onClick={() => {
                window.location.hash = 'dog';
            }} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
            Acceder
            </button>
          </div>

          {/* Tarjeta TeleDriving */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">TeleDriving</h2>
            <p className="text-gray-600 mb-4">
              Control remoto de vehículo
            </p>
            <button 
            onClick={() => {
                window.location.hash = 'teledriving';
            }} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
            Acceder
            </button>
          </div>

          {/* Tarjeta Brazo Robot */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Brazo Robot</h2>
            <p className="text-gray-600 mb-4">
              Control del brazo robótico
            </p>
            <button 
            onClick={() => {
                window.location.hash = 'arm';
            }} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
            Acceder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;