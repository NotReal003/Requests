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

          const userResponse = await axios.get(`${API}/users/@me`, {
            withCredentials: true,
          });

        // Fetch request count
        const requestsResponse = await axios.get(`${API}/requests`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        setRequestCount(requestsResponse.data.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        const errorMessage = error.message || 'Failed to find your profile.';
        toast.error(errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [API]);
  const handleUpdateDisplayName = (newDisplayName) => {
    setUser((prevUser) => ({
      ...prevUser,
      displayName: newDisplayName,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <FaSpinner className="animate-spin inline-block align-middle" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <strong className="text-lg text-red-500">{error}</strong>
          <Toaster />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster />
      <div className="flex items-center space-x-4 mb-8">
        {user && user.avatarHash ? (
          <img
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.webp?size=128`}
            className="ring-primary ring-offset-base-100 w-24 h-24 rounded-full ring-4 ring-offset-2 shadow-lg"
            alt={user.username}
          />
        ) : (
          <FaUserCircle className="w-24 h-24 rounded-full shadow-lg" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
          <p>@{user.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="text-sm gap-2">
            <p>
              <strong className="mr-1">
                <MdMarkEmailRead className="inline-block align-middle m-1" /> Email:
              </strong>
              {user.email}
            </p>
              <p>
                <strong className="mr-1">
                  <FaCheck className="inline-block align-middle m-1" /> Joined:
                </strong>
                {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            <p>
              <strong className="mr-1">
                <MdAdminPanelSettings className="inline-block align-middle m-1" /> Admin:
              </strong>
              {user.admin ? 'Yes' : 'No'}
            </p>
            <p>
              <strong className="mr-1">
                <FiUserCheck className="inline-block align-middle m-1" /> Staff:
              </strong>
              {user.staff ? 'Yes' : 'No'}
            </p>
            <p>
              <strong className="mr-1">
                <FcLinux className="inline-block align-middle m-1" /> Authorization:
              </strong>
              {user.authType}
            </p>
            <p>
              <strong className="mr-1">
                <FaDiscord className="inline-block align-middle m-1" /> Account ID:
              </strong>
              {user.id}
            </p>
          </div>

        </div>

        <div className="p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Request Summary</h2>
          <div className="flex items-center">
            <IoMdListBox className="w-6 h-6 text-blue-500 mr-2" />
            <p className="text-lg">{requestCount} requests submitted</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        {user.authType === 'discord' && (
        <button className="btn no-animation bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-blue-700 transition-all btn-sm flex items-center"
          onClick={() => window.location.href = `discord:/users/${user.id}`}
        >
          <FaDiscord className="mr-2" /> View Discord Profile
        </button>
      )}
        <button className="btn no-animation bg-purple-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-purple-700 transition-all btn-sm" onClick={() => setEditModalOpen(true)}><IoMdSettings /> Edit Profile
        </button>
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentDisplayName={user?.displayName || user?.username}
        onUpdate={handleUpdateDisplayName}
      />
      {user.authType === 'discord' && (
      <div className="flex items-center justify-center mt-2">
        <p className="mt-2 text-xs text-gray-400">Before using the "View Discord Profile" button, please make sure you are on Desktop or You have installed Discord on your Device.</p>
      </div>
      )}
    </div>
  );
};

export default Profile;
