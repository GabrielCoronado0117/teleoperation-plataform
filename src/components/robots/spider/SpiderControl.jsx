import React, { useState } from 'react';
import { auth } from '../../../firebase/config';

function SpiderControl() {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [electromagnet, setElectromagnet] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [climbMode, setClimbMode] = useState(false);

  // Función para el control del joystick (simulado)
  const handleJoystickMove = (direction) => {
    switch(direction) {
      case 'forward':
        setJoystickPosition({ x: 0, y: 1 });
        break;
      case 'backward':
        setJoystickPosition({ x: 0, y: -1 });
        break;
      case 'left':
        setJoystickPosition({ x: -1, y: 0 });
        break;
      case 'right':
        setJoystickPosition({ x: 1, y: 0 });
        break;
      case 'stop':
        setJoystickPosition({ x: 0, y: 0 });
        break;
    }
    console.log(`Movimiento: ${direction}, Velocidad: ${speed}%`);
  };

  // Función para controlar el electroimán
  const toggleElectromagnet = () => {
    setElectromagnet(!electromagnet);
    console.log(`Electroimán ${!electromagnet ? 'activado' : 'desactivado'}`);
  };

  // Función para cambiar modo de escalada
  const toggleClimbMode = () => {
    setClimbMode(!climbMode);
    console.log(`Modo escalada ${!climbMode ? 'activado' : 'desactivado'}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Control Robot Araña</h1>
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
          {/* Control de Movimiento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Movimiento</h2>
            
            {/* Joystick simulado */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div></div>
              <button
                onMouseDown={() => handleJoystickMove('forward')}
                onMouseUp={() => handleJoystickMove('stop')}
                onMouseLeave={() => handleJoystickMove('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                ↑
              </button>
              <div></div>
              
              <button
                onMouseDown={() => handleJoystickMove('left')}
                onMouseUp={() => handleJoystickMove('stop')}
                onMouseLeave={() => handleJoystickMove('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                ←
              </button>
              <button
                onClick={() => handleJoystickMove('stop')}
                className="bg-red-500 text-white p-4 rounded hover:bg-red-600"
              >
                ●
              </button>
              <button
                onMouseDown={() => handleJoystickMove('right')}
                onMouseUp={() => handleJoystickMove('stop')}
                onMouseLeave={() => handleJoystickMove('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                →
              </button>

              <div></div>
              <button
                onMouseDown={() => handleJoystickMove('backward')}
                onMouseUp={() => handleJoystickMove('stop')}
                onMouseLeave={() => handleJoystickMove('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                ↓
              </button>
              <div></div>
            </div>

            {/* Control de velocidad */}
            <div>
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
          </div>

          {/* Controles Especiales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Controles Especiales</h2>
            
            {/* Control del Electroimán */}
            <div className="mb-6">
              <button
                onClick={toggleElectromagnet}
                className={`w-full p-4 rounded text-white ${
                  electromagnet 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {electromagnet ? 'Desactivar Electroimán' : 'Activar Electroimán'}
              </button>
            </div>

            {/* Modo Escalada */}
            <div className="mb-6">
              <button
                onClick={toggleClimbMode}
                className={`w-full p-4 rounded text-white ${
                  climbMode 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {climbMode ? 'Desactivar Modo Escalada' : 'Activar Modo Escalada'}
              </button>
            </div>

            {/* Estado actual */}
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-2">Estado Actual:</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="font-medium">Electroimán:</span>{' '}
                  <span className={electromagnet ? 'text-green-600' : 'text-red-600'}>
                    {electromagnet ? 'Activado' : 'Desactivado'}
                  </span>
                </li>
                <li>
                  <span className="font-medium">Modo Escalada:</span>{' '}
                  <span className={climbMode ? 'text-green-600' : 'text-red-600'}>
                    {climbMode ? 'Activado' : 'Desactivado'}
                  </span>
                </li>
                <li>
                  <span className="font-medium">Velocidad:</span>{' '}
                  <span className="text-blue-600">{speed}%</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Video Feed */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Video en Vivo</h2>
            <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
              <span className="text-gray-600">Feed de Video</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpiderControl;