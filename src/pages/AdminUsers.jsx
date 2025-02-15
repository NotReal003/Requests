import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaUserShield, FaUser, FaSpinner } from "react-icons/fa";
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
    const roleStyle = roleInfo[role]?.className || "bg-gray-600 text-white";
    return (
        <span className={`rounded-lg px-2 py-1 text-xs font-bold ${roleStyle}`}>
            {role.toUpperCase()}
        </span>
    );
};

const UserIcon = ({ role }) => {
    const { Icon, title } = roleInfo[role] || { Icon: FaUser, title: "User" };
    return <Icon className="text-4xl mr-4" title={title} />;
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminOnly, setAdminOnly] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [userList, setUserList] = useState([]);
    const API = process.env.REACT_APP_API;
    const [currentDetailRequestId, setCurrentDetailRequestId] = useState(null);  //For Abort

    // Fetch all users (only once)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API}/manage/users/all`, { withCredentials: true });
                const mappedUsers = Object.values(response.data.users).map((user) => ({
                    ...user,
                    role: user.admin ? "admin" : user.staff ? "moderator" : "user",
                }));
                setUserList(mappedUsers); // Store the mapped users
                setUsers(mappedUsers);    // and also set them to the 'users' state
            } catch (error) {
                if (error.response?.status === 403) {
                    setAdminOnly(true);
                } else {
                    setError("Failed to fetch users: " + (error.response?.data?.message || error.message));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [API]);


    // Debounced fetch user details
    const fetchUserDetails = useCallback(async (id) => {
        if (loadingDetails) return; // Prevent multiple requests
        setLoadingDetails(true);
        setDetailsError(null);

        // Abort previous request, if any
        if (currentDetailRequestId) {
            currentDetailRequestId.abort();
        }

        const controller = new AbortController();  // Create AbortController
        setCurrentDetailRequestId(controller);


        try {
            const response = await axios.get(`${API}/manage/user/${id}`, {
                withCredentials: true,
                signal: controller.signal // Pass the signal to axios
            });
            setSelectedUser(response.data.user);
            toast.success("User details loaded");
        } catch (error) {
            if (axios.isCancel(error)) {
                 // Request was aborted, do nothing
            } else {
                setDetailsError("Failed to fetch user details: " + (error.response?.data?.message || error.message));
                toast.error(detailsError);
                console.error("Failed to fetch user details:", error);
            }
        } finally {
            setLoadingDetails(false);
            setCurrentDetailRequestId(null); // Reset request ID
        }
    }, [API, loadingDetails, detailsError, currentDetailRequestId]);

    const handleCloseDetails = () => {
        setSelectedUser(null);
        setDetailsError(null);  // Clear error when closing
        // No need to abort here;  closing implies we don't care about the result anymore.
    };


    if (adminOnly) return <AdminOnly />;

    return (
        <div
            className="flex flex-col items-center justify-center max-w-md md:max-w-lg mx-auto min-h-screen p-4 shadow-lg"
            role="main"
        >
            <h1 className="text-2xl font-bold mb-4">Users</h1>

            {selectedUser ? (
                <div className="w-full max-w-3xl bg-gray-800 p-4 rounded-lg shadow-lg text-white">
                    <h2 className="text-xl font-bold mb-2" id="user-details-heading">
                        {selectedUser.username}'s Details
                    </h2>
                    {loadingDetails ? (
                        <div className="flex items-center justify-center space-x-2">
                            <FaSpinner className="animate-spin inline-block align-middle mr-2" />
                            <p>Loading details...</p>
                        </div>
                    ) : detailsError ? (
                        <p className="text-red-500">{detailsError}</p>
                    ) : (
                        <>
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
                            <button
                                className="btn mt-4 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br font-medium rounded-lg no-animation"
                                onClick={handleCloseDetails}
                                aria-label="Close user details"
                            >
                                <IoMdArrowRoundBack className="mr-2" /> Close Details
                            </button>
                        </>
                    )}
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
                    ) : userList.length > 0 ? (
                        userList.map((user) => (
                            <div
                                key={user.id}
                                className="flex flex-col bg-gray-800 p-4 rounded-lg shadow-lg text-white cursor-pointer hover:bg-gray-700 transition-colors duration-200 active:bg-gray-600"
                                onClick={() => fetchUserDetails(user.id)}
                                role="listitem"
                                aria-labelledby={`user-${user.id}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <UserIcon role={user.role} />
                                        <div>
                                            <h2 className="text-md font-bold" id={`user-${user.id}`}>
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
