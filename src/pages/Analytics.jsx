import React, { useEffect, useState } from "react";
import axios from "axios";

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API}/collect/visits`);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div>
          <span className="loading loading-dots loading-lg"></span>
          <p className="mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <header className="p-6 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-center">Analytics Dashboard</h1>
      </header>
      <main className="container mx-auto py-8 px-4 space-y-8">
        {analytics.length > 0 ? (
          analytics.map((data, index) => (
            <AnalyticsCard key={index} data={data} />
          ))
        ) : (
          <p className="text-center">No analytics data available.</p>
        )}
      </main>
    </div>
  );
};

const AnalyticsCard = ({ data }) => {
  const {
    pageType,
    visits,
    uniqueVisitors,
    lastVisit,
    dailyVisits,
    weeklyVisits,
    referrerStats,
  } = data;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 capitalize">{pageType} Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Total Visits" value={visits} />
        <InfoItem label="Unique Visitors" value={uniqueVisitors} />
        <InfoItem label="Last Visit" value={lastVisit || "N/A"} />
        <InfoItem label="Daily Visits" value={formatMap(dailyVisits)} />
        <InfoItem label="Weekly Visits" value={formatMap(weeklyVisits)} />
        <InfoItem label="Top Referrer" value={getTopReferrer(referrerStats)} />
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium">{label}</p>
    <p className="text-lg font-bold">{value || "N/A"}</p>
  </div>
);

const formatMap = (map) => {
  if (!map || map.size === 0) return "N/A";
  return Array.from(map.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

const getTopReferrer = (referrerStats) => {
  if (!referrerStats || referrerStats.size === 0) return "N/A";
  return Array.from(referrerStats.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];
};

export default Analytics;
