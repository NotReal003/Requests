import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSend } from 'react-icons/io5';
import { IoMdMail } from "react-icons/io";
import { ImExit } from 'react-icons/im';
import { FaSpinner } from 'react-icons/fa';
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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        toast.error('You must be logged in to submit a support request. Please log in and try again.');
        setIsSubmitting(false);
        return;
      }

      if (!agree) {
        toast.error('You must agree to the Terms of Service and Privacy Policy to proceed.');
        return;
      }

      if (!supportRequest.trim()) {
        toast.error('Please provide a detailed description of your support request.');
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
          credentials: 'include',
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
          toast.success('Your support request has been submitted successfully. You will hear from us soon!');
          setSupportRequest('');
          setAdditionalInfo('');
          setAgree(false);
          navigate(`/success?request=${data.requestId}`);
        } else {
          toast.error(data.message || 'An issue occurred while submitting your request. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('A network error occurred. Please check your connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [supportRequest, additionalInfo, agree, navigate, API]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-2xl rounded-xl p-6 bg-base-100 transition-all duration-300">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold flex items-center justify-center text-primary">
            <IoMdMail aria-hidden="true" className="size-8 mr-2" /> Support Center
          </h1>
          <p className="mt-2 text-base text-gray-400">
            Submit your support request below. Our team is committed to assisting you promptly in accordance with our{' '}
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
          </p>
        </header>

        <div role="alert" className="alert alert-info mb-6 transition-opacity duration-300">
          <span>
            For Applications, please specify "Application" in your request and include your In-Game Name. For other inquiries, provide as much detail as possible to help us assist you efficiently.
          </span>
        </div>

        <form id="supportForm" onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label htmlFor="supportRequest" className="label text-lg font-semibold">
              Your Support Request <span className="text-error">*</span>
            </label>
            <textarea
              id="supportRequest"
              name="supportRequest"
              className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary transition-all duration-200"
              rows="4"
              placeholder="Describe your issue or question in detail."
              value={supportRequest}
              onChange={(e) => setSupportRequest(e.target.value)}
              required
              maxLength={1750}
              aria-describedby="supportRequestHelp"
            />
            <p id="supportRequestHelp" className="text-sm text-gray-500 mt-1">
              {1750 - supportRequest.length} characters remaining
            </p>
          </div>

          <div className="form-control">
            <label htmlFor="additionalInfo" className="label text-lg font-semibold">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="textarea textarea-bordered w-full focus:ring-2 focus:ring-primary transition-all duration-200"
              rows="3"
              placeholder="Provide any extra details to assist us."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={1750}
              aria-describedby="additionalInfoHelp"
            />
            <p id="additionalInfoHelp" className="text-sm text-gray-500 mt-1">
              {1750 - additionalInfo.length} characters remaining
            </p>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                id="agree"
                name="agree"
                className="checkbox checkbox-primary"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
                aria-describedby="termsHelp"
              />
              <span id="termsHelp" className="label-text">
                I agree to NotReal003's{' '}
                <a
                  href="https://support.notreal003.xyz/terms"
                  className="link link-primary"
                  target-py-2
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

          <div className="sticky bottom-0 left-0 right-0 bg-base-100 border-t border-gray-700 pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline btn-secondary flex items-center gap-2 hover:bg-secondary hover:text-white transition-all duration-200"
              aria-label="Go back to previous page"
            >
              <ImExit /> Back
            </button>
            <div
              className="tooltip tooltip-top overflow-x-auto"
              data-tip={!agree ? 'Please agree to the Terms of Service and Privacy Policy.' : ''}
            >
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
                disabled={isSubmitting || !agree}
                aria-label="Submit support request"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin size-5" /> Submit
                  </>
                ) : (
                  <>
                    <IoSend className="size-5" /> Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Need further assistance? Contact us at{' '}
            <a href="mailto:support@notreal003.xyz" className="link link-primary">
              support@notreal003.xyz
            </a>.
          </p>
          <p>
            Visit our{' '}
            <a
              href="https://support.notreal003.xyz"
              className="link link-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support Desk
            </a>{' '}
            for more information.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Support;
