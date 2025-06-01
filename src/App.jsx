import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components';
import MaintenanceMode from './components/NoAPI';
import routeConfig from './routes';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    // Run API health check silently in background
    axios.get('https://api.notreal003.xyz/health')
      .then(res => {
        if (res.data?.message === 'Application not found') {
          setApiUnavailable(true);
        }
      })
      .catch(() => {
        setApiUnavailable(true); // Consider API unavailable on any failure
      });

    // Auth token check
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');

    if (ref === "producthunt") {
      axios.get(`${API}/collect/request/producthunt`);
      console.log("ProductHunt referral");
    }

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      setIsAuthenticated(true);
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show toast but never block UI
  useEffect(() => {
    if (!isOnline) {
      toast.error('No Internet connection');
    }
  }, [isOnline]);

  return (
    <Router>
      <div className="App relative">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="container mx-auto">
          <Routes>
            {routeConfig(isAuthenticated).map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
        <Footer />
        <Toaster />
        
        {apiUnavailable && (
          <div className="absolute inset-0 z-50">
            <MaintenanceMode />
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
