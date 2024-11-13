import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ImSpinner6 } from "react-icons/im";

const BlockUserPage = () => {
  const [myBlockUser, setMyBlockUser] = useState('');
  const [myBlockReason, setMyBlockReason] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [nonBlockedUsers, setNonBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;
  const token = localStorage.getItem('jwtToken');
  const headers = { Authorization: `${token}` };

  const fetchBlockedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users/blocks`, { headers });
      const blocked = response.data.filter(user => user.blocked === "YES");
      const nonBlocked = response.data.filter(user => user.blocked !== "YES");
      setBlockedUsers(blocked);
      setNonBlockedUsers(nonBlocked);
      setError(null);
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        navigate('/PageNotFound');
      } else {
        setError(`${status}: ${error.response?.data?.message || 'Failed to fetch users.'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [API, navigate, headers]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const blockUser = async () => {
    if (!myBlockUser || !myBlockReason) {
      toast.error('User ID and reason are required.');
      return;
    }

    if (!/^\d+$/.test(myBlockUser)) {
      toast.error('Invalid User ID format.');
      return;
    }

    const blockUserPromise = axios.post(
      `${API}/users/block/add`,
      { myBlockUser, myBlockReason },
      { headers }
    );

    toast.promise(
      blockUserPromise,
      {
        loading: 'Blocking user...',
        success: 'User blocked successfully!',
        error: (err) => err.response?.data?.message || 'An error occurred',
      }
    );

    try {
      await blockUserPromise;
      setMyBlockUser('');
      setMyBlockReason('');
      fetchBlockedUsers();
    } catch (error) {
      console.error('Error blocking the user:', error);
    }
  };

  const unblockUser = async (userId) => {
    const unblockUserPromise = axios.put(
      `${API}/users/unblock`,
      { myBlockUser: userId },
      { headers }
    );

    toast.promise(
      unblockUserPromise,
      {
        loading: 'Unblocking user...',
        success: 'User unblocked successfully!',
        error: (err) => err.response?.data?.message || 'An error occurred',
      }
    );

    try {
      await unblockUserPromise;
      fetchBlockedUsers();
    } catch (error) {
      console.error('Error unblocking the user:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Block/Unblock Users</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Block a User</h2>
        <input
          type="text"
          placeholder="Enter user ID"
          value={myBlockUser}
          onChange={(e) => setMyBlockUser(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <input
          type="text"
          placeholder="Enter reason"
          value={myBlockReason}
          onChange={(e) => setMyBlockReason(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <button className="btn btn-primary" onClick={blockUser}>
          Block User
        </button>
      </div>

      {loading ? (
        <div aria-live="polite" className="flex justify-center my-8">
          <ImSpinner6 className="animate-spin text-4xl" />
          <p className="ml-2">Loading users...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>
          {blockedUsers.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.reason}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => unblockUser(user.user_id)}>
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alert alert-info shadow-lg">
              <span>No blocked users found.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockUserPage;
