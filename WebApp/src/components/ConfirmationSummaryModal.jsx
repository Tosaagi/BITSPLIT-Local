import useState from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import StyledButton from './StyledButton';
import AlertModal from './AlertModal';
import { formatCurrency } from '../utils/formatCurrency';

const ConfirmationSummaryModal = ({ isOpen, onClose, totals, receiptDetails, people }) => {
    const [alertMessage, setAlertMessage] = useState('');

    const handleShare = async () => {
        let totalCalculated = 0;
        let shareText = "📋 Bill Split Results from BITSPLIT\n===========================================\n";

        people.forEach((person, index) => {
            const personData = totals[person];
            if (!personData) return;

            const displayNumber = index + 1;
            shareText += `${displayNumber}. ${person}: ${formatCurrency(personData.total)}\n`;

            personData.items.forEach(item => {
                shareText += `- ${item.quantity}x ${item.description}`;
                if (item.price !== undefined) {
                    shareText += ` @ ${formatCurrency(item.price)}`;
                }
                shareText += '\n';
            });

            shareText += `  Tax: ${formatCurrency(personData.tax)}\n`;
            totalCalculated += personData.total;

            if (index < people.length - 1) shareText += '\n';
        });


        shareText += "===========================================\n";
        shareText += `Grand Total: ${formatCurrency(receiptDetails.total)}\n`;

        if (receiptDetails.total !== totalCalculated) {
            const unassigned = receiptDetails.total - totalCalculated;
            shareText += `Unassigned: ${formatCurrency(unassigned)}\n`;
        }

        if (navigator.share) {
            try { await navigator.share({ title: 'Bill Split Results', text: shareText }); } 
            catch (error) { console.error('Error sharing:', error); }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                setAlertMessage('Results copied to clipboard!'); 
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                alert('Could not copy results.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full flex flex-col max-h-[90vh]">
                    <div className="flex-shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FiCheckCircle className="text-green-500 mr-3" size={28} /> Confirmed Result
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <FiXCircle size={24} />
                            </button>
                        </div>
                        <p className="text-gray-500 mb-6">Here is the final breakdown of the bill.</p>
                    </div>
                    
                    <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {people.map(person => {
                                const personData = totals[person];
                                if (!personData) return null;
                                
                                return (
                                    <div key={person} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-green-800">{person}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Sub: {formatCurrency(personData.subtotal)} + Tax: {formatCurrency(personData.tax)}
                                                </p>
                                            </div>
                                            <span className="text-xl font-bold text-green-800 flex-shrink-0 ml-4">
                                                {formatCurrency(personData.total)}
                                            </span>
                                        </div>
                                        
                                        <ul className="text-sm text-gray-700 mt-3 space-y-1">
                                            {personData.items.map((item, index) => (
                                                <li key={index} className="flex justify-between items-center">
                                                    <span>• {item.quantity}x {item.description}</span>
                                                    <span className="font-medium">{formatCurrency(item.price)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                            {totals['Unassigned']?.total > 0 && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-yellow-800">Unassigned</h3>
                                        <span className="text-xl font-bold text-yellow-800">{formatCurrency(totals['Unassigned'].total)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 pt-6">
                        <div className="border-t-2 border-dashed pt-4">
                            <div className="flex justify-between text-gray-600 font-medium"><span>Receipt Subtotal</span><span>{formatCurrency(receiptDetails.subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600 font-medium"><span>Receipt Tax</span><span>{formatCurrency(receiptDetails.tax)}</span></div>
                            <div className="flex justify-between text-gray-900 font-bold text-2xl mt-2"><span>Grand Total</span><span>{formatCurrency(receiptDetails.total)}</span></div>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <StyledButton onClick={handleShare} variant="secondary" className="w-full !py-3">Share Results</StyledButton>
                            <StyledButton onClick={onClose} className="w-full !py-3">Done</StyledButton>
                        </div>
                    </div>
                </div>
            </div>
            <AlertModal isOpen={!!alertMessage} onClose={() => setAlertMessage('')} message={alertMessage} />
        </>
    );
};

export default ConfirmationSummaryModal;

