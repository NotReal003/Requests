import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUser, FaSpinner } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { formatDistanceToNow } from 'date-fns';
import AdminOnly from "../components/AdminOnly";

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: 'bg-red-600 text-white',
    moderator: 'bg-blue-600 text-white',
    user: 'bg-green-600 text-white',
  };

  return (
    <span className={`rounded-lg px-2 py-1 text-xs font-bold ${roleStyles[role] || 'bg-gray-600 text-white'}`}>{role.toUpperCase()}</span>
  );
};

const UserIcon = ({ role }) => {
  return role === 'admin' ? (
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
  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API}/manage/users/all`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          setLoading(false); 
          setAdminOnly(true);
        }       
        console.error(error);
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token, API]);

  
 if (adminOnly) return <AdminOnly />;

  return (
    <div className="flex flex-col items-center justify-center max-w-md md:max-w-lg mx-auto min-h-screen p-4 shadow-lg">
      <div className="rounded-lg shadow-sm p-2">
        <h1 className="text-2xl font-bold mb-4">Admin Users</h1>
      </div>

      <div className="w-full max-w-3xl">
        <div className="space-y-4">
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
                className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-lg text-white cursor-pointer"
              >
                <div className="flex items-center">
                  <UserIcon role={user.role} />
                  <div>
                    <h2 className="text-md font-bold">{user.username} <RoleBadge role={user.role} /></h2>
                    <p className="text-sm">Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-800">No users found.</p>
          )}
        </div>

        <div className="sticky bottom-0 left-0 right-0 w-full bg-base-100 border-1 border-t-slate-100 flex justify-start items-center rounded-md p-2">
          <button className="btn text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg no-animation" onClick={() => navigate('/')}> 
            <IoMdArrowRoundBack className="mr-2" /> Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
