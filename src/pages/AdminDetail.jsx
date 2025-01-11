import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import toast, { Toaster } from 'react-hot-toast';
import { MdDelete, MdUpdate } from 'react-icons/md';
import AdminOnly from '../components/AdminOnly';

function AdminDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const [request, setRequest] = useState(null);
  const [alert, setAlert] = useState(null);
  const [status, setStatus] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminOnly, setAdminOnly] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const sanitizeInput = (input) => {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;

    const normalizeNewlines = (text) => text.replace(/\n{2,}/g, '\n');

    const sanitizeHtml = (text) =>
      text.replace(/[<>&'"]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&#39;';
          case '"': return '&quot;';
          default: return char;
        }
      });

    const sanitizedInput = urlRegex.test(input) ? sanitizeHtml(input) : sanitizeHtml(input);

    return normalizeNewlines(sanitizedInput);
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axios.get(`${API}/admin/requests/${requestId}`, {
          withCredentials: true,
        });

        // Success case
        setRequest(response.data);
        setStatus(response.data.status);
        setReviewMessage(response.data.reviewMessage || '');
      } catch (error) {
        const errorStatus = error.response?.status;

        if (errorStatus === 403) {
          setAdminOnly(true);
        } else {
          toast.warn('Something went wrong, please try again later');
        }
      }
    };

    fetchRequest();
  }, [requestId, API, navigate]);

  const handleUpdateAndSendEmail = async () => {

    const sanitizedReviewMessage = sanitizeInput(reviewMessage);
    try {
      const token = localStorage.getItem('jwtToken');

      const updateResponse = await axios.patch(
        `${API}/admin/${requestId}`,
        { status, reviewMessage: sanitizedReviewMessage },
        { withCredentials: true }
      );

      if (updateResponse.status === 200) {
        toast.success(updateResponse.data.message || 'Request Updated Successfully.');

        // Send the email
        const emailResponse = await axios.post(
          `${API}/admin/send/email`,
          {
            requestId,
            reviewMessage,
            status,
            username: request.username,
          },
          { headers: { Authorization: `${token}` } }
        );

        if (emailResponse.status === 200) {
          toast.success('Updated user on email :)');
        } else {
          toast.error('Unable to send email :/');
        }
      } else {
        toast.error(updateResponse.data.message || 'Request was updated but something might have gone wrong.');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setAdminOnly(true);
        setAlert(null);
      } else if (error.response) {
        toast.error(error.response.data.message || 'Error updating the request.');
        setAlert(error.response.data.message || 'Error updating the request.');
      } else {
        toast.error('Something is wrong :/');
      }
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      await axios.delete(`${API}/admin/${requestId}`, {
        withCredentials: true,
      });
      toast.success('Request deleted successfully.');
      navigate('/');
    } catch (error) {
      toast.error('Error deleting the request.');
    }
    setShowDeleteModal(false);
  };

  if (!request && adminOnly) {
    return <AdminOnly />;
  }

  if (!request) {
    return (
      <div className="flex w-52 flex-col gap-4 container mx-auto px-4 py-8">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-6 w-30"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {alert && (
        <div className={`alert alert-${alert.type} shadow-lg mb-4`}>
          <div>
            <span>{alert.message}</span>
          </div>
        </div>
      )}
      <div className="card p-2 shadow-lg bg-base-100">
        <div className="card-body">
          <h2 className="card-title">Request Details ({request.status})</h2>
          <div className="form-control">
            <label className="label">Review Message</label>
            <textarea
              value={reviewMessage}
              onChange={(e) => {
                setReviewMessage(e.target.value);
                e.target.style.height = "auto"; // 
                e.target.style.height = `${e.target.scrollHeight}px`; //
              }}
              className="textarea text-white textarea-bordered bg-orange-600 focus:outline-none"
              placeholder="Enter your review message"
              style={{ overflow: "hidden", resize: "none" }} //
            />

          </div>
          <div className="form-control">
            <label className="label">Request Status</label>
            <select
              className="select select-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
              <option value="PENDING">Pending</option>
              <option value="RESUBMIT_REQUIRED">Resubmit Required</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">From User</label>
            <textarea
              value={`${request.username} / ${request.id}`}
              readOnly
              className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          {request.type === 'report' && (
            <div className="form-control">
              <label className="label">Discord Message Link / Evidence (required)</label>
              <textarea
                value={request.messageLink}
                readOnly
                className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}
          {request.type === 'support' && (
            <div className="form-control">
              <label className="label">Your support request (required)</label>
              <textarea
                value={request.messageLink}
                readOnly
                className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}
          {request.type === 'guild-application' && (
            <div className="form-control">
              <label className="label">In-Game Name (required)</label>
              <textarea
                value={request.inGameName}
                readOnly
                className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}
          {request.type === 'guild-application' && (
            <div className="form-control">
              <label className="label">Reason for joining the guild? (required)</label>
              <textarea
                value={request.messageLink}
                readOnly
                className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}
          <div className="form-control">
            <label className="label">Anything else you would like to add?</label>
            <textarea
              value={request.additionalInfo}
              readOnly
              className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div className="form-control mt-4">
            <button onClick={handleUpdateAndSendEmail} className="btn no-animation bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-blue-700 transition-all">
              <MdUpdate /> Update Request & Send Email
            </button>
          </div>
          <div className="form-control mt-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-outline hover:btn-error no-animation"
            >
              <MdDelete /> Delete Request
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <button className="btn no-animation bg-purple-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-purple-700 transition-all" onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack /> Back
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p>Are you sure you want to delete this request? This action cannot be undone.</p>
            <div className="modal-action">
              <button onClick={handleDelete} className="btn no-animation bg-red-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-red-700 transition-all">
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn no-animation bg-purple-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-purple-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}

export default AdminDetail;
