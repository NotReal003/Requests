import React, { useState } from "react";
import Modal from '../components/Focus';

const Focus = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">
          React Focus Lock with DaisyUI
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          A clean and professional modal with focus-locking capabilities.
        </p>
      </header>
      <main>
        <button className="btn btn-accent btn-lg" onClick={openModal}>
          Open Modal
        </button>
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Focus;
