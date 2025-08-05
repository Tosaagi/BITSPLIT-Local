import { FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import StyledButton from './StyledButton';

const AlertModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full transform transition-all animate-fadeAndZoomIn">
                <div className="flex justify-center items-center mb-4">
                    <FiAlertTriangle className="text-yellow-500" size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">Alert</h3>
                    <p className="text-gray-600 mt-2 mb-6">{message}</p>
                </div>
                <StyledButton onClick={onClose} className="w-full !py-3">
                    OK
                </StyledButton>
            </div>
        </div>
    );
};

export default AlertModal;