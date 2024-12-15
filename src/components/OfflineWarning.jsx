import React, { useEffect, useState } from "react";
import { MdWifiOff } from "react-icons/md";

const OfflineWarning = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-gray-300">
      <div className="text-center">
        <div className="mb-4">
          <MdWifiOff className="w-16 h-16 mx-auto text-red-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold">You're Offline</h1>
        <p className="text-gray-400 mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    </div>
  );
};

export default OfflineWarning;
