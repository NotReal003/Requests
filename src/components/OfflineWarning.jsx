import React from "react";
import { MdWifiOff } from "react-icons/md";

const OfflineWarning = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100">
      <div className="text-center px-4 md:px-0">
        <div className="mb-6">
          <MdWifiOff className="w-20 h-20 mx-auto text-red-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold mb-4 md:text-4xl">You're Offline</h1>
        <p className="text-gray-300 text-lg mt-2 mb-4">
          Please check your internet connection.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default OfflineWarning;
