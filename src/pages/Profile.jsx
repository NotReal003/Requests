import React, { useEffect, useState } from 'react';
import { IoMdSettings, IoMdListBox } from "react-icons/io";
import { FaDiscord, FaCheck, FaUserCircle, FaSpinner } from "react-icons/fa";
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';
import { MdMarkEmailRead, MdAdminPanelSettings } from "react-icons/md";
import toast, { Toaster } from 'react-hot-toast';
import { FcLinux } from "react-icons/fc";
import { FiUserCheck } from "react-icons/fi";

const Profile = () => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userResponse = await axios.get(`${API}/users/@me`, { withCredentials: true });
        const requestsResponse = await axios.get(`${API}/requests`, { withCredentials: true });
        setUser(userResponse.data);
        const datas = userResponse.data;
        setRequestCount(requestsResponse.data.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error(datas.message || 'An issue occurred while submitting your request.');
        setError(datas.message || 'Failed to find your profile.');
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [API]);

  const handleUpdateDisplayName = (newDisplayName) => {
    setUser((prevUser) => ({ ...prevUser, displayName: newDisplayName }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <FaSpinner className="animate-spin text-3xl text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden px-6 py-10">
      <Toaster />
      {/* Animated background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-[-20%] top-[-20%] h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-black to-transparent opacity-30 animate-pulse-slow blur-3xl"></div>
        <div className="absolute right-[-10%] bottom-[-20%] h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-black to-transparent opacity-30 animate-pulse-slow blur-3xl"></div>
      </div>

      {/* Profile Container */}
      <div className="relative z-10 max-w-4xl mx-auto backdrop-blur-md bg-gray-900/40 border border-purple-500/20 shadow-xl rounded-3xl p-8">
        <div className="flex items-center space-x-6 mb-8">
          {user?.avatarHash ? (
            <img
              src={`${user.avatarHash}`}
              className="w-24 h-24 rounded-full ring-4 ring-purple-600 shadow-md"
              alt={user.username}
            />
          ) : (
            <FaUserCircle className="w-24 h-24 rounded-full text-gray-500" />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">{user.displayName || user.username}</h1>
            <p className="text-sm text-gray-400">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Account Details</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><MdMarkEmailRead className="inline mr-2" /> Email: {user.email}</li>
              <li><FaCheck className="inline mr-2" /> Joined: {new Date(user.joinedAt).toLocaleDateString()}</li>
              <li><MdAdminPanelSettings className="inline mr-2" /> Admin: {user.admin ? 'Yes' : 'No'}</li>
              <li><FiUserCheck className="inline mr-2" /> Staff: {user.staff ? 'Yes' : 'No'}</li>
              <li><FcLinux className="inline mr-2" /> Auth: {user.authType}</li>
              <li><FaDiscord className="inline mr-2" /> ID: {user.id}</li>
            </ul>
          </div>

          <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-indigo-300">Request Summary</h2>
            <div className="flex items-center text-lg text-white">
              <IoMdListBox className="text-blue-400 mr-2" />
              {requestCount} requests submitted
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center mt-10 gap-4">
          {user.authType === 'discord' && (
            <button
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => window.location.href = `discord:/users/${user.id}`}
            >
              <FaDiscord className="mr-2" /> View Discord Profile
            </button>
          )}
          <button
            className="btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setEditModalOpen(true)}
          >
            <IoMdSettings className="mr-2" /> Edit Profile
          </button>
        </div>

        {user.authType === 'discord' && (
          <p className="text-xs text-gray-400 mt-3">
            Desktop users or those with the Discord app can use the "View Discord Profile" button.
          </p>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentDisplayName={user?.displayName || user?.username}
        onUpdate={handleUpdateDisplayName}
      />

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .animate-pulse-slow { animation: pulse-slow 15s infinite; }
      `}</style>
    </div>
  );
};

export default Profile;
