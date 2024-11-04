// src/pages/404.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaRegFaceGrinBeamSweat } from "react-icons/fa6";
import { House } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center mx-auto p-4">
      <div className="form-container min-h-screen text-center">
        <h1 className="text-4xl font-bold mb-4">404 - This Page Was Not Found</h1>
        <p className="mb-4"><FaRegFaceGrinBeamSweat className="animate-pulse inline-block align-middle mr-1" /> The page you are looking for does not exist</p>
        <Link to="/" className="btn btn-outline btn-primary w-full"><House className="size-4" /> Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
