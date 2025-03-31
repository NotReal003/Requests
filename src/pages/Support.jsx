import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSend, IoMdMail } from 'react-icons/io5';
import { ImExit } from 'react-icons/im';
import { FaSpinner } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import DOMPurify from 'dompurify';

const Support = () => {
  const [messageLink, setMessageLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  // Enhanced form validation
  const validateForm = () => {
    if (!messageLink.trim()) {
      toast.error('Support request is required.');
      return false;
    }
    if (messageLink.length > 1000 || additionalInfo.length > 500) {
      toast.error('Input exceeds maximum length.');
      return false;
    }
    if (!agree) {
      toast.error('You must agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('Please log in to submit a support request.');
        setIsSubmitting(false);
        return;
      }

      if (!validateForm()) return;

      const sanitizedMessageLink = sanitizeInput(messageLink);
      const sanitizedAdditionalInfo = sanitizeInput(additionalInfo);
      const payload = {
        messageLink: sanitizedMessageLink,
        additionalInfo: sanitizedAdditionalInfo,
      };

      try {
        setIsSubmitting(true);
        const response = await fetch(`${API}/requests/support`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.status === 403) {
          toast.error('Access denied. Please log in again.');
          return;
        }

        const data = await response.json();
        if (response.ok) {
          toast.success('Your support request has been submitted successfully.');
          setMessageLink('');
          setAdditionalInfo('');
          setAgree(false);
          navigate(`/success?request=${data.requestId}`);
        } else {
          toast.error(data.message || 'Failed to submit your request.');
        }
      } catch (error) {
        console.error('Submission Error:', error);
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [messageLink, additionalInfo, agree, navigate, API]
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <IoMdMail className="text-blue-600 text-3xl mr-2" />
          <h1 className="text-3xl font-semibold text-gray-800">Support Request</h1>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-r">
          <p>
            We’re here to assist you. For guild applications, please specify “Guild Application” and include your in-game name.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="messageLink" className="block text-sm font-medium text-gray-700 mb-1">
              Your Request <span className="text-red-500">*</span>
            </label>
            <textarea
              id="messageLink"
              name="messageLink"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              rows="4"
              placeholder="Please describe your issue or request"
              value={messageLink}
              onChange={(e) => setMessageLink(e.target.value)}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{messageLink.length}/1000 characters</p>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              rows="3"
              placeholder="Provide any additional details (optional)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{additionalInfo.length}/500 characters</p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agree"
              name="agree"
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
            />
            <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
              I agree to NotReal003’s{' '}
              <a
                href="https://support.notreal003.xyz/terms"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href="https://support.notreal003.xyz/privacy"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>.
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <ImExit className="mr-2" /> Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !agree}
              className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isSubmitting || !agree ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Submitting...
                </>
              ) : (
                <>
                  <IoSend className="mr-2" /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
