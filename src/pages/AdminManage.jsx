import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ImSpinner6 } from "react-icons/im";
import AdminOnly from '../components/AdminOnly';

const AdminManagePage = () => {
  const [tab, setTab] = useState('users'); // tabs: 'users' or 'ips'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminOnly, setAdminOnly] = useState(true);

  // Shared State
  const API = process.env.REACT_APP_API;
  // User Block/Unblock State
  const [myBlockUser, setMyBlockUser] = useState('');
  const [myBlockReason, setMyBlockReason] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [nonBlockedUsers, setNonBlockedUsers] = useState([]);

  // IP Ban/Unban State
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('');
  const [bannedIps, setBannedIps] = useState([]);

  // Fetch Blocked Users
  const fetchBlockedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users/blocks`, { withCredentials: true });
      const blocked = response.data.filter((user) => user.blocked === "YES");
      const nonBlocked = response.data.filter((user) => user.blocked !== "YES");
      setBlockedUsers(blocked);
      setNonBlockedUsers(nonBlocked);
      setError(null);

      if (response.status === 403) {
        setAdminOnly(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [API]);

  // Fetch Banned IPs
  const fetchBannedIps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ip/banned`, { withCredentials: true });
      setBannedIps(response.data);
      setError(null);

      if (response.status === 403) {
        setAdminOnly(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch IPs.');
    } finally {
      setLoading(false);
    }
  }, [API]);

  // Block User
  const blockUser = async () => {
    if (!myBlockUser || !myBlockReason) {
      toast.error('User ID and reason are required.');
      return;
    }

    const blockUserPromise = axios.post(
      `${API}/users/block/add`,
      { myBlockUser, myBlockReason },
      { withCredentials: true }
    );

    toast.promise(blockUserPromise, {
      loading: 'Blocking user...',
      success: 'User blocked successfully!',
      error: (err) => err.response?.data?.message || 'Error blocking user.',
    });

    try {
      await blockUserPromise;
      setMyBlockUser('');
      setMyBlockReason('');
      fetchBlockedUsers();
    } catch (error) {}
  };

  // Unblock User
  const unblockUser = async (userId) => {
    const unblockUserPromise = axios.put(
      `${API}/users/unblock`,
      { myBlockUser: userId },
      { withCredentials: true }
    );

    toast.promise(unblockUserPromise, {
      loading: 'Unblocking user...',
      success: 'User unblocked successfully!',
      error: (err) => err.response?.data?.message || 'Error unblocking user.',
    });

    try {
      await unblockUserPromise;
      fetchBlockedUsers();
    } catch (error) {}
  };

  // Ban IP
  const banIp = async () => {
    if (!ipAddress || !reason) {
      toast.error('IP address and reason are required.');
      return;
    }

    try {
      await axios.post(`${API}/ip/ban`, { ipAddress, reason }, { withCredentials: true });
      toast.success('IP banned successfully.');
      setIpAddress('');
      setReason('');
      fetchBannedIps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error banning IP.');
    }
  };

  // Unban IP
  const unbanIp = async (ip) => {
    try {
      await axios.delete(`${API}/ip/unban`, { data: { ipAddress: ip } }, { withCredentials: true });
      toast.success('IP unbanned successfully.');
      fetchBannedIps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error unbanning IP.');
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    if (tab === 'users') fetchBlockedUsers();
    else fetchBannedIps();
  }, [tab, fetchBlockedUsers, fetchBannedIps]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="mb-4">
            <ImSpinner6 className="w-16 h-16 mx-auto text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold">Loading...</h1>
          <p className="text-gray-400 mt-2">Please wait while are checking your info..</p>
        </div>
      </div>
    );
  }

  if (adminOnly) {
    return <AdminOnly />;
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Admin Management Panel</h1>

      {/* Tabs */}
      <div className="tabs mb-8">
        <a
          className={`tab tab-bordered ${tab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setTab('users')}
        >
          Manage Users
        </a>
        <a
          className={`tab tab-bordered ${tab === 'ips' ? 'tab-active' : ''}`}
          onClick={() => setTab('ips')}
        >
          Manage IPs
        </a>
      </div>

      {loading ? (
        <div aria-live="polite" className="flex justify-center my-8">
          <ImSpinner6 className="animate-spin text-4xl" />
          <p className="ml-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{error}</span>
        </div>
      ) : tab === 'users' ? (
        // Manage Users
        <div>
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

          <h2 className="text-xl font-semibold mt-8 mb-4">Blocked Users</h2>
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
      ) : (
        // Manage IPs
        <div>
          <h2 className="text-xl font-semibold mb-4">Add IP Ban</h2>
          <input
            type="text"
            placeholder="Enter IP address"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            className="input input-bordered w-full mb-2"
          />
          <input
            type="text"
            placeholder="Enter reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input input-bordered w-full mb-2"
          />
          <button className="btn btn-primary" onClick={banIp}>
            Ban IP
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-4">Banned IPs</h2>
          {bannedIps.length > 0 ? (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bannedIps.map((ip) => (
                  <tr key={ip.ipAddress}>
                    <td>{ip.ipAddress}</td>
                    <td>{ip.reason}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => unbanIp(ip.ipAddress)}>
                        Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="alert alert-info shadow-lg">
              <span>No banned IPs found.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManagePage;
