import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import io from 'socket.io-client';
import JoystickController from './JoystickControllerDog';

function DogControl() {
  const [speed, setSpeed] = useState(50);
  const [movement, setMovement] = useState({ x: 0, y: 0 });
  const [isStanding, setIsStanding] = useState(true);
  const [selectedMode, setSelectedMode] = useState('normal');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isConnected, setIsConnected] = useState(false);
  const [stabilityLevel, setStabilityLevel] = useState(100);
  const [actionHistory, setActionHistory] = useState([]);
  const [isJoystickConnected, setIsJoystickConnected] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    motors: 'OK',
    balance: 'OK',
    sensors: 'OK',
    servos: 'OK'
  });
  const [videoFeed, setVideoFeed] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://14.10.2.192:8066', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  
    // Socket event handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
      logAction('Conexión', 'Conectado al servidor de control');
    });
  
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      logAction('Conexión', 'Desconectado del servidor de control');
    });
  
    newSocket.on('frame', (frameData) => {
      if (frameData?.data) {
        setVideoFeed(`data:image/jpeg;base64,${frameData.data}`);
      }
    });
  
    newSocket.on('status_update', (data) => {
      if (data.battery) setBatteryLevel(data.battery);
      if (data.stability) setStabilityLevel(data.stability);
      if (data.system) setSystemStatus(data.system);
    });
  
    setSocket(newSocket);
    return () => newSocket?.disconnect();
  }, []);
  
  const logAction = (action, detail) => {
    setActionHistory(prev => [{
      action,
      detail,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
  };
  
  const handleMovement = (direction) => {
    if (!socket || !isConnected || isJoystickConnected) return;
  
    let x_speed = 0;
    let y_speed = 0;
    const normalizedSpeed = speed / 100;
  
    switch(direction) {
      case 'forward': y_speed = normalizedSpeed; break;
      case 'backward': y_speed = -normalizedSpeed; break;
      case 'left': x_speed = -normalizedSpeed; break;
      case 'right': x_speed = normalizedSpeed; break;
    }
  
    socket.emit('control_command', {
      command: 'move',
      x_speed,
      y_speed,
      yaw_speed: 0
    });
  
    setMovement({ x: x_speed, y: y_speed });
    logAction('Movimiento', `Dirección: ${direction}, Velocidad: ${speed}%`);
  };

  const toggleStance = () => {
    if (!socket || !isConnected) return;
    const command = isStanding ? 'stand_down' : 'stand_up';
    socket.emit('control_command', { command });
    setIsStanding(!isStanding);
    logAction('Postura', isStanding ? 'Sentado' : 'De pie');
  };
  
  const changeMode = (mode) => {
    if (!socket || !isConnected) return;
    const gaitTypes = {
      'normal': 0,
      'agile': 1,
      'stable': 2
    };
  
    socket.emit('control_command', {
      command: 'switch_gait',
      gait_type: gaitTypes[mode] || 0
    });
    setSelectedMode(mode);
    logAction('Modo', `Cambiado a: ${mode}`);
  };
  
  // Manejo de eventos de teclado actualizado
  useEffect(() => {
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      const hasGamepad = Object.values(gamepads).some(gamepad => gamepad !== null);
      setIsJoystickConnected(hasGamepad);
    };

    window.addEventListener('gamepadconnected', () => {
      checkGamepad();
      logAction('Control', 'Joystick conectado');
    });
    
    window.addEventListener('gamepaddisconnected', () => {
      checkGamepad();
      logAction('Control', 'Joystick desconectado');
    });
    
    checkGamepad(); // Verificar al inicio

    const handleKeyDown = (e) => {
      if (!isConnected || isJoystickConnected) return;
      
      switch(e.key) {
        case 'ArrowUp': handleMovement('forward'); break;
        case 'ArrowDown': handleMovement('backward'); break;
        case 'ArrowLeft': handleMovement('left'); break;
        case 'ArrowRight': handleMovement('right'); break;
        case ' ': toggleStance(); break;
      }
    };
  
    const handleKeyUp = (e) => {
      if (!isConnected || isJoystickConnected) return;
      
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          handleMovement('stop');
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('gamepadconnected', checkGamepad);
      window.removeEventListener('gamepaddisconnected', checkGamepad);
    };
  }, [isConnected, speed, isJoystickConnected]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Status Bar */}
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
      {/* Main Control Panel */}
{/* Main Control Panel */}
<div className="max-w-7xl mx-auto px-4 py-8">
  <div className="grid grid-cols-1 gap-6">
    {/* Video Feed - Con tamaño ajustado */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Video en Vivo</h2>
      <div className="max-w-3xl mx-auto"> {/* Añadido contenedor con ancho máximo */}
        <div className="bg-gray-200 aspect-video rounded flex items-center justify-center">
          {videoFeed ? (
            <img 
              src={videoFeed} 
              alt="Video feed" 
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <span className="text-gray-600">Esperando video...</span>
          )}
        </div>
      </div>
    </div>

    {/* Controls Grid - 2 columnas para los controles debajo del video */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Joystick Controller Component */}
      <JoystickController 
        socket={socket}
        isConnected={isConnected}
        onMovement={setMovement}
        setIsStanding={setIsStanding}
        onModeChange={changeMode}
      />

      {/* Movement Control */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Control de Movimiento</h2>
        <div className="text-sm text-gray-600 mb-4">
          Estado: {movement.x === 0 && movement.y === 0 ? 'Detenido' : 'En movimiento'}
        </div>
        
        {/* Directional Controls */}
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
        
        {/* Speed Control */}
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

      {/* Modes and Postures */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Modos y Posturas</h2>
        
        {/* Mode Selector */}
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

        {/* Posture Control */}
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

      {/* System Status */}
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

      {/* Action History */}
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
  </div>
</div>
</div>
  );
}

export default DogControl;