import React from 'react';
import { FaChartBar, FaTools, FaDiscord } from "react-icons/fa";

const NoAPI = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-screen bg-base-100 text-white">
      <div className="text-center">
        <div className="mb-4">
          <FaTools className="w-16 h-16 mx-auto text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold">Under Maintenance</h1>
        <p className="text-gray-400 mt-2">
          Our API is currently undergoing maintenance. You won’t be able to make requests at this time.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <FaDiscord className="text-indigo-400 w-5 h-5" />
          <a
            href="https://discord.gg/sqVBrMVQmp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Join our Discord for updates
          </a>
          <FaChartBar className="text-indigo-400 w-5 h-5" />
          <a
            href="https://check.notreal003.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Check current issues status
          </a>
        </div>
      </div>
    </div>
  );
};

export default NoAPI;
