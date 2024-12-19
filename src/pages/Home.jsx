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
    <div className="flex flex-col justify-center items-center p-6 min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Requests</h1>

        <div className="space-y-4">
          <button
            className="w-full py-4 px-6 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-700 transition-all"
            onClick={() => handleNavigation('/one')}
          >
            <IoShieldCheckmark className="mr-3 text-xl" />
            Your Requests
          </button>

          <h2 className="text-xl font-semibold text-gray-700 text-center mt-4">New Request</h2>

          <button
            className="w-full py-4 px-6 bg-yellow-500 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-yellow-600 transition-all"
            onClick={() => handleNavigation('/report')}
          >
            <FaDiscord className="mr-3 text-xl" />
            Discord Report
          </button>

          <button
            className="w-full py-4 px-6 bg-purple-600 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-purple-700 transition-all"
            onClick={() => handleNavigation('/apply')}
          >
            <IoMdMail className="mr-3 text-xl" />
            Guild Application
          </button>

          <button
            className="w-full py-4 px-6 bg-teal-600 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-teal-700 transition-all"
            onClick={() => handleNavigation('/support')}
          >
            <MdSupportAgent className="mr-3 text-xl" />
            Support Request
          </button>

          {isStaff && (
            <button
              className="w-full py-4 px-6 bg-red-500 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all"
              onClick={() => handleNavigation('/admin')}
            >
              Requests Dashboard / Staff Area
            </button>
          )}

          {isAdmin && (
            <>
              <button
                className="w-full py-4 px-6 bg-red-500 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all"
                onClick={() => handleNavigation('/admin/manage')}
              >
                Admin Manage Dash
              </button>
              <button
                className="w-full py-4 px-6 bg-red-500 text-white text-lg font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all"
                onClick={() => handleNavigation('/Analytics')}
              >
                Analytics
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
