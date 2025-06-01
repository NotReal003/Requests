import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer, OfflineWarning } from './components';
import NoAPI from './components/NoAPI';
import routeConfig from './routes';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // status
  const API = process.env.REACT_APP_API;

useEffect(() => {
  // API health check (non-blocking)
  axios.get('https://api.notreal003.xyz/health')
    .then(res => {
      if (res.data?.message === "Application not found") {
        setApiUnavailable(true);
      }
    })
    .catch(() => {
      setApiUnavailable(true);
    });

  // Authentication check
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');

  if (ref === "producthunt") {
    axios.get(`${API}/collect/request/producthunt`);
    console.log("ProductHunt referral");
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    if (authToken) setIsAuthenticated(true);
  } else {
    const storedToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    if (storedToken) setIsAuthenticated(true);
  }

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
       {apiUnavailable && (
        <div className="absolute inset-0 z-50">
          <NoAPI />
        </div>
      )}
     </div>
   </Router>
  );
};

export default App;
