import React, { useEffect, useState } from "react";
import axios from "axios";

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://api.notreal003.xyz/analytics", {
                  withCredentials: true,
                });
                const data = response.data;

                // Process maps and non-serializable objects
                const transformMap = (map) => (map ? Object.fromEntries(map) : {});
                const transformedData = {
                    ...data,
                    referrerStats: transformMap(data.referrerStats),
                    deviceStats: transformMap(data.deviceStats),
                    browserStats: transformMap(data.browserStats),
                    dailyTrends: transformMap(data.dailyTrends),
                };

                setAnalyticsData(transformedData);
                setError(null);
            } catch (err) {
                console.error("Error fetching analytics data:", err);
                setError("Failed to load analytics data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Loading analytics...</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    if (!analyticsData) {
        return <div className="alert alert-warning">No analytics data available.</div>;
    }

    const { totalVisits, uniqueVisitors, referrerStats, deviceStats, browserStats, dailyTrends, recentVisits, topVisitors } = analyticsData;

    return (
        <div className="analytics-container p-6">
            <h1 className="text-2xl font-bold mb-4">Analytics Overview</h1>

            <div className="stats stats-vertical lg:stats-horizontal shadow mb-6">
                <div className="stat">
                    <div className="stat-title">Total Visits</div>
                    <div className="stat-value">{totalVisits || 0}</div>
                </div>
                <div className="stat">
                    <div className="stat-title">Unique Visitors</div>
                    <div className="stat-value">{uniqueVisitors || 0}</div>
                </div>
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Referrer Statistics</h2>
                {Object.keys(referrerStats).length ? (
                    <ul className="list-disc pl-5">
                        {Object.entries(referrerStats).map(([referrer, count]) => (
                            <li key={referrer}>{referrer}: {count}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No referrer stats available.</p>
                )}
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Device Statistics</h2>
                {Object.keys(deviceStats).length ? (
                    <ul className="list-disc pl-5">
                        {Object.entries(deviceStats).map(([device, count]) => (
                            <li key={device}>{device}: {count}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No device stats available.</p>
                )}
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Browser Statistics</h2>
                {Object.keys(browserStats).length ? (
                    <ul className="list-disc pl-5">
                        {Object.entries(browserStats).map(([browser, count]) => (
                            <li key={browser}>{browser}: {count}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No browser stats available.</p>
                )}
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Daily Trends</h2>
                {Object.keys(dailyTrends).length ? (
                    <ul className="list-disc pl-5">
                        {Object.entries(dailyTrends).map(([date, count]) => (
                            <li key={date}>{date}: {count}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No daily trends data available.</p>
                )}
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Recent Visits</h2>
                {recentVisits.length ? (
                    <ul className="list-disc pl-5">
                        {recentVisits.map((visit, index) => (
                            <li key={index}>Referrer: {visit.referrer || "Unknown"}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No recent visits data available.</p>
                )}
            </div>

            <div className="stats-section">
                <h2 className="text-xl font-semibold mb-2">Top Visitors</h2>
                {topVisitors.length ? (
                    <ul className="list-disc pl-5">
                        {topVisitors.map((visitor, index) => (
                            <li key={index}>
                                IP Address: {visitor.ipAddress || "Unknown"}, Visits: {visitor.visitCount || 0}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No top visitors data available.</p>
                )}
            </div>
        </div>
    );
};

export default Analytics;