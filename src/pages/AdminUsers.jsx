import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserShield, FaUser, FaSpinner, FaUsers } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import AdminOnly from "../components/AdminOnly";
import toast, { Toaster } from "react-hot-toast";

const roleInfo = {
  admin: { className: "bg-red-600 text-white", Icon: FaUserShield, title: "Admin" },
  moderator: { className: "bg-blue-600 text-white", Icon: FaUser, title: "Moderator" },
  user: { className: "bg-green-600 text-white", Icon: FaUser, title: "User" },
};

const RoleBadge = ({ role }) => {
  const { className } = roleInfo[role] || { className: "bg-gray-600 text-white" };
  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${className}`}>
      {role.toUpperCase()}
    </span>
  );
};

const AdminUsers = () => {
  const API = process.env.REACT_APP_API;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [adminOnly, setAdminOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/manage/users/all`, { withCredentials: true });
        const mappedUsers = Object.values(response.data.users).map((user) => ({
          ...user,
          role: user.admin ? "admin" : user.staff ? "moderator" : "user",
        }));
        setUsers(mappedUsers);
      } catch (error) {
        if (error.response?.status === 403) {
          setAdminOnly(true);
        } else {
          setFetchError("Failed to fetch users: " + (error.response?.data?.message || error.message));
          toast.error("Error loading users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API]);

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Fetch user details when a user is clicked
  const handleUserClick = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const response = await axios.get(`${API}/manage/user/${id}`, { withCredentials: true });
      setSelectedUser(response.data.user);
      toast.success("User details loaded");
    } catch (error) {
      setDetailError("Failed to fetch user details: " + (error.response?.data?.message || error.message));
      toast.error("Error loading user details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Close the details modal
  const closeModal = () => {
    setSelectedUser(null);
    setDetailError(null);
  };

  if (adminOnly) return <AdminOnly />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <Toaster />
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center">
            <FaUsers className="mr-2" /> User Management
          </h1>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 mb-4 rounded-lg border border-gray-700 bg-gray-800 text-white"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" /> Loading users...
          </div>
        ) : fetchError ? (
          <div className="text-red-500 text-center font-bold">{fetchError}</div>
        ) : paginatedUsers.length > 0 ? (
          <ul className="space-y-4">
            {paginatedUsers.map((user) => {
              const { Icon } = roleInfo[user.role] || { Icon: FaUser };
              return (
                <li
                  key={user.id}
                  className="p-4 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <div className="flex items-center">
                    <Icon className="text-4xl mr-4" title={roleInfo[user.role]?.title || "User"} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{user.username}</span>
                        <RoleBadge role={user.role} />
                      </div>
                      <div className="text-sm">
                        Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-400">No users found.</p>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for User Details */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-3xl leading-none text-white hover:text-gray-400"
              aria-label="Close details"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">{selectedUser.username}'s Details</h2>
            {detailLoading ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" /> Loading details...
              </div>
            ) : detailError ? (
              <div className="text-red-500">{detailError}</div>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Display Name:</strong> {selectedUser.displayName}
                </p>
                <p>
                  <strong>Auth Type:</strong> {selectedUser.authType}
                </p>
                <p>
                  <strong>IP:</strong> {selectedUser.ip || "N/A"}
                </p>
                <p>
                  <strong>Device:</strong> {selectedUser.device || "Unknown"}
                </p>
              </div>
            )}
            <button
              onClick={closeModal}
              className="mt-4 flex items-center px-4 py-2 bg-purple-700 rounded hover:bg-purple-800 transition"
            >
              <IoMdArrowRoundBack className="mr-2" /> Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
