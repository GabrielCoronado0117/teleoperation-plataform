import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { logActivity, ActivityTypes } from '../../../service/logService';
import { useAuth } from '../../../hook/useAuth';
import { useNavigate } from 'react-router-dom';

function PepperControl() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0 });
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isConnected, setIsConnected] = useState(true);
  const [voiceHistory, setVoiceHistory] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    sensors: 'OK',
    camera: 'OK',
    audio: 'OK'
  });

  // Efecto para registrar inicio de sesión
  useEffect(() => {
    const logInitialAccess = async () => {
      try {
        await logActivity(user.uid, ActivityTypes.ROBOT_ACCESS, {
          robot: 'pepper',
          action: 'session_start',
          userEmail: user.email
        });
      } catch (error) {
        console.error('Error logging initial access:', error);
      }
    };

    if (user) {
      logInitialAccess();
    }
  }, [user]);
  // Simulación de actualización de estado
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setIsConnected(Math.random() > 0.1);
      
      // Actualizar estado del sistema aleatoriamente
      setSystemStatus(prev => ({
        ...prev,
        motors: Math.random() > 0.1 ? 'OK' : 'ERROR',
        sensors: Math.random() > 0.1 ? 'OK' : 'ERROR'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Monitorear cambios en la conexión
  useEffect(() => {
    const logConnectionChange = async () => {
      try {
        await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
          robot: 'pepper',
          action: 'connection_status',
          status: isConnected ? 'connected' : 'disconnected',
          userEmail: user.email
        });
      } catch (error) {
        console.error('Error logging connection change:', error);
      }
    };

    if (user) {
      logConnectionChange();
    }
  }, [isConnected, user]);

  // Monitorear cambios críticos en el estado del sistema
  useEffect(() => {
    const logSystemStatusChange = async () => {
      const errors = Object.entries(systemStatus)
        .filter(([_, status]) => status !== 'OK')
        .map(([key]) => key);

      if (errors.length > 0) {
        try {
          await logActivity(user.uid, ActivityTypes.ERROR, {
            robot: 'pepper',
            action: 'system_status',
            errors,
            userEmail: user.email
          });
        } catch (error) {
          console.error('Error logging system status:', error);
        }
      }
    };

    if (user) {
      logSystemStatusChange();
    }
  }, [systemStatus, user]);

  // Función para controlar la cabeza con límites
  const handleHeadMovement = async (direction) => {
    try {
      let newX = headPosition.x;
      let newY = headPosition.y;

      switch(direction) {
        case 'up':
          newY = Math.min(45, headPosition.y + 5);
          break;
        case 'down':
          newY = Math.max(-45, headPosition.y - 5);
          break;
        case 'left':
          newX = Math.max(-45, headPosition.x - 5);
          break;
        case 'right':
          newX = Math.min(45, headPosition.x + 5);
          break;
      }

      setHeadPosition({ x: newX, y: newY });
      
      // Registrar actividad
      await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
        robot: 'pepper',
        action: 'head_movement',
        direction,
        position: { x: newX, y: newY },
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error en movimiento de cabeza:', error);
    }
  };

  // Función para el habla con historial
  const handleSpeak = async () => {
    if (speechText.trim()) {
      try {
        setVoiceHistory(prev => [{
          type: 'speak',
          text: speechText,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);

        await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
          robot: 'pepper',
          action: 'speak',
          text: speechText,
          userEmail: user.email
        });

        setSpeechText('');
      } catch (error) {
        console.error('Error en comando de voz:', error);
      }
    }
  };

  // Función para escuchar
  const toggleListening = async () => {
    try {
      const newListeningState = !isListening;
      setIsListening(newListeningState);
      
      setVoiceHistory(prev => [{
        type: 'listen',
        text: newListeningState ? 'Inicio de escucha' : 'Fin de escucha',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);

      await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
        robot: 'pepper',
        action: 'listening',
        state: newListeningState,
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error en cambio de estado de escucha:', error);
    }
  };

  // Función para manejar la desconexión
  const handleDisconnect = async () => {
    try {
      await logActivity(user.uid, ActivityTypes.ROBOT_ACCESS, {
        robot: 'pepper',
        action: 'session_end',
        userEmail: user.email
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al registrar desconexión:', error);
      navigate('/dashboard');
    }
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
            <h1 className="text-2xl font-bold text-gray-800">Control Robot Pepper</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleDisconnect}
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
          {/* Control de Movimientos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Cabeza</h2>
            <div className="text-sm text-gray-600 mb-2">
              Posición actual: X: {headPosition.x}° Y: {headPosition.y}°
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div></div>
              <button
                onClick={() => handleHeadMovement('up')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!isConnected}
              >
                Arriba
              </button>
              <div></div>
              
              <button
                onClick={() => handleHeadMovement('left')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!isConnected}
              >
                Izquierda
              </button>
              <div className="bg-gray-100 p-2 rounded text-center">
                Centro
              </div>
              <button
                onClick={() => handleHeadMovement('right')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!isConnected}
              >
                Derecha
              </button>

              <div></div>
              <button
                onClick={() => handleHeadMovement('down')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!isConnected}
              >
                Abajo
              </button>
              <div></div>
            </div>
          </div>

          {/* Control de Voz */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Voz</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Texto para hablar
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe algo..."
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSpeak}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={!isConnected || !speechText.trim()}
                  >
                    Hablar
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={toggleListening}
                  className={`w-full p-2 rounded ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white disabled:opacity-50`}
                  disabled={!isConnected}
                >
                  {isListening ? 'Dejar de Escuchar' : 'Empezar a Escuchar'}
                </button>
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
          </div>

          {/* Historial de Comandos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Comandos</h2>
            {voiceHistory.length > 0 ? (
              <div className="space-y-2">
                {voiceHistory.map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span className={`${
                      entry.type === 'speak' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {entry.text}
                    </span>
                    <span className="text-gray-500">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No hay comandos registrados
              </div>
            )}
          </div>

          {/* Video Feed */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Video en Vivo</h2>
              <span className={`px-2 py-1 rounded text-xs ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Transmitiendo' : 'Sin señal'}
              </span>
            </div>
            <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
              <span className="text-gray-600">
                {isConnected ? 'Feed de Video' : 'Cámara Desconectada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PepperControl;