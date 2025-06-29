import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { FcGoogle, FcLock } from "react-icons/fc";

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
      axios.get(`https://api.notreal003.org/auth/google/callback?code=${code}`, {
        withCredentials: true,
      })
        .then(response => {
          if (response.status === 200) {
            const token = response.data.jwtToken;

            document.cookie = `token=${token}; domain=notreal003.org; path=/; max-age=${6.048e8 / 1000}; httpOnly: true;`;

            toast('Verification In Process...');
            // user auth
            axios.get(`https://api.notreal003.org/auth/user?callback=${token}`, {
              withCredentials: true,
            })
              .then(userResponse => {
                if (userResponse.status === 200) {
                  window.location.href = 'https://request.notreal003.org/profile';
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
    <FcLock className="h-16 w-16" />
    <span className="text-3xl font-bold">+</span>
    <FcGoogle className="h-16 w-16" />
  </div>

  {/* Loading State */}
  {loading && (
    <div className="flex flex-col items-center text-center mt-6">
      <FaSpinner className="animate-spin h-6 w-6 text-gray-700 mb-3" />
      <p className="font-serif text-lg text-gray-700">
        Please wait while we securely connect your Google account.
      </p>
    </div>
  )}

  {/* Error Message */}
  {error && (
    <div className="mt-6 px-4 py-2 bg-red-100 text-red-600 font-serif rounded-lg text-center">
      <strong>{error}</strong>
    </div>
  )}
</div>

  );
};

export default Callback;
