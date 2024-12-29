import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminOnly from '../components/AdminOnly';
import { FaSpinner } from 'react-icons/fa';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [adminOnly, setAdminOnly] = useState(false);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API}/visits`, {
          credentials: 'include',
        });

        if (response.status === 403) {
          setAdminOnly(true);
          return;
        }

        const data = await response.json();
        setAnalyticsData(data.pageStats);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'An error occurred while fetching analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = (pageData) => {
    if (selectedView === 'daily') {
      return pageData.dailyVisits.map(([date, visits]) => ({ date, visits }));
    }
    if (selectedView === 'weekly') {
      return pageData.weeklyVisits.map(([week, visits]) => ({ date: `Week of ${week}`, visits }));
    }
    if (selectedView === 'monthly') {
      return pageData.monthlyVisits.map(([month, visits]) => ({ date: `Month: ${month}`, visits }));
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin inline-block align-middle" />
      </div>
    );
  }

  if (adminOnly) {
    return <AdminOnly />;
  }

  return (
    <div className="container mx-auto p-6">
      {error && <div className="text-center mt-4 text-red-500">{error}</div>}
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Analytics</h1>
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
          <div
            key={page.pageType}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="card-body">
              <h2 className="card-title text-secondary">{page.pageType.toUpperCase()}</h2>
              <p className="text-sm text-gray-500">Total Visits: {page.totalVisits}</p>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={getChartData(page)} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#4ADE80"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
