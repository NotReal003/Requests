import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://api.notreal003.xyz/collect/visits");
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  const { totalVisits, uniqueVisitors, referrerStats, deviceStats, browserStats, dailyTrends } = data;

  const referrerChart = {
    labels: Object.keys(referrerStats),
    datasets: [
      {
        label: "Referrers",
        data: Object.values(referrerStats),
        backgroundColor: ["#6366F1", "#22D3EE", "#F97316", "#E11D48"],
      },
    ],
  };

  const deviceChart = {
    labels: Object.keys(deviceStats),
    datasets: [
      {
        label: "Devices",
        data: Object.values(deviceStats),
        backgroundColor: ["#14B8A6", "#8B5CF6", "#FACC15"],
      },
    ],
  };

  const dailyChart = {
    labels: Object.keys(dailyTrends),
    datasets: [
      {
        label: "Daily Visits",
        data: Object.values(dailyTrends),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-black min-h-screen text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Total Visits</h2>
          <p className="text-2xl font-bold">{totalVisits}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold">Unique Visitors</h2>
          <p className="text-2xl font-bold">{uniqueVisitors}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Referrer Stats</h2>
          <Pie data={referrerChart} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Device Stats</h2>
          <Bar data={deviceChart} />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">Daily Trends</h2>
        <Line data={dailyChart} />
      </div>
    </div>
  );
};

export default Analytics;
