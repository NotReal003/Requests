import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserShield, FaUser, FaSpinner } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { formatDistanceToNow } from "date-fns";
import AdminOnly from "../components/AdminOnly";
import toast, { Toaster } from "react-hot-toast";

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-red-600 text-white",
    moderator: "bg-blue-600 text-white",
    user: "bg-green-600 text-white",
  };
  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${roleStyles[role] || "bg-gray-600 text-white"}`}>
      {role.toUpperCase()}
    </span>
  );
};

const UserIcon = ({ role }) => {
  return role === "admin" ? (
    <FaUserShield className="text-4xl mr-4" title="Admin" />
  ) : (
    <FaUser className="text-4xl mr-4" title="User" />
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminOnly, setAdminOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API}/manage/users/all`, { withCredentials: true });
        const userList = Object.values(response.data.users).map((user) => ({
          ...user,
          role: user.admin ? "admin" : user.staff ? "moderator" : "user",
        }));
        setUsers(userList);
      } catch (error) {
        if (error.response?.status === 403) setAdminOnly(true);
        console.error(error);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API]);

  const fetchUserDetails = async (id) => {
    try {
      const response = await axios.get(`${API}/manage/user/${id}`, { withCredentials: true });
      setSelectedUser(response.data);
      toast.success("User details loaded");
    } catch (error) {
      toast.error("Failed to fetch user");
      console.error("Failed to fetch user details:", error);
    }
  };

  if (adminOnly) return <AdminOnly />;

  return (
    <div className="flex flex-col items-center justify-center max-w-md md:max-w-lg mx-auto min-h-screen p-4 shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {selectedUser ? (
        <div className="w-full max-w-3xl bg-gray-800 p-4 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-bold mb-2">{selectedUser.username}'s Details</h2>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Display Name:</strong> {selectedUser.displayName}</p>
          <p><strong>Auth Type:</strong> {selectedUser.authType}</p>
          <p><strong>IP:</strong> {selectedUser.ip || "N/A"}</p>
          <p><strong>Device:</strong> {selectedUser.device || "Unknown"}</p>
          <button
            className="btn mt-4 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br font-medium rounded-lg no-animation"
            onClick={() => setSelectedUser(null)}
          >
            <IoMdArrowRoundBack className="mr-2" /> Close Details
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl space-y-4">
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <FaSpinner className="animate-spin inline-block align-middle mr-2" />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <p className="text-center text-red-600 font-bold">{error}</p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col bg-gray-800 p-4 rounded-lg shadow-lg text-white cursor-pointer"
                onClick={() => fetchUserDetails(user.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <UserIcon role={user.role} />
                    <div>
                      <h2 className="text-md font-bold">
                        {user.username} <RoleBadge role={user.role} />
                      </h2>
                      <p className="text-sm">
                        Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No users found.</p>
          )}
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default AdminUsers;
