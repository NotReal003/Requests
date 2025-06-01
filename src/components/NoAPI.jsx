import React from 'react';
import { FaChartBar, FaTools, FaDiscord } from "react-icons/fa";

const NoAPI = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <FaTools className="w-24 h-24 mx-auto text-gray-400" />
          <h1 className="text-4xl font-bold mt-4">Under Maintenance</h1>
          <p className="text-gray-300 mt-2">
            Our API is currently undergoing scheduled maintenance. This is expected to last until approximately 8:00 PM IST. During this time, API requests will not be processed. We apologize for any inconvenience.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <a
              href="https://discord.gg/sqVBrMVQmp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <FaDiscord className="w-5 h-5" />
              Join our Discord for updates
            </a>
            <a
              href="https://check.notreal003.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <FaChartBar className="w-5 h-5" />
              Check current issues status
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            Last updated: Jun 01, 2025, 06:10 PM IST
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoAPI;
