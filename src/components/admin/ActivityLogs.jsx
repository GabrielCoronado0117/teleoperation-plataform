import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllLogs, 
  getLogsByType, 
  getLogsByDateRange, 
  ActivityTypes,
  exportLogsToCSV,
  getLogsStatistics 
} from '../../service/logService';
import { useAuth } from '../../hook/useAuth';

function ActivityLogs() {
  // Estados básicos
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();
  const { userData } = useAuth();

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Estados de filtros
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Estado para estadísticas
  const [statistics, setStatistics] = useState(null);

  // Estado para exportación
  const [exporting, setExporting] = useState(false);

  // Estado para mostrar detalles
  const [selectedLog, setSelectedLog] = useState(null);
  // Función para obtener color según tipo de actividad
  const getActivityColor = (type) => {
    switch (type) {
      case ActivityTypes.LOGIN:
        return 'bg-green-100 text-green-800';
      case ActivityTypes.LOGOUT:
        return 'bg-yellow-100 text-yellow-800';
      case ActivityTypes.ERROR:
        return 'bg-red-100 text-red-800';
      case ActivityTypes.ROBOT_ACCESS:
        return 'bg-blue-100 text-blue-800';
      case ActivityTypes.ROBOT_CONTROL:
        return 'bg-purple-100 text-purple-800';
      case ActivityTypes.PERMISSION_CHANGE:
        return 'bg-indigo-100 text-indigo-800';
      case ActivityTypes.ROLE_CHANGE:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para cargar logs con reintentos
  const loadLogs = useCallback(async (retries = 3) => {
    try {
      setLoading(true);
      setError(null);
      let result;

      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (filterType === 'all') {
        result = await getAllLogs(params);
      } else if (filterType === 'date') {
        result = await getLogsByDateRange(
          new Date(dateRange.start),
          new Date(dateRange.end),
          params
        );
      } else {
        result = await getLogsByType(filterType, params);
      }

      setLogs(result.logs);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);

    } catch (err) {
      console.error('Error loading logs:', err);
      if (retries > 0) {
        console.warn(`Retrying load, attempts left: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return loadLogs(retries - 1);
      }
      setError('Error al cargar los registros. Por favor, verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filterType, dateRange, currentPage, itemsPerPage]);

  // Función para cargar estadísticas
  const loadStatistics = async () => {
    try {
      const stats = await getLogsStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Función para exportar logs
  const handleExport = async () => {
    try {
      setExporting(true);
      const csvContent = await exportLogsToCSV({
        filterType,
        dateRange: filterType === 'date' ? dateRange : undefined
      });

      // Crear y descargar el archivo CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting logs:', error);
      setError('Error al exportar los registros.');
    } finally {
      setExporting(false);
    }
  };

  // Función para manejar el clic en un log
  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetails = () => {
    setSelectedLog(null);
  };

  // Efecto para cargar logs cuando cambian los filtros
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Efecto para cargar estadísticas
  useEffect(() => {
    loadStatistics();
  }, []);
  // Verificación de permisos de administrador
  if (!userData?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600">Acceso Denegado</h2>
          <p className="mt-2 text-gray-600">No tienes permisos para ver esta página.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Componente de Paginación
  const Pagination = () => (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Vista móvil */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>

      {/* Vista desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
            </span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            de <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Selector de items por página */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
          </select>

          {/* Botones de paginación */}
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Primera</span>
              ««
            </button>
            {/* ... resto de la paginación ... */}
          </nav>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Encabezado y Controles */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bitácora de Actividades</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total de registros: {totalItems}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Botón de Exportar */}
              <button
                onClick={handleExport}
                disabled={exporting || loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportando...
                  </>
                ) : (
                  'Exportar CSV'
                )}
              </button>

              {/* Botón Volver */}
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Volver al Panel
              </button>

              {/* Filtros */}
              <div className="flex space-x-4">
                <select
                  className="border rounded-md px-3 py-2"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Todas las actividades</option>
                  {Object.entries(ActivityTypes).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                  <option value="date">Por fecha</option>
                </select>

                {filterType === 'date' && (
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, start: e.target.value }));
                        setCurrentPage(1);
                      }}
                      className="border rounded-md px-3 py-2"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange(prev => ({ ...prev, end: e.target.value }));
                        setCurrentPage(1);
                      }}
                      className="border rounded-md px-3 py-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-blue-800 font-semibold">Total Actividades</h3>
                <p className="text-2xl font-bold text-blue-600">{statistics.totalLogs}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-green-800 font-semibold">Usuarios Activos</h3>
                <p className="text-2xl font-bold text-green-600">{statistics.uniqueUsers}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-800 font-semibold">Accesos a Robots</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {statistics.byType?.[ActivityTypes.ROBOT_ACCESS] || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-red-800 font-semibold">Errores</h3>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.byType?.[ActivityTypes.ERROR] || 0}
                </p>
              </div>
            </div>
          )}
          {/* Manejo de Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => loadLogs()}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Tabla de Logs */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando registros...</p>
            </div>
          ) : logs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityColor(log.type)}`}>
                            {log.type.replace('_', ' ').toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {typeof log.details === 'string' 
                            ? log.details 
                            : JSON.stringify(log.details).slice(0, 50) + '...'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleLogClick(log)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination />
            </>
          ) : (
            <div className="text-center py-8 text-gray-600">
              No se encontraron registros para los filtros seleccionados.
            </div>
          )}

          {/* Modal de Detalles */}
          {selectedLog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900">
                      Detalles del Registro
                    </h3>
                    <button
                      onClick={handleCloseDetails}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Fecha y Hora</h4>
                      <p className="mt-1">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Usuario</h4>
                      <p className="mt-1">{selectedLog.userEmail}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tipo</h4>
                      <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityColor(selectedLog.type)}`}>
                        {selectedLog.type.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Detalles</h4>
                      <pre className="mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                        {typeof selectedLog.details === 'string' 
                          ? selectedLog.details 
                          : JSON.stringify(selectedLog.details, null, 2)
                        }
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;