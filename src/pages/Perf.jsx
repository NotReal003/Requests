import React, { useState, useMemo } from 'react';
import { FaChartLine, FaClock } from 'react-icons/fa';
import usePerformanceMetrics from './components/usePerformanceMetrics'; // Custom hook for fetching
import PerformanceChart from './components/PerformanceChart';
import MetricsControl from './components/MetricsControl';

// Define a professional color palette mapped to each metric
const METRIC_CONFIG = {
  LCP: { color: '#4ade80' }, // green-400
  FID: { color: '#f87171' }, // red-400
  CLS: { color: '#60a5fa' }, // blue-400
  FCP: { color: '#facc15' }, // yellow-400
  TTFB: { color: '#fb923c' }, // orange-400
  INP: { color: '#a78bfa' }, // violet-400
};

const ALL_METRICS = Object.keys(METRIC_CONFIG);

const DashboardHeader = ({ lastUpdated }) => (
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3 text-green-400">
      <FaChartLine /> Realtime Performance Trends
    </h1>
    <p className="text-sm text-zinc-400 flex items-center justify-center gap-2">
      <FaClock className="animate-pulse text-green-400" />
      <span>Last updated: {lastUpdated}</span>
    </p>
  </div>
);

const PerformanceDashboard = () => {
  const { metrics, lastUpdated } = usePerformanceMetrics(); // Using custom hook
  const [visibleMetrics, setVisibleMetrics] = useState(ALL_METRICS);

  const chartData = useMemo(() => {
    const groupedData = metrics.reduce((acc, metric) => {
      const timestamp = new Date(metric.timestamp).toLocaleTimeString();
      if (!acc[timestamp]) {
        acc[timestamp] = { time: timestamp };
      }
      acc[timestamp][metric.name] = metric.value;
      return acc;
    }, {});
    return Object.values(groupedData).slice(-30); // Keep last 30 data points
  }, [metrics]);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader lastUpdated={lastUpdated} />

        <div className="bg-zinc-800/50 rounded-lg p-4 sm:p-6 border border-zinc-700 shadow-2xl backdrop-blur-sm">
          <MetricsControl
            allMetrics={ALL_METRICS}
            visibleMetrics={visibleMetrics}
            setVisibleMetrics={setVisibleMetrics}
            metricConfig={METRIC_CONFIG}
          />
          <div className="mt-6">
            <PerformanceChart
              data={chartData}
              visibleMetrics={visibleMetrics}
              metricConfig={METRIC_CONFIG}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
