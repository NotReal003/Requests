import React from 'react';
import { PiDetectiveFill } from "react-icons/pi";


const AdminOnly = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="text-center">
        <div className="mb-4">
          <PiDetectiveFill className="w-16 h-16 mx-auto text-gray-500" />
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
