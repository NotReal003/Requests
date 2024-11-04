import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { FaSpinner } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { MdCancel } from "react-icons/md";

function RequestDetail() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMesssage, setErrorMesssage] = useState(null);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const reviewMessageRef = useRef(null);
  const additionalInfoRef = useRef(null);
  const messageLinkRef = useRef(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const requestId = urlParams.get('id');
        const token = localStorage.getItem('jwtToken');
        const response = await axios.get(`${API}/requests/${requestId}`, {
          headers: { Authorization: `${token}` },
        });

        if (response.status === 200) {
          setRequest(response.data);
          setLoading(false);
        } else {
          setErrorMesssage(response.data.message || 'An error occurred while fetching the request.');
          toast.error(response.data.message || 'An error occurred while fetching the request.');
          setLoading(false);
        }
      } catch (error) {
        setErrorMesssage(error.response?.data?.message || 'An error occurred while fetching the request.');
        toast.error(error.response?.data?.message || 'You do not have permission to check this request');
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId, API]);

  useEffect(() => {
    // Adjust height for textareas
    if (reviewMessageRef.current) {
      reviewMessageRef.current.style.height = 'auto';
      reviewMessageRef.current.style.height = `${reviewMessageRef.current.scrollHeight}px`;
    }
    if (additionalInfoRef.current) {
      additionalInfoRef.current.style.height = 'auto';
      additionalInfoRef.current.style.height = `${additionalInfoRef.current.scrollHeight}px`;
    }
    if (messageLinkRef.current) {
      messageLinkRef.current.style.height = 'auto';
      messageLinkRef.current.style.height = `${messageLinkRef.current.scrollHeight}px`;
    }
  }, [request]);

  const handleCancelRequest = async () => {
    setIsCancelling(true);

    const token = localStorage.getItem('jwtToken');
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');

    const cancelRequestPromise = axios.put(
      `${API}/requests/${requestId}/cancel`,
      {
        status: 'CANCELLED',
        reviewMessage: 'Self-canceled by the user.',
      },
      { headers: { Authorization: `${token}` } }
    );

    toast.promise(
      cancelRequestPromise,
      {
        loading: 'Cancelling your request...',
        success: 'Request cancelled successfully',
        error: (err) => err.response?.data?.message || 'An error occurred while cancelling your request',
      }
    );

    try {
      await cancelRequestPromise;
    } catch (error) {
      console.error('Error cancelling the request:', error);
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-52 flex-col gap-4 container mx-auto px-4 py-8">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
        <div className="skeleton h-6 w-30"></div>
      </div>
    );
  }

  if (errorMesssage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-center">
          <strong className="text-lg text-red-500">{errorMesssage}</strong>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center p-4 max-w-md md:max-w-lg mx-auto shadow-lg min-h-screen">
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 min-h-screen">
      <Toaster />
      {request.reviewed === 'false' && (
        <div className="flex items-center m-2">
          <p className="text-sm text-gray-400 m-2">Your request is currently being reviewed by the admin.</p>
        </div>
      )}
      <div className="card w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-4">
        <div className="card-body">
          <h2 className="card-title">Request Details ({request.status})</h2>
          {request.reviewed === 'true' && (
            <div className="form-control">
              <label className="label">Review Message</label>
              <textarea
                ref={reviewMessageRef}
                value={request.reviewMessage || `Your request was ${request.status}.`}
                readOnly
                className="textarea text-white textarea-bordered bg-orange-500 focus:outline-none"
              />
            </div>
          )}
          {request.type === 'report' && (
            <div className="form-control">
              <label className="label">Discord Message Link / Evidence (required)</label>
              <textarea
                ref={messageLinkRef}
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
                ref={messageLinkRef}
                value={request.messageLink}
                readOnly
                className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}
          {request.type === 'guild-application' && (
            <>
              <div className="form-control">
                <label className="label">In-Game Name (required)</label>
                <textarea
                  value={request.inGameName}
                  readOnly
                  className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="form-control">
                <label className="label">Reason for joining the guild? (required)</label>
                <textarea
                  ref={messageLinkRef}
                  value={request.messageLink}
                  readOnly
                  className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </>
          )}
          <div className="form-control">
            <label className="label">Anything else you would like to add?</label>
            <textarea
              ref={additionalInfoRef}
              value={request.additionalInfo}
              readOnly
              className="textarea textarea-bordered focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {request.reviewed === 'false' && (
            <div className="mt-4">
              <p className="text-center mb-2 text-gray-400 text-xs">Something is wrong?</p>
              <button
                className="btn text-white bg-orange-500 hover:bg-orange-600 w-full btn-sm no-animation"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Request
              </button>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Cancellation</h3>
            <p className="py-4 font-serif">Are you sure you want to cancel your request?</p>
            <div className="modal-action">
              <button
                className="btn btn-info no-animation"
                onClick={() => setShowCancelModal(false)}
              >
                No, keep it
              </button>
              <button
                className="btn btn-error no-animation"
                disabled={isCancelling}
                onClick={handleCancelRequest}
              >
                {isCancelling ? <span><FaSpinner className="animate-spin inline-block align-middle mr-2" />Yes, cancel it</span> : <span><MdCancel className="inline-block align-middle mr-2" /> Yes, cancel it</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        <button className="btn text-white bg-blue-600 btn-md no-animation" onClick={() => navigate(-1)}>
          <IoMdArrowRoundBack className="mr-1" />
          Back
        </button>
      </div>
    </div>
  );
}

export default RequestDetail;
