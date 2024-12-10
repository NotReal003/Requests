import React from 'react';

const AdminOnly = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <div className="mb-4">
          {/* Replace this with a detective image/icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9.75a1.5 1.5 0 013 0m3 0a1.5 1.5 0 013 0m-12.75.75v2.25m15-2.25v2.25m-9.75 9h5.25a1.5 1.5 0 001.5-1.5V15a4.5 4.5 0 00-9 0v3.75a1.5 1.5 0 001.5 1.5zm0 0H3.75m8.25 0h8.25"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">This Page Isn't Meant for You</h1>
        <p className="text-gray-400 mt-2">
          You do not have the required permissions to access this page.
        </p>
      </div>
    </div>
  );
};

export default AdminOnly;
