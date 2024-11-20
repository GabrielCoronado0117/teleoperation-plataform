import React, { useState } from 'react';
import { auth } from '../../../firebase/config';

function TeleDrivingControl() {
  const [speed, setSpeed] = useState(0);
  const [steering, setSteering] = useState(0);
  const [gear, setGear] = useState('P'); // P, R, N, D
  const [brake, setBrake] = useState(false);
  const [indicators, setIndicators] = useState({ left: false, right: false });
  const [lights, setLights] = useState(false);

  // Función para control de velocidad
  const handleSpeedChange = (value) => {
    setSpeed(parseInt(value));
    console.log(`Velocidad: ${value} km/h`);
  };

  // Función para control de dirección
  const handleSteering = (direction) => {
    switch(direction) {
      case 'left':
        setSteering(-45);
        break;
      case 'right':
        setSteering(45);
        break;
      case 'center':
        setSteering(0);
        break;
    }
    console.log(`Dirección: ${direction}`);
  };

  // Función para cambiar marcha
  const handleGearChange = (newGear) => {
    setGear(newGear);
    console.log(`Marcha: ${newGear}`);
  };

  // Función para intermitentes
  const toggleIndicator = (side) => {
    if (side === 'left') {
      setIndicators({ left: !indicators.left, right: false });
    } else {
      setIndicators({ left: false, right: !indicators.right });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">TeleDriving</h1>
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
          {/* Controles Principales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Controles Principales</h2>
            
            {/* Velocímetro */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Velocidad</span>
                <span className="font-bold text-blue-600">{speed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={speed}
                onChange={(e) => handleSpeedChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Control de Dirección */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onMouseDown={() => handleSteering('left')}
                onMouseUp={() => handleSteering('center')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                ←
              </button>
              <div className="bg-gray-100 p-4 rounded text-center">
                {steering}°
              </div>
              <button
                onMouseDown={() => handleSteering('right')}
                onMouseUp={() => handleSteering('center')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                →
              </button>
            </div>

            {/* Freno */}
            <button
              onMouseDown={() => setBrake(true)}
              onMouseUp={() => setBrake(false)}
              className={`w-full p-4 rounded text-white mb-6 ${
                brake ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              FRENO
            </button>
          </div>

          {/* Controles Secundarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Controles Secundarios</h2>

            {/* Selector de Marcha */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['P', 'R', 'N', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGearChange(g)}
                  className={`p-4 rounded ${
                    gear === g 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Intermitentes */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => toggleIndicator('left')}
                className={`p-4 rounded ${
                  indicators.left 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ← Intermitente
              </button>
              <button
                onClick={() => toggleIndicator('right')}
                className={`p-4 rounded ${
                  indicators.right 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Intermitente →
              </button>
            </div>

            {/* Luces */}
            <button
              onClick={() => setLights(!lights)}
              className={`w-full p-4 rounded ${
                lights 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lights ? 'Apagar Luces' : 'Encender Luces'}
            </button>
          </div>

          {/* Vista de Cámaras */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cámaras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cámara Frontal */}
              <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
                <span className="text-gray-600">Cámara Frontal</span>
              </div>
              {/* Cámara Trasera */}
              <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
                <span className="text-gray-600">Cámara Trasera</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeleDrivingControl;