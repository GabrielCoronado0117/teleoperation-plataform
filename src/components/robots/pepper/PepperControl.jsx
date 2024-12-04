import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hook/useAuth';
import { useNavigate } from 'react-router-dom';
import { logActivity, ActivityTypes } from '../../../service/logService';

const PEPPER_SERVER_URL = 'http://14.10.2.192:8070';

function PepperControl() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados
  const [isConnected, setIsConnected] = useState(true); // Asumimos conectado inicialmente
  const [speechText, setSpeechText] = useState('');
  const [voiceHistory, setVoiceHistory] = useState([]);
  const [error, setError] = useState(null);

  // Función para enviar comandos HTTP
  const sendCommand = async (endpoint, data) => {
    try {
      const response = await fetch(`${PEPPER_SERVER_URL}${endpoint}`, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Con mode: 'no-cors', no podemos leer la respuesta,
      // pero podemos asumir que funcionó si no hubo error
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      setError('Error al enviar comando');
      setIsConnected(false);
      return false;
    }
  };

  // Control de movimientos
  const moveJoint = async (joint, angle, speed = 0.2) => {
    try {
      const success = await sendCommand('/move_joint', {
        joint,
        angle,
        speed
      });

      if (success) {
        // Log activity
        await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
          robot: 'pepper',
          action: 'move_joint',
          details: { joint, angle, speed }
        });
      }
    } catch (error) {
      console.error('Error moving joint:', error);
    }
  };

  // Manejo de movimientos de cabeza
  const handleHeadMovement = async (direction) => {
    const movements = {
      up: { joint: 'HeadPitch', angle: -0.3 },
      down: { joint: 'HeadPitch', angle: 0.3 },
      left: { joint: 'HeadYaw', angle: 0.3 },
      right: { joint: 'HeadYaw', angle: -0.3 }
    };

    const movement = movements[direction];
    if (movement) {
      try {
        await moveJoint(movement.joint, movement.angle);
      } catch (error) {
        console.error(`Error moving head ${direction}:`, error);
      }
    }
  };

  // Text to Speech
  const handleSpeak = async () => {
    if (speechText.trim()) {
      try {
        const success = await sendCommand('/say', {
          text: speechText
        });

        if (success) {
          setVoiceHistory(prev => [{
            type: 'speak',
            text: speechText,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev.slice(0, 4)]);

          await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
            robot: 'pepper',
            action: 'speak',
            text: speechText
          });

          setSpeechText('');
        }
      } catch (error) {
        console.error('Error in text-to-speech:', error);
      }
    }
  };

  // Acciones predefinidas
  const performAction = async (actionName) => {
    try {
      const success = await sendCommand('/perform_action', {
        action: actionName
      });

      if (success) {
        await logActivity(user.uid, ActivityTypes.ROBOT_CONTROL, {
          robot: 'pepper',
          action: 'perform_action',
          actionName
        });
      }
    } catch (error) {
      console.error('Error performing action:', error);
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
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Feed */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Video Feed</h2>
            <div className="aspect-video bg-black rounded">
              <img 
                src={`${PEPPER_SERVER_URL}/video_feed`}
                alt="Pepper video feed"
                className="w-full h-full object-contain"
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* Control de movimientos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Control de Movimientos</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div></div>
              <button
                onClick={() => handleHeadMovement('up')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Arriba
              </button>
              <div></div>
              
              <button
                onClick={() => handleHeadMovement('left')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Izquierda
              </button>
              <div className="bg-gray-100 p-2 rounded text-center">
                Centro
              </div>
              <button
                onClick={() => handleHeadMovement('right')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Derecha
              </button>

              <div></div>
              <button
                onClick={() => handleHeadMovement('down')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Abajo
              </button>
              <div></div>
            </div>
          </div>

          {/* Control de voz */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Control de Voz</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Texto para que Pepper hable..."
                />
                <button
                  onClick={handleSpeak}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Hablar
                </button>
              </div>
            </div>
          </div>

          {/* Acciones predefinidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Acciones Predefinidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => performAction('greet')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Saludar
              </button>
              <button
                onClick={() => performAction('wave')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Hacer Señas
              </button>
              <button
                onClick={() => performAction('presentation')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Presentación
              </button>
              <button
                onClick={() => performAction('home')}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Posición Inicial
              </button>
            </div>
          </div>

          {/* Historial de voz */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Historial de Voz</h2>
            <div className="space-y-2">
              {voiceHistory.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <span className="text-blue-600">{entry.text}</span>
                  <span className="text-gray-500">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PepperControl;