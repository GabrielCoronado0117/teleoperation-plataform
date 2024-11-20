import React, { useState } from 'react';
import { auth } from '../../../firebase/config';

function ArmControl() {
  const [joints, setJoints] = useState({
    base: 0,
    shoulder: 0,
    elbow: 0,
    wrist: 0,
    gripper: 0
  });

  const [gripperState, setGripperState] = useState(false); // false = abierto, true = cerrado
  const [speed, setSpeed] = useState(50);
  const [selectedMode, setSelectedMode] = useState('manual'); // manual, automatic

  // Función para controlar las articulaciones
  const handleJointChange = (joint, value) => {
    setJoints(prev => ({
      ...prev,
      [joint]: parseInt(value)
    }));
    console.log(`${joint}: ${value}°`);
  };

  // Función para el gripper
  const toggleGripper = () => {
    setGripperState(!gripperState);
    console.log(`Gripper ${gripperState ? 'abierto' : 'cerrado'}`);
  };

  // Función para posición inicial
  const goToHome = () => {
    setJoints({
      base: 0,
      shoulder: 0,
      elbow: 0,
      wrist: 0,
      gripper: 0
    });
    console.log('Volviendo a posición inicial');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Control Brazo Robot</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{auth.currentUser?.email}</span>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Panel de Control */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Control de Articulaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Articulaciones</h2>
            
            {/* Sliders para cada articulación */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Base: {joints.base}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={joints.base}
                  onChange={(e) => handleJointChange('base', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Hombro: {joints.shoulder}°
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={joints.shoulder}
                  onChange={(e) => handleJointChange('shoulder', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Codo: {joints.elbow}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={joints.elbow}
                  onChange={(e) => handleJointChange('elbow', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Muñeca: {joints.wrist}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={joints.wrist}
                  onChange={(e) => handleJointChange('wrist', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Control de Gripper y Opciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Gripper</h2>
            
            {/* Control de Gripper */}
            <div className="mb-6">
              <button
                onClick={toggleGripper}
                className={`w-full p-4 rounded text-white ${
                  gripperState 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {gripperState ? 'Abrir Gripper' : 'Cerrar Gripper'}
              </button>
            </div>

            {/* Control de Velocidad */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Velocidad: {speed}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Selector de Modo */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Modo de Operación</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedMode('manual')}
                  className={`p-2 rounded ${
                    selectedMode === 'manual' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setSelectedMode('automatic')}
                  className={`p-2 rounded ${
                    selectedMode === 'automatic' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Automático
                </button>
              </div>
            </div>

            {/* Posición Home */}
            <button
              onClick={goToHome}
              className="w-full bg-yellow-500 text-white p-4 rounded hover:bg-yellow-600"
            >
              Ir a Posición Inicial
            </button>
          </div>

          {/* Visualización 3D o Cámara */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Visualización del Brazo</h2>
            <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
              <span className="text-gray-600">Vista del Brazo Robótico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArmControl;