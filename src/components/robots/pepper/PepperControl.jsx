import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';

function PepperControl() {
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

  // Simulación de actualización de estado
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setIsConnected(Math.random() > 0.1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para controlar la cabeza con límites
  const handleHeadMovement = (direction) => {
    switch(direction) {
      case 'up':
        setHeadPosition(prev => ({ ...prev, y: Math.min(45, prev.y + 5) }));
        break;
      case 'down':
        setHeadPosition(prev => ({ ...prev, y: Math.max(-45, prev.y - 5) }));
        break;
      case 'left':
        setHeadPosition(prev => ({ ...prev, x: Math.max(-45, prev.x - 5) }));
        break;
      case 'right':
        setHeadPosition(prev => ({ ...prev, x: Math.min(45, prev.x + 5) }));
        break;
    }
    console.log(`Moviendo cabeza: ${direction}, Posición: X:${headPosition.x}° Y:${headPosition.y}°`);
  };

  // Función para el habla con historial
  const handleSpeak = () => {
    if (speechText.trim()) {
      console.log('Pepper dice:', speechText);
      setVoiceHistory(prev => [{
        type: 'speak',
        text: speechText,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
      setSpeechText('');
    }
  };

  // Función para escuchar
  const toggleListening = () => {
    setIsListening(!isListening);
    setVoiceHistory(prev => [{
      type: 'listen',
      text: !isListening ? 'Inicio de escucha' : 'Fin de escucha',
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
    console.log('Estado de escucha:', !isListening);
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
                  />
                  <button
                    onClick={handleSpeak}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                  } text-white`}
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
            <div className="space-y-2">
              {voiceHistory.map((entry, index) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <span className={entry.type === 'speak' ? 'text-blue-600' : 'text-green-600'}>
                    {entry.text}
                  </span>
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

export default PepperControl;