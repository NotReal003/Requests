import React, { useState } from "react";
import LogoutModal from "../components/Focus";

const Focus = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleLogout = () => {
    closeModal();
    console.log("User logged out");
    // Add logout functionality here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Logout Confirmation Modal</h1>
        <p className="text-gray-400 mt-2">A modern, Discord-inspired logout modal.</p>
      </header>
      <main>
        <button
          className="px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 focus:ring focus:ring-blue-400"
          onClick={openModal}
        >
          Logout
        </button>
      </main>
      <LogoutModal
        isOpen={isModalOpen}
        onConfirm={handleLogout}
        onCancel={closeModal}
      />
    </div>
  );
};

export default Focus;
