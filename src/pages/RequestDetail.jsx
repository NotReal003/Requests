import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaSpinner, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBan, FaShieldAlt } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { MdCancel, MdInfoOutline, MdQuestionAnswer, MdPerson, MdLink } from 'react-icons/md';

// --- Helper Component: PermissionError ---
// Replaces the confusing use of AdminOnly for user-facing errors.
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
        PENDING: { icon: FaHourglassHalf, text: 'Pending Review', color: 'text-yellow-400' },
        APPROVED: { icon: FaCheckCircle, text: 'Approved', color: 'text-green-400' },
        RESOLVED: { icon: FaCheckCircle, text: 'Resolved', color: 'text-green-400' },
        DENIED: { icon: FaTimesCircle, text: 'Denied', color: 'text-red-400' },
        CANCELLED: { icon: FaBan, text: 'Cancelled', color: 'text-red-500' },
        ESCALATED: { icon: FaExclamationTriangle, text: 'Escalated', color: 'text-orange-400' },
    };
    const currentStatus = statusStyles[status] || { icon: FaExclamationTriangle, text: 'Unknown', color: 'text-gray-400' };
    const Icon = currentStatus.icon;
    return (
        <div className={`flex items-center text-lg font-semibold ${currentStatus.color}`}>
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
            <label className="flex items-center text-sm font-semibold text-gray-400 mb-1"><Icon className="mr-2" />{label}</label>
            <div className="p-3 bg-[#2a2a2a]/50 rounded-lg border border-gray-700/50 text-gray-300 whitespace-pre-wrap break-words min-h-[44px]">
                {value || <span className="text-gray-500">Not provided</span>}
            </div>
        </div>
    );
};

// --- Component: LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <FaSpinner className="animate-spin text-5xl mb-4" />
        <p>Loading Your Request...</p>
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
        // Refetch data to show updated status
        const response = await axios.get(`${API}/requests/${requestId}`, { withCredentials: true });
        setRequest(response.data);
    } catch (error) {
        // Toast already handled the error message
    } finally {
        setIsCancelling(false);
        setShowCancelModal(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (permissionError) return <PermissionError message={permissionError} />;
  if (!request) return <PermissionError message="Could not find the specified request." />;

  const getRequestFields = () => {
    switch(request.type) {
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
    <div className="min-h-screen bg-black text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#1a0c2e] opacity-50 z-0"></div>
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

        <div className="container mx-auto max-w-4xl relative z-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold text-white">Your Request Status</h1>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/80 transition-colors flex items-center border border-gray-700/50">
                    <IoMdArrowRoundBack className="mr-2" /> Back
                </button>
            </div>

            <div className="bg-[#1a1a1a]/50 p-6 sm:p-8 rounded-2xl border border-gray-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-purple-400 mb-2 sm:mb-0">{request.typeName}</h2>
                    <StatusIndicator status={request.status} />
                </div>

                {request.reviewed === 'true' && (
                    <div className="mb-6 bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                        <h3 className="text-lg font-semibold text-purple-300 mb-2">Staff Review</h3>
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
                        <p className="text-sm text-gray-500 mb-2">If you made a mistake, you can cancel your request.</p>
                        <button 
                            onClick={() => setShowCancelModal(true)} 
                            className="px-6 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors font-semibold"
                        >
                            Cancel Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

export default RequestDetail;
