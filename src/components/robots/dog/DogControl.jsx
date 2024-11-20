import React, { useState } from 'react';
import { auth } from '../../../firebase/config';

function DogControl() {
  const [speed, setSpeed] = useState(50);
  const [movement, setMovement] = useState({ x: 0, y: 0 });
  const [isStanding, setIsStanding] = useState(true);
  const [selectedMode, setSelectedMode] = useState('normal'); // normal, agile, stable

  // Función para el control de movimiento
  const handleMovement = (direction) => {
    switch(direction) {
      case 'forward':
        setMovement(prev => ({ ...prev, y: 1 }));
        break;
      case 'backward':
        setMovement(prev => ({ ...prev, y: -1 }));
        break;
      case 'left':
        setMovement(prev => ({ ...prev, x: -1 }));
        break;
      case 'right':
        setMovement(prev => ({ ...prev, x: 1 }));
        break;
      case 'stop':
        setMovement({ x: 0, y: 0 });
        break;
    }
    console.log(`Movimiento: ${direction}, Velocidad: ${speed}%`);
  };

  // Función para cambiar postura
  const toggleStance = () => {
    setIsStanding(!isStanding);
    console.log(`Robot ${isStanding ? 'sentado' : 'parado'}`);
  };

  // Función para cambiar modo
  const changeMode = (mode) => {
    setSelectedMode(mode);
    console.log(`Modo cambiado a: ${mode}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Control Robot Perro</h1>
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
            
            {/* Controles direccionales */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div></div>
              <button
                onMouseDown={() => handleMovement('forward')}
                onMouseUp={() => handleMovement('stop')}
                onMouseLeave={() => handleMovement('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                Adelante
              </button>
              <div></div>
              
              <button
                onMouseDown={() => handleMovement('left')}
                onMouseUp={() => handleMovement('stop')}
                onMouseLeave={() => handleMovement('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                Izquierda
              </button>
              <button
                onClick={() => handleMovement('stop')}
                className="bg-red-500 text-white p-4 rounded hover:bg-red-600"
              >
                Detener
              </button>
              <button
                onMouseDown={() => handleMovement('right')}
                onMouseUp={() => handleMovement('stop')}
                onMouseLeave={() => handleMovement('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                Derecha
              </button>

              <div></div>
              <button
                onMouseDown={() => handleMovement('backward')}
                onMouseUp={() => handleMovement('stop')}
                onMouseLeave={() => handleMovement('stop')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                Atrás
              </button>
              <div></div>
            </div>

            {/* Control de velocidad */}
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
          </div>

          {/* Control de Modos y Posturas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Modos y Posturas</h2>
            
            {/* Selector de Modos */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Modo de Operación</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => changeMode('normal')}
                  className={`p-2 rounded ${
                    selectedMode === 'normal' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => changeMode('agile')}
                  className={`p-2 rounded ${
                    selectedMode === 'agile' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Ágil
                </button>
                <button
                  onClick={() => changeMode('stable')}
                  className={`p-2 rounded ${
                    selectedMode === 'stable' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Estable
                </button>
              </div>
            </div>

            {/* Control de Postura */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Postura</h3>
              <button
                onClick={toggleStance}
                className={`w-full p-3 rounded ${
                  isStanding 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                } text-white`}
              >
                {isStanding ? 'Sentarse' : 'Pararse'}
              </button>
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

export default DogControl;