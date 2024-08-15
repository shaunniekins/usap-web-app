import React, { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isPersistent, setIsPersistent] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(); // Call the onConfirm handler passed from the parent component
    setIsPersistent(true);
    onClose(); // Close the modal if persistent state is not set
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900 opacity-50" />
      {/* Modal Content */}
      <div
        className="relative bg-theme p-6 rounded-lg shadow-lg z-10 w-96"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <div className="text-xl font-semibold mb-4">Confirmation</div>
        <div className="mb-4">
          By clicking &quot;Confirm,&quot; you acknowledge that you have read and accepted
          the
          <a
            href="/privacy-policy"
            className="text-blue-500 underline ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          and the
          <a
            href="/terms-and-conditions"
            className="text-blue-500 underline ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </a>
          .
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
