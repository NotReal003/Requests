import React from "react";
import FocusLock from "react-focus-lock";

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel} // Close modal when clicking outside
    >
      <div
        className="bg-gray-800 text-white rounded-lg shadow-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // Prevent click bubbling
      >
        <FocusLock>
          <h3 className="text-lg font-semibold">Are you sure?</h3>
          <p className="text-gray-400 mt-2">
            Do you really want to logout? You’ll need to log back in to access your account.
          </p>
          <div className="flex justify-end mt-4 space-x-3">
            <button
              className="px-4 py-2 bg-gray-700 rounded text-gray-300 hover:bg-gray-600 focus:ring focus:ring-gray-500"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:ring focus:ring-red-500"
              onClick={onConfirm}
            >
              Logout
            </button>
          </div>
        </FocusLock>
      </div>
    </div>
  );
};

export default LogoutModal;
