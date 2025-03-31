import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { FaShieldHalved } from "react-icons/fa6";
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from "react-icons/fa";
import DOMPurify from "dompurify";

const ReportForm = () => {
  const [messageLink, setMessageLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  // Simple sanitizer function
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Allow no tags
      ALLOWED_ATTR: []  // Allow no attributes
    });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      toast.error('You must be logged in to submit an application.');
      setIsSubmitting(false);
      return;
    }

    if (!agree) {
      toast.error('You must agree to the terms before submitting.');
      return;
    }

    const sanitizedMessageLink = sanitizeInput(messageLink);
    const sanitizedAdditionalInfo = sanitizeInput(additionalInfo);

    const payload = {
      messageLink: sanitizedMessageLink,
      additionalInfo: sanitizedAdditionalInfo,
      requestType: 'report',
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API}/requests/report`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 0) {
        toast.error("Please Check Your Network Connection");
      }

      const data = await response.json();

      if (response.ok) {
        toast.success('Your report was submitted successfully!');
        setMessageLink('');
        setAdditionalInfo('');
        setAgree(false);
        navigate(`/success?request=${data.requestId}`);
      } else {
        toast.error(data.message || 'There was an issue submitting your report.');
      }
    } catch (error) {
      console.error('Error: ', error);
      toast.error(error || 'Please check your network');
    } finally {
      setIsSubmitting(false);
    }
  }, [messageLink, additionalInfo, agree, navigate, API]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-2">
        <h1 className="text-2xl font-bold mb-4 fill-current flex items-center justify-center">
          <FaShieldHalved className="size-6 mr-2" />Discord report
        </h1>
        <div role="alert" className="alert alert-info">
          <span>If you believe the user is violating the Discord Terms of Service or Community Guidelines, right-click the message and choose "Report message" button.</span>
        </div>
        <form id="reportForm" onSubmit={handleSubmit}>
          <label htmlFor="messageLink" className="label">Discord Message Link / Evidence (required)</label>
          <input
            type="text"
            id="messageLink"
            name="messageLink"
            className="input input-bordered w-full"
            placeholder="https://discord.com/channels/XXXXX/XXXXX/XXXXX"
            value={messageLink}
            onChange={(e) => setMessageLink(e.target.value)}
            required
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
              {1750 - messageLink.length} characters remaining
            </p>

          <label htmlFor="additionalInfo" className="label">Anything else you would like to add?</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            className="textarea textarea-bordered w-full"
            rows="4"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
              {1750 - additionalInfo.length} characters remaining
            </p>

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
                By clicking here you will agree with NotReal003's{' '}
                <a href="https://support.notreal003.xyz/terms" className="link link-primary" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
                <a href="https://support.notreal003.xyz/privacy" className="link link-primary" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </span>
            </label>
          </div>
          <div className="sticky bottom-0 left-0 right-0 w-full bg-base-100 border-1 border-t-slate-100 flex justify-between items-center rounded-lg p-2">
            <button onClick={() => navigate(-1)} className="btn text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg no-animatio"><ImExit />Back</button>
            <div className="tooltip tooltip-top overflow-auto" data-tip={!agree ? "You must agree to the Terms of Services and to our Privacy Policy." : ""}>
              <button type="submit" className="btn btn-primary no-animation" disabled={isSubmitting || !agree}>
                {isSubmitting ? <span><FaSpinner className="animate-spin inline-block align-middle mr-2" /> Submit</span> : <><IoSend className="inline-block align-middle mr-2" /> Submit</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
