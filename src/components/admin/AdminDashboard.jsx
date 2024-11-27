import React, { useState, useEffect } from 'react';
import { getLogsStatistics } from '../../service/logService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(7); // 7 días por defecto

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLogsStatistics(selectedTimeRange);
        
        if (!mounted) return;

        if (!data) {
          throw new Error('No se pudieron cargar las estadísticas');
        }

        setStats(data);
      } catch (err) {
        if (mounted) {
          console.error('Error loading statistics:', err);
          setError('Error al cargar las estadísticas: ' + err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };


    loadStats();
  }, [selectedTimeRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <h3 className="font-bold mb-2">Error al cargar los datos</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Preparar datos para gráficas
  const activityByTypeData = Object.entries(stats.byType || {}).map(([type, count]) => ({
    name: type.replace('_', ' ').toLowerCase(),
    value: count
  }));

  const timeDistributionData = Object.entries(stats.timeDistribution || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString(),
    count
  }));

  const severityData = Object.entries(stats.bySeverity || {}).map(([severity, count]) => ({
    name: severity,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Analytics</h1>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
          className="border rounded p-2"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={15}>Últimos 15 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
      </div>

      {/* Resumen de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Total de Logs</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalLogs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Usuarios Únicos</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.uniqueUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">Tipos de Actividad</h3>
          <p className="text-3xl font-bold text-gray-800">{Object.keys(stats.byType || {}).length}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad por Tiempo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Actividad por Tiempo</h3>
          <div className="h-64">
            <LineChart
              width={500}
              height={250}
              data={timeDistributionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>

        {/* Distribución por Tipo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
          <div className="h-64">
            <PieChart width={500} height={250}>
              <Pie
                data={activityByTypeData}
                cx={200}
                cy={120}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {activityByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* Severidad de Eventos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Severidad de Eventos</h3>
          <div className="h-64">
            <BarChart
              width={500}
              height={250}
              data={severityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;