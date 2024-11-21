import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';

function DogControl() {
  const [speed, setSpeed] = useState(50);
  const [movement, setMovement] = useState({ x: 0, y: 0 });
  const [isStanding, setIsStanding] = useState(true);
  const [selectedMode, setSelectedMode] = useState('normal'); // normal, agile, stable
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isConnected, setIsConnected] = useState(true);
  const [stabilityLevel, setStabilityLevel] = useState(100);
  const [actionHistory, setActionHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    balance: 'OK',
    sensors: 'OK',
    servos: 'OK'
  });

  // Simulación de actualización de estado
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setIsConnected(Math.random() > 0.1);
      setStabilityLevel(Math.min(100, Math.max(60, 80 + Math.random() * 40)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para registrar acciones
  const logAction = (action, detail) => {
    setActionHistory(prev => [{
      action,
      detail,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
  };

  // Función para el control de movimiento
  const handleMovement = (direction) => {
    let newX = movement.x;
    let newY = movement.y;

    switch(direction) {
      case 'forward':
        newY = 1;
        newX = 0;
        break;
      case 'backward':
        newY = -1;
        newX = 0;
        break;
      case 'left':
        newX = -1;
        newY = 0;
        break;
      case 'right':
        newX = 1;
        newY = 0;
        break;
      case 'stop':
        newX = 0;
        newY = 0;
        break;
    }

    setMovement({ x: newX, y: newY });
    logAction('Movimiento', `Dirección: ${direction}, Velocidad: ${speed}%`);
  };

  // Función para cambiar postura
  const toggleStance = () => {
    setIsStanding(!isStanding);
    logAction('Postura', isStanding ? 'Sentado' : 'De pie');
  };

  // Función para cambiar modo
  const changeMode = (mode) => {
    setSelectedMode(mode);
    logAction('Modo', `Cambiado a: ${mode}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Barra de estado */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              <span className="text-sm text-gray-600">
                Estabilidad: {stabilityLevel.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Batería: {batteryLevel.toFixed(1)}%
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className={`h-full rounded ${
                      batteryLevel > 50 ? 'bg-green-500' : 
                      batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            
            {/* Estado actual de movimiento */}
            <div className="text-sm text-gray-600 mb-4">
              Estado: {movement.x === 0 && movement.y === 0 ? 'Detenido' : 'En movimiento'}
            </div>
            
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
            <div>
              <label className="block text-gray-700 mb-2">
                Velocidad: {speed}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => {
                  const newSpeed = parseInt(e.target.value);
                  setSpeed(newSpeed);
                  logAction('Velocidad', `Ajustada a ${newSpeed}%`);
                }}
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
                {['normal', 'agile', 'stable'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => changeMode(mode)}
                    className={`p-2 rounded ${
                      selectedMode === mode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
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

          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estado del Sistema</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(systemStatus).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Acciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Acciones</h2>
            <div className="space-y-2">
              {actionHistory.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">{entry.action}:</span>
                  <span className="text-gray-600">{entry.detail}</span>
                  <span className="text-gray-500">{entry.timestamp}</span>
                </div>
              ))}
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