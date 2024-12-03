import React, { useState, useEffect } from 'react';

const JoystickControllerArm = ({ onPositionChange, isConnected }) => {
  const [gamepad, setGamepad] = useState(null);
  const [controlMode, setControlMode] = useState('position');

  useEffect(() => {
    const handleGamepadConnected = (e) => {
      console.log("Gamepad connected:", e.gamepad);
      setGamepad(e.gamepad);
    };

    const handleGamepadDisconnected = (e) => {
      console.log("Gamepad disconnected");
      setGamepad(null);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp) {
        setGamepad(gp);
        break;
      }
    }

    const pollGamepad = setInterval(() => {
      if (!isConnected) return;

      const gamepads = navigator.getGamepads();
      const activeGamepad = gamepads[0];
      
      if (!activeGamepad) return;

      const xAxis = activeGamepad.axes[0];
      const yAxis = activeGamepad.axes[1];
      const rAxis = activeGamepad.axes[2];
      
      if (activeGamepad.buttons[0].pressed) {
        setControlMode(prev => prev === 'position' ? 'rotation' : 'position');
      }

      const deadzone = 0.15;
      const normalizedX = Math.abs(xAxis) < deadzone ? 0 : xAxis;
      const normalizedY = Math.abs(yAxis) < deadzone ? 0 : yAxis;
      const normalizedR = Math.abs(rAxis) < deadzone ? 0 : rAxis;

      if (controlMode === 'position') {
        onPositionChange({
          x: normalizedX * 2,
          y: normalizedY * 2,
          z: activeGamepad.buttons[6].value - activeGamepad.buttons[7].value,
          r: 0
        });
      } else {
        onPositionChange({
          x: 0,
          y: 0,
          z: 0,
          r: normalizedR * 5
        });
      }
    }, 50);

    return () => {
      clearInterval(pollGamepad);
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
    };
  }, [isConnected, onPositionChange]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Control por Joystick</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${gamepad ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {gamepad ? 'Joystick Conectado' : 'No se detecta Joystick'}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          Modo: {controlMode === 'position' ? 'Control de Posición' : 'Control de Rotación'}
        </span>
      </div>
    </div>
  );
};

export default JoystickControllerArm;