import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleCheck, House } from 'lucide-react';
import { FaDiscord, FaSpinner } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";


const Success = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestId = urlParams.get('request');
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API}/requests/${requestId}`, {
          headers: {
            'Authorization': `${token}`
          }
        });

        if (!res.ok) {
          const errorResponse = await res.json();
          setError(errorResponse.message || 'Failed to load request.');
          throw new Error(errorResponse.message || 'Failed to load the request.');
        }

        const requestData = await res.json();
        setRequest(requestData);

        const userToken = localStorage.getItem('jwtToken');
        const userRes = await fetch(`${API}/users/@me`, {
          headers: {
            'Authorization': `${userToken}`
          }
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
    <div className="flex flex flex-col items-center justify-center p-4 max-w-md md:max-w-lg mx-auto shadow-lg bg-base-50 min-h-screen">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <IoShieldCheckmark className="w-20 h-20 text-green-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Success</h1>
        <p>Thanks for submitting {request.typeName} <strong>{request.username}</strong>. We will notify you on your email <strong>{myUser.email}</strong>. Join our Discord Server so we may contact you :)</p>
        <p className="text-xs">Your request ID: {request._id}</p>
        <Link to="/one" className="btn btn-outline btn-info mt-4 w-full">
          <CircleCheck className='size-4' /> Your Requests
        </Link>
        <a rel="noreferrer" target="_blank" href="https://discord.gg/sqVBrMVQmp" className="btn btn-outline btn-primary w-full mt-5">
          <FaDiscord /> Join our Discord Server
        </a>
        <Link to="/" className="btn btn-outline btn-warning mt-4 w-full">
          <House className='size-4' /> Back to Home Page
        </Link>
      </div>
    </div>
  );
}

export default Success;
