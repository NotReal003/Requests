import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer, OfflineWarning } from './components';
import routeConfig from './routes';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // status
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    // Check authentication
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref === "producthunt") {
      axios.get(`${API}/collect/request/producthunt`);
      console.log("ProductHunt referral");
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (authToken) {
        setIsAuthenticated(true);
      }
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

//    {!isOnline && (
//           <OfflineWarning className="bg-black-100" />
//          )}

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) {
    return <div className="loading loading-spinner text-info"></div>;
  }

  if (!isOnline) {
    toast.error('No Internet connection');
  }

//  if (isOnline) {
//    toast.success('Connected with the server');
//  }

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
       </div>
       <Footer />
       <Toaster />
     </div>
   </Router>
  );
};

export default App;
