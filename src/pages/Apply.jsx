import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import { FaPeopleGroup } from "react-icons/fa6";
import toast, { Toaster } from 'react-hot-toast';
import { FaSpinner } from "react-icons/fa";

const Apply = () => {
  const [inGameName, setInGameName] = useState('');
  const [messageLink, setMessageLink] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const API = process.env.REACT_APP_API;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      toast.warning('You must be logged in to submit an application.');
      setIsLoading(false);
      return;
    }

    const payload = {
      inGameName,
      messageLink,
      additionalInfo,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      toast.error('Our server is not responding please try again later.');
      setIsLoading(false);
    }, 10000);

    try {
      const response = await fetch(`${API}/requests/guild`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'There was an issue submitting your application. Please try again.');
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
    <div className="flex flex-col items-center justify-center p-2 min-h-screen">
      <Toaster />
      <div className="form-container w-full max-w-md md:max-w-lg mx-auto shadow-lg rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4 fill-current flex items-center justify-center">
          <FaPeopleGroup className="size-6 mr-2" /> Guild Application
        </h1>
        <div role="alert" className="alert">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info h-6 w-6 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Please make sure you provide us your exact In-Game-Name or we may will be not able to invite you to the Guild, also fill in your answers.</span>
        </div>
        <form id="guildApplicationForm" onSubmit={handleSubmit}>
          <label htmlFor="inGameName" className="label">In-Game Name (required)</label>
          <input
            id="inGameName"
            name="inGameName"
            className="input input-bordered w-full"
            type="text"
            placeholder="Enter your in-game name"
            value={inGameName}
            onChange={(e) => setInGameName(e.target.value)}
            required
          />

          <label htmlFor="messageLink" className="label">Reason for joining the guild? (required)</label>
          <textarea
            id="messageLink"
            name="messageLink"
            className="textarea textarea-bordered w-full"
            rows="3"
            placeholder="Let us know why you want to join"
            value={messageLink}
            onChange={(e) => setMessageLink(e.target.value)}
            required
          />

          <label htmlFor="additionalInfo" className="label">Anything else? (Optional)</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            className="textarea textarea-bordered w-full"
            rows="2"
            placeholder="Feel free to leave this field blank"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          ></textarea>
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
                <a href="https://support.notreal003.xyz/terms" className="link link-primary" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
                <a href="https://support.notreal003.xyz/privacy" className="link link-primary" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </span>
            </label>
          </div>
          <div className="sticky bottom-0 left-0 right-0 w-full bg-base-100 flex justify-between  border-1 border-t-slate-100 items-center rounded-lg p-4 pb-2">
            <Link to="/" className="btn btn-info no-animation hover:text-warning"><ImExit />Back</Link>
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
