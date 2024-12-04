import { useState, useEffect } from 'react';

export const useJoystick = () => {
    const [gamepadState, setGamepadState] = useState({
        connected: false,
        axes: [0, 0, 0, 0],
        buttons: [],
        timestamp: 0
    });

    useEffect(() => {
        let animationFrameId;
        
        const updateGamepadState = () => {
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[0]; // Using first gamepad

            if (gamepad) {
                setGamepadState({
                    connected: true,
                    axes: [...gamepad.axes],
                    buttons: gamepad.buttons.map(btn => ({
                        pressed: btn.pressed,
                        touched: btn.touched,
                        value: btn.value
                    })),
                    timestamp: gamepad.timestamp
                });
            } else {
                setGamepadState(prev => ({...prev, connected: false}));
            }

            animationFrameId = requestAnimationFrame(updateGamepadState);
        };

        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected:", e.gamepad);
            setGamepadState(prev => ({...prev, connected: true}));
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("Gamepad disconnected:", e.gamepad);
            setGamepadState(prev => ({...prev, connected: false}));
        });

        animationFrameId = requestAnimationFrame(updateGamepadState);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Mapear los controles del joystick a movimientos del robot
    const getMappedControls = () => {
        if (!gamepadState.connected) return null;

        const [leftX, leftY, rightX, rightY] = gamepadState.axes;
        const deadzone = 0.1; // Ignorar pequeños movimientos accidentales

        return {
            // Head movement (left stick)
            head: {
                yaw: Math.abs(leftX) > deadzone ? -leftX : 0,
                pitch: Math.abs(leftY) > deadzone ? leftY : 0
            },
            // Arm movement (right stick)
            rightArm: {
                pitch: Math.abs(rightY) > deadzone ? -rightY : 0,
                roll: Math.abs(rightX) > deadzone ? rightX : 0
            },
            // Button mappings
            actions: {
                greet: gamepadState.buttons[0]?.pressed,
                wave: gamepadState.buttons[1]?.pressed,
                home: gamepadState.buttons[2]?.pressed,
                presentation: gamepadState.buttons[3]?.pressed
            }
        };
    };

    return {
        isConnected: gamepadState.connected,
        mappedControls: getMappedControls()
    };
};