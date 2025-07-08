import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import {
    FaSpinner, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBan, FaShieldAlt
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { MdCancel, MdInfoOutline, MdQuestionAnswer, MdPerson, MdLink } from 'react-icons/md';

// --- Helper Component: PermissionError ---
const PermissionError = ({ message }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="bg-gradient-to-br from-[#1E1E1E] to-[#111] p-10 rounded-2xl shadow-2xl border border-red-500/30">
            <FaShieldAlt className="text-7xl text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-3">Access Denied</h1>
            <p className="text-gray-400 max-w-sm">{message || "You do not have permission to view this request."}</p>
        </div>
    </div>
);

// --- Component: ConfirmationModal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, isActionInProgress }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-70 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700/50">
                <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
                <div className="text-gray-400 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors">Go Back</button>
                    <button onClick={onConfirm} disabled={isActionInProgress} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50">
                        {isActionInProgress ? <FaSpinner className="animate-spin mr-2" /> : <MdCancel className="mr-2" />}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component: StatusIndicator ---
const StatusIndicator = ({ status }) => {
    const statusStyles = {
        PENDING: { icon: FaHourglassHalf, text: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        APPROVED: { icon: FaCheckCircle, text: 'Approved', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        RESOLVED: { icon: FaCheckCircle, text: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        DENIED: { icon: FaTimesCircle, text: 'Denied', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        CANCELLED: { icon: FaBan, text: 'Cancelled', color: 'text-red-500', bg: 'bg-red-600/10 border-red-600/20' },
        ESCALATED: { icon: FaExclamationTriangle, text: 'Escalated', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    };
    const currentStatus = statusStyles[status] || { icon: FaExclamationTriangle, text: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' };
    const Icon = currentStatus.icon;
    return (
        <div className={`flex items-center text-lg font-semibold ${currentStatus.color} ${currentStatus.bg} px-4 py-2 rounded-lg border`}>
            <Icon className="mr-2" />
            <span>{currentStatus.text}</span>
        </div>
    );
};

// --- Component: InfoField ---
const InfoField = ({ label, value, icon }) => {
    const Icon = icon;
    return (
        <div>
            <label className="flex items-center text-sm font-semibold text-gray-400 mb-2"><Icon className="mr-2" />{label}</label>
            <div className="p-3 bg-[#111]/50 rounded-lg border border-gray-700/50 text-gray-300 whitespace-pre-wrap break-words min-h-[44px]">
                {value || <span className="text-gray-500">Not provided</span>}
            </div>
        </div>
    );
};

// --- Component: LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-400">
        <FaSpinner className="animate-spin text-5xl mb-4 text-purple-400" />
        <p className="text-lg tracking-wider">Loading Your Request...</p>
    </div>
);

function RequestDetail() {
    const location = useLocation();
    const requestId = new URLSearchParams(location.search).get('id');
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    const navigate = useNavigate();
    const API = process.env.REACT_APP_API || 'https://api.notreal003.org';

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) {
                setPermissionError("No request ID was found in the URL.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API}/requests/${requestId}`, { withCredentials: true });
                setRequest(response.data);
            } catch (error) {
                setPermissionError(error.response?.data?.message || 'You do not have permission to view this request.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId, API]);

    const handleCancelRequest = async () => {
        setIsCancelling(true);
        const cancelPromise = axios.patch(`${API}/requests/${requestId}/cancel`,
            { status: 'CANCELLED', reviewMessage: 'Self-canceled by the user.' },
            { withCredentials: true }
        );

        toast.promise(cancelPromise, {
            loading: 'Cancelling request...',
            success: 'Request cancelled successfully.',
            error: (err) => err.response?.data?.message || 'Failed to cancel request.',
        });

        try {
            await cancelPromise;
            const response = await axios.get(`${API}/requests/${requestId}`, { withCredentials: true });
            setRequest(response.data);
        } catch (error) {
            // toast handles error
        } finally {
            setIsCancelling(false);
            setShowCancelModal(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (permissionError) return <PermissionError message={permissionError} />;
    if (!request) return <PermissionError message="Could not find the specified request." />;

    const getRequestFields = () => {
        switch (request.type) {
            case 'report': return <InfoField icon={MdLink} label="Evidence/Message Link" value={request.messageLink} />;
            case 'support': return <InfoField icon={MdQuestionAnswer} label="Your Support Query" value={request.messageLink} />;
            case 'guild-application': return <>
                <InfoField icon={MdPerson} label="In-Game Name" value={request.inGameName} />
                <InfoField icon={MdQuestionAnswer} label="Reason for Joining" value={request.messageLink} />
            </>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen w-full text-gray-200 font-sans relative">
            {/* Gradient Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#151515] overflow-hidden">
                <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-700/30 via-pink-600/20 to-transparent blur-3xl animate-spin-slow" />
                <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-indigo-700/20 to-transparent blur-2xl animate-spin-slow-reverse" />
            </div>

            <Toaster position="top-center" toastOptions={{ className: 'bg-gray-800 text-white border border-gray-700' }} />
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelRequest}
                title="Confirm Cancellation"
                isActionInProgress={isCancelling}
            >
                Are you sure you want to cancel this request? This action cannot be reversed.
            </ConfirmationModal>

            <div className="relative z-10 p-4 sm:p-6 lg:p-10 animate-fade-in-up">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 pb-6 border-b border-gray-800/50 bg-black/30 backdrop-blur-md p-6 rounded-2xl shadow-md">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-fade-in-up">
                            Request Status
                        </h1>
                        <p className="text-sm text-gray-400 mt-2">
                            Request ID: <span className="font-mono text-purple-400">{request._id}</span>
                        </p>
                    </div>
                    <button onClick={() => navigate(-1)} className="mt-6 sm:mt-0 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 transition-all duration-300 text-white rounded-lg shadow-lg border border-gray-600/40 flex items-center">
                        <IoMdArrowRoundBack className="mr-2" />
                        Go Back
                    </button>
                </header>

                <main className="max-w-4xl mx-auto">
                    <div className="bg-gray-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/20">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-4 mb-6">
                            <h2 className="text-2xl font-bold text-purple-400 mb-2 sm:mb-0">{request.typeName}</h2>
                            <StatusIndicator status={request.status} />
                        </div>

                        {request.reviewed === 'true' && (
                            <div className="mb-6 bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                                <h3 className="text-lg font-semibold text-purple-300 mb-2">Review</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{request.reviewMessage || `Your request was ${request.status.toLowerCase()}.`}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-300">Your Submitted Information</h3>
                            {getRequestFields()}
                            <InfoField icon={MdInfoOutline} label="Additional Information" value={request.additionalInfo} />
                        </div>

                        {request.status === 'PENDING' && request.reviewed === 'false' && (
                            <div className="text-center pt-6 mt-6 border-t border-gray-800">
                                <p className="text-sm text-gray-500 mb-3">If you made a mistake, you can cancel your request.</p>
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:scale-105 transition-transform duration-300 font-semibold shadow-lg shadow-red-900/30"
                                >
                                    Cancel Request
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }

                @keyframes spin-slow-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow-reverse { animation: spin-slow-reverse 25s linear infinite; }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default RequestDetail;
