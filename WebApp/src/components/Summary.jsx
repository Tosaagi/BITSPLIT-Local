// src/components/Summary.jsx

import React from 'react';
import { FiPaperclip, FiCheckCircle } from 'react-icons/fi';
import StyledButton from './StyledButton';
import { formatCurrency } from '../utils/formatCurrency';

/**
 * Displays the final summary of totals.
 */
const Summary = ({ totals, receiptDetails, people, onConfirm }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiPaperclip className="mr-3 text-indigo-500"/>Summary</h3>
            <div className="space-y-3 mb-6">
                {people.map(person => (
                    <div key={person} className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-green-800">{person}</h4>
                            <span className="font-bold text-lg text-green-800">{formatCurrency(totals[person]?.total)}</span>
                        </div>
                        <ul className="text-xs text-gray-500 mt-2 pl-4 list-disc">
                            {totals[person]?.items.map((item, index) => (
                                <li key={index}>{item.quantity}x {item.description}</li>
                            ))}
                        </ul>
                        <p className="text-xs text-gray-600 mt-1 text-right">Sub: {formatCurrency(totals[person]?.subtotal)} + Tax: {formatCurrency(totals[person]?.tax)}</p>
                    </div>
                ))}
                {totals['Unassigned']?.total > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-yellow-800">Unassigned</h4>
                            <span className="font-bold text-lg text-yellow-800">{formatCurrency(totals['Unassigned'].total)}</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t-2 border-dashed pt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Receipt Subtotal</span><span>{formatCurrency(receiptDetails.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Receipt Tax</span><span>{formatCurrency(receiptDetails.tax)}</span></div>
                <div className="flex justify-between text-gray-900 font-bold text-xl mt-2"><span>Grand Total</span><span>{formatCurrency(receiptDetails.total)}</span></div>
            </div>
            <div className="mt-6">
                <StyledButton onClick={onConfirm} className="w-full !py-3 !text-base bg-green-600 hover:bg-green-700 hover:cursor-pointer focus:ring-green-500">
                    <FiCheckCircle size={20}/>
                    <span>Confirm & Finish</span>
                </StyledButton>
            </div>
        </div>
    );
};

export default Summary;