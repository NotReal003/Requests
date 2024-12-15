import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, Footer } from './components';
import { Home, ReportForm, Support, Apply, NotFound, Login, Success, One, Admin, RequestDetail, AdminDetail, Callback, Profile, Note, AdminManage, EmailSignup, EmailSignin, GithubCallback, About, Analytics } from './pages';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return <div className="loading loading-spinner text-info"></div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} />
        <div>
          <Routes>
            <Route exact path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/report" element={isAuthenticated ? <ReportForm /> : <Navigate to="/login" />} />
            <Route path="/support" element={isAuthenticated ? <Support /> : <Navigate to="/login" />} />
            <Route path="/apply" element={isAuthenticated ? <Apply /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/success" element={isAuthenticated ? <Success /> : <Navigate to="/login" />} />
            <Route path="/one" element={isAuthenticated ? <One /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/login" />} />
            <Route path="/requestdetail" element={isAuthenticated ? <RequestDetail /> : <Navigate to="/login" />} />
            <Route path="/admindetail" element={isAuthenticated ? <AdminDetail /> : <Navigate to="/login" />} />
            <Route path="*" element={isAuthenticated ? <NotFound /> : <Navigate to="/login" />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/admin/manage" element={isAuthenticated ? <AdminManage /> : <Navigate to="/login" />} />
            <Route path="/note" element={isAuthenticated ? <Note /> : <Navigate to="/login" />} />
            <Route path="/email-signup" element={isAuthenticated ? <Navigate to="/" /> : <EmailSignup />} />
            <Route path="/email-signin" element={isAuthenticated ? <Navigate to="/" /> : <EmailSignin />} />
            <Route path="/github/callback" element={isAuthenticated ? <Navigate to="/" /> : <GithubCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
