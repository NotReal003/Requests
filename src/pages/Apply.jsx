import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { FaPeopleGroup } from "react-icons/fa6";
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from "react-icons/fa";
import { BiLoaderCircle } from "react-icons/bi";
import DOMPurify from "dompurify";

const Apply = () => {
  const [inGameName, setInGameName] = useState('');
  const [messageLink, setMessageLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const API = process.env.REACT_APP_API;

  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // Allow no tags
      ALLOWED_ATTR: []  // Allow no attributes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      toast.error('You must be logged in to submit an application.');
      setIsLoading(false);
      return;
    }

    const sanitizedInGameName = sanitizeInput(inGameName);
    const sanitizedMessageLink = sanitizeInput(messageLink);
    const sanitizedAdditionalInfo = sanitizeInput(additionalInfo);

    const payload = {
      inGameName: sanitizedInGameName,
      messageLink: sanitizedMessageLink,
      additionalInfo: sanitizedAdditionalInfo,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      toast.error('Our server is not responding please try again later.');
      setIsLoading(false);
    }, 10000);

    try {
      const response = await fetch(`${API}/requests/application`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });


      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'There was an issue submitting your application. Please try again.');
        setIsLoading(false);
        return;
      }

      toast.success(data.message || 'Application submitted successfully.');
      setInGameName('');
      setMessageLink('');
      setAdditionalInfo('');
      setIsLoading(false);
      navigate(`/success?request=${data.requestId}`);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error:', error);
        toast.error('There was an error submitting your application. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-2">
        <h1 className="text-2xl font-bold mb-4 fill-current flex items-center justify-center">
          <FaPeopleGroup className="size-6 mr-2" /> Application
        </h1>
        <div role="alert" className="alert alert-info">
          <span>Please make sure you provide us your exact username or we may will be not able to invite you, also please fill in your answers.</span>
        </div>
        <form id="guildApplicationForm" onSubmit={handleSubmit}>
          <label htmlFor="inGameName" className="label">Username (required)</label>
          <input
            id="inGameName"
            name="inGameName"
            className="input input-bordered w-full"
            type="text"
            placeholder="Enter your username"
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            maxLength={16}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
              {16 - inGameName.length} characters remaining
            </p>

          <label htmlFor="messageLink" className="label">Reason for joining the team? (required)</label>
          <textarea
            id="messageLink"
            name="messageLink"
            className="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Let us know why you want to join"
            value={messageLink}
            onChange={(e) => setMessageLink(e.target.value)}
            maxLength={1750}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
              {1750 - messageLink.length} characters remaining
            </p>

          <label htmlFor="additionalInfo" className="label">Anything else? (Optional)</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            className="textarea textarea-bordered w-full"
            rows="2"
            placeholder="Feel free to leave this field blank"
            value={additionalInfo}
            maxLength={1750}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          ></textarea>
          <p className="text-sm text-gray-500 mt-1">
              {1750 - additionalInfo.length} characters remaining
            </p>
          <div className="terms mr-2 mb-2">
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
              <span className="label-text ml-2 text-justify">
                By clicking here you will agree with NotReal003's {' '}
                <a href="https://support.notreal003.org/terms" className="link link-primary" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
                <a href="https://support.notreal003.org/privacy" className="link link-primary" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </span>
            </label>
          </div>
          <div className="sticky bottom-0 left-0 right-0 w-full bg-base-100 flex justify-between  border-1 border-t-slate-100 items-center rounded-lg p-4 pb-2">
            <button onClick={() => navigate(-1)} className="btn btn text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg no-animation"><ImExit />Back</button>
            <div className="tooltip tooltip-top overflow-x-auto" data-tip={!agree ? "You must agree to our Terms of Services and Privacy Policy" : ""}>
              <button type="submit" className="btn btn-primary no-animation" disabled={isLoading || !agree}>
                {isLoading ? <span><FaSpinner className="animate-spin inline-block align-middle mr-2" /> Submit</span> : <><IoSend className="inline-block align-middle mr-2" /> Submit</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;
