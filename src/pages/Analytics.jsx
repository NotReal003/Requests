import React, { useState, useEffect } from "react";
import axios from "axios";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/analytics", {
          withCredentials: true,
        });
        });
        setAnalyticsData(response.data);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to display statistics
  const StatCard = ({ title, stats }) => (
    <div className="stat shadow-md p-4 rounded-lg bg-base-200">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      {stats && Object.keys(stats).length > 0 ? (
        <ul>
          {Object.entries(stats).map(([key, value]) => (
            <li key={key} className="text-sm">
              {key}: {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Data Not Available</p>
      )}
    </div>
  );

  // Render the component
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      {loading ? (
        <div className="text-center">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      ) : (
        analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="General Stats"
              stats={{
                "Total Visits": analyticsData.totalVisits,
                "Unique Visitors": analyticsData.uniqueVisitors,
              }}
            />
            <StatCard title="Referrer Stats" stats={analyticsData.referrerStats} />
            <StatCard title="Device Stats" stats={analyticsData.deviceStats} />
            <StatCard title="Browser Stats" stats={analyticsData.browserStats} />
            <StatCard title="Daily Trends" stats={analyticsData.dailyTrends} />
          </div>
        )
      )}

      {/* Recent Visits Section */}
      {analyticsData?.recentVisits && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Recent Visits</h2>
          <ul className="list-disc list-inside">
            {analyticsData.recentVisits.map((visit, index) => (
              <li key={index} className="text-sm">
                Referrer: {visit.referrer || "Direct"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Visitors Section */}
      {analyticsData?.topVisitors && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Top Visitors</h2>
          <ul className="list-disc list-inside">
            {analyticsData.topVisitors.map((visitor, index) => (
              <li key={index} className="text-sm">
                IP Address: {visitor.ipAddress || "N/A"} - Visits:{" "}
                {visitor.visitCount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analytics;
