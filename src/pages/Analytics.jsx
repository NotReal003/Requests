import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [pageStats, setPageStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://request.notreal003.xyz/api/visits', {
          withCredentials = true,
        });
        const data = await response.json();

        if (data.success) {
          // Clean the data to exclude $-prefixed fields
          const cleanedStats = Object.entries(data.pageStats).reduce((acc, [key, value]) => {
            if (!key.startsWith('$')) {
              acc[key] = value;
            }
            return acc;
          }, {});
          setPageStats(cleanedStats);
        }
      } catch (error) {
        console.error('Error fetching visit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!Object.keys(pageStats).length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-700">No visit data available.</div>
      </div>
    );
  }

  const getChartData = (stats) => {
    return {
      labels: stats?.daily?.map(([date]) => date) || [],
      datasets: [
        {
          label: 'Daily Visits',
          data: stats?.daily?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Weekly Visits',
          data: stats?.weekly?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Monthly Visits',
          data: stats?.monthly?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Page Visit Analytics</h1>
      <div className="space-y-8">
        {Object.entries(pageStats).map(([pageType, stats]) => (
          <div key={pageType} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{pageType}</h2>
            <Line data={getChartData(stats)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
