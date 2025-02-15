import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaDiscord } from "react-icons/fa";
import { FcLock } from "react-icons/fc";
import toast, { Toaster } from 'react-hot-toast';

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null); // State to handle API errors
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // Get Code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setLoading(true);
      // Discord Auth
      axios.get(`https://api.notreal003.xyz/auth/callback?code=${code}`, {
        withCredentials: true,
      })
        .then(response => {
          if (response.status === 200) {
            const token = response.data.jwtToken;
            navigator.clipboard.writeText(token); // for a minute 

            document.cookie = `token=${token}; domain=notreal003.xyz; path=/; max-age=${6.048e8 / 1000}; httpOnly: true;`;

            toast('Verification In Process...');
            // user auth
            axios.get(`https://api.notreal003.xyz/auth/user?callback=${token}`, {
              withCredentials: true,
            })
              .then(userResponse => {
                if (userResponse.status === 200) {
                  window.location.href = 'https://request.notreal003.xyz/profile';
                }
              })
              .catch(userError => {
                console.error('Error during user authentication:', userError);
                setLoading(false);
                setError(userError.response?.data?.message || 'An error occurred while verifying user.');
              });
          }
        })
        .catch(error => {
          console.error('Error during authentication:', error);
          // Set error message from the API response
          setLoading(false);
          setError(error.response?.data?.message || 'An error occurred while signing in.');
        });
    } else {
      toast.error('No authorization code found in URL. Please SignIn again.');
      setError('No authorization code found in URL. Please SignIn again.');
      setLoading(false);
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 shadow-lg">
  <Toaster />
  
  {/* Icons Section */}
  <div className="flex items-center space-x-6 mb-6">
    <FcLock className="h-14 w-14 text-gray-700" />
    <span className="text-3xl font-semibold">+</span>
    <FaDiscord className="h-16 w-16 text-blue-600" />
  </div>

  {/* Loading State */}
  {loading && (
    <div className="flex flex-col items-center mt-6 space-y-4">
      <FaSpinner className="h-6 w-6 animate-spin text-gray-600" />
      <p className="font-serif text-center text-gray-700">
        Please wait while we are securely connecting your Discord account.
      </p>
    </div>
  )}

  {/* Error Message */}
  {error && (
    <div className="mt-6 px-4 py-2 text-center font-serif text-red-500 border border-red-400 rounded-md bg-red-100">
      <strong>{error}</strong>
    </div>
  )}
</div>

  );
};

export default Callback;
