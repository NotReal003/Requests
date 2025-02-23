import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import toast, { Toaster } from 'react-hot-toast';
import { MdDelete, MdUpdate } from 'react-icons/md';
import AdminOnly from '../components/AdminOnly';

function AdminDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const API = process.env.REACT_APP_API;

  // State management
  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminOnly, setAdminOnly] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    reviewMessage: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Input sanitization
  const sanitizeInput = useCallback((input) => {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    const normalizeNewlines = (text) => text.replace(/\n{3,}/g, '\n\n');
    
    const sanitized = input
      .replace(/[<>&'"]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#x27;',
        '"': '&quot;'
      }[char] || char));
    
    return normalizeNewlines(urlRegex.test(input) ? input : sanitized);
  }, []);

  // Fetch request data
  const fetchRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/admin/requests/${requestId}`, {
        withCredentials: true,
      });
      
      setRequest(response.data);
      setFormData({
        status: response.data.status,
        reviewMessage: response.data.reviewMessage || ''
      });
    } catch (error) {
      if (error.response?.status === 403) {
        setAdminOnly(true);
      } else {
        toast.error('Failed to load request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [requestId, API]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // Handle form updates
  const handleUpdateAndSendEmail = async () => {
    try {
      const sanitizedMessage = sanitizeInput(formData.reviewMessage);
      const token = localStorage.getItem('jwtToken');

      const updateResponse = await axios.patch(
        `${API}/admin/${requestId}`,
        { ...formData, reviewMessage: sanitizedMessage },
        { withCredentials: true }
      );

      toast.success(updateResponse.data.message || 'Request updated successfully');

      // Send email
      await axios.post(
        `${API}/admin/send/email`,
        {
          requestId,
          reviewMessage: sanitizedMessage,
          status: formData.status,
          username: request.username,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Email notification sent');
      fetchRequest(); // Refresh data
    } catch (error) {
      if (error.response?.status === 403) {
        setAdminOnly(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to update request');
      }
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/admin/${requestId}`, {
        withCredentials: true,
      });
      toast.success('Request deleted successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to delete request');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Loading and authorization states
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (adminOnly) return <AdminOnly />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Toaster position="top-center" />
      
      <div className="card shadow-lg bg-base-100">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-2xl">
              Request Details 
              <span className="badge badge-outline ml-2">{formData.status}</span>
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-circle"
              title="Go Back"
            >
              <IoMdArrowRoundBack size={24} />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="form-control">
              <label className="label font-medium">Review Message</label>
              <textarea
                value={formData.reviewMessage}
                onChange={(e) => {
                  setFormData({ ...formData, reviewMessage: e.target.value });
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="textarea textarea-bordered h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your review message"
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-control">
              <label className="label font-medium">Status</label>
              <select
                className="select select-bordered w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {['APPROVED', 'DENIED', 'PENDING', 'RESUBMIT_REQUIRED', 'CANCELLED', 'RESOLVED']
                  .map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
              </select>
            </div>

            {/* Request Details */}
            <div className="form-control">
              <label className="label font-medium">Submitted By</label>
              <input
                value={`${request.username} (ID: ${request.id})`}
                readOnly
                className="input input-bordered bg-gray-100"
              />
            </div>

            {/* Dynamic fields based on request type */}
            {request.type === 'report' && (
              <div className="form-control">
                <label className="label font-medium">Evidence Link</label>
                <input
                  value={request.messageLink}
                  readOnly
                  className="input input-bordered bg-gray-100"
                />
              </div>
            )}

            {request.type === 'support' && (
              <div className="form-control">
                <label className="label font-medium">Support Request</label>
                <textarea
                  value={request.messageLink}
                  readOnly
                  className="textarea textarea-bordered bg-gray-100"
                />
              </div>
            )}

            {request.type === 'guild-application' && (
              <>
                <div className="form-control">
                  <label className="label font-medium">In-Game Name</label>
                  <input
                    value={request.inGameName}
                    readOnly
                    className="input input-bordered bg-gray-100"
                  />
                </div>
                <div className="form-control">
                  <label className="label font-medium">Reason for Joining</label>
                  <textarea
                    value={request.messageLink}
                    readOnly
                    className="textarea textarea-bordered bg-gray-100"
                  />
                </div>
              </>
            )}

            {request.additionalInfo && (
              <div className="form-control">
                <label className="label font-medium">Additional Information</label>
                <textarea
                  value={request.additionalInfo}
                  readOnly
                  className="textarea textarea-bordered bg-gray-100"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleUpdateAndSendEmail}
              className="btn btn-primary flex-1 flex items-center gap-2"
            >
              <MdUpdate size={20} /> Update & Notify
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error btn-outline flex-1 flex items-center gap-2"
            >
              <MdDelete size={20} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this request? This action is irreversible.</p>
            <div className="modal-action flex gap-4">
              <button
                onClick={handleDelete}
                className="btn btn-error flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDetail;
