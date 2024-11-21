
import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';

function SpiderControl() {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [electromagnet, setElectromagnet] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [climbMode, setClimbMode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isConnected, setIsConnected] = useState(true);
  const [adhesionStrength, setAdhesionStrength] = useState(100);
  const [inclinacion, setInclinacion] = useState({ x: 0, y: 0 });
  const [actionHistory, setActionHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    electromagnet: 'OK',
    sensors: 'OK',
    camera: 'OK',
    adhesion: 'OK'
  });
  const [sensorData, setSensorData] = useState({
    temperatura: 25,
    humedad: 45,
    presion: 1013
  });

  // Simulación de actualización de estado
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar batería
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      
      // Simular cambios en la inclinación
      setInclinacion({
        x: Math.sin(Date.now() / 1000) * 10,
        y: Math.cos(Date.now() / 1000) * 10
      });
      
      // Actualizar fuerza de adhesión
      setAdhesionStrength(prev => 
        electromagnet ? Math.min(100, prev + 1) : Math.max(0, prev - 1)
      );

      // Simular estado de conexión
      setIsConnected(Math.random() > 0.1);

      // Actualizar datos de sensores
      setSensorData(prev => ({
        temperatura: 25 + Math.random() * 2,
        humedad: 45 + Math.random() * 5,
        presion: 1013 + Math.random() * 10
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [electromagnet]);

  // Función para registrar acciones
  const logAction = (action, detail) => {
    setActionHistory(prev => [{
      action,
      detail,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
  };

  // Función para el control del joystick
  const handleJoystickMove = (direction) => {
    let newX = 0, newY = 0;
    switch(direction) {
      case 'forward':
        newY = 1;
        break;
      case 'backward':
        newY = -1;
        break;
      case 'left':
        newX = -1;
        break;
      case 'right':
        newX = 1;
        break;
      case 'stop':
        break;
    }
    
    setJoystickPosition({ x: newX, y: newY });
    if (direction !== 'stop') {
      logAction('Movimiento', `Dirección: ${direction}, Velocidad: ${speed}%`);
    }
  };

  // Función para controlar el electroimán
  const toggleElectromagnet = () => {
    setElectromagnet(prev => !prev);
    logAction('Electroimán', !electromagnet ? 'Activado' : 'Desactivado');
  };

  // Función para cambiar modo de escalada
  const toggleClimbMode = () => {
    setClimbMode(prev => !prev);
    logAction('Modo Escalada', !climbMode ? 'Activado' : 'Desactivado');
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
                Adhesión: {adhesionStrength.toFixed(1)}%
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
            <div className="text-sm text-gray-600 mb-4">
              Estado: {joystickPosition.x === 0 && joystickPosition.y === 0 ? 'Detenido' : 'En movimiento'}
            </div>
            
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
                onChange={(e) => {
                  const newSpeed = parseInt(e.target.value);
                  setSpeed(newSpeed);
                  logAction('Velocidad', `Ajustada a ${newSpeed}%`);
                }}
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
              <div className="mt-2 text-sm text-gray-600">
                Fuerza de adhesión: {adhesionStrength.toFixed(1)}%
              </div>
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

            {/* Inclinación */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Inclinación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">X: {inclinacion.x.toFixed(1)}°</span>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full rounded bg-blue-500"
                      style={{ 
                        width: '50%',
                        transform: `translateX(${inclinacion.x}%)` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Y: {inclinacion.y.toFixed(1)}°</span>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full rounded bg-blue-500"
                      style={{ 
                        width: '50%',
                        transform: `translateX(${inclinacion.y}%)` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
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

            {/* Datos de Sensores */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Datos de Sensores:</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Temperatura</div>
                  <div className="font-medium">{sensorData.temperatura.toFixed(1)}°C</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Humedad</div>
                  <div className="font-medium">{sensorData.humedad.toFixed(1)}%</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Presión</div>
                  <div className="font-medium">{sensorData.presion.toFixed(0)}hPa</div>
                </div>
              </div>
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

export default SpiderControl;