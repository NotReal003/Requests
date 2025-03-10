import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleCheck, House } from 'lucide-react';
import { FaDiscord, FaSpinner } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";


const Success = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestId = urlParams.get('request');
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API}/requests/${requestId}`, {
          withCredentials: true,
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          setError(errorResponse.message || 'Failed to load request.');
          throw new Error(errorResponse.message || 'Failed to load the request.');
        }

        const requestData = await res.json();
        setRequest(requestData);

        const userRes = await fetch(`${API}/users/@me`, {
          withCredentials: true,
        });

        if (!userRes.ok) {
          const errorResponse = await userRes.json();
          setError(errorResponse.message || 'Failed to load user details.');
          throw new Error(errorResponse.message || 'Failed to load user details.');
        }

        const userData = await userRes.json();
        setMyUser(userData);

      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'An error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, API]);

  const handleNavigation = (path) => {
    navigate(path);
  };
  const handleWindowLocation = (path) => {
    window.location.href = path;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-50">
        <div className="text-center">
          <FaSpinner className="animate-spin inline-block align-middle" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-50">
        <div className="text-center">
          <strong className="text-lg text-red-500">{error}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex flex-col items-center justify-center max-w-md md:max-w-lg mx-auto shadow-lg bg-base-50 min-h-screen">
      <div className="text-center p-2">
        <div className="flex items-center justify-center mb-4">
          <IoShieldCheckmark className="w-20 h-20 text-green-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Success</h1>
        <p>Thanks for submitting {request.typeName} <strong>{request.username}</strong>. We will notify you on your email <strong>{myUser.email}</strong>. Join our Discord Server so we may contact you :)</p>
        <p className="text-xs">Your request ID: {request._id}</p>
        <button onClick={() => handleNavigation('/one')} className="btn no-animation mt-4 w-full bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-700 transition-all">
          <CircleCheck className='size-4' /> Your Requests
        </button>
        <button
          onClick={() => handleWindowLocation('https://discord.gg/sqVBrMVQmp')}
          className="btn mt-4 no-animation w-full bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-blue-700 transition-all">
          <FaDiscord /> Join our Discord Server
        </button>
        <button onClick={() => handleNavigation('/')} className="btn no-animation mt-4 w-full bg-yellow-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center hover:bg-yellow-600 transition-all">
          <House className='size-4' /> Back to Home Page
        </button>
      </div>
    </div>
  );
}

export default Success;
