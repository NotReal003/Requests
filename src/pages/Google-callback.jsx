import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaLock } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { FaGoogle } from "react-icons/fa6";

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
      axios.get(`https://api.notreal003.xyz/auth/google/callback?code=${code}`, {
        withCredentials: true,
      })
        .then(response => {
          if (response.status === 200) {
            const token = response.data.jwtToken;

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
    <div className="flex flex-col items-center justify-center min-h-screen shadow-lg">
      <Toaster />
      <div className="flex items-center space-x-4">
        <FaLock className="h-14 w-14 m-4" />
        <span className="text-3xl m-4 mr-4 ml-4">+</span>
        <FaGoogle className="h-16 w-16 m-4 ml-4" />
      </div>
      {loading && (
        <div className="flex items-center mt-8 m-4">
          <div className="flex items-center justify-center">
            <FaSpinner className="animate-spin inline-block align-middle m-4" />
          </div>
          <p className="font-serif">Please wait while we are securely connecting your Google account.</p>
        </div>
      )}
      {error && (
        <div className="mt-8 m-4 font-serif text-red-500 justify-center">
          <strong>{error}</strong>
        </div>
      )}
    </div>
  );
};

export default Callback;
