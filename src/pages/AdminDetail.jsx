import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdDelete, MdUpdate } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import AdminOnly from '../components/AdminOnly';

const STATUS_OPTIONS = [
  'APPROVED', 'DENIED', 'PENDING', 
  'RESUBMIT_REQUIRED', 'CANCELLED', 'RESOLVED'
];

const REQUEST_TYPES = {
  REPORT: 'report',
  SUPPORT: 'support',
  GUILD: 'guild-application'
};

function AdminDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const API = process.env.REACT_APP_API;

  const [state, setState] = useState({
    request: null,
    status: '',
    reviewMessage: '',
    isLoading: false,
    error: null,
    showDeleteModal: false,
    isAdminOnly: false
  });

  const sanitizeInput = useCallback((input) => {
    if (!input) return '';
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    const cleanText = input
      .replace(/[<>&'"]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#x27;',
        '"': '&quot;'
      }[char] || char))
      .replace(/\n{2,}/g, '\n');
    return urlRegex.test(input) ? input : cleanText;
  }, []);

  const fetchRequest = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.get(`${API}/admin/requests/${requestId}`, {
        withCredentials: true,
      });
      setState(prev => ({
        ...prev,
        request: response.data,
        status: response.data.status,
        reviewMessage: response.data.reviewMessage || '',
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAdminOnly: error.response?.status === 403,
        error: error.response?.data.message || 'Failed to load request'
      }));
      toast.error('Failed to load request details');
    }
  }, [requestId, API]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleUpdateAndSendEmail = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const sanitizedMessage = sanitizeInput(state.reviewMessage);
    
    try {
      const token = localStorage.getItem('jwtToken');
      const updateResponse = await axios.patch(
        `${API}/admin/${requestId}`,
        { status: state.status, reviewMessage: sanitizedMessage },
        { withCredentials: true }
      );

      toast.success(updateResponse.data.message || 'Request updated successfully');
      
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
      
      toast.success('Email notification sent');
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAdminOnly: error.response?.status === 403,
        error: error.response?.data.message || 'Update failed'
      }));
      toast.error(error.response?.data.message || 'Failed to process request');
    }
  }, [API, requestId, state.status, state.reviewMessage, state.request?.username, sanitizeInput]);

  const handleDelete = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await axios.delete(`${API}/admin/${requestId}`, {
        withCredentials: true,
      });
      toast.success('Request deleted successfully');
      navigate('/admin');
    } catch (error) {
      toast.error('Failed to delete request');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [API, requestId, navigate]);

  const renderRequestFields = () => {
    if (!state.request) return null;
    
    const fields = {
      [REQUEST_TYPES.REPORT]: {
        label: 'Discord Message Link / Evidence',
        value: state.request.messageLink
      },
      [REQUEST_TYPES.SUPPORT]: {
        label: 'Support Request',
        value: state.request.messageLink
      },
      [REQUEST_TYPES.GUILD]: [
        { label: 'In-Game Name', value: state.request.inGameName },
        { label: 'Reason for Joining', value: state.request.messageLink }
      ]
    };

    const typeFields = fields[state.request.type];
    if (!typeFields) return null;

    return Array.isArray(typeFields) ? typeFields.map(field => (
      <ReadonlyField key={field.label} {...field} />
    )) : <ReadonlyField {...typeFields} />;
  };

  if (state.isAdminOnly) return <AdminOnly />;
  if (!state.request && state.isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      {state.error && (
        <div className="alert alert-error shadow-lg mb-4">
          <span>{state.error}</span>
        </div>
      )}

      <div className="card shadow-lg bg-base-100">
        <div className="card-body">
          <h2 className="card-title">
            Request Details {state.request?.status && `(${state.request.status})`}
          </h2>

          <TextAreaField
            label="Review Message"
            value={state.reviewMessage}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              reviewMessage: e.target.value 
            }))}
            placeholder="Enter your review message"
            disabled={state.isLoading}
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
            value={`${state.request?.username || ''} / ${state.request?.id || ''}`}
          />

          {renderRequestFields()}

          <ReadonlyField
            label="Additional Information"
            value={state.request?.additionalInfo || 'None provided'}
          />

          <div className="flex gap-4 mt-6">
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
        className="mt-4"
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
}

// Reusable Components
const TextAreaField = ({ label, value, onChange, placeholder, disabled }) => (
  <div className="form-control">
    <label className="label font-medium">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="textarea textarea-bordered bg-orange-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      style={{ minHeight: '100px', resize: 'vertical' }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled }) => (
  <div className="form-control">
    <label className="label font-medium">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="select select-bordered focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option.charAt(0) + option.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);

const ReadonlyField = ({ label, value }) => (
  <div className="form-control">
    <label className="label font-medium">{label}</label>
    <textarea
      value={value || 'N/A'}
      readOnly
      className="textarea textarea-bordered focus:outline-none bg-gray-100"
      style={{ minHeight: '80px' }}
    />
  </div>
);

const ActionButton = ({ 
  onClick, 
  icon, 
  text, 
  color, 
  variant = 'solid', 
  disabled, 
  loading, 
  className 
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn ${variant === 'outline' ? 'btn-outline' : ''} 
      bg-${color}-600 text-white hover:bg-${color}-700 
      disabled:opacity-50 flex items-center gap-2 ${className}`}
  >
    {loading ? (
      <span className="loading loading-spinner"></span>
    ) : (
      <>
        {icon}
        {text}
      </>
    )}
  </button>
);

const DeleteModal = ({ isOpen, onConfirm, onCancel, isLoading }) => (
  isOpen && (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Deletion</h3>
        <p className="py-4">Are you sure? This action cannot be undone.</p>
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
  )
);

const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="skeleton h-12 w-1/3 mb-6"></div>
    <div className="space-y-4">
      <div className="skeleton h-32 w-full"></div>
      <div className="skeleton h-16 w-2/3"></div>
      <div className="skeleton h-16 w-1/2"></div>
    </div>
  </div>
);

export default AdminDetail;
