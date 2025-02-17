import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { FaUserShield, FaUser, FaSpinner, FaUsers, FaSave } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import AdminOnly from "../components/AdminOnly";
import toast, { Toaster } from "react-hot-toast";
import { useDebounce } from "use-debounce";

const roleInfo = {
  admin: { className: "bg-red-600 text-white", Icon: FaUserShield, title: "Admin" },
  moderator: { className: "bg-blue-600 text-white", Icon: FaUser, title: "Moderator" },
  user: { className: "bg-green-600 text-white", Icon: FaUser, title: "User" },
};

const RoleBadge = ({ role }) => {
  const { className, title } = roleInfo[role] || { className: "bg-gray-600 text-white", title: "User" };
  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${className}`} title={title}>
      {role.toUpperCase()}
    </span>
  );
};

const UserListItem = ({ user, onClick }) => {
  const { Icon, title } = roleInfo[user.role] || { Icon: FaUser, title: "User" };
  
  return (
    <li
      className="p-4 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View details of ${user.username}`}
    >
      <div className="flex items-center">
        <Icon className="text-4xl mr-4 transition-transform group-hover:scale-110" title={title} />
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{user.username}</span>
            <RoleBadge role={user.role} />
          </div>
          <div className="text-sm text-gray-400">
            Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </li>
  );
};

const Pagination = ({ page, totalPages, setPage }) => (
  <div className="flex justify-center items-center space-x-4 mt-6">
    <button
      disabled={page === 1}
      onClick={() => setPage(p => p - 1)}
      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-600"
      aria-label="Previous page"
    >
      Prev
    </button>
    <span aria-live="polite">
      Page {page} of {totalPages}
    </span>
    <button
      disabled={page === totalPages}
      onClick={() => setPage(p => p + 1)}
      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 transition-colors hover:bg-gray-600"
      aria-label="Next page"
    >
      Next
    </button>
  </div>
);

const UserModal = ({ user, onClose, loading, error, onRoleChange }) => {
  const [newRole, setNewRole] = useState(user.role);
  const [updating, setUpdating] = useState(false);
  
  const handleRoleUpdate = async () => {
    setUpdating(true);
    try {
      await onRoleChange(user.id, newRole);
      toast.success("Role updated successfully!");
    } catch (e) {
      toast.error("Failed to update role: " + e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div 
        className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative"
        role="dialog"
        aria-labelledby="user-details-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white transition-colors"
          aria-label="Close details"
        >
          &times;
        </button>
        <h2 id="user-details-title" className="text-2xl font-semibold mb-4">
          {user.username}'s Details
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <FaSpinner className="animate-spin mr-2" /> Loading details...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            {error} <button onClick={onClose} className="text-blue-400 hover:text-blue-300 ml-2">Try again</button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <p><strong>Email:</strong> <span className="text-gray-300">{user.email}</span></p>
              <p><strong>Display Name:</strong> <span className="text-gray-300">{user.displayName}</span></p>
              <div className="flex items-center space-x-2">
                <strong>Role:</strong>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-gray-800 text-white px-2 py-1 rounded"
                  disabled={updating}
                >
                  {Object.keys(roleInfo).map(role => (
                    <option key={role} value={role}>{roleInfo[role].title}</option>
                  ))}
                </select>
                <button
                  onClick={handleRoleUpdate}
                  disabled={updating || newRole === user.role}
                  className="px-2 py-1 bg-purple-700 rounded hover:bg-purple-800 disabled:opacity-50 flex items-center"
                >
                  {updating ? (
                    <span><FaSpinner className="animate-spin mr-1" /> Update</span>
                  ) : (
                    <>
                      <FaSave className="mr-1" /> Update
                    </>
                  )}
                </button>
              </div>
              <p><strong>Auth Type:</strong> <span className="text-gray-300">{user.authType}</span></p>
              <p><strong>IP:</strong> <span className="text-gray-300">{user.ip || "N/A"}</span></p>
              <p><strong>Device:</strong> <span className="text-gray-300">{user.device || "Unknown"}</span></p>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-purple-700 rounded hover:bg-purple-800 transition"
            >
              <IoMdArrowRoundBack className="mr-2" /> Close Details
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const API = process.env.REACT_APP_API;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminOnly, setAdminOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/manage/users/all`, { withCredentials: true });
      const mappedUsers = Object.values(response.data.users).map(user => ({
        ...user,
        role: user.admin ? "admin" : user.staff ? "moderator" : "user",
      }));
      setUsers(mappedUsers);
    } catch (error) {
      if (error.response?.status === 403) {
        setAdminOnly(true);
      } else {
        toast.error("Failed to load users: " + (error.response?.data?.message || error.message));
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchUsers().catch(() => {});
  }, [fetchUsers]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      await axios.patch(
        `${API}/manage/user/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setSelectedUser(prev => prev && { ...prev, role: newRole });
    } catch (error) {
      toast.error("Role update failed: " + (error.response?.data?.message || error.message));
      throw error;
    }
  }, [API]);

  const filteredUsers = useMemo(() => 
    users.filter(user =>
      user.username.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), 
    [users, debouncedSearch]
  );

  const totalPages = useMemo(() => 
    Math.ceil(filteredUsers.length / pageSize) || 1,
    [filteredUsers.length]
  );

  const paginatedUsers = useMemo(() =>
    filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page]
  );

  const handleUserClick = useCallback(async id => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await axios.get(`${API}/manage/user/${id}`, { withCredentials: true });
      setSelectedUser({
        ...response.data.user,
        role: response.data.user.admin ? "admin" : response.data.user.staff ? "moderator" : "user"
      });
    } catch (error) {
      setDetailError("Failed to fetch details: " + (error.response?.data?.message || error.message));
      toast.error("Error loading user details");
    } finally {
      setDetailLoading(false);
    }
  }, [API]);

  const closeModal = useCallback(() => {
    setSelectedUser(null);
    setDetailError(null);
  }, []);

  if (adminOnly) return <AdminOnly />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Toaster />
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FaUsers className="mr-2" aria-hidden="true" /> User Management
          </h1>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : "Refresh"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-3 mb-6 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          aria-label="Search users"
        />

        {loading ? (
          <div className="space-y-4">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-800 rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-700 rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedUsers.length > 0 ? (
          <ul className="space-y-4" aria-label="User list">
            {paginatedUsers.map(user => (
              <UserListItem
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user.id)}
              />
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
