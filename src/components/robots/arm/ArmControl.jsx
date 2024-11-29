import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { logActivity, ActivityTypes } from '../../../service/logService';
import { useAuth } from '../../../hook/useAuth';

function ArmControl() {
  const { user } = useAuth();
  // Estados para la integración con Flask
  const [joints, setJoints] = useState({
    x: 160,
    y: 0,
    z: 100,
    r: 0
  });
  
  const jointLimits = {
    x: { min: 170, max: 240 },
    y: { min: -150, max: 150 },
    z: { min: 0, max: 100 },
    r: { min: -180, max: 180 }
  };

  // Estados originales del diseño
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [engineTemp, setEngineTemp] = useState(90);
  const [actionHistory, setActionHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    sensors: 'OK',
    camera: 'OK',
    encoders: 'OK'
  });

  // Efecto para simular datos del sistema
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setEngineTemp(prev => 90 + Math.sin(Date.now() / 1000) * 5);
      
      setSystemStatus(prev => ({
        ...prev,
        motors: Math.random() > 0.1 ? 'OK' : 'ERROR',
        sensors: Math.random() > 0.1 ? 'OK' : 'ERROR'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Efecto para conexión con servidor Flask
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://192.168.10.141:8079/');
        if (response.ok) {
          setIsConnected(true);
          await logActivity(user.uid, ActivityTypes.ROBOT_ACCESS, {
            robot: 'arm',
            action: 'connection',
            status: 'connected',
            userEmail: user.email
          });
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Función para registrar acciones
  const logAction = (action, detail) => {
    setActionHistory(prev => [{
      action,
      detail,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
  };

  // Manejar cambios en las articulaciones
  const handleJointChange = async (joint, value) => {
    try {
      const newJoints = { ...joints, [joint]: Number(value) };
      setJoints(newJoints);
      
      const response = await fetch('http://192.168.10.141:8079/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJoints)
      });

      const data = await response.json();
      setResponseMessage(data.message);
      logAction('Movimiento', `${joint.toUpperCase()}: ${value}`);

      await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
        robot: 'arm',
        action: 'joint_move',
        joint,
        value,
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error moving joint:', error);
      setResponseMessage('Error al mover articulación');
    }
  };

  // Manejar comando Home
  const handleHome = async () => {
    try {
      const response = await fetch('http://192.168.10.141:8079/home', {
        method: 'POST'
      });
      
      const data = await response.json();
      setResponseMessage(data.message);
      logAction('Sistema', 'Movido a posición Home');

      await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
        robot: 'arm',
        action: 'home',
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error moving to home:', error);
      setResponseMessage('Error al mover a Home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">Conectando con el robot...</div>
        </div>
      </div>
    );
  }

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
                Temp: {engineTemp.toFixed(1)}°C
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
              <span className="text-gray-600">{user?.email}</span>
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

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transmisión en Vivo</h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {isConnected ? (
                <img
                  src="http://192.168.10.141:8079/video_feed"
                  alt="Robot Camera Feed"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  No hay señal de video
                </div>
              )}
            </div>
          </div>

          {/* Control de Articulaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Articulaciones</h2>
            <div className="space-y-6">
              {Object.entries(joints).map(([joint, value]) => (
                <div key={joint}>
                  <label className="block text-gray-700 mb-2">
                    {joint.toUpperCase()}: {value}
                  </label>
                  <input
                    type="range"
                    min={jointLimits[joint].min}
                    max={jointLimits[joint].max}
                    value={value}
                    onChange={(e) => handleJointChange(joint, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{jointLimits[joint].min}</span>
                    <span>{jointLimits[joint].max}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleHome}
                className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!isConnected}
              >
                Mover a Home
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
        </div>

        {/* Mensajes de Respuesta */}
        {responseMessage && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {responseMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArmControl;