import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API}/collect/visits`, { withCredentials: true }); // Important: Include credentials
        setAnalyticsData(response.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message); 
        } else {
          setError("An error occurred while fetching analytics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);


  if (loading) {
    return <div style={{ color: 'white' }}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;  // Display error message
  }

  if (!analyticsData || !analyticsData.success) {
    return <div style={{ color: 'white' }}>No analytics data available.</div>; // Or handle other no-data cases
  }


  const {
    totalVisits,
    uniqueVisitors,
    referrerStats,
    deviceStats,
    browserStats,
    dailyTrends,
    recentVisits,
    topVisitors,
  } = analyticsData;



  // Chart configurations (example - customize as needed)
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: 'white' },
      },
      title: {
        display: true,
        text: 'Device Stats',
        color: 'white'
      },
    },
    scales: {
      x: { ticks: { color: 'white' } },
      y: { ticks: { color: 'white' } },
    },
  };

  const barChartData = {
    labels: Object.keys(deviceStats),
    datasets: [
      {
        label: 'Device Visits',
        data: Object.values(deviceStats),
        backgroundColor: 'rgba(54, 162, 235, 0.8)', // Example color
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };


  // Line chart data and options for daily trends
  const lineChartData = {
    labels: Object.keys(dailyTrends),
    datasets: [
      {
        label: 'Daily Visits',
        data: Object.values(dailyTrends),
        borderColor: 'rgba(255, 99, 132, 1)', // Example color
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Example color
        tension: 0.4, // Smooths the line a bit
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: 'white' },
      },
      title: {
        display: true,
        text: 'Daily Visit Trends',
        color: 'white',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
      },
    },
  };



  // ... (similar configurations for other charts like Pie chart for browser stats)
  const pieChartData = {
    labels: Object.keys(browserStats),
    datasets: [
      {
        label: 'Browser Usage',
        data: Object.values(browserStats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
           // ... more colors as needed
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
           // ... more colors as needed
        ],
        borderWidth: 1,
      },
    ],
  };


  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: 'white' },
        position: 'right', // Or 'top', 'bottom', 'left'
      },
      title: {
        display: true,
        text: 'Browser Usage',
        color: 'white',
      },
    },
  };



  return (
    <div style={{ backgroundColor: 'black', color: 'white', padding: '20px' }}>
      <h2>Website Analytics</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div>
          <h3>Total Visits:</h3>
          <p>{totalVisits}</p>
        </div>
        <div>
          <h3>Unique Visitors:</h3>
          <p>{uniqueVisitors}</p>
        </div>
      </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}> {/* Responsive grid */}
        <div>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        <div>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        <div>  {/* Pie chart */}
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>



      <h3>Recent Visits</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Visit Time</th>
            <th>Referrer</th>
            <th>Device</th>
            <th>Browser</th>
          </tr>
        </thead>
        <tbody>
          {recentVisits.map((visit, index) => (
            <tr key={index}>
              <td>{visit.ipAddress}</td>
              <td>{new Date(visit.visitTime).toLocaleString()}</td> {/* Format date/time */}
              <td>{visit.referrer}</td>
              <td>{visit.device}</td>
              <td>{visit.browser}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ... other tables/charts for referrerStats, topVisitors, etc. */}
    </div>
  );
};


export default Analytics;