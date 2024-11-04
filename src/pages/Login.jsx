import React, { useEffect } from 'react';
import { FaDiscord, FaEnvelope } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { IoLogoGithub } from "react-icons/io";

const Login = () => {
  useEffect(() => {
    //..
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="bg-black bg-opacity-50 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Login</h1>
        <p className="text-center text-white mb-8">Choose a login method to continue.</p>

        <button
          onClick={() => window.location.href = 'https://api.notreal003.xyz/auth/signin'}
          className="btn btn-outline btn-primary w-full flex items-center justify-center gap-2 transition-all duration-200 hover:bg-primary hover:border-primary hover:text-white"
          aria-label="Login with Discord"
        >
          <FaDiscord aria-hidden="true" />
          <span>Login with Discord</span>
        </button>

        <Link
          to="/email-signin"
          className="btn btn-outline btn-primary w-full mt-5 flex items-center justify-center gap-2 transition-all duration-200 hover:bg-primary hover:border-primary hover:text-white"
          aria-label="Login with Email"
        >
          <FaEnvelope aria-hidden="true" />
          <span>Login with Email</span>
        </Link>

        <div className="tooltip tooltip-info w-full mt-5" data-tip="GitHub Login is currently not accepted.">
          <button
            disabled
            className="btn btn-outline btn-primary w-full flex items-center justify-center gap-2 transition-all duration-200 cursor-not-allowed"
            aria-label="GitHub login disabled"
          >
            <IoLogoGithub aria-hidden="true" />
            <span>Login with GitHub</span>
          </button>
        </div>

        {/* Defer rendering of this non-essential paragraph */}
        <p className="text-center text-white mt-5 lazy-load-content">
          Don’t have an account?{" "}
          <Link to="/email-signup" className="text-info font-bold hover:underline">
            Sign up with Email
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
