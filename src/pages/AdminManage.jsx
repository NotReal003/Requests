import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaUserSlash, FaUserCheck, FaShieldAlt, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { ImSpinner6 } from "react-icons/im";
import AdminOnly from '../components/AdminOnly';

// --- Helper Component: AdminOnly Placeholder ---
// --- Component: ConfirmationModal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700/50">
                <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
                <div className="text-gray-400 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    );
};

// --- Component: Skeleton Loader ---
const TableSkeleton = ({ columns, rows = 5 }) => (
    <div className="space-y-2 animate-pulse">
        <div className="flex justify-between p-4 bg-gray-800/50 rounded-t-lg">
            {columns.map((col, i) => <div key={i} className="h-4 bg-gray-700 rounded w-1/4"></div>)}
        </div>
        {[...Array(rows)].map((_, i) => (
             <div key={i} className="flex justify-between items-center p-4 bg-[#1c1c1c]/50">
                {columns.map((col, j) => <div key={j} className="h-4 bg-gray-700 rounded w-1/4"></div>)}
            </div>
        ))}
    </div>
);


// --- Manage Users Panel ---
const ManageUsersPanel = ({ api, onAction, adminOnly, setAdminOnly }) => {
    const [myBlockUser, setMyBlockUser] = useState('');
    const [myBlockReason, setMyBlockReason] = useState('');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [userToUnblock, setUserToUnblock] = useState(null); // For modal

    const fetchBlockedUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${api}/users/blocks`, { withCredentials: true });
            const blocked = response.data.filter((user) => user.blocked === "YES");
            setBlockedUsers(blocked);
        } catch (err) {
            if (err.response?.status === 403) setAdminOnly(true);
            else setError(err.response?.data?.message || 'Failed to fetch blocked users.');
        } finally {
            setLoading(false);
        }
    }, [api, setAdminOnly]);

    useEffect(() => {
        fetchBlockedUsers();
    }, [fetchBlockedUsers]);

    const handleBlockUser = async (e) => {
        e.preventDefault();
        onAction(async () => {
            if (!myBlockUser || !myBlockReason) {
                toast.error('User ID and reason are required.');
                return Promise.reject();
            }
            await axios.post(`${api}/users/block/add`, { myBlockUser, myBlockReason }, { withCredentials: true });
            setMyBlockUser('');
            setMyBlockReason('');
            fetchBlockedUsers();
        }, {
            loading: 'Blocking user...',
            success: 'User blocked successfully!',
            error: (err) => err.response?.data?.message || 'Error blocking user.',
        });
    };
    
    const handleUnblockUser = () => {
        if (!userToUnblock) return;
        onAction(async () => {
            await axios.put(`${api}/users/unblock`, { myBlockUser: userToUnblock.user_id }, { withCredentials: true });
            fetchBlockedUsers();
        }, {
            loading: `Unblocking ${userToUnblock.user_id}...`,
            success: 'User unblocked successfully!',
            error: (err) => err.response?.data?.message || 'Error unblocking user.',
        });
        setUserToUnblock(null); // Close modal
    };
    
    const filteredUsers = useMemo(() => 
        blockedUsers.filter(user => 
            user.user_id.toLowerCase().includes(search.toLowerCase()) || 
            user.reason.toLowerCase().includes(search.toLowerCase())
        ), [blockedUsers, search]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ConfirmationModal
                isOpen={!!userToUnblock}
                onClose={() => setUserToUnblock(null)}
                onConfirm={handleUnblockUser}
                title="Confirm Unblock"
            >
                <p>Are you sure you want to unblock user <strong>{userToUnblock?.user_id}</strong>?</p>
                <p className="text-sm mt-2 text-gray-500">Reason for block: {userToUnblock?.reason}</p>
            </ConfirmationModal>

            {/* Block User Form */}
            <div className="lg:col-span-1 bg-[#1a1a1a]/50 p-6 rounded-xl border border-gray-800/50">
                <h3 className="text-2xl font-bold mb-4 text-white">Block a User</h3>
                <form onSubmit={handleBlockUser} className="space-y-4">
                    <input type="text" placeholder="Enter user ID" value={myBlockUser} onChange={(e) => setMyBlockUser(e.target.value)} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <input type="text" placeholder="Enter reason for block" value={myBlockReason} onChange={(e) => setMyBlockReason(e.target.value)} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <button type="submit" className="w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center">
                        <FaUserSlash className="mr-2" /> Block User
                    </button>
                </form>
            </div>

            {/* Blocked Users List */}
            <div className="lg:col-span-2 bg-[#1a1a1a]/30 p-6 rounded-xl border border-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Blocked Users ({filteredUsers.length})</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 pl-10 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    </div>
                </div>
                 {loading ? <TableSkeleton columns={['User ID', 'Reason', 'Action']} /> : error ? <div className="text-red-400">{error}</div> :
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50"><tr><th className="p-3">User ID</th><th className="p-3">Reason</th><th className="p-3 text-right">Action</th></tr></thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="border-b border-gray-800 hover:bg-[#2a2a2a]/50">
                                        <td className="p-3 font-mono">{user.user_id}</td>
                                        <td className="p-3">{user.reason}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => setUserToUnblock(user)} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/40 transition-colors text-sm font-semibold flex items-center">
                                                <FaUserCheck className="mr-1.5" /> Unblock
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <p className="text-center py-8 text-gray-500">No blocked users found.</p>}
                    </div>
                }
            </div>
        </div>
    );
};

// --- Manage IPs Panel ---
const ManageIpsPanel = ({ api, onAction, adminOnly, setAdminOnly }) => {
    const [ipAddress, setIpAddress] = useState('');
    const [reason, setReason] = useState('');
    const [bannedIps, setBannedIps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ipToUnban, setIpToUnban] = useState(null); // For modal

    const fetchBannedIps = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${api}/ip/banned`, { withCredentials: true });
            setBannedIps(response.data);
        } catch (err) {
            if (err.response?.status === 403) setAdminOnly(true);
            else setError(err.response?.data?.message || 'Failed to fetch IPs.');
        } finally { setLoading(false); }
    }, [api, setAdminOnly]);

    useEffect(() => { fetchBannedIps(); }, [fetchBannedIps]);
    
    const handleBanIp = async (e) => {
        e.preventDefault();
        onAction(async () => {
            if (!ipAddress || !reason) {
                toast.error('IP address and reason are required.');
                return Promise.reject();
            }
            await axios.post(`${api}/ip/ban`, { ipAddress, reason }, { withCredentials: true });
            setIpAddress('');
            setReason('');
            fetchBannedIps();
        }, {
            loading: 'Banning IP...',
            success: 'IP banned successfully.',
            error: (err) => err.response?.data?.message || 'Error banning IP.',
        });
    };

    const handleUnbanIp = () => {
        if (!ipToUnban) return;
        onAction(async () => {
            await axios.delete(`${api}/ip/unban`, { data: { ipAddress: ipToUnban.ipAddress }, withCredentials: true });
            fetchBannedIps();
        }, {
            loading: `Unbanning ${ipToUnban.ipAddress}...`,
            success: 'IP unbanned successfully.',
            error: (err) => err.response?.data?.message || 'Error unbanning IP.',
        });
        setIpToUnban(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <ConfirmationModal
                isOpen={!!ipToUnban}
                onClose={() => setIpToUnban(null)}
                onConfirm={handleUnbanIp}
                title="Confirm Unban IP"
            >
                <p>Are you sure you want to unban the IP address <strong>{ipToUnban?.ipAddress}</strong>?</p>
                <p className="text-sm mt-2 text-gray-500">Reason for ban: {ipToUnban?.reason}</p>
            </ConfirmationModal>

            {/* Ban IP Form */}
            <div className="lg:col-span-1 bg-[#1a1a1a]/50 p-6 rounded-xl border border-gray-800/50">
                <h3 className="text-2xl font-bold mb-4 text-white">Ban an IP Address</h3>
                <form onSubmit={handleBanIp} className="space-y-4">
                    <input type="text" placeholder="Enter IP address" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <input type="text" placeholder="Enter reason for ban" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <button type="submit" className="w-full p-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center">
                       <FaShieldAlt className="mr-2" /> Ban IP
                    </button>
                </form>
            </div>

            {/* Banned IPs List */}
            <div className="lg:col-span-2 bg-[#1a1a1a]/30 p-6 rounded-xl border border-gray-800/50">
                <h3 className="text-2xl font-bold mb-4 text-white">Banned IPs ({bannedIps.length})</h3>
                {loading ? <TableSkeleton columns={['IP Address', 'Reason', 'Action']} /> : error ? <div className="text-red-400">{error}</div> :
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/50"><tr><th className="p-3">IP Address</th><th className="p-3">Reason</th><th className="p-3 text-right">Action</th></tr></thead>
                            <tbody>
                                {bannedIps.map((ip) => (
                                    <tr key={ip.ipAddress} className="border-b border-gray-800 hover:bg-[#2a2a2a]/50">
                                        <td className="p-3 font-mono">{ip.ipAddress}</td>
                                        <td className="p-3">{ip.reason}</td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => setIpToUnban(ip)} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/40 transition-colors text-sm font-semibold">Unban</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bannedIps.length === 0 && <p className="text-center py-8 text-gray-500">No banned IPs found.</p>}
                    </div>
                }
            </div>
        </div>
    );
}

// --- Main Component ---
const AdminManagePage = () => {
  const [tab, setTab] = useState('users');
  const [adminOnly, setAdminOnly] = useState(false);
  const API = process.env.REACT_APP_API || 'https://api.notreal003.xyz';

  const handleAction = async (action, messages) => {
    try {
        await toast.promise(action(), messages);
    } catch (error) {
        // Errors are handled by individual toast messages in the action.
    }
  };

  if (adminOnly) {
    return <AdminOnly />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#1a0c2e] opacity-50 z-0"></div>
        <Toaster position="top-center" toastOptions={{ className: 'bg-gray-800 text-white border border-gray-700' }} />
        
        <div className="container mx-auto max-w-7xl relative z-10">
            <h1 className="text-4xl font-bold text-white mb-2">Management Panel</h1>
            <p className="text-gray-400 mb-8">Block malicious users and ban IP addresses to protect the platform.</p>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-800 mb-8">
                <button
                    className={`px-6 py-3 font-semibold transition-colors ${tab === 'users' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
                    onClick={() => setTab('users')}>Manage Users</button>
                <button
                    className={`px-6 py-3 font-semibold transition-colors ${tab === 'ips' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}
                    onClick={() => setTab('ips')}>Manage IPs</button>
            </div>

            {tab === 'users' ? 
                <ManageUsersPanel api={API} onAction={handleAction} adminOnly={adminOnly} setAdminOnly={setAdminOnly} /> : 
                <ManageIpsPanel api={API} onAction={handleAction} adminOnly={adminOnly} setAdminOnly={setAdminOnly} />
            }
        </div>
    </div>
  );
};

export default AdminManagePage;
