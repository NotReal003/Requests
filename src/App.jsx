import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer, OfflineWarning } from './components';
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return <div className="loading loading-spinner text-info"></div>;
  }

  return (
    <Router>
     <div className="App">
       <Navbar isAuthenticated={isAuthenticated} />
          <div className="container mx-auto">
           <Routes>
           {routeConfig(isAuthenticated).map((route, index) => (
             <Route key={index} path={route.path} element={route.element} />
           ))}
        </Routes>
          {!isOnline && (
           <OfflineWarning className="bg-black-100" />
          )}
       </div>
       <Footer />
     </div>
   </Router>
  );
};

export default App;
