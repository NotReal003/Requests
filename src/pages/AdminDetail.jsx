// AdminDetail.jsx
import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { MdDelete, MdUpdate } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import AdminOnly from '../components/AdminOnly';

// Constants
const STATUS_OPTIONS = [
  'APPROVED', 'DENIED', 'PENDING',
  'RESUBMIT_REQUIRED', 'CANCELLED', 'RESOLVED'
] as const;

const REQUEST_TYPES = {
  REPORT: 'report',
  SUPPORT: 'support',
  GUILD: 'guild-application'
} as const;

// Types
type RequestType = typeof REQUEST_TYPES[keyof typeof REQUEST_TYPES];
type StatusType = typeof STATUS_OPTIONS[number];

interface RequestData {
  id?: string;
  username?: string;
  status?: StatusType;
  reviewMessage?: string;
  messageLink?: string;
  inGameName?: string;
  additionalInfo?: string;
  type?: RequestType;
}

interface State {
  request: RequestData | null;
  status: StatusType | '';
  reviewMessage: string;
  isLoading: boolean;
  error: string | null;
  showDeleteModal: boolean;
  isAdminOnly: boolean;
}

// Utility Functions
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
  if (urlRegex.test(input)) return input;
  
  return input
    .replace(/[<>&'"]/g, (char) => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&#x27;',
      '"': '&quot;'
    }[char] || char))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AdminDetail: React.FC = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const API = process.env.REACT_APP_API || '';

  const [state, setState] = useState<State>({
    request: null,
    status: '',
    reviewMessage: '',
    isLoading: false,
    error: null,
    showDeleteModal: false,
    isAdminOnly: false
  });

  const fetchRequest = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.get(`${API}/admin/requests/${requestId}`, {
        withCredentials: true,
      });
      
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

  const handleUpdateAndSendEmail = useCallback(async () => {
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
      fetchRequest(); // Refresh data
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data.message || 'Failed to update request'
        : 'Unexpected error occurred';
        
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  }, [API, requestId, state.status, state.reviewMessage, state.request?.username, fetchRequest]);

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

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const renderRequestFields = useCallback(() => {
    if (!state.request) return null;

    const fieldsConfig: Record<RequestType, any> = {
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

    const fields = fieldsConfig[state.request.type as RequestType];
    if (!fields) return null;

    return Array.isArray(fields) 
      ? fields.map((field, index) => <ReadonlyField key={index} {...field} />)
      : <ReadonlyField {...fields} />;
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
            onChange={(e) => setState(prev => ({ ...prev, status: e.target.value as StatusType }))}
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

// Reusable Components
interface FieldProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  options?: readonly string[];
}

const TextAreaField = memo(({ label, value, onChange, placeholder, disabled, maxLength }: FieldProps) => (
  <div className="form-control mb-4">
    <label className="label font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className="textarea textarea-bordered bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-md shadow-sm"
      style={{ minHeight: '100px', resize: 'vertical' }}
    />
    {maxLength && (
      <span className="text-sm text-gray-500 mt-1">
        {value.length}/{maxLength}
      </span>
    )}
  </div>
));

const SelectField = memo(({ label, value, onChange, options, disabled }: FieldProps) => (
  <div className="form-control mb-4">
    <label className="label font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="select select-bordered bg-white text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-md shadow-sm"
    >
      <option value="">Select status</option>
      {options?.map(option => (
        <option key={option} value={option}>
          {option.charAt(0) + option.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
));

const ReadonlyField = memo(({ label, value }: FieldProps) => (
  <div className="form-control mb-4">
    <label className="label font-medium text-gray-700">{label}</label>
    <textarea
      value={value || 'N/A'}
      readOnly
      className="textarea textarea-bordered bg-gray-50 text-gray-600 border-gray-200 rounded-md shadow-sm"
      style={{ minHeight: '80px', resize: 'none' }}
    />
  </div>
));

interface ButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  color: string;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const ActionButton = memo(({ 
  onClick, 
  icon, 
  text, 
  color, 
  variant = 'solid', 
  disabled, 
  loading, 
  className 
}: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn ${variant === 'outline' ? `btn-outline border-${color}-600 text-${color}-600 hover:bg-${color}-600 hover:text-white` : `bg-${color}-600 text-white hover:bg-${color}-700`} 
      disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors rounded-md shadow-sm ${className}`}
  >
    {loading ? (
      <span className="loading loading-spinner text-white"></span>
    ) : (
      <>
        {icon}
        {text}
      </>
    )}
  </button>
));

interface ModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteModal = memo(({ isOpen, onConfirm, onCancel, isLoading }: ModalProps) => (
  isOpen ? (
    <div className="modal modal-open fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="modal-box bg-white rounded-xl shadow-xl">
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
  ) : null
));

const LoadingSkeleton = memo(() => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="h-12 w-1/3 bg-gray-200 rounded mb-6"></div>
    <div className="space-y-4">
      <div className="h-32 w-full bg-gray-200 rounded"></div>
      <div className="h-16 w-2/3 bg-gray-200 rounded"></div>
      <div className="h-16 w-1/2 bg-gray-200 rounded"></div>
    </div>
  </div>
));

export default AdminDetail;
