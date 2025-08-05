import useEffect from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const SuccessModal = ({ isOpen, onClose, title = "Success!", message,}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 transition-opacity duration-300 animate-fadeIn"
      aria-labelledby="success-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all duration-300 animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
             <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
            >
                <FiX size={24} />
            </button>
        </div>

        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
                <FiCheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800" id="success-modal-title">
                {title}
            </h3>
            <p className="text-gray-500 mt-2">
                {message}
            </p>
        </div>

        <div className="mt-8">
            <button
                onClick={onClose}
                className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-md hover:shadow-lg"
            >
                Continue
            </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
