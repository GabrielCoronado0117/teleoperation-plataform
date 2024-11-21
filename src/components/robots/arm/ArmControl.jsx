import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';

function ArmControl() {
  const [joints, setJoints] = useState({
    base: 0,
    shoulder: 0,
    elbow: 0,
    wrist: 0,
    gripper: 0
  });

  const [jointLimits] = useState({
    base: { min: -180, max: 180 },
    shoulder: { min: -90, max: 90 },
    elbow: { min: -180, max: 180 },
    wrist: { min: -180, max: 180 },
    gripper: { min: 0, max: 100 }
  });

  const [savedPositions, setSavedPositions] = useState([
    { name: 'Home', positions: { base: 0, shoulder: 0, elbow: 0, wrist: 0, gripper: 0 } },
    { name: 'Reposo', positions: { base: 0, shoulder: -45, elbow: -90, wrist: 0, gripper: 0 } }
  ]);

  const [gripperState, setGripperState] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [selectedMode, setSelectedMode] = useState('manual'); // manual, automatic
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isConnected, setIsConnected] = useState(true);
  const [actionHistory, setActionHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    sensors: 'OK',
    gripper: 'OK',
    encoders: 'OK'
  });

  // Simulación de actualización de estado
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setIsConnected(Math.random() > 0.1);
      
      // Actualizar estado del sistema aleatoriamente
      setSystemStatus(prev => ({
        ...prev,
        motors: Math.random() > 0.1 ? 'OK' : 'ERROR',
        sensors: Math.random() > 0.1 ? 'OK' : 'ERROR',
      }));
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

  // Función para controlar las articulaciones
  const handleJointChange = (joint, value) => {
    const limitedValue = Math.min(
      jointLimits[joint].max,
      Math.max(jointLimits[joint].min, parseInt(value))
    );
    
    setJoints(prev => ({
      ...prev,
      [joint]: limitedValue
    }));
    
    logAction('Movimiento', `${joint}: ${limitedValue}°`);
  };

  // Función para el gripper
  const toggleGripper = () => {
    setGripperState(!gripperState);
    logAction('Gripper', gripperState ? 'Abierto' : 'Cerrado');
  };

  // Función para guardar posición actual
  const saveCurrentPosition = (name) => {
    const newPosition = {
      name,
      positions: { ...joints }
    };
    setSavedPositions(prev => [...prev, newPosition]);
    logAction('Posición Guardada', name);
  };

  // Función para cargar posición guardada
  const loadPosition = (position) => {
    setJoints(position.positions);
    logAction('Posición Cargada', position.name);
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
                Modo: {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
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
              {Object.entries(joints).map(([joint, value]) => (
                <div key={joint}>
                  <label className="block text-gray-700 mb-2">
                    {joint.charAt(0).toUpperCase() + joint.slice(1)}: {value}°
                  </label>
                  <input
                    type="range"
                    min={jointLimits[joint].min}
                    max={jointLimits[joint].max}
                    value={value}
                    onChange={(e) => handleJointChange(joint, e.target.value)}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500">
                    Límites: {jointLimits[joint].min}° a {jointLimits[joint].max}°
                  </div>
                </div>
              ))}
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
                onChange={(e) => {
                  const newSpeed = parseInt(e.target.value);
                  setSpeed(newSpeed);
                  logAction('Velocidad', `Ajustada a ${newSpeed}%`);
                }}
                className="w-full"
              />
            </div>

            {/* Selector de Modo */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Modo de Operación</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedMode('manual');
                    logAction('Modo', 'Cambiado a Manual');
                  }}
                  className={`p-2 rounded ${
                    selectedMode === 'manual' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Manual
                </button>
                <button
                  onClick={() => {
                    setSelectedMode('automatic');
                    logAction('Modo', 'Cambiado a Automático');
                  }}
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
          </div>

          {/* Posiciones Guardadas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Posiciones Guardadas</h2>
            <div className="grid grid-cols-2 gap-2">
              {savedPositions.map((pos, index) => (
                <button
                  key={index}
                  onClick={() => loadPosition(pos)}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  {pos.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => saveCurrentPosition(`Posición ${savedPositions.length + 1}`)}
              className="mt-4 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar Posición Actual
            </button>
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

            {/* Historial de Acciones */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Últimas Acciones:</h3>
              <div className="space-y-2 text-sm">
                {actionHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between border-b pb-1">
                    <span>{entry.action}: {entry.detail}</span>
                    <span className="text-gray-500">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
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