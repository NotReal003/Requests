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
        const { data } = await axios.get(`${API}/collect/visits`, {
          withCredentials: true,
        });
        setAnalytics(data);
      } catch {
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading analytics..." />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-semibold text-center">Website Analytics</h1>
      </header>

      <div className="container mx-auto py-8 px-4">
        <StatsGrid analytics={analytics} />
        <TrendsSection trends={analytics.dailyTrends} />
        <StatsSection title="Device Usage" data={analytics.deviceStats} />
        <StatsSection title="Browser Usage" data={analytics.browserStats} />
        <StatsSection title="Referrer Stats" data={analytics.referrerStats} />
      </div>
    </div>
  );
};

const LoadingScreen = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-center">
      <span className="loading loading-dots loading-lg"></span>
      <p className="mt-2 text-lg">{message}</p>
    </div>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
    <p>{message}</p>
  </div>
);

const StatsGrid = ({ analytics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <StatCard title="Total Visits" value={analytics.totalVisits} />
    <StatCard title="Unique Visitors" value={analytics.uniqueVisitors} />
    <StatCard title="Top Referrer" value={getTopKey(analytics.referrerStats)} />
  </div>
);

const TrendsSection = ({ trends }) => (
  <Section title="Daily Trends">
    {trends && Object.keys(trends).length ? (
      <table className="table-auto w-full bg-gray-800 p-4 rounded-lg">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Visits</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(trends).map(([date, visits], index) => (
            <tr key={date} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
              <td className="px-4 py-2">{date}</td>
              <td className="px-4 py-2">{visits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No data available.</p>
    )}
  </Section>
);

const StatsSection = ({ title, data }) => (
  <Section title={title}>
    {data && Object.keys(data).length ? (
      <ul className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <li key={key} className="flex justify-between">
            <span>{key}</span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p>No data available.</p>
    )}
  </Section>
);

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value || "N/A"}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const getTopKey = (data) => {
  if (!data || Object.keys(data).length === 0) return "N/A";
  return Object.entries(data).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
};

export default Analytics;
