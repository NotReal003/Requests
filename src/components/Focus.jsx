import React from "react";
import FocusLock from "react-focus-lock";

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()} // Prevent click bubbling
      >
        {/* FocusLock traps focus */}
        <FocusLock>
          <h3 className="font-bold text-lg text-center">Focus-Locked Modal</h3>
          <p className="py-4 text-center">
            This modal traps focus. Use "Tab" to navigate within it.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
            <button className="btn btn-outline">Another Action</button>
          </div>
        </FocusLock>
      </div>
    </div>
  );
};

export default Modal;
