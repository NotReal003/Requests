import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord } from 'react-icons/fa';
import { MdSupportAgent } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { IoShieldCheckmark } from "react-icons/io5";
import axios from 'axios';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const API = process.env.REACT_APP_API;
  const ADMINW = process.env.REACT_APP_ADMIN;

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    axios.get(`${API}/users/@me`, {
      headers: { Authorization: `${token}` }
    })
      .then(response => {
        if (response.data.staff === true) { //
          setIsStaff(true);
        }
        if (response.data.id === ADMINW || response.data.staff === true) {
          setIsAdmin(true);
          setIsStaff(true);
        }
      })
      .catch(error => {
        console.error('Failed to check admin status:', error);
      });
  }, [API, ADMINW]);

  return (
    <div className="flex flex-col justify-center p-4 min-h-screen">
      <div className="bg rounded-lg p-8 w-full max-w-md md:max-w-lg mx-auto shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Requests</h1>

        <div className="space-y-6">
          <Link to="/one" className="btn btn-info btn-outline transition-all duration-200 hover:bg-info hover:border-info hover:text-white no-animation w-full">
            <span className="flex"><IoShieldCheckmark className="mr-2" />Your Requests</span>
          </Link>

          <h2 className="text-xl font-bold">New Request</h2>

          <Link to="/report" className="btn btn-warning btn-outline transition-all duration-200 hover:bg-warning hover:border-warning hover:text-white no-animation w-full">
            <span className="flex"><FaDiscord className="mr-2" />Discord Report</span>
          </Link>

          <Link to="/apply" className="btn btn-secondary btn-outline transition-all duration-200 hover:bg-secondary hover:border-secondary hover:text-white no-animation w-full">
            <span className="flex"><IoMdMail className="mr-2" />Guild Application</span>
          </Link>

          <Link to="/support" className="btn btn-accent btn-outline transition-all duration-200 hover:bg-accent hover:border-accent hover:text-white no-animation w-full">
            <span className="flex"><MdSupportAgent className="mr-2" />Support Request</span>
          </Link>

          {isStaff && (
            <Link to="/admin" className="btn btn-error btn-outline transition-all duration-200 hover:bg-error hover:border-error hover:text-white no-animation w-full">
              <span className="flex items-center">Requests Dashboard / Staff Area</span>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/manage" className="btn btn-error btn-outline transition-all duration-200 hover:bg-error hover:border-error hover:text-white no-animation w-full">
              <span className="flex items-center">Admin Manage Dash</span>
            </Link>
          )}
          {isAdmin && (
          <Link to="/Analytics" className="btn btn-error btn-outline transition-all duration-200 hover:bg-error hover:border-error hover:text-white no-animation w-full">
            <span className="flex items-center">Analytics</span>
          </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
