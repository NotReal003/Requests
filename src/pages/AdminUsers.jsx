import { useEffect, useState } from "react";
import axios from "axios";
import AdminOnly from '../components/AdminOnly';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminOnly, setAdminOnly] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://api.notreal003.xyz/manage/users/all", {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setLoading(false);
          setAdminOnly(true);
        }
        setError(err.response?.data?.message || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading users...</p>;
  if (adminOnly) return <AdminOnly />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {users.map((user) => (
        <div key={user._id} className="card bg-base-100 shadow-md p-4 rounded-lg">
          <img
            src={
              user.authType === "discord"
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatarHash}.png`
                : user.avatarHash
            }
            alt={user.username}
            className="w-20 h-20 rounded-full mx-auto"
          />
          <h2 className="text-xl font-semibold text-center mt-2">{user.displayName || user.username}</h2>
          <p className="text-center text-gray-500">{user.email}</p>
          <p className="text-center capitalize text-sm text-gray-400">Auth: {user.authType}</p>
          <p className="text-center text-xs text-gray-400">Joined: {new Date(user.joinedAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminUsers;
