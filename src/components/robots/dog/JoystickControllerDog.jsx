import React, { useEffect, useState } from 'react';

const JoystickController = ({ socket, onMovement, isConnected, setIsStanding, onModeChange }) => {
    const [gamepad, setGamepad] = useState(null);
    const [isJoystickConnected, setIsJoystickConnected] = useState(false);
    const [lastStanceTime, setLastStanceTime] = useState(0);
    const [controlMode, setControlMode] = useState('keyboard');
    const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

    // Mapeo de botones del control
    const GAMEPAD_BUTTONS = {
        A: 0,       // Sentarse/Pararse
        B: 1,       // Modo Normal
        X: 2,       // Modo Ágil
        Y: 3,       // Modo Estable
        LB: 4,      // Reducir velocidad
        RB: 5,      // Aumentar velocidad
        LT: 6,      // Trigger izquierdo
        RT: 7,      // Trigger derecho
        BACK: 8,    // Select/Back
        START: 9,   // Start
        L3: 10,     // Click stick izquierdo
        R3: 11,     // Click stick derecho
        UP: 12,     // D-pad arriba
        DOWN: 13,   // D-pad abajo
        LEFT: 14,   // D-pad izquierda
        RIGHT: 15   // D-pad derecha
    };

    // Detectar conexión/desconexión del gamepad
    useEffect(() => {
        const handleGamepadConnected = (e) => {
            setGamepad(e.gamepad);
            setIsJoystickConnected(true);
            setControlMode('gamepad');
            console.log('Gamepad connected:', e.gamepad);
        };

        const handleGamepadDisconnected = (e) => {
            if (gamepad && e.gamepad.index === gamepad.index) {
                setGamepad(null);
                setIsJoystickConnected(false);
                setControlMode('keyboard');
                console.log('Gamepad disconnected');
            }
        };

        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
        };
    }, [gamepad]);

    // Manejar input del gamepad
    useEffect(() => {
        const handleGamepadInput = () => {
            if (!isJoystickConnected || !isConnected || !gamepad) return;
            
            const gamepads = navigator.getGamepads();
            const currentGamepad = gamepads[gamepad.index];
            
            if (!currentGamepad) return;

            // Control de movimiento
            handleMovementInput(currentGamepad);
            
            // Control de botones
            handleButtonInput(currentGamepad);
        };

        const handleMovementInput = (currentGamepad) => {
            // Control principal con stick izquierdo
            const leftX = currentGamepad.axes[0];
            const leftY = currentGamepad.axes[1];
            // Control de rotación con stick derecho
            const rightX = currentGamepad.axes[2];
            
            const deadzone = 0.15;
            const rotationDeadzone = 0.2;

            let x_speed = 0;
            let y_speed = 0;
            let yaw_speed = 0;

            // Movimiento con stick izquierdo
            if (Math.abs(leftX) > deadzone || Math.abs(leftY) > deadzone) {
                x_speed = Math.abs(leftX) > deadzone ? leftX : 0;
                y_speed = Math.abs(leftY) > deadzone ? -leftY : 0;
                
                // Normalizar valores
                const magnitude = Math.sqrt(x_speed * x_speed + y_speed * y_speed);
                if (magnitude > 1) {
                    x_speed /= magnitude;
                    y_speed /= magnitude;
                }
            }

            // Movimiento alternativo con D-pad
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.UP].pressed) y_speed = 1;
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.DOWN].pressed) y_speed = -1;
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.LEFT].pressed) x_speed = -1;
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.RIGHT].pressed) x_speed = 1;

            // Rotación con stick derecho
            if (Math.abs(rightX) > rotationDeadzone) {
                yaw_speed = rightX;
            }

            // Aplicar multiplicador de velocidad
            x_speed *= speedMultiplier;
            y_speed *= speedMultiplier;
            yaw_speed *= speedMultiplier;

            // Enviar comando de movimiento
            if (x_speed !== 0 || y_speed !== 0 || yaw_speed !== 0) {
                socket.emit('control_command', {
                    command: 'move',
                    x_speed,
                    y_speed,
                    yaw_speed
                });
                onMovement({ x: x_speed, y: y_speed });
            }
        };

        const handleButtonInput = (currentGamepad) => {
            // Control de velocidad con bumpers
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.RB].pressed) {
                setSpeedMultiplier(prev => Math.min(prev + 0.1, 2.0));
            }
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.LB].pressed) {
                setSpeedMultiplier(prev => Math.max(prev - 0.1, 0.1));
            }

            // Velocidad con triggers (analogico)
            const rtValue = currentGamepad.buttons[GAMEPAD_BUTTONS.RT].value;
            const ltValue = currentGamepad.buttons[GAMEPAD_BUTTONS.LT].value;
            if (rtValue > 0.1 || ltValue > 0.1) {
                setSpeedMultiplier(1.0 + Math.max(rtValue, ltValue));
            }

            // Botón A para sentarse/pararse con cooldown
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.A].pressed) {
                const now = Date.now();
                if (now - lastStanceTime > 1000) {
                    socket.emit('control_command', { command: 'toggle_stance' });
                    setLastStanceTime(now);
                    setIsStanding(prev => !prev);
                }
            }

            // Cambio de modos con botones
            if (currentGamepad.buttons[GAMEPAD_BUTTONS.B].pressed) {
                onModeChange('normal');
            } else if (currentGamepad.buttons[GAMEPAD_BUTTONS.X].pressed) {
                onModeChange('agile');
            } else if (currentGamepad.buttons[GAMEPAD_BUTTONS.Y].pressed) {
                onModeChange('stable');
            }
        };

        const gamepadLoop = setInterval(handleGamepadInput, 50);
        return () => clearInterval(gamepadLoop);
    }, [socket, isConnected, gamepad, onMovement, lastStanceTime, onModeChange, speedMultiplier]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Estado del Control</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Modo de Control:</span>
                    <span className={`px-3 py-1 rounded-full ${
                        controlMode === 'gamepad' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {controlMode === 'gamepad' ? 'Control' : 'Teclado'}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-700">Multiplicador de Velocidad:</span>
                    <span className="font-medium">{speedMultiplier.toFixed(2)}x</span>
                </div>
                {controlMode === 'gamepad' && (
                    <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">Controles:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Stick Izquierdo / D-pad: Movimiento</li>
                            <li>Stick Derecho: Rotación</li>
                            <li>A: Sentarse/Pararse</li>
                            <li>B/X/Y: Cambiar Modos</li>
                            <li>LB/RB: Ajustar Velocidad</li>
                            <li>Triggers: Control Fino de Velocidad</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoystickController;