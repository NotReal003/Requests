import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  // Simple sanitizer function
  const sanitizeInput = (input) => {
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
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.warning('You must be logged in to submit an application.');
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
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API}/requests/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 403) {
        toast.error('Your access has been denied, please login again.');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        toast.success('Your request submitted successfully.');
        setMessageLink('');
        setAdditionalInfo('');
        setAgree(false);
        navigate(`/success?request=${data.requestId}`);
      } else {
        toast.error(data.message || 'There was an issue submitting your request.');
      }
    } catch (error) {
      console.error('Error: ', error);
      toast.error('An error occurred while submitting your request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  }, [messageLink, additionalInfo, agree, navigate, API]);

  return (
    <div className="flex flex-col items-center justify-center p-2 min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4 fill-current flex items-center justify-center">
          <IoMdMail className="size-6 mr-2" />Support
        </h1>
        <div role="alert" className="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Feel free ask anything! If you are submitting a guild application, let us know it is a Guild application and provide us with your In-Game Name.</span>
        </div>
        <form id="reportForm" onSubmit={handleSubmit}>
          <label htmlFor="messageLink" className="label">Your support request (required)</label>
          <textarea
            id="messageLink"
            name="messageLink"
            className="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Let us know the issue"
            value={messageLink}
            onChange={(e) => setMessageLink(e.target.value)}
            required
            maxLength={1000}
          />
          <label htmlFor="additionalInfo" className="label">Anything else?</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            className="textarea textarea-bordered w-full"
            rows="1"
            placeholder="Feel free to leave this field blank"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            maxLength={500}
          />
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
            <Link to="/" className="btn btn-info no-animation hover:text-warning"><ImExit />Back</Link>
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

export default Support;
