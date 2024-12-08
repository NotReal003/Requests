import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [pageStats, setPageStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://request.notreal003.xyz/api/collect/visits', {
          withCredentials: true,
        });
        const data = await response.json();
        if (data.success) {
          setPageStats(data.pageStats);
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
    return <div>Loading...</div>;
  }

  // Chart.js data and options
  const getChartData = (pageStats) => {
    return {
      labels: pageStats?.daily?.map(([date]) => date) || [],
      datasets: [
        {
          label: 'Daily Visits',
          data: pageStats?.daily?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
        {
          label: 'Weekly Visits',
          data: pageStats?.weekly?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1,
        },
        {
          label: 'Monthly Visits',
          data: pageStats?.monthly?.map(([, count]) => count) || [],
          fill: false,
          borderColor: 'rgb(255, 159, 64)',
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Page Visit Analytics</h1>
      <div className="mt-4">
        {Object.keys(pageStats).length === 0 ? (
          <p>No visit data available.</p>
        ) : (
          Object.entries(pageStats).map(([pageType, stats]) => (
            <div key={pageType} className="mb-8">
              <h2 className="text-lg font-semibold">{pageType}</h2>
              <Line data={getChartData(stats)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Analytics;
