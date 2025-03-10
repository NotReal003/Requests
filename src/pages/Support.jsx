import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
import { ImExit } from "react-icons/im";
import toast, { Toaster } from 'react-hot-toast';
//import { FaSpinner } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import DOMPurify from "dompurify";

const Support = () => {
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
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API}/requests/support`, {
        method: 'POST',
        credetials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-2">
        <h1 className="text-2xl font-bold mb-4 fill-current flex items-center justify-center">
          <IoMdMail className="size-6 mr-2" />Support
        </h1>
        <div role="alert" className="alert alert-info">
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
            rows="2"
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
            <button onClick={() => navigate(-1)} className="btn text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg no-animation"><ImExit />Back</button>
            <div className="tooltip tooltip-top overflow-x-auto" data-tip={!agree ? "You must agree to the Terms of Services and to our Privacy Policy." : ""}>
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