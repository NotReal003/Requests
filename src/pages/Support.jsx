import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
import { ImExit } from "react-icons/im";
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from "react-icons/fa";

const Support = () => {
  const [messageLink, setMessageLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API;

  const sanitizeInput = (input) => {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    return input.replace(/[<>&'"]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        default: return char;
      }
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

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API}/requests/support`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageLink: sanitizedMessageLink, additionalInfo: sanitizedAdditionalInfo }),
      });

      if (response.status === 403) {
        toast.error('Your access has been denied. Please log in again.');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        toast.success('Your request has been submitted successfully.');
        setMessageLink('');
        setAdditionalInfo('');
        setAgree(false);
        navigate(`/success?request=${data.requestId}`);
      } else {
        toast.error(data.message || 'There was an issue submitting your request.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while submitting your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }, [messageLink, additionalInfo, agree, navigate, API]);

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-black text-white">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center justify-center text-white">
          <IoMdMail className="size-6 mr-2" /> Support
        </h1>
        <div className="alert alert-info mb-4 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current h-6 w-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Feel free to ask anything! If you are submitting a guild application, let us know it is a Guild application and provide us with your In-Game Name.
        </div>
        <form id="reportForm" onSubmit={handleSubmit}>
          <label htmlFor="messageLink" className="label text-white">Your support request (required)</label>
          <textarea
            id="messageLink"
            className="textarea textarea-bordered w-full bg-gray-800 text-white"
            rows="3"
            placeholder="Let us know the issue"
            value={messageLink}
            onChange={(e) => setMessageLink(e.target.value)}
            required
            maxLength={1000}
          />
          <label htmlFor="additionalInfo" className="label text-white">Anything else?</label>
          <textarea
            id="additionalInfo"
            className="textarea textarea-bordered w-full bg-gray-800 text-white"
            rows="2"
            placeholder="Feel free to leave this field blank"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            maxLength={500}
          />
          <div className="terms my-4">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <span className="ml-2">
                By clicking here, you agree to NotReal003's{' '}
                <a href="https://support.notreal003.xyz/terms" className="link link-primary" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
                <a href="https://support.notreal003.xyz/privacy" className="link link-primary" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </span>
            </label>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary text-white">
              <ImExit className="mr-2" /> Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !agree}>
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <IoSend className="mr-2" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
