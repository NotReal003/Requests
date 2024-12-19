import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDiscord } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import { IoMdMail } from 'react-icons/io';
import { IoShieldCheckmark } from 'react-icons/io5';
import axios from 'axios';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const API = process.env.REACT_APP_API;
  const ADMINW = process.env.REACT_APP_ADMIN;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios
      .get(`${API}/users/@me`, {
        withCredentials: true,
      })
      .then((response) => {
        if (response.data.staff === true) {
          setIsStaff(true);
        }
        if (response.data.id === ADMINW || response.data.staff === true) {
          setIsAdmin(true);
          setIsStaff(true);
        }
      })
      .catch((error) => {
        console.error('Failed to check admin status:', error);
      });
  }, [API, ADMINW]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col justify-center p-6 min-h-screen bg-base-200">
      <div className="bg-base-100 rounded-lg p-8 w-full max-w-lg mx-auto shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">Requests</h1>

        <div className="space-y-6">
          <button
            className="btn btn-info btn-lg btn-block transition-all duration-200 hover:bg-info hover:border-info hover:text-white"
            onClick={() => handleNavigation('/one')}
          >
            <span className="flex items-center justify-center">
              <IoShieldCheckmark className="mr-2 text-lg" /> Your Requests
            </span>
          </button>

          <h2 className="text-2xl font-semibold text-secondary text-center">New Request</h2>

          <button
            className="btn btn-warning btn-lg btn-block transition-all duration-200 hover:bg-warning hover:border-warning hover:text-white"
            onClick={() => handleNavigation('/report')}
          >
            <span className="flex items-center justify-center">
              <FaDiscord className="mr-2 text-lg" /> Discord Report
            </span>
          </button>

          <button
            className="btn btn-secondary btn-lg btn-block transition-all duration-200 hover:bg-secondary hover:border-secondary hover:text-white"
            onClick={() => handleNavigation('/apply')}
          >
            <span className="flex items-center justify-center">
              <IoMdMail className="mr-2 text-lg" /> Guild Application
            </span>
          </button>

          <button
            className="btn btn-accent btn-lg btn-block transition-all duration-200 hover:bg-accent hover:border-accent hover:text-white"
            onClick={() => handleNavigation('/support')}
          >
            <span className="flex items-center justify-center">
              <MdSupportAgent className="mr-2 text-lg" /> Support Request
            </span>
          </button>

          {isStaff && (
            <button
              className="btn btn-error btn-lg btn-block transition-all duration-200 hover:bg-error hover:border-error hover:text-white"
              onClick={() => handleNavigation('/admin')}
            >
              <span className="flex items-center justify-center">
                Requests Dashboard / Staff Area
              </span>
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-error btn-lg btn-block transition-all duration-200 hover:bg-error hover:border-error hover:text-white"
              onClick={() => handleNavigation('/admin/manage')}
            >
              <span className="flex items-center justify-center">Admin Manage Dash</span>
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-error btn-lg btn-block transition-all duration-200 hover:bg-error hover:border-error hover:text-white"
              onClick={() => handleNavigation('/Analytics')}
            >
              <span className="flex items-center justify-center">Analytics</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
