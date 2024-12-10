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
import AdminOnly from '../components/AdminOnly';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('daily'); // daily, weekly, monthly
  const [adminOnly, setAdminOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://request.notreal003.xyz/api/visits', {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
          setAnalyticsData(data.pageStats);
        } else if (data.status === 403) {
          setAdminOnly(true);
        }
      } catch (err) {
        if (error.response?.status === 403) {
          setAdminOnly(true);
          setError('This page is only available to you, please wait 30 hours...');
        } else {
        console.error('Error fetching analytics data:', err);
        setError('An error occurred while fetching analytics data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (pageData) => {
    const labels =
      selectedView === 'daily'
        ? pageData.dailyVisits.map((visit) => visit[0])
        : selectedView === 'weekly'
        ? ['This Week']
        : ['This Month'];
    const data =
      selectedView === 'daily'
        ? pageData.dailyVisits.map((visit) => visit[1])
        : selectedView === 'weekly'
        ? [pageData.weeklyVisits]
        : [pageData.monthlyVisits];

    return {
      labels,
      datasets: [
        {
          label: `${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Visits`,
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner text-primary"></div>
      </div>
    );
  }

  if (adminOnly) {
    return <AdminOnly />;
  }

  return (
    <div className="container mx-auto p-6">
      {error && (
        <div className="text-center mt-4 text-red-500">
          {error}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Analytics Dashboard</h1>
      <div className="tabs mb-6 justify-center">
        <button
          className={`tab tab-bordered ${selectedView === 'daily' && 'tab-active'}`}
          onClick={() => setSelectedView('daily')}
        >
          Daily
        </button>
        <button
          className={`tab tab-bordered ${selectedView === 'weekly' && 'tab-active'}`}
          onClick={() => setSelectedView('weekly')}
        >
          Weekly
        </button>
        <button
          className={`tab tab-bordered ${selectedView === 'monthly' && 'tab-active'}`}
          onClick={() => setSelectedView('monthly')}
        >
          Monthly
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsData.map((page) => (
          <div key={page.pageType} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="card-body">
              <h2 className="card-title text-secondary">{page.pageType.toUpperCase()}</h2>
              <p className="text-sm text-gray-500">Total Visits: {page.totalVisits}</p>
              <Line
                data={getChartData(page)}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.raw} visits`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      grid: {
                        color: '#e5e7eb',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
