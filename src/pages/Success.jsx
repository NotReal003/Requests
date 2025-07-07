import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { House, CircleCheck } from 'lucide-react';
import { FaDiscord, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { IoShieldCheckmark } from "react-icons/io5";

// --- Component: LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-400">
        <FaSpinner className="animate-spin text-5xl mb-4 text-purple-400" />
        <p className="text-lg tracking-wider">Finalizing Your Request...</p>
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
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 overflow-hidden bg-black">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[-20%] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute left-0 top-0 h-1/2 w-1/2 rounded-full bg-gradient-to-tr from-purple-900 to-transparent opacity-20 animate-spin-slow"></div>
            <div className="absolute right-0 bottom-0 h-1/2 w-1/2 rounded-full bg-gradient-to-bl from-indigo-900 to-transparent opacity-20 animate-spin-slow-reverse"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-xl text-center animate-fade-in-up">
            {/* Glassmorphism Card */}
            <div className="bg-gray-900/40 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/20">
                <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute w-32 h-32 bg-green-500/20 rounded-full animate-ping-slow"></div>
                    <div className="bg-gray-800 p-5 rounded-full border-2 border-green-500/50">
                        <IoShieldCheckmark className="w-20 h-20 text-green-400" />
                    </div>
                </div>
                
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-300 to-sky-300 text-transparent bg-clip-text mb-4">
                    Submission Successful
                </h1>
                <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto">
                    Thank you, <strong className="font-semibold text-white">{request.username}</strong>. Your <strong className="font-semibold text-purple-300">{request.typeName}</strong> has been received.
                </p>
                <p className="text-sm text-gray-500 mb-10">We'll send updates to <strong className="text-gray-400">{myUser.email}</strong>. Your request ID is <strong className="font-mono text-gray-400">{request._id}</strong>.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate('/one')} 
                        className="group relative w-full p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-lg transition-transform duration-300 hover:scale-105"
                    >
                        <CircleCheck className='inline-block size-6 mr-2' /> View Requests
                    </button>
                    <button
                        onClick={() => window.location.href = 'https://discord.gg/sqVBrMVQmp'}
                        className="group relative w-full p-4 bg-[#5865F2] rounded-lg text-white font-bold text-lg transition-transform duration-300 hover:scale-105"
                    >
                        <FaDiscord className="inline-block size-6 mr-2" /> Join Discord
                    </button>
                </div>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
                >
                    <House className='size-5 mr-2' /> Go Back Home
                </button>
            </div>
        </div>

        {/* CSS for custom animations */}
        <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow { animation: spin-slow 20s linear infinite; }
            
            @keyframes spin-slow-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
            }
            .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }

            @keyframes ping-slow {
                75%, 100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
            .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
            
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        `}</style>
    </div>
  );
}

export default Success;
