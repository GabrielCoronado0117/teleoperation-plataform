import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  startAfter,
  startAt,
  endBefore,
  getCountFromServer,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Tipos de actividades
export const ActivityTypes = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  ROBOT_ACCESS: 'robot_access',
  ROBOT_CONTROL: 'robot_control',
  PERMISSION_CHANGE: 'permission_change',
  ROLE_CHANGE: 'role_change',
  ERROR: 'error',
  SYSTEM: 'system'
};

// Tipos de severidad para los logs
export const LogSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Funciones auxiliares
const getCollectionCount = async (queryConstraints) => {
  try {
    const q = query(collection(db, 'logs'), ...queryConstraints);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting collection count:', error);
    throw error;
  }
};

// Función para intentar reconectar
const tryReconnect = async () => {
  try {
    await enableNetwork(db);
  } catch (e) {
    console.warn('Network reconnection warning:', e);
  }
};
// Función para registrar una actividad
export const logActivity = async (userId, type, details, severity = LogSeverity.INFO) => {
  const logEntry = {
    userId,
    type,
    details,
    severity,
    timestamp: serverTimestamp(),
    userEmail: details.userEmail || 'Unknown',
    metadata: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp_iso: new Date().toISOString()
    }
  };

  try {
    await tryReconnect();
    const logsRef = collection(db, 'logs');
    const docRef = await addDoc(logsRef, logEntry);
    return {
      id: docRef.id,
      ...logEntry,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error logging activity:', error);
    // Fallback: guardar en localStorage si falla
    try {
      const localLogs = JSON.parse(localStorage.getItem('failedLogs') || '[]');
      const localLog = {
        ...logEntry,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('failedLogs', JSON.stringify([...localLogs, localLog]));
    } catch (e) {
      console.error('Failed to save log locally:', e);
    }
    throw error;
  }
};

// Función para construir consultas paginadas
const buildPaginatedQuery = (baseQuery, { page = 1, limit: limitCount = 10, lastDoc = null }) => {
  if (lastDoc) {
    return query(baseQuery, startAfter(lastDoc), limit(limitCount));
  }
  
  if (page > 1) {
    return query(baseQuery, limit(limitCount * page));
  }
  
  return query(baseQuery, limit(limitCount));
};

// Función para formatear resultados
const formatQueryResults = async (querySnapshot) => {
  const logs = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().timestamp_iso)
  }));

  return {
    logs,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    hasMore: querySnapshot.docs.length === querySnapshot.size
  };
};
// Obtener todos los logs con paginación
export const getAllLogs = async ({ page = 1, limit = 10, ...rest } = {}) => {
  try {
    await tryReconnect();
    const logsRef = collection(db, 'logs');
    const baseQuery = query(logsRef, orderBy('timestamp', 'desc'));
    
    // Obtener total de registros
    const total = await getCollectionCount([orderBy('timestamp', 'desc')]);
    
    // Construir consulta paginada
    const q = buildPaginatedQuery(baseQuery, { page, limit });
    const snapshot = await getDocs(q);
    const results = await formatQueryResults(snapshot);

    return {
      ...results,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error en getAllLogs:', error);
    if (error.code === 'unavailable') {
      await disableNetwork(db);
      const result = await getAllLogs({ page, limit, ...rest });
      await enableNetwork(db);
      return result;
    }
    throw error;
  }
};

// Obtener logs por tipo
export const getLogsByType = async (type, { page = 1, limit = 10, ...rest } = {}) => {
  try {
    await tryReconnect();
    const logsRef = collection(db, 'logs');
    const baseQuery = query(
      logsRef,
      where('type', '==', type),
      orderBy('timestamp', 'desc')
    );

    const total = await getCollectionCount([
      where('type', '==', type),
      orderBy('timestamp', 'desc')
    ]);

    const q = buildPaginatedQuery(baseQuery, { page, limit });
    const snapshot = await getDocs(q);
    const results = await formatQueryResults(snapshot);

    return {
      ...results,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error en getLogsByType:', error);
    if (error.code === 'unavailable') {
      await disableNetwork(db);
      const result = await getLogsByType(type, { page, limit, ...rest });
      await enableNetwork(db);
      return result;
    }
    throw error;
  }
};

// Obtener logs por rango de fechas
export const getLogsByDateRange = async (startDate, endDate, { page = 1, limit = 10, ...rest } = {}) => {
  try {
    await tryReconnect();
    const logsRef = collection(db, 'logs');
    const baseQuery = query(
      logsRef,
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc')
    );

    const total = await getCollectionCount([
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'desc')
    ]);

    const q = buildPaginatedQuery(baseQuery, { page, limit });
    const snapshot = await getDocs(q);
    const results = await formatQueryResults(snapshot);

    return {
      ...results,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error en getLogsByDateRange:', error);
    if (error.code === 'unavailable') {
      await disableNetwork(db);
      const result = await getLogsByDateRange(startDate, endDate, { page, limit, ...rest });
      await enableNetwork(db);
      return result;
    }
    throw error;
  }
};
// Función para exportar logs a CSV
export const exportLogsToCSV = async (filters = {}) => {
  try {
    await tryReconnect();
    // Obtener todos los logs para exportar
    const allLogs = await getAllLogs({ limit: 1000, ...filters });
    
    const headers = ['Fecha', 'Usuario', 'Tipo', 'Severidad', 'Detalles'];
    const rows = allLogs.logs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.userEmail,
      log.type,
      log.severity || LogSeverity.INFO,
      typeof log.details === 'string'
        ? `"${log.details.replace(/"/g, '""')}"`
        : `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    return {
      content: csvContent,
      filename: `logs_${new Date().toISOString()}.csv`,
      totalExported: rows.length
    };
  } catch (error) {
    console.error('Error exporting logs to CSV:', error);
    throw error;
  }
};

// Función para obtener estadísticas de logs
export const getLogsStatistics = async (daysBack = 7) => {
  try {
    await tryReconnect();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const stats = {
      totalLogs: 0,
      byType: {},
      bySeverity: {},
      byUser: {},
      timeDistribution: {},
      activeUsers: new Set()
    };

    const logsRef = collection(db, 'logs');
    const q = query(
      logsRef,
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => {
      const log = doc.data();
      // Asegurarse de que timestamp existe y es válido
      const timestamp = log.timestamp?.toDate() || new Date(log.timestamp_iso);
      const dateKey = timestamp.toISOString().split('T')[0];

      // Incrementar contadores
      stats.totalLogs++;
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      stats.bySeverity[log.severity || 'info'] = (stats.bySeverity[log.severity || 'info'] || 0) + 1;
      stats.timeDistribution[dateKey] = (stats.timeDistribution[dateKey] || 0) + 1;

      if (log.userEmail) {
        stats.byUser[log.userEmail] = (stats.byUser[log.userEmail] || 0) + 1;
        stats.activeUsers.add(log.userEmail);
      }
    });

    // Convertir Set a número para activeUsers
    stats.uniqueUsers = stats.activeUsers.size;
    delete stats.activeUsers;

    // Ordenar timeDistribution por fecha
    stats.timeDistribution = Object.fromEntries(
      Object.entries(stats.timeDistribution)
        .sort(([a], [b]) => new Date(a) - new Date(b))
    );

    return stats;
  } catch (error) {
    console.error('Error getting logs statistics:', error);
    throw error;
  }
};
// Función para limpiar logs antiguos
export const cleanOldLogs = async (daysToKeep = 30) => {
  try {
    await tryReconnect();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const logsRef = collection(db, 'logs');
    const q = query(
      logsRef,
      where('timestamp', '<', cutoffDate),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const batchSize = 500;
    let deletedCount = 0;

    // Procesar documentos en lotes
    const processDocuments = async (documents) => {
      try {
        const deleteOperations = documents.map(doc => doc.ref.delete());
        await Promise.all(deleteOperations);
        return deleteOperations.length;
      } catch (error) {
        console.error('Error processing batch:', error);
        throw error;
      }
    };

    // Procesar todos los documentos en lotes
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      try {
        const batch = snapshot.docs.slice(i, Math.min(i + batchSize, snapshot.docs.length));
        const batchCount = await processDocuments(batch);
        deletedCount += batchCount;
        
        // Log de progreso
        console.log(`Processed ${deletedCount} of ${snapshot.docs.length} documents`);
      } catch (error) {
        console.error(`Error processing batch starting at index ${i}:`, error);
        // Continuar con el siguiente lote incluso si uno falla
        continue;
      }
    }

    return {
      success: true,
      deletedCount,
      cutoffDate,
      message: `Se eliminaron ${deletedCount} registros anteriores a ${cutoffDate.toLocaleDateString()}`
    };
  } catch (error) {
    console.error('Error cleaning old logs:', error);
    return {
      success: false,
      error: error.message,
      cutoffDate,
      deletedCount: 0,
      message: `Error al eliminar registros: ${error.message}`
    };
  }
};

// Función para sincronizar logs fallidos
export const syncFailedLogs = async () => {
  try {
    await tryReconnect();
    const failedLogs = JSON.parse(localStorage.getItem('failedLogs') || '[]');
    if (failedLogs.length === 0) return { synced: 0 };

    const syncedLogs = [];
    const errors = [];

    for (const log of failedLogs) {
      try {
        const result = await logActivity(
          log.userId,
          log.type,
          log.details,
          log.severity
        );
        syncedLogs.push({ ...log, syncedId: result.id });
      } catch (error) {
        console.error('Error syncing log:', error);
        errors.push({ log, error: error.message });
      }
    }

    // Remover solo los logs sincronizados exitosamente
    const remainingLogs = failedLogs.filter(
      log => !syncedLogs.find(
        synced => synced.timestamp === log.timestamp && 
                 synced.userId === log.userId
      )
    );

    // Actualizar localStorage
    localStorage.setItem('failedLogs', JSON.stringify(remainingLogs));

    return {
      success: true,
      synced: syncedLogs.length,
      remaining: remainingLogs.length,
      errors: errors.length > 0 ? errors : null
    };
  } catch (error) {
    console.error('Error syncing failed logs:', error);
    return {
      success: false,
      error: error.message,
      synced: 0,
      remaining: null
    };
  }
};

// Exportación por defecto
export default {
  logActivity,
  getAllLogs,
  getLogsByType,
  getLogsByDateRange,
  exportLogsToCSV,
  getLogsStatistics,
  cleanOldLogs,
  syncFailedLogs,
  ActivityTypes,
  LogSeverity
};