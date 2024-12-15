import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer } from './components';
import routeConfig from './routes';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // status

  useEffect(() => {
    // Check authentication
    const urlParams = new URLSearchParams(window.location.search);
    const callback = urlParams.get('callback');
    if (callback) {
      localStorage.setItem('jwtToken', callback);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, "/");
    } else {
      const storedToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (storedToken) {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);

    // Connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return <div className="loading loading-spinner text-info"></div>;
  }

  return (
    <Router>
      <div className="App">
        {!isOnline && (
          <div className="bg-red-600 text-white text-center py-2">
            You are offline. Please check your internet connection.
          </div>
        )}
        <Navbar isAuthenticated={isAuthenticated} />
        <div>
          <Routes>
            {routeConfig(isAuthenticated).map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
