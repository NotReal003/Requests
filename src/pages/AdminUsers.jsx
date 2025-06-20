import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaUserShield, FaUser, FaSpinner, FaSave, FaUsers, FaSearch, FaSyncAlt } from 'react-icons/fa';
import { IoMdArrowRoundBack, IoMdClose } from 'react-icons/io';
import { formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

// --- Helper Component: AdminOnly Placeholder ---
// This component is shown when a non-admin user tries to access the page.
const AdminOnly = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
    <div className="bg-gradient-to-br from-[#1E1E1E] to-[#111] p-10 rounded-2xl shadow-2xl border border-red-500/30">
        <FaUserShield className="text-7xl text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-3">Access Denied</h1>
        <p className="text-gray-400 max-w-sm">You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
    </div>
  </div>
);


// --- Role Information & Styling ---
// Centralized role configuration for easy updates.
// Tailwind CSS requires full class names, so we define them here instead of constructing them dynamically.
const roleInfo = {
  admin: { 
    label: 'Admin', 
    Icon: FaUserShield, 
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
  },
  mod: { 
    label: 'Mod', 
    Icon: FaUserShield, 
    className: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
  },
  user: { 
    label: 'User', 
    Icon: FaUser, 
    className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20' 
  },
};


// --- Component: UserModal ---
// Modal for viewing and editing user details.
const UserModal = ({ user, onClose, loading, error, onRoleChange }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [updating, setUpdating] = useState(false);

  const handleRoleUpdate = async () => {
    setUpdating(true);
    try {
      await onRoleChange(user.id, newRole);
      toast.success('Role updated successfully!');
    } catch (e) {
      toast.error(`Failed to update role: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700/50"
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="user-details-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-white transition-transform duration-300 hover:rotate-90"
          aria-label="Close details"
        >
          <IoMdClose />
        </button>
        
        <h2 id="user-details-title" className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">
          {user.username}'s Details
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <FaSpinner className="animate-spin mr-3 text-2xl" /> Loading details...
          </div>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg text-center py-10">
            <p>{error}</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 text-gray-300">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
              <div className="flex items-center space-x-3 pt-2">
                <strong className="flex-shrink-0">Role:</strong>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-[#2a2a2a] text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none border border-gray-600 w-full"
                  disabled={updating}
                >
                  {Object.keys(roleInfo).map((role) => (
                    <option key={role} value={role}>
                      {roleInfo[role].label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRoleUpdate}
                  disabled={updating || newRole === user.role}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
                >
                  {updating ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                </button>
              </div>
              <p><strong>Auth Type:</strong> <span className="font-mono bg-gray-700/50 px-2 py-1 rounded">{user.authType}</span></p>
              <p><strong>IP:</strong> {user.ip || 'N/A'}</p>
              <p><strong>Device:</strong> {user.device || 'Unknown'}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-8 w-full flex items-center justify-center px-4 py-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors duration-300"
            >
              <IoMdArrowRoundBack className="mr-2" /> Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// --- Component: Pagination ---
const Pagination = ({ page, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    
    return (
        <div className="flex justify-center items-center space-x-2 mt-10">
            <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-3 py-2 bg-gray-800/50 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                aria-label="First page"
            >
                « First
            </button>
            <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-2 bg-gray-800/50 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                aria-label="Previous page"
            >
                ‹ Prev
            </button>
            <span className="text-gray-400 px-4" aria-live="polite">
                Page {page} of {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-2 bg-gray-800/50 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                aria-label="Next page"
            >
                Next ›
            </button>
            <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-3 py-2 bg-gray-800/50 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors"
                aria-label="Last page"
            >
                Last »
            </button>
        </div>
    );
};


// --- Component: Skeleton Loader ---
const UserListSkeleton = ({ count = 5 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="p-4 bg-[#1a1a1a]/50 rounded-xl border border-gray-800/50 animate-pulse">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-700 rounded-full mr-4" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-gray-700 rounded w-1/4" />
                    </div>
                    <div className="h-6 w-16 bg-gray-700 rounded-full" />
                </div>
            </div>
        ))}
    </div>
);


// --- Main Component: AdminUsers ---
const AdminUsers = () => {
  // Use a placeholder API URL if environment variable is not set.
  const apiUrl = process.env.REACT_APP_API || 'https://api.notreal003.xyz'; 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminOnly, setAdminOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data for demonstration purposes. Replace with your actual API call.
       const response = await axios.get(`${apiUrl}/manage/users/all`, { withCredentials: true });
       const mappedUsers = Object.values(response.data.users).map((user) => ({
         ...user,
         role: user.admin ? 'admin' : user.staff ? 'mod' : 'user',
       }));
      ];
      setUsers(mappedUsers);
      // End of mock data
    } catch (error) {
      if (error.response?.status === 403) setAdminOnly(true);
      else toast.error(`Failed to load users: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = useCallback(
    async (userId, newRole) => {
      try {
        // Mocking the API call
         await axios.patch(`${apiUrl}/admin/staff/manage/${userId}/role`, { role: newRole }, { withCredentials: true });
        //console.log(`Updating user ${userId} to role ${newRole}`);
        await new Promise(res => setTimeout(res, 500)); // Simulate network delay
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
        setSelectedUser((prev) => prev && { ...prev, role: newRole });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Mock API Error');
      }
    },
    [apiUrl]
  );

  const filteredUsers = useMemo(
    () => users.filter((user) => 
        user.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [users, debouncedSearch]
  );

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / pageSize) || 1, [filteredUsers.length, pageSize]);
  const paginatedUsers = useMemo(() => filteredUsers.slice((page - 1) * pageSize, page * pageSize), [filteredUsers, page, pageSize]);

  useEffect(() => {
      if(page > totalPages) {
          setPage(totalPages);
      }
  }, [page, totalPages]);


  const handleUserClick = useCallback(
    async (user) => {
      setSelectedUser(user); // Optimistically set user data
      setDetailLoading(true);
      setDetailError(null);
      try {
        // You can still fetch detailed/fresh data here if needed
         const response = await axios.get(`${apiUrl}/manage/user/${user.id}`, { withCredentials: true });
         const detailedUser = {
           ...response.data.user,
           role: response.data.user.admin ? 'admin' : response.data.user.staff ? 'mod' : 'user',
         };
        await new Promise(res => setTimeout(res, 500)); // Simulate network delay
        setSelectedUser(user);
      } catch (error) {
        setDetailError(`Failed to fetch details: ${error.response?.data?.message || 'Mock API Error'}`);
      } finally {
        setDetailLoading(false);
      }
    },
    [apiUrl]
  );

  const closeModal = useCallback(() => setSelectedUser(null), []);
  
  const roleCounts = useMemo(() => {
    return users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, { admin: 0, mod: 0, user: 0 });
  }, [users]);


  if (adminOnly) return <AdminOnly />;

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#1a0c2e] opacity-50 z-0"></div>
      <Toaster position="top-center" toastOptions={{
          className: 'bg-gray-800 text-white border border-gray-700',
      }} />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center text-white">
              <FaUsers className="mr-4 text-purple-400" /> User Management
            </h1>
            <p className="text-gray-400 mt-1">Manage all users across the platform.</p>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/80 transition-colors duration-300 flex items-center disabled:opacity-50 border border-gray-700/50"
            disabled={loading}
            aria-label="Refresh user list"
          >
            <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#1c1c1c] to-[#111] p-6 rounded-xl border border-gray-800/50">
                <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
                <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1c1c1c] to-[#111] p-6 rounded-xl border border-amber-500/20">
                <h3 className="text-sm font-medium text-amber-400">Administrators</h3>
                <p className="text-3xl font-bold text-white">{roleCounts.admin}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1c1c1c] to-[#111] p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400">Moderators</h3>
                <p className="text-3xl font-bold text-white">{roleCounts.mod}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1c1c1c] to-[#111] p-6 rounded-xl border border-gray-500/20">
                <h3 className="text-sm font-medium text-gray-400">Regular Users</h3>
                <p className="text-3xl font-bold text-white">{roleCounts.user}</p>
            </div>
        </div>

        {/* --- Search and Actions --- */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            className="w-full p-3 pl-12 rounded-lg bg-[#1a1a1a]/50 border border-gray-700/50 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search users"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
              aria-label="Clear search"
            >
              <IoMdClose size={20}/>
            </button>
          )}
        </div>

        {/* --- User List --- */}
        <div className="bg-[#1a1a1a]/30 rounded-xl border border-gray-800/50 p-2">
            {loading ? (
                <UserListSkeleton count={pageSize}/>
            ) : paginatedUsers.length > 0 ? (
                <ul className="space-y-2" aria-label="User list">
                {paginatedUsers.map((user) => {
                    const RoleIcon = roleInfo[user.role].Icon;
                    return (
                        <li
                            key={user.id}
                            className="p-4 bg-[#1c1c1c]/50 rounded-lg shadow-md hover:bg-[#2a2a2a] transition-all duration-300 cursor-pointer group border border-transparent hover:border-purple-500/30"
                            onClick={() => handleUserClick(user)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleUserClick(user)}
                            aria-label={`View details for ${user.username}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <RoleIcon className={`text-4xl mr-4 text-gray-500 transition-colors group-hover:text-purple-400`} />
                                    <div>
                                        <p className="font-bold text-lg text-white">{user.username}</p>
                                        <p className="text-sm text-gray-400">
                                            Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleInfo[user.role].className} transition-transform group-hover:scale-105`}>
                                    {roleInfo[user.role].label}
                                </span>
                            </div>
                        </li>
                    )
                })}
                </ul>
            ) : (
                <div className="text-center text-gray-500 py-16">
                    <p className="text-xl">No Users Found</p>
                    <p>Your search for "{debouncedSearch}" did not return any results.</p>
                </div>
            )}
        </div>

        <Pagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={closeModal}
          loading={detailLoading}
          error={detailError}
          onRoleChange={handleRoleChange}
        />
      )}
    </div>
  );
};

export default AdminUsers;
