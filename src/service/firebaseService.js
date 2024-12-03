import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../firebase/config';

// Constantes para la configuración
const RETRY_DELAY = 5000; // 5 segundos entre intentos (manteniendo tu configuración)
const MAX_RETRIES = 3;

// Objeto para manejar mensajes de error específicos de Firebase
export const errorHandler = {
  parseFirebaseError: (error) => {
    const errorMessages = {
      'permission-denied': 'No tienes permisos para realizar esta acción.',
      'failed-precondition': 'Error de conexión. Verificando conexión...',
      'not-found': 'El recurso solicitado no existe.',
      'already-exists': 'Este registro ya existe.',
      'unauthenticated': 'Por favor, inicia sesión nuevamente.',
      'resource-exhausted': 'Has excedido el límite de intentos permitidos.',
      'cancelled': 'La operación fue cancelada.',
      'data-loss': 'Se produjo una pérdida de datos irrecuperable.',
      'unknown': 'Se produjo un error desconocido.',
      'invalid-argument': 'Los datos proporcionados no son válidos.',
      'deadline-exceeded': 'La operación tardó demasiado tiempo.',
      'unavailable': 'El servicio no está disponible en este momento.'
    };

    if (error.code) {
      return errorMessages[error.code] || error.message;
    }
    return error.message || 'Error desconocido';
  }
};

// Objeto para manejar el estado offline/online
export const handleOfflineState = {
  enableFirestore: async () => {
    try {
      console.log('[FirebaseService] Intentando habilitar la red...');
      await enableNetwork(db);
      console.log('[FirebaseService] Red habilitada exitosamente');
      return true;
    } catch (error) {
      console.error('[FirebaseService] Error habilitando la red:', error);
      console.error('Detalles del error:', errorHandler.parseFirebaseError(error));
      return false;
    }
  },

  disableFirestore: async () => {
    try {
      console.log('[FirebaseService] Deshabilitando la red...');
      await disableNetwork(db);
      console.log('[FirebaseService] Red deshabilitada exitosamente');
      return true;
    } catch (error) {
      console.error('[FirebaseService] Error deshabilitando la red:', error);
      console.error('Detalles del error:', errorHandler.parseFirebaseError(error));
      return false;
    }
  },
  
  retryConnection: async (retryAttempts = MAX_RETRIES, delay = RETRY_DELAY) => {
    console.log(`[FirebaseService] Iniciando reintentos de conexión. Intentos máximos: ${retryAttempts}`);
    
    for(let i = 0; i < retryAttempts; i++) {
      console.log(`[FirebaseService] Intento ${i + 1} de ${retryAttempts}`);
      
      const success = await handleOfflineState.enableFirestore();
      if(success) {
        console.log('[FirebaseService] Conexión restablecida exitosamente');
        return true;
      }
      
      if (i < retryAttempts - 1) {
        console.log(`[FirebaseService] Esperando ${delay/1000} segundos antes del siguiente intento...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    
    console.log('[FirebaseService] Se agotaron los intentos de reconexión');
    return false;
  },

  // Método para verificar el estado de la conexión
  checkConnection: async () => {
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      // Intentamos hacer una operación simple para verificar la conexión
      const connectionTest = getDoc(doc(db, '_connection_test_', 'test'));
      
      await Promise.race([connectionTest, timeout]);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Método para manejar reconexiones con retroalimentación
  handleReconnection: async (onStatusChange) => {
    let attempts = 0;
    const maxAttempts = MAX_RETRIES;

    while (attempts < maxAttempts) {
      if (onStatusChange) {
        onStatusChange({
          attempting: true,
          attempt: attempts + 1,
          maxAttempts,
          message: `Intento de reconexión ${attempts + 1} de ${maxAttempts}`
        });
      }

      const success = await handleOfflineState.enableFirestore();
      if (success) {
        if (onStatusChange) {
          onStatusChange({
            attempting: false,
            success: true,
            message: 'Conexión restablecida exitosamente'
          });
        }
        return true;
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }

    if (onStatusChange) {
      onStatusChange({
        attempting: false,
        success: false,
        message: 'No se pudo restablecer la conexión'
      });
    }
    return false;
  }
};