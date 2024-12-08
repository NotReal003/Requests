import React, { useEffect, useState } from "react";
import axios from "axios";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API}/collect/visits`, {
          withCredentials: true,
        });
        setAnalytics(response.data);
      } catch (err) {
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <span className="loading loading-dots loading-lg"></span>
          <p className="mt-2 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-semibold text-center">Website Analytics</h1>
      </header>

      <div className="container mx-auto py-8 px-4">
        {/* Total Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Visits" value={analytics.totalVisits} />
          <StatCard title="Unique Visitors" value={analytics.uniqueVisitors} />
          <StatCard title="Top Referrer" value={getTopKey(analytics.referrerStats)} />
        </div>

        {/* Trends Section */}
        <Section title="Daily Trends">
          <TrendsChart trends={analytics.dailyTrends} />
        </Section>

        {/* Device and Browser Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Section title="Device Usage">
            <PieChart data={analytics.deviceStats} />
          </Section>
          <Section title="Browser Usage">
            <PieChart data={analytics.browserStats} />
          </Section>
        </div>

        {/* Referrer Stats */}
        <Section title="Referrer Stats" className="mt-8">
          <StatList data={analytics.referrerStats} />
        </Section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value || "N/A"}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section>
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">{children}</div>
  </section>
);

const TrendsChart = ({ trends }) => {
  const dates = Object.keys(trends || {});
  const values = Object.values(trends || {});

  if (dates.length === 0) return <p>No data available.</p>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Visits</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date, idx) => (
              <tr key={date} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                <td className="px-4 py-2">{date}</td>
                <td className="px-4 py-2">{values[idx]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PieChart = ({ data }) => {
  const total = Object.values(data || {}).reduce((sum, value) => sum + value, 0);

  if (!total) return <p>No data available.</p>;

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span>{key}</span>
          <span>{((value / total) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
};

const StatList = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <ul className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <li key={key} className="flex justify-between">
          <span>{key}</span>
          <span>{value}</span>
        </li>
      ))}
    </ul>
  );
};

const getTopKey = (data) => {
  if (!data || Object.keys(data).length === 0) return "N/A";

  const [topKey] = Object.entries(data).reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev));
  return topKey;
};

export default Analytics;
