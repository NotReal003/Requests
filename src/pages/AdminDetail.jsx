// AdminDetail.jsx
import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdDelete, MdUpdate } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import AdminOnly from '../components/AdminOnly';

// Constants (single-line to avoid parsing issues)
const STATUS_OPTIONS = ['APPROVED', 'DENIED', 'PENDING', 'RESUBMIT_REQUIRED', 'CANCELLED', 'RESOLVED'];
const REQUEST_TYPES = { REPORT: 'report', SUPPORT: 'support', GUILD: 'guild-application' };

// Utility Functions
const sanitizeInput = function(input) {
  if (!input) return '';
  const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
  if (urlRegex.test(input)) return input;
  return input
    .replace(/[<>&'"]/g, (char) => ({ '<': '<', '>': '>', '&': '&', "'": '', '"': '"' }[char] || char))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AdminDetail = function() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const API = process.env.REACT_APP_API || '';

  const [state, setState] = useState({
    request: null,
    status: '',
    reviewMessage: '',
    isLoading: false,
    error: null,
    showDeleteModal: false,
    isAdminOnly: false
  });

  const fetchRequest = useCallback(async function() {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.get(`${API}/admin/requests/${requestId}`, { withCredentials: true });
      setState(prev => ({
        ...prev,
        request: response.data,
        status: response.data.status || '',
        reviewMessage: response.data.reviewMessage || '',
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data.message || 'Network error occurred'
        : 'Unexpected error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAdminOnly: axios.isAxiosError(error) && error.response?.status === 403,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  }, [requestId, API]);

  const handleUpdateAndSendEmail = useCallback(async function() {
    if (!state.status) {
      toast.error('Please select a status');
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const sanitizedMessage = sanitizeInput(state.reviewMessage);
    try {
      const token = localStorage.getItem('jwtToken');
      const updateResponse = await axios.patch(
        `${API}/admin/${requestId}`,
        { status: state.status, reviewMessage: sanitizedMessage },
        { withCredentials: true }
      );
      await axios.post(
        `${API}/admin/send/email`,
        {
          requestId,
          reviewMessage: sanitizedMessage,
          status: state.status,
          username: state.request?.username,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request updated and email sent successfully');
      setState(prev => ({ ...prev, isLoading: false }));
      fetchRequest();
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data.message || 'Failed to update request'
        : 'Unexpected error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast.error(errorMessage);
    }
  }, [API, requestId, state.status, state.reviewMessage, state.request?.username, fetchRequest]);

  const handleDelete = useCallback(async function() {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await axios.delete(`${API}/admin/${requestId}`, { withCredentials: true });
      toast.success('Request deleted successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to delete request');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [API, requestId, navigate]);

  useEffect(function() {
    fetchRequest();
  }, [fetchRequest]);

  const renderRequestFields = useCallback(function() {
    if (!state.request) return null;
    const fieldsConfig = {
      [REQUEST_TYPES.REPORT]: { label: 'Discord Message Link / Evidence', value: state.request.messageLink },
      [REQUEST_TYPES.SUPPORT]: { label: 'Support Request', value: state.request.messageLink },
      [REQUEST_TYPES.GUILD]: [
        { label: 'In-Game Name', value: state.request.inGameName },
        { label: 'Reason for Joining', value: state.request.messageLink }
      ]
    };
    const fields = fieldsConfig[state.request.type];
    if (!fields) return null;
    return Array.isArray(fields)
      ? fields.map((field, index) => <ReadonlyField key={index} label={field.label} value={field.value} />)
      : <ReadonlyField label={fields.label} value={fields.value} />;
  }, [state.request]);

  if (state.isAdminOnly) return <AdminOnly />;
  if (!state.request && state.isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      {state.error && (
        <div className="alert alert-error shadow-lg mb-6 rounded-lg">
          <span>{state.error}</span>
        </div>
      )}
      <div className="card shadow-lg bg-base-100 rounded-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            Request Details {state.request?.status && (
              <span className="text-sm opacity-75">({state.request.status})</span>
            )}
          </h2>
          <TextAreaField
            label="Review Message"
            value={state.reviewMessage}
            onChange={(e) => setState(prev => ({ ...prev, reviewMessage: e.target.value }))}
            placeholder="Enter your review message"
            disabled={state.isLoading}
            maxLength={500}
          />
          <SelectField
            label="Request Status"
            value={state.status}
            onChange={(e) => setState(prev => ({ ...prev, status: e.target.value }))}
            options={STATUS_OPTIONS}
            disabled={state.isLoading}
          />
          <ReadonlyField
            label="From User"
            value={`${state.request?.username || 'Unknown'} / ${state.request?.id || 'N/A'}`}
          />
          {renderRequestFields()}
          <ReadonlyField
            label="Additional Information"
            value={state.request?.additionalInfo || 'None provided'}
          />
          <div className="flex flex-wrap gap-4 mt-6">
            <ActionButton
              onClick={handleUpdateAndSendEmail}
              icon={<MdUpdate />}
              text="Update & Send Email"
              color="blue"
              disabled={state.isLoading}
              loading={state.isLoading}
            />
            <ActionButton
              onClick={() => setState(prev => ({ ...prev, showDeleteModal: true }))}
              icon={<MdDelete />}
              text="Delete Request"
              color="red"
              variant="outline"
              disabled={state.isLoading}
            />
          </div>
        </div>
      </div>
      <ActionButton
        onClick={() => navigate(-1)}
        icon={<IoMdArrowRoundBack />}
        text="Back"
        color="purple"
        className="mt-6"
        disabled={state.isLoading}
      />
      <DeleteModal
        isOpen={state.showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setState(prev => ({ ...prev, showDeleteModal: false }))}
        isLoading={state.isLoading}
      />
    </div>
  );
};

const TextAreaField = memo(function({ label, value, onChange, placeholder, disabled, maxLength }) {
  return (
    <div className="form-control mb-4">
      <label className="label font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="textarea textarea-bordered text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-base-100 disabled:cursor-not-allowed rounded-md shadow-sm"
        style={{ minHeight: '100px', resize: 'vertical' }}
      />
      {maxLength && (
        <span className="text-sm text-gray-500 mt-1">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
});

const SelectField = memo(function({ label, value, onChange, options, disabled }) {
  return (
    <div className="form-control mb-4">
      <label className="label font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="select select-bordered bg-base-100 text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-md shadow-sm"
      >
        <option value="">Select status</option>
        {options?.map(option => (
          <option key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
});

const ReadonlyField = memo(function({ label, value }) {
  return (
    <div className="form-control mb-4">
      <label className="label font-medium text-gray-700">{label}</label>
      <textarea
        value={value || 'N/A'}
        readOnly
        className="textarea textarea-bordered text-gray-600 border-gray-200 rounded-md shadow-sm"
        style={{ minHeight: '80px', resize: 'none' }}
      />
    </div>
  );
});

const ActionButton = memo(function({ onClick, icon, text, color, variant = 'solid', disabled, loading, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variant === 'outline' ? `btn-outline border-${color}-600 text-${color}-600 hover:bg-${color}-600 hover:text-white` : `bg-${color}-600 text-white hover:bg-${color}-700`} 
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors rounded-md shadow-sm ${className}`}
    >
      {loading ? (
        <span className="loading loading-spinner text-white"> {text}</span>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
});

const DeleteModal = memo(function({ isOpen, onConfirm, onCancel, isLoading }) {
  return isOpen ? (
    <div className="modal modal-open fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="modal-box bg-base-100 rounded-xl shadow-xl">
        <h3 className="font-bold text-lg text-gray-800">Confirm Deletion</h3>
        <p className="py-4 text-gray-600">Are you sure you want to delete this request? This action cannot be undone.</p>
        <div className="modal-action flex gap-4">
          <ActionButton
            onClick={onConfirm}
            text="Delete"
            color="red"
            disabled={isLoading}
            loading={isLoading}
          />
          <ActionButton
            onClick={onCancel}
            text="Cancel"
            color="purple"
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  ) : null;
});

const LoadingSkeleton = memo(function() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-12 w-1/3 rounded mb-6"></div>
      <div className="space-y-4">
        <div className="h-32 w-full rounded"></div>
        <div className="h-16 w-2/3 rounded"></div>
        <div className="h-16 w-1/2 rounded"></div>
      </div>
    </div>
  );
});

export default AdminDetail;
