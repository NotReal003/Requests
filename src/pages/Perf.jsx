import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaClock, FaArrowDown, FaCalendarAlt } from 'react-icons/fa';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState([]);

  const fetchMetrics = async () => {
    const res = await fetch('/api/performance');
    const data = await res.json();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-gray-800 text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <FaChartLine className="text-green-400" /> Performance Metrics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg border border-zinc-700 p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="px-2 py-1 bg-zinc-700 text-white text-xs rounded uppercase font-semibold">
                {metric.name}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FaClock /> {new Date(metric.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
              {metric.value.toFixed(2)} <FaArrowDown className="text-base text-zinc-400" />
            </div>

            {metric.delta !== undefined && (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                <FaCalendarAlt className="text-xs" /> Delta: {metric.delta.toFixed(2)}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
