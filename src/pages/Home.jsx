import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDiscord, FaUserSecret } from 'react-icons/fa';
import { MdSupportAgent } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { IoShieldCheckmark } from "react-icons/io5";
import axios from 'axios';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const API = process.env.REACT_APP_API;
  const ADMINW = process.env.REACT_APP_ADMIN;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get(`${API}/users/@me`, {
      withCredentials: true,
    })
      .then(response => {
        setIsStaff(!!response.data.staff); // Ensure boolean value
        setIsAdmin(!!response.data.admin);
      })
      .catch(error => {
        console.error('Failed to check admin status:', error);
      });
  }, [API, ADMINW]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen">
      <div className="bg rounded-lg p-8 w-full max-w-md md:max-w-lg mx-auto shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Requests</h1>

        <div className="space-y-6">
          <button onClick={() => handleNavigation('/one')} className="btn no-animation w-full bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-700 transition-all">
            <span className="flex"><IoShieldCheckmark className="mr-2" />Your Requests</span>
          </button>

          <h2 className="text-xl font-bold">New Request</h2>

          <button onClick={() => handleNavigation('/report')} className="btn no-animation w-full bg-yellow-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-yellow-600 transition-all">
            <span className="flex"><FaDiscord className="mr-2" />Discord Report</span>
          </button>

          <button onClick={() => handleNavigation('/apply')} className="btn no-animation w-full bg-purple-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-purple-700 transition-all">
            <span className="flex"><IoMdMail className="mr-2" />Application</span>
          </button>

          <button onClick={() => handleNavigation('/support')} className="btn no-animation w-full bg-teal-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-teal-700 transition-all">
            <span className="flex"><MdSupportAgent className="mr-2" />Support Request</span>
          </button>

          {(isStaff || isAdmin) && (
            <button onClick={() => handleNavigation('/admin')} className="btn no-animation w-full bg-red-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all">
              <span className="flex items-center">Requests Dashboard / Staff Area</span>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => handleNavigation('/admin/manage')} className="btn no-animation btn w-full bg-red-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all">
              <span className="flex items-center">Admin Manage Dash</span>
            </button>
          )}
          {isAdmin && (
          <button onClick={() => handleNavigation('/Analytics')} className="btn no-animation w-full bg-red-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all">
            <span className="flex items-center">Analytics</span>
          </button>
          )}
          {isAdmin && (
          <button onClick={() => handleNavigation('/admin/users')} className="btn no-animation w-full bg-red-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-red-600 transition-all">
            <span className="flex items-center">Admin | Users</span>
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
