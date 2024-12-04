import { logActivity, ActivityTypes } from './logService';

const PEPPER_SERVER = 'http://14.10.2.192:8070';

class PepperService {
    constructor() {
        this.videoSocket = null;
        this.audioSocket = null;
        this.controlSocket = null;
        this.isConnected = false;
    }

    async connectToServer(userId) {
        try {
            // Inicializar conexiones HTTP para los diferentes endpoints
            const response = await fetch(`${PEPPER_SERVER}/`);
            if (response.ok) {
                this.isConnected = true;
                await logActivity(userId, ActivityTypes.ROBOT_ACCESS, {
                    robot: 'pepper',
                    action: 'connection_established',
                    status: 'success'
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error connecting to Pepper server:', error);
            await logActivity(userId, ActivityTypes.ERROR, {
                robot: 'pepper',
                action: 'connection_failed',
                error: error.message
            });
            return false;
        }
    }

    async moveJoint(userId, joint, angle, speed = 0.2) {
        try {
            const response = await fetch(`${PEPPER_SERVER}/move_joint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ joint, angle, speed })
            });

            if (response.ok) {
                await logActivity(userId, ActivityTypes.ROBOT_CONTROL, {
                    robot: 'pepper',
                    action: 'move_joint',
                    joint,
                    angle,
                    speed
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error moving joint:', error);
            return false;
        }
    }

    async speak(userId, text) {
        try {
            const response = await fetch(`${PEPPER_SERVER}/say`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                await logActivity(userId, ActivityTypes.ROBOT_CONTROL, {
                    robot: 'pepper',
                    action: 'speak',
                    text
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error in text to speech:', error);
            return false;
        }
    }

    async performAction(userId, action) {
        try {
            const response = await fetch(`${PEPPER_SERVER}/perform_action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                await logActivity(userId, ActivityTypes.ROBOT_CONTROL, {
                    robot: 'pepper',
                    action: 'perform_action',
                    actionType: action
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error performing action:', error);
            return false;
        }
    }

    async toggleAudio(userId, start = true) {
        const endpoint = start ? '/start_audio' : '/stop_audio';
        try {
            const response = await fetch(`${PEPPER_SERVER}${endpoint}`, {
                method: 'POST'
            });

            if (response.ok) {
                await logActivity(userId, ActivityTypes.ROBOT_CONTROL, {
                    robot: 'pepper',
                    action: start ? 'start_audio' : 'stop_audio'
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error toggling audio:', error);
            return false;
        }
    }

    getVideoFeedUrl() {
        return `${PEPPER_SERVER}/video_feed`;
    }

    getAudioFeedUrl() {
        return `${PEPPER_SERVER}/audio_feed`;
    }

    disconnect(userId) {
        this.isConnected = false;
        logActivity(userId, ActivityTypes.ROBOT_ACCESS, {
            robot: 'pepper',
            action: 'disconnected'
        });
    }
}

export const pepperService = new PepperService();