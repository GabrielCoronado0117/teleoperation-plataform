import React, { useState } from 'react';
import { auth } from '../../../firebase/config';

function PepperControl() {
  const [headPosition, setHeadPosition] = useState({ x: 0, y: 0 });
  const [armPosition, setArmPosition] = useState({ left: 0, right: 0 });
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Función para controlar la cabeza
  const handleHeadMovement = (direction) => {
    switch(direction) {
      case 'up':
        setHeadPosition(prev => ({ ...prev, y: prev.y + 10 }));
        break;
      case 'down':
        setHeadPosition(prev => ({ ...prev, y: prev.y - 10 }));
        break;
      case 'left':
        setHeadPosition(prev => ({ ...prev, x: prev.x - 10 }));
        break;
      case 'right':
        setHeadPosition(prev => ({ ...prev, x: prev.x + 10 }));
        break;
    }
    console.log(`Moviendo cabeza: ${direction}`);
  };

  // Función para el habla
  const handleSpeak = () => {
    if (speechText.trim()) {
      console.log('Pepper dice:', speechText);
      setSpeechText('');
    }
  };

  // Función para escuchar
  const toggleListening = () => {
    setIsListening(!isListening);
    console.log('Estado de escucha:', !isListening);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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