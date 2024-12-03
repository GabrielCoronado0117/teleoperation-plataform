import React, { useEffect, useState } from 'react';

const JoystickController = ({ socket, onMovement, isConnected, setIsStanding }) => {
    const [gamepad, setGamepad] = useState(null);
    const [isJoystickConnected, setIsJoystickConnected] = useState(false);
    const [lastStanceTime, setLastStanceTime] = useState(0);
  
    useEffect(() => {
      const handleGamepadInput = () => {
        if (!isJoystickConnected || !isConnected || !gamepad) return;
        
        const gamepads = navigator.getGamepads();
        const currentGamepad = gamepads[gamepad.index];
        
        if (currentGamepad) {
          // Control de movimiento con stick izquierdo
          const leftX = currentGamepad.axes[0];
          const leftY = currentGamepad.axes[1];
          const deadzone = 0.15;
  
          // Rotación con stick derecho
          const rightX = currentGamepad.axes[2];
          const rotationDeadzone = 0.2;
  
          let x_speed = 0;
          let y_speed = 0;
          let yaw_speed = 0;
  
          // Movimiento adelante/atrás y lateral
          if (Math.abs(leftX) > deadzone || Math.abs(leftY) > deadzone) {
            x_speed = Math.abs(leftX) > deadzone ? leftX : 0;
            y_speed = Math.abs(leftY) > deadzone ? -leftY : 0;
          }
  
          // Rotación
          if (Math.abs(rightX) > rotationDeadzone) {
            yaw_speed = rightX;
          }
  
          // Enviar comando de movimiento
          socket.emit('control_command', {
            command: 'move',
            x_speed,
            y_speed,
            yaw_speed
          });
          onMovement({ x: x_speed, y: y_speed });
  
          // Botón A (0) para sentarse/pararse con cooldown
          if (currentGamepad.buttons[0].pressed) {
            const now = Date.now();
            if (now - lastStanceTime > 1000) { // 1 segundo de cooldown
              socket.emit('control_command', { command: 'toggle_stance' });
              setLastStanceTime(now);
              setIsStanding(prev => !prev);
            }
          }
  
          // Modos con botones
          if (currentGamepad.buttons[1].pressed) { // Botón B
            socket.emit('control_command', { command: 'switch_gait', gait_type: 0 });
          } else if (currentGamepad.buttons[2].pressed) { // Botón X
            socket.emit('control_command', { command: 'switch_gait', gait_type: 1 });
          } else if (currentGamepad.buttons[3].pressed) { // Botón Y
            socket.emit('control_command', { command: 'switch_gait', gait_type: 2 });
          }
        }
      };
  
      const gamepadLoop = setInterval(handleGamepadInput, 50);
      return () => clearInterval(gamepadLoop);
    }, [socket, isConnected, gamepad, onMovement, lastStanceTime]);
    
};

export default JoystickController;