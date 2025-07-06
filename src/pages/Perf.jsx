// pages/PerformanceDashboard.jsx
import React, { useEffect, useState } from 'react';
import { FaChartLine, FaClock, FaArrowDown, FaCalendarAlt, FaUser, FaDesktop } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const formatPerformanceEmoji = (value, name) => {
  const thresholds = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [200, 500],
    INP: [200, 500],
  };
  const [good, okay] = thresholds[name] || [1000, 3000];
  if (value <= good) return '✅';
  if (value <= okay) return '⚠️';
  return '❌';
};

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/performance', { withCredentials: true });
      setMetrics(res.data);
    } catch (error) {
      setError('Failed to load metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-gray-800 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-center text-green-400 flex justify-center items-center gap-4">
          <FaChartLine className="text-4xl" /> Monitoring Dashboard
        </h1>

        {loading && <p className="text-center text-gray-400">Loading metrics...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 shadow-2xl hover:scale-[1.01] transition-transform"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm bg-zinc-700 px-3 py-1 rounded-md font-bold uppercase">
                  {metric.name}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaClock /> {new Date(metric.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="text-3xl font-bold text-green-400 mb-2 flex items-center gap-2">
                {formatPerformanceEmoji(metric.value, metric.name)} {metric.value.toFixed(2)} ms
              </div>

              {metric.delta !== undefined && (
                <p className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                  <FaArrowDown /> Delta: {metric.delta.toFixed(2)}
                </p>
              )}

              <div className="text-sm text-zinc-300 flex items-center gap-2">
                <FaUser className="text-zinc-500" /> {metric.userAgent?.slice(0, 50) || 'Unknown'}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <FaDesktop className="text-zinc-500" /> {metric.connection || 'N/A'}
              </div>
              <div className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
                <FaCalendarAlt />
                {new Date(metric.timestamp).toLocaleDateString()} • {formatDistanceToNow(new Date(metric.timestamp), { addSuffix: true })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
