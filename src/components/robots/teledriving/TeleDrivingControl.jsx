import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';

function TeleDrivingControl() {
  // Estados básicos
  const [speed, setSpeed] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [steering, setSteering] = useState(0);
  const [gear, setGear] = useState('P'); // P, R, N, D
  const [brake, setBrake] = useState(false);
  const [accelerator, setAccelerator] = useState(0);
  const [indicators, setIndicators] = useState({ left: false, right: false });
  const [lights, setLights] = useState(false);

  // Estados de vehículo
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [fuel, setFuel] = useState(100);
  const [isConnected, setIsConnected] = useState(true);
  const [engineTemp, setEngineTemp] = useState(90);
  const [oilPressure, setOilPressure] = useState(40);
  
  // Sensores
  const [proximityData, setProximityData] = useState({
    front: 100,
    back: 100,
    left: 100,
    right: 100
  });

  // Estado del sistema
  const [systemStatus, setSystemStatus] = useState({
    engine: 'OK',
    transmission: 'OK',
    brakes: 'OK',
    steering: 'OK',
    cameras: 'OK',
    sensors: 'OK'
  });

  // Historial de acciones
  const [actionHistory, setActionHistory] = useState([]);

  // Simulación de actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar niveles
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      setFuel(prev => Math.max(0, prev - 0.05));
      
      // Simular temperatura del motor
      setEngineTemp(prev => 90 + Math.sin(Date.now() / 1000) * 5);
      
      // Simular presión de aceite
      setOilPressure(prev => 40 + Math.sin(Date.now() / 1000) * 2);
      
      // Simular sensores de proximidad
      setProximityData(prev => ({
        front: Math.max(0, 100 + Math.sin(Date.now() / 1000) * 20),
        back: Math.max(0, 100 + Math.cos(Date.now() / 1000) * 20),
        left: Math.max(0, 100 + Math.sin(Date.now() / 500) * 20),
        right: Math.max(0, 100 + Math.cos(Date.now() / 500) * 20)
      }));

      // Actualizar RPM basado en acelerador
      setRpm(prev => {
        const targetRpm = accelerator * 80;
        return prev + (targetRpm - prev) * 0.1;
      });

      // Simular conexión
      setIsConnected(Math.random() > 0.05);
    }, 100);

    return () => clearInterval(interval);
  }, [accelerator]);

  // Registrar acciones
  const logAction = (action, detail) => {
    setActionHistory(prev => [{
      action,
      detail,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]);
  };

  // Control de velocidad
  const handleSpeedChange = (value) => {
    setSpeed(parseInt(value));
    setAccelerator(value / 100);
    logAction('Velocidad', `${value} km/h`);
  };

  // Control de dirección
  const handleSteering = (direction) => {
    let newAngle;
    switch(direction) {
      case 'left':
        newAngle = -45;
        break;
      case 'right':
        newAngle = 45;
        break;
      default:
        newAngle = 0;
    }
    setSteering(newAngle);
    logAction('Dirección', direction);
  };

  // Cambio de marcha
  const handleGearChange = (newGear) => {
    if (speed === 0 || (gear === 'P' && brake)) {
      setGear(newGear);
      logAction('Marcha', newGear);
    }
  };

  // Control de intermitentes
  const toggleIndicator = (side) => {
    setIndicators(prev => ({
      left: side === 'left' ? !prev.left : false,
      right: side === 'right' ? !prev.right : false
    }));
    logAction('Intermitente', side);
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
                Marcha: {gear}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Combustible: {fuel.toFixed(1)}%
                <div className="w-20 h-2 bg-gray-200 rounded">
                  <div 
                    className={`h-full rounded ${
                      fuel > 30 ? 'bg-green-500' : 
                      fuel > 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${fuel}%` }}
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
            <h1 className="text-2xl font-bold text-gray-800">TeleDriving</h1>
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
          {/* Panel de Instrumentos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Panel de Instrumentos</h2>
            
            {/* Velocímetro y RPM */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{speed}</div>
                  <div className="text-sm text-gray-600">km/h</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={speed}
                  onChange={(e) => handleSpeedChange(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(rpm)}</div>
                  <div className="text-sm text-gray-600">RPM</div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div 
                    className={`h-full rounded ${
                      rpm < 6000 ? 'bg-green-500' : 
                      rpm < 7000 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(rpm / 8000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Temperatura y Presión de Aceite */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-600">Temperatura Motor</div>
                <div className="flex items-center">
                  <div className="text-lg font-bold">{Math.round(engineTemp)}°C</div>
                  <div className="ml-2 w-full h-2 bg-gray-200 rounded">
                    <div 
                      className={`h-full rounded ${
                        engineTemp < 100 ? 'bg-green-500' : 
                        engineTemp < 110 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(engineTemp / 130) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Presión Aceite</div>
                <div className="flex items-center">
                  <div className="text-lg font-bold">{Math.round(oilPressure)} PSI</div>
                  <div className="ml-2 w-full h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full rounded bg-green-500"
                      style={{ width: `${(oilPressure / 60) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles Principales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Controles</h2>
            
            {/* Selector de Marcha */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {['P', 'R', 'N', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => handleGearChange(g)}
                  className={`p-4 rounded ${
                    gear === g 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={speed > 0 && gear === 'P'}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Control de Dirección */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                onMouseDown={() => handleSteering('left')}
                onMouseUp={() => handleSteering('center')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                ←
              </button>
              <div className="bg-gray-100 p-4 rounded text-center">
                {steering}°
              </div>
              <button
                onMouseDown={() => handleSteering('right')}
                onMouseUp={() => handleSteering('center')}
                className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600"
              >
                →
              </button>
            </div>

            {/* Frenos e Intermitentes */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onMouseDown={() => setBrake(true)}
                onMouseUp={() => setBrake(false)}
                className={`p-4 rounded text-white ${
                  brake ? 'bg-red-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                FRENO
              </button>
              <button
                onClick={() => setLights(!lights)}
                className={`p-4 rounded ${
                  lights ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {lights ? 'Luces ON' : 'Luces OFF'}
              </button>
            </div>

            {/* Intermitentes */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleIndicator('left')}
                className={`p-4 rounded ${
                  indicators.left 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ← Intermitente
              </button>
              <button
                onClick={() => toggleIndicator('right')}
                className={`p-4 rounded ${
                  indicators.right 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Intermitente →
              </button>
            </div>
          </div>

          {/* Sensores de Proximidad */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sensores de Proximidad</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(proximityData).map(([sensor, distance]) => (
                <div key={sensor} className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600 capitalize">{sensor}</div>
                  <div className="flex items-center">
                    <div className="text-lg font-bold">{Math.round(distance)}cm</div>
                    <div className="ml-2 flex-1 h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-full rounded ${
                          distance > 50 ? 'bg-green-500' : 
                          distance > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (distance / 100) * 100)}%` }}
                      ></div>
                    </div>
                    </div>
                  </div>
              ))}
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

            {/* Historial de Acciones */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Últimas Acciones:</h3>
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

          {/* Sistema de Cámaras */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sistema de Cámaras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cámara Frontal */}
              <div className="bg-gray-200 aspect-video rounded">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-gray-600">Cámara Frontal</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {isConnected ? 'Transmitiendo' : 'Sin señal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cámara Trasera */}
              <div className="bg-gray-200 aspect-video rounded">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-gray-600">Cámara Trasera</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {isConnected ? 'Transmitiendo' : 'Sin señal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Lateral Izquierda */}
              <div className="bg-gray-200 aspect-video rounded">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-gray-600">Vista Lateral Izquierda</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {isConnected ? 'Transmitiendo' : 'Sin señal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Lateral Derecha */}
              <div className="bg-gray-200 aspect-video rounded">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-gray-600">Vista Lateral Derecha</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {isConnected ? 'Transmitiendo' : 'Sin señal'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TeleDrivingControl;