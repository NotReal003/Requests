import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/collect/visits`, {
          withCredentials: true,
        });
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading loading-dots loading-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  const { totalVisits, uniqueVisitors, referrerStats, deviceStats, browserStats, dailyTrends } = stats;

  const pieData = {
    labels: Object.keys(deviceStats),
    datasets: [
      {
        data: Object.values(deviceStats),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const barData = {
    labels: Object.keys(browserStats),
    datasets: [
      {
        label: 'Browser Usage',
        data: Object.values(browserStats),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const lineData = {
    labels: Object.keys(dailyTrends),
    datasets: [
      {
        label: 'Daily Visits',
        data: Object.values(dailyTrends),
        borderColor: '#FF6384',
        fill: false,
      },
    ],
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 shadow-lg p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Total Visits</h2>
            <p className="text-4xl font-bold">{totalVisits}</p>
          </div>
          <div className="bg-gray-900 shadow-lg p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Unique Visitors</h2>
            <p className="text-4xl font-bold">{uniqueVisitors}</p>
          </div>
          <div className="bg-gray-900 shadow-lg p-4 rounded-lg">
            <h2 className="text-xl font-semibold">Referrer Stats</h2>
            <ul>
              {Object.entries(referrerStats).map(([referrer, count]) => (
                <li key={referrer}>
                  {referrer}: {count}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-900 shadow-lg p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Device Stats</h2>
            <Pie data={pieData} />
          </div>
          <div className="bg-gray-900 shadow-lg p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Browser Stats</h2>
            <Bar data={barData} />
          </div>
        </div>
        <div className="bg-gray-900 shadow-lg p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-4">Daily Trends</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
