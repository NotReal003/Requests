import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdMail } from "react-icons/io";
import { ImExit } from "react-icons/im";
import { FaSpinner } from 'react-icons/fa';
import { IoSend } from "react-icons/io5";
import toast, { Toaster } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const Support = () => {
  const [supportRequest, setSupportRequest] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const sanitizeInput = (input) =>
    DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  const handleSubmit = useCallback(async (e) => {
  e.preventDefault();
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    toast.error('You must be logged in to submit a support request.');
    setIsSubmitting(false);
    return;
  }

  if (!agree) {
    toast.error('Please agree to the Terms of Service and Privacy Policy to proceed.');
    return;
  }

  if (!supportRequest.trim()) {
    toast.error('Please provide a description of your support request.');
    return;
  }

  const sanitizedSupportRequest = sanitizeInput(supportRequest).trim();
  const sanitizedAdditionalInfo = sanitizeInput(additionalInfo).trim();
  const payload = {
    messageLink: sanitizedSupportRequest,
    additionalInfo: sanitizedAdditionalInfo,
  };

  try {
    setIsSubmitting(true);
    const response = await fetch(`${API}/requests/support`, {
      method: 'POST',
      credentials: 'include', // Fixed typo from 'credetials'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 403) {
      toast.error('Your session has expired or you lack permission. Please log in again.');
      return;
    }

    const data = await response.json();
    if (response.ok) {
      toast.success('Your support request has been submitted successfully.');
      setSupportRequest('');
      setAdditionalInfo('');
      setAgree(false);
      navigate(`/success?request=${data.requestId}`);
    } else {
      toast.error(data.message || 'There was an issue submitting your request. Please try again later.');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An error occurred while submitting your request. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
}, [supportRequest, additionalInfo, agree, navigate, API]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-4 bg-base-100">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
          <IoMdMail aria-hidden="true" className="size-6 mr-2" /> Support
        </h1>
        <p className="mb-4 text-center text-gray-700">
          Please fill out the form below to submit a support request. Our team will review your request and respond as soon as possible.
        </p>
        <div role="alert" className="alert alert-info mb-4">
          <span>
            Feel free to ask anything! If submitting a guild application, please indicate it’s a Guild application and include your In-Game Name.
          </span>
        </div>
        <form id="reportForm" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="supportRequest" className="label text-lg">
              Your support request (required)
            </label>
            <textarea
              id="supportRequest"
              name="supportRequest"
              className="textarea textarea-bordered w-full"
              rows="3"
              placeholder="Please describe your issue or question in detail."
              value={supportRequest}
              onChange={(e) => setSupportRequest(e.target.value)}
              required
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {1000 - supportRequest.length} characters remaining
            </p>
          </div>
          <div>
            <label htmlFor="additionalInfo" className="label text-lg">
              Anything else?
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="textarea textarea-bordered w-full"
              rows="2"
              placeholder="Optional: Provide any additional information to assist us."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {500 - additionalInfo.length} characters remaining
            </p>
          </div>
          <div className="terms m-1">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                id="agree"
                name="agree"
                className="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span className="label-text ml-2">
                By clicking here you agree with NotReal003's{' '}
                <a
                  href="https://support.notreal003.xyz/terms"
                  className="link link-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="https://support.notreal003.xyz/privacy"
                  className="link link-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>.
              </span>
            </label>
          </div>
          <div className="sticky bottom-0 left-0 right-0 w-full bg-base-100 border-t border-gray-200 flex justify-between items-center rounded-b-lg p-4 shadow-sm">
            <button
              onClick={() => navigate(-1)}
              className="btn text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg no-animation"
              aria-label="Go back to previous page"
            >
              <ImExit /> Back
            </button>
            <div
              className="tooltip tooltip-top overflow-x-auto"
              data-tip={!agree ? 'You must agree to the Terms of Service and Privacy Policy.' : ''}
            >
              <button
                type="submit"
                className="btn btn-primary no-animation"
                disabled={isSubmitting || !agree}
                aria-label="Submit support request"
              >
                {isSubmitting ? (
                  <span>
                    <FaSpinner className="animate-spin inline-block align-middle mr-2" /> Submitting
                  </span>
                ) : (
                  <>
                    <IoSend className="inline-block align-middle mr-2" /> Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
