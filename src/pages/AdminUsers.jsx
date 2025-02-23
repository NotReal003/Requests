import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { FaUserShield, FaUser, FaSpinner, FaSave, FaUsers, FaSearch } from 'react-icons/fa';
import { IoMdArrowRoundBack, IoMdClose } from 'react-icons/io';
import { formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import AdminOnly from '../components/AdminOnly'; // Assuming this is defined elsewhere

// Role information for different user types
const roleInfo = {
  admin: { label: 'Admin', color: 'red', Icon: FaUserShield },
  mod: { label: 'Mod', color: 'blue', Icon: FaUser },
  user: { label: 'User', color: 'green', Icon: FaUser },
};

// UserModal component
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
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-black bg-opacity-60 z-50 animate-fade-in">
      <div
        className="bg-[#2E2E2E] p-8 rounded-xl shadow-2xl w-full max-w-lg relative"
        role="dialog"
        aria-labelledby="user-details-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-[#FFD700] hover:text-white transition-all"
          aria-label="Close details"
        >
          <IoMdClose />
        </button>
        <h2 id="user-details-title" className="text-2xl font-semibold mb-6 text-[#FFD700]">
          {user.username}'s Details
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-gray-400">
            <FaSpinner className="animate-spin mr-3" /> Loading details...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-6">
            {error}
            <button onClick={onClose} className="text-[#9370DB] hover:text-[#4B0082] ml-3">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 text-gray-300">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Display Name:</strong> {user.displayName}</p>
              <div className="flex items-center space-x-3">
                <strong>Role:</strong>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-[#4B0082] text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#9370DB] focus:outline-none"
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
                  className="px-4 py-2 bg-[#9370DB] rounded-lg hover:bg-[#4B0082] disabled:opacity-50 flex items-center transition-all"
                >
                  {updating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Updating
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Update
                    </>
                  )}
                </button>
              </div>
              <p><strong>Auth Type:</strong> {user.authType}</p>
              <p><strong>IP:</strong> {user.ip || 'N/A'}</p>
              <p><strong>Device:</strong> {user.device || 'Unknown'}</p>
            </div>
            <button
              onClick={onClose}
              className="mt-8 w-full flex items-center justify-center px-4 py-2 bg-[#9370DB] rounded-lg hover:bg-[#4B0082] transition-all"
            >
              <IoMdArrowRoundBack className="mr-2" /> Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ page, totalPages, setPage }) => (
  <div className="flex justify-center items-center space-x-4 mt-8">
    <button
      disabled={page === 1}
      onClick={() => setPage(1)}
      className="px-4 py-2 bg-[#9370DB] rounded-lg disabled:opacity-50 hover:bg-[#4B0082] transition-all"
      aria-label="First page"
    >
      First
    </button>
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => p - 1)}
      className="px-4 py-2 bg-[#9370DB] rounded-lg disabled:opacity-50 hover:bg-[#4B0082] transition-all"
      aria-label="Previous page"
    >
      Prev
    </button>
    <span className="text-[#FFD700]" aria-live="polite">
      Page {page} of {totalPages}
    </span>
    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => p + 1)}
      className="px-4 py-2 bg-[#9370DB] rounded-lg disabled:opacity-50 hover:bg-[#4B0082] transition-all"
      aria-label="Next page"
    >
      Next
    </button>
    <button
      disabled={page === totalPages}
      onClick={() => setPage(totalPages)}
      className="px-4 py-2 bg-[#9370DB] rounded-lg disabled:opacity-50 hover:bg-[#4B0082] transition-all"
      aria-label="Last page"
    >
      Last
    </button>
  </div>
);

// Main AdminUsers component
const AdminUsers = () => {
  const apiUrl = process.env.REACT_APP_API;
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
      const response = await axios.get(`${apiUrl}/manage/users/all`, { withCredentials: true });
      const mappedUsers = Object.values(response.data.users).map((user) => ({
        ...user,
        role: user.admin ? 'admin' : user.staff ? 'mod' : 'user',
      }));
      setUsers(mappedUsers);
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
        await axios.patch(`${apiUrl}/admin/staff/manage/${userId}/role`, { role: newRole }, { withCredentials: true });
        setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
        setSelectedUser((prev) => prev && { ...prev, role: newRole });
      } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
      }
    },
    [apiUrl]
  );

  const filteredUsers = useMemo(
    () => users.filter((user) => user.username.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [users, debouncedSearch]
  );
  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / pageSize) || 1, [filteredUsers.length]);
  const paginatedUsers = useMemo(() => filteredUsers.slice((page - 1) * pageSize, page * pageSize), [filteredUsers, page]);

  const handleUserClick = useCallback(
    async (id) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const response = await axios.get(`${apiUrl}/manage/user/${id}`, { withCredentials: true });
        setSelectedUser({
          ...response.data.user,
          role: response.data.user.admin ? 'admin' : response.data.user.staff ? 'mod' : 'user',
        });
      } catch (error) {
        setDetailError(`Failed to fetch details: ${error.response?.data?.message || error.message}`);
      } finally {
        setDetailLoading(false);
      }
    },
    [apiUrl]
  );

  const closeModal = useCallback(() => setSelectedUser(null), []);

  if (adminOnly) return <AdminOnly />;

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-6">
      <Toaster />
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <FaUsers className="mr-3 text-[#FFD700]" /> User Management
          </h1>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-[#9370DB] rounded-lg hover:bg-[#4B0082] transition-all flex items-center disabled:opacity-50"
            disabled={loading}
            aria-label="Refresh user list"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Refresh'}
          </button>
        </div>

        <div className="relative mb-8">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-3 pl-10 rounded-lg bg-[#2E2E2E] border border-[#4B0082] text-white focus:ring-2 focus:ring-[#9370DB] focus:outline-none"
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <IoMdClose />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="p-4 bg-[#2E2E2E] rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#4B0082] rounded-full mr-4" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#4B0082] rounded w-1/3" />
                    <div className="h-3 bg-[#4B0082] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedUsers.length > 0 ? (
          <ul className="space-y-4" aria-label="User list">
            {paginatedUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 bg-[#2E2E2E] rounded-lg shadow hover:bg-[#3E3E3E] transition cursor-pointer group"
                onClick={() => handleUserClick(user.id)}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => e.key === 'Enter' && handleUserClick(user.id)}
                aria-label={`View details of ${user.username}`}
              >
                <div className="flex items-center">
                  {roleInfo[user.role].Icon && (
                    <roleInfo[user.role].Icon className="text-4xl mr-4 transition-transform group-hover:scale-110" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{user.username}</span>
                      <span className={`rounded-lg px-2 py-1 text-xs font-bold bg-${roleInfo[user.role].color}-600 text-white`}>
                        {roleInfo[user.role].label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400 py-6">No users found matching your search.</p>
        )}

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
