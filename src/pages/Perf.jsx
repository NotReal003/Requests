import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { FaChartLine, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { format } from 'date-fns';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState([]);

  const fetchMetrics = async () => {
    try {
      const res = await axios.get('/api/performance', { withCredentials: true });
      setMetrics(res.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  // Group data for charts
  const chartData = useMemo(() => {
    const grouped = {};
    metrics.forEach((metric) => {
      const timestamp = format(new Date(metric.timestamp), 'HH:mm:ss');
      if (!grouped[timestamp]) grouped[timestamp] = { time: timestamp };
      grouped[timestamp][metric.name] = metric.value;
    });
    return Object.values(grouped).slice(-30); // last 30 points
  }, [metrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 flex items-center justify-center gap-3 text-green-400">
        <FaChartLine /> Realtime Performance Trends
      </h1>

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700 shadow-xl max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-white">Metrics Over Time</h2>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555' }} />
            <Legend />
            {['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'].map((metric, i) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={['#00ffcc', '#ff6699', '#66ccff', '#ffcc00', '#ff6666', '#66ff66'][i]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
