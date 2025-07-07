import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { House, CircleCheck } from 'lucide-react';
import { FaDiscord, FaSpinner, FaExclamationTriangle } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";

// --- Component: LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <FaSpinner className="animate-spin text-5xl mb-4" />
        <p>Finalizing Your Request...</p>
    </div>
);

// --- Component: ErrorDisplay ---
const ErrorDisplay = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
      <div className="bg-gradient-to-br from-[#1E1E1E] to-[#111] p-10 rounded-2xl shadow-2xl border border-red-500/30">
          <FaExclamationTriangle className="text-7xl text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-3">An Error Occurred</h1>
          <p className="text-gray-400 max-w-sm">{message || "Something went wrong. Please try again later."}</p>
      </div>
    </div>
);


const Success = () => {
  const location = useLocation();
  const requestId = new URLSearchParams(location.search).get('request');
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [myUser, setMyUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API || 'https://api.notreal003.org';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!requestId) {
          setError("No request ID provided.");
          setLoading(false);
          return;
      }
      try {
        // Use Promise.all to fetch request and user details concurrently
        const [requestRes, userRes] = await Promise.all([
          axios.get(`${API}/requests/${requestId}`, { withCredentials: true }),
          axios.get(`${API}/users/@me`, { withCredentials: true })
        ]);

        setRequest(requestRes.data);
        setMyUser(userRes.data);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load confirmation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [requestId, API]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!request || !myUser) return <ErrorDisplay message="Could not retrieve all necessary details." />;

  return (
    <div className="min-h-screen w-full bg-black text-gray-200 font-sans flex items-center justify-center p-4">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#1a0c2e] opacity-50 z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg text-center bg-[#1a1a1a]/50 p-8 sm:p-12 rounded-2xl border border-gray-800/50 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
                <IoShieldCheckmark className="w-24 h-24 text-green-400 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Success!</h1>
            <p className="text-gray-400 mb-6">
                Thank you, <strong className="text-white">{request.username}</strong>. Your <strong className="text-purple-400">{request.typeName}</strong> has been submitted. We'll send updates to <strong className="text-white">{myUser.email}</strong>.
            </p>
            <p className="text-xs text-gray-500 mb-8">Request ID: {request._id}</p>

            <div className="space-y-4">
                <button 
                    onClick={() => navigate('/one')} 
                    className="w-full p-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-bold flex items-center justify-center text-white"
                >
                    <CircleCheck className='size-5 mr-2' /> View Your Requests
                </button>
                <button
                    onClick={() => window.location.href = 'https://discord.gg/sqVBrMVQmp'}
                    className="w-full p-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center justify-center text-white"
                >
                    <FaDiscord className="size-5 mr-2" /> Join our Discord
                </button>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors font-bold flex items-center justify-center text-gray-300"
                >
                    <House className='size-5 mr-2' /> Back to Home
                </button>
            </div>
        </div>
    </div>
  );
}

export default Success;
