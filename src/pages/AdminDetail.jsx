import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { MdDelete, MdUpdate, MdContentCopy, MdArrowBack, MdInfoOutline, MdQuestionAnswer, MdPerson, MdLink } from 'react-icons/md';
import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { ImSpinner6 } from 'react-icons/im';
import AdminOnly from '../components/AdminOnly';
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

// --- Component: RequestInfoField ---
const RequestInfoField = ({ icon, label, value }) => (
    <div>
        <label className="flex items-center text-sm font-semibold text-gray-400 mb-1">
            {icon} {label}
        </label>
        <div className="p-3 bg-[#2a2a2a]/50 rounded-lg border border-gray-700/50 text-gray-300 whitespace-pre-wrap break-words">
            {value || <span className="text-gray-500">Not provided</span>}
        </div>
    </div>
);

// --- Component: LoadingSpinner ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-gray-400">
        <ImSpinner6 className="animate-spin text-5xl mb-4" />
        <p>Loading Request Details...</p>
    </div>
);

const AdminDetail = () => {
  const location = useLocation();
  const requestId = new URLSearchParams(location.search).get('id');
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminOnly, setAdminOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API || 'https://api.notreal003.org';

  const sanitizeInput = (input) => {
    return input.replace(/[<>&'"]/g, (char) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;'
    }[char] || char));
  };
  
  const fetchRequest = useCallback(async () => {
    if (!requestId) {
        toast.error("No request ID provided.");
        navigate(-1);
        return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/requests/${requestId}`, { withCredentials: true });
      setRequest(response.data);
      setStatus(response.data.status);
      setReviewMessage(response.data.reviewMessage || '');
    } catch (error) {
      if (error.response?.status === 403) setAdminOnly(true);
      else {
        toast.error('Failed to load request details.');
        navigate(-1);
      }
    } finally {
      setLoading(false);
    }
  }, [requestId, API, navigate]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleUpdateAndSendEmail = async () => {
    const sanitizedReviewMessage = sanitizeInput(reviewMessage);
    const updatePromise = axios.patch(`${API}/admin/${requestId}`, 
        { status, reviewMessage: sanitizedReviewMessage }, 
        { withCredentials: true }
    );

    toast.promise(updatePromise, {
        loading: 'Updating request...',
        success: (res) => {
            // Trigger email sending after successful update
            sendEmail(res.data.username);
            return res.data.message || 'Request updated successfully!';
        },
        error: (err) => err.response?.data?.message || 'Error updating request.',
    });
  };

  const sendEmail = async (username) => {
      const emailPromise = axios.post(`${API}/admin/send/email`, {
          requestId,
          reviewMessage,
          status,
          username: username || request.username,
      }, { withCredentials: true });

      toast.promise(emailPromise, {
          loading: 'Sending notification email...',
          success: 'Email notification sent!',
          error: 'Failed to send email.',
      });
  }

  const handleCopy = () => {
    const textToCopy = `Your Application has been approved and we have invited ${request?.inGameName || request?.username} to the NETFLIX Guild :)\n\nReviewer,\nNotReal003, Leader\nNETFLIX Guild.`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success('Accepted message copied!'))
      .catch(err => toast.error('Failed to copy message.'));
  };

  const handleBlockCopy = () => {
    const textToCopy = `We strongly advise against submitting fraudulent applications, as doing so may result in the suspension of your account from our services due to misuse of our request system.\n\nReviewer,\nNotReal003, Leader\nNETFLIX Guild.`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success('Warning message copied!'))
      .catch(err => toast.error('Failed to copy message.'));
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    const deletePromise = axios.delete(`${API}/admin/${requestId}`, { withCredentials: true });
    
    toast.promise(deletePromise, {
        loading: 'Deleting request...',
        success: () => {
            navigate('/admin');
            return 'Request deleted successfully.';
        },
        error: 'Error deleting request.',
    });
  };

  if (loading) return <LoadingSpinner />;
  if (adminOnly) return <AdminOnly />;
  if (!request) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-red-400">
            <FaExclamationTriangle className="text-5xl mb-4"/>
            <p>Could not load request details.</p>
        </div>
    );
  }

  const getRequestFields = () => {
      switch(request.type) {
          case 'report':
              return <RequestInfoField icon={<MdLink className="mr-2"/>} label="Evidence/Message Link" value={request.messageLink} />;
          case 'support':
              return <RequestInfoField icon={<MdQuestionAnswer className="mr-2"/>} label="Support Query" value={request.messageLink} />;
          case 'guild-application':
              return <>
                  <RequestInfoField icon={<MdPerson className="mr-2"/>} label="In-Game Name" value={request.inGameName} />
                  <RequestInfoField icon={<MdQuestionAnswer className="mr-2"/>} label="Reason for Joining" value={request.messageLink} />
              </>;
          default:
              return null;
      }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black to-[#1a0c2e] opacity-50 z-0"></div>
        <Toaster position="top-center" toastOptions={{ className: 'bg-gray-800 text-white border border-gray-700' }} />
        <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Confirm Deletion">
            Are you sure you want to delete this request? This action cannot be undone.
        </ConfirmationModal>

        <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white">Request Details</h1>
                    <p className="text-gray-400 mt-1">Reviewing request ID: <span className="font-mono text-purple-400">{request._id}</span></p>
                </div>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/80 transition-colors flex items-center border border-gray-700/50">
                    <MdArrowBack className="mr-2" /> Back to List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Request Info */}
                <div className="lg:col-span-2 bg-[#1a1a1a]/30 p-6 rounded-xl border border-gray-800/50 space-y-4">
                    <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Submitted Information</h3>
                    <RequestInfoField icon={<MdPerson className="mr-2"/>} label="Submitted By" value={`${request.username} (${request.id})`} />
                    {getRequestFields()}
                    <RequestInfoField icon={<MdInfoOutline className="mr-2"/>} label="Additional Info" value={request.additionalInfo} />
                </div>

                {/* Right Column: Admin Actions */}
                <div className="lg:col-span-3 bg-[#1a1a1a]/50 p-6 rounded-xl border border-gray-800/50 space-y-6">
                    <h3 className="text-2xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Admin Review</h3>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Request Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="DENIED">Denied</option>
                            <option value="ESCALATED">Escalated</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Review Message (sent to user)</label>
                        <textarea
                            value={reviewMessage}
                            onChange={(e) => setReviewMessage(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[120px] resize-y"
                            placeholder="Enter your review message..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <button onClick={handleUpdateAndSendEmail} className="w-full p-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors font-bold flex items-center justify-center">
                            <MdUpdate className="mr-2" /> Update & Send Email
                        </button>
                        <button onClick={handleCopy} className="w-full p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors font-bold flex items-center justify-center">
                            <MdContentCopy className="mr-2" /> Copy Accepted Msg
                        </button>
                        <button onClick={handleBlockCopy} className="w-full p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/70 transition-colors font-bold flex items-center justify-center">
                            <MdContentCopy className="mr-2" /> Copy Warning Msg
                        </button>
                    </div>

                     <div className="text-center">
                        <button onClick={() => setShowDeleteModal(true)} className="text-red-500/70 hover:text-red-500 hover:underline transition-colors text-sm font-semibold flex items-center justify-center mx-auto">
                            <MdDelete className="mr-1.5" /> Delete This Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default AdminDetail;
