import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaDiscord, FaArrowRight } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { formatDistanceToNow } from 'date-fns';
import { FaPeopleGroup } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';
import AdminOnly from '../components/AdminOnly';

// Request Status Component
const RequestStatus = ({ status }) => {
  const statusStyles = {
    DENIED: 'bg-red-600 text-white',
    APPROVED: 'bg-green-600 text-white',
    RESUBMIT_REQUIRED: 'bg-orange-600 text-white',
    PENDING: 'bg-yellow-600 text-white',
    CANCELLED: 'bg-red-600 text-white',
    RESOLVED: 'bg-green-600 text-white',
    ESCALATED: 'bg-yellow-600 text-white',
  };

  const statusTooltips = {
    DENIED: 'Request was denied.',
    APPROVED: 'Request was approved.',
    ESCALATED: 'Request is escalated',
    PENDING: 'Request is pending.',
    CANCELLED: 'Request was cancelled.',
    RESOLVED: 'Request was resolved.',
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-bold ${statusStyles[status]}`}
      title={statusTooltips[status]}
    >
      {status}
    </span>
  );
};

const RequestIcon = ({ type }) => {
  const iconClass = 'text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3 md:mr-4';
  if (type === 'report') {
    return <FaDiscord className={iconClass} title="Discord Report" />;
  } else if (type === 'guild-application') {
    return <FaPeopleGroup className={iconClass} title="Guild Application" />;
  } else if (type === 'support') {
    return <MdSupportAgent className={iconClass} title="Support Request" />;
  }
  return null;
};

const LoadingSkeleton = () => (

  <div className="space-y-4">
    {[...Array(6)].map((_, idx) => (
      <div
        key={idx}
        className="animate-pulse flex justify-between items-center p-4 bg-base-300 rounded-lg shadow-lg max-w-md md:max-w-lg mx-auto"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-400 rounded w-40 mb-2"></div>
            <div className="h-3 bg-gray-400 rounded w-24"></div>
          </div>
        </div>
        <div className="w-4 h-4 bg-gray-400 rounded"></div>
      </div>
    ))}
  </div>
  );

const ErrorAlert = ({ message }) => (
  <div className="alert alert-error shadow-lg">
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-6.364 6.364m0 0L5.636 18.364m6.364-6.364l6.364 6.364M6.636 5.636L18.364 17.364" />
      </svg>
      <span>{message}</span>
    </div>
  </div>
);

const FilterControls = ({ statusFilter, setStatusFilter, userIdFilter, setUserIdFilter, handleToggleApiStatus, apiClosed }) => (
  <div className="mb-4 flex flex-col sm:flex-row justify-between">
    <div>
      <select
        className="select select-bordered select-md w-full mb-2"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="DENIED">Denied</option>
        <option value="ESCALATED">ESCALATED</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <input
        type="text"
        placeholder="Search a User"
        value={userIdFilter}
        className="input input-bordered w-full"
        onChange={(e) => setUserIdFilter(e.target.value)}
      />
      <div className="mb-2 mt-2">
        <label className="label cursor-pointer">
          <span className="label-text text-md">API Status:</span>
          <input
            type="checkbox"
            className="toggle toggle-info"
            checked={!apiClosed}
            onChange={handleToggleApiStatus}
          />
        </label>
      </div>
    </div>
  </div>
);

// Request Item Component
const RequestItem = ({ request, handleRequestClick, getGradientClass }) => (
  <div
    key={request._id}
    className={`flex justify-between items-center p-2 sm:p-3 md:p-4 rounded-lg shadow-lg text-white ${getGradientClass(
      request.status
    )} cursor-pointer`}
    onClick={() => handleRequestClick(request._id)}
  >
    <div className="flex items-center">
      <RequestIcon type={request.type} />
      <div>
        <h1 className="text-md sm:text-base md:text-xs font-bold">{request.username}</h1>
        <h2 className="text-sm sm:text-base md:text-lg font-bold">
          {request.type === 'report' ? `Discord Report` : request.type === 'guild-application' ? 'Application' : 'Support Request'}{' '}
          <RequestStatus status={request.status} />
        </h2>
        <p className="text-xs sm:text-sm">
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
    <div className="flex items-center">
      <FaArrowRight className="ml-2 sm:ml-4 text-lg sm:text-xl" title="View details" />
    </div>
  </div>
);

// Main Admin Component
const Admin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [apiClosed, setApiClosed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminOnly, setAdminOnly] = useState(false);
  const requestsPerPage = 10;
  const token = localStorage.getItem('jwtToken');
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const handleToggleApiStatus = async () => {
    const confirmMessage = apiClosed ? 'open the API' : 'close the API';
    if (window.confirm(`Are you sure you want to ${confirmMessage}?`)) {
      try {
        const response = await axios.patch(
          `${API}/server/manage-api`,
          { closeType: apiClosed ? 'noopened' : 'yesclosed' },
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          toast.success(`API has been ${apiClosed ? 'opened' : 'closed'} successfully.`);
          setApiClosed(!apiClosed);
        } else {
          toast.error('Failed to change API status.');
        }
      } catch (error) {
        console.error('Error changing API status:', error);
        toast.error('An error occurred while changing API status.');
      }
    }
  };
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${API}/admin/requests`, {
          withCredentials: true,
        });

        if (response.status === 403) {
          setAdminOnly(true);
        }

        // Success case
        let filteredRequests = response.data;

        if (statusFilter) {
          filteredRequests = filteredRequests.filter((request) => request.status === statusFilter);
        }

        // Filter requests by user ID
        if (userIdFilter) {
          filteredRequests = filteredRequests.filter((request) => request.id.includes(userIdFilter));
        }

        // Sort requests by creation date
        const sortedRequests = filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sortedRequests);
      } catch (error) {
        const errorStatus = error.response?.status;

        // Handle 403 forbidden
        if (errorStatus === 403) {
          setAdminOnly(true);
        } else {
          const errorMessage = error.response?.data?.message || 'Failed to load requests. Please try again later.';
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, statusFilter, userIdFilter, API, navigate]);


  const handleRequestClick = (id) => {
    navigate(`/admindetail?id=${id}`);
  };

  const getGradientClass = (status) => {
    switch (status) {
      case 'DENIED':
        return 'bg-gradient-to-r from-red-600 to-red-700';
      case 'CANCELLED':
        return 'bg-gradient-to-r from-orange-600 to-orange-700';
      case 'APPROVED':
        return 'bg-gradient-to-r from-green-600 to-green-700';
      case 'RESUBMIT_REQUIRED':
        return 'bg-gradient-to-r from-orange-600 to-orange-700';
      case 'RESOLVED':
        return 'bg-gradient-to-r from-green-600 to-green-700';
      default:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    }
  };

  const paginatedRequests = requests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  );

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => setCurrentPage((prev) => prev - 1);

  if (adminOnly) {
    return <AdminOnly />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
      <Toaster />
      <div className="rounded-lg p-2 shadow-sm w-full max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">Admin Dashboard - Manage Requests </h1>
        <FilterControls
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          userIdFilter={userIdFilter}
          setUserIdFilter={setUserIdFilter}
          handleToggleApiStatus={handleToggleApiStatus}
          apiClosed={apiClosed}
        />
      </div>

      <div className="w-full max-w-3xl">
        <div className="space-y-2 sm:space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorAlert message={error} />
          ) : paginatedRequests.length > 0 ? (
            <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-300">
            Received <span className="text-[#FFD700]">{paginatedRequests.length}</span> requests.
          </h2>
        </div>
            paginatedRequests.map((request) => (
              <RequestItem
                key={request._id}
                request={request}
                handleRequestClick={handleRequestClick}
                getGradientClass={getGradientClass}
              />
            ))
          ) : (
            <div className="alert shadow-lg">
              <div>
                <span>No requests found.</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="btn no-animation bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-blue-700 transition-all"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="btn no-animation bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-blue-700 transition-all"
            onClick={handleNextPage}
            disabled={paginatedRequests.length < requestsPerPage}
          >
            Next
          </button>
        </div>
        <div className="mt-4">
          <button className="btn no-animation bg-purple-600 text-white font-medium rounded-lg shadow-sm flex items-center hover:bg-purple-700 transition-all" onClick={() => navigate('/')}>
            <IoMdArrowRoundBack className="mr-2" title="Go back to home page" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
