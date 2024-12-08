import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://request.notreal003.xyz/api/visits', {
          credetials: 'include',
        });
        const data = await response.json();

        if (data.success) {
          setAnalyticsData(data.counts);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (analyticsData.length === 0) {
    return <div className="text-center mt-4">No analytics data available.</div>;
  }

  const getChartData = (pageData) => ({
    labels: Array.from(pageData.dailyVisits.keys()),
    datasets: [
      {
        label: 'Daily Visits',
        data: Array.from(pageData.dailyVisits.values()),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      {analyticsData.map((page) => (
        <div key={page.pageType} className="mb-8">
          <h2 className="text-lg font-semibold">{page.pageType}</h2>
          <Line data={getChartData(page)} />
        </div>
      ))}
    </div>
  );
};

export default Analytics;
