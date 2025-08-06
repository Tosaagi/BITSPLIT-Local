import { useState } from 'react';
import { FiPlus, FiMinus, FiX, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import { BiCut } from 'react-icons/bi';
import StyledButton from './StyledButton';
import { formatCurrency } from '../utils/formatCurrency';

const ItemCard = ({ item, people, assignment, onAssignmentChange, onItemChange, onRemoveItem, isSplit, onToggleSplit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState(item);
    const [error, setError] = useState(null);

    const handleSave = () => {
        setError(null);
        onItemChange(item.id, 'description', editedItem.description);
        onItemChange(item.id, 'quantity', parseFloat(editedItem.quantity) || 1);
        onItemChange(item.id, 'totalPrice', parseFloat(editedItem.totalPrice) || 0);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setError(null);
        setEditedItem(item);
        setIsEditing(false);
    };

    const toggleAssignPerson = (personName) => {
        setError(null);
        const newAssignment = { ...(assignment || {}) };

        if (newAssignment[personName]) {
            delete newAssignment[personName];
        } else {
            const totalAssignedQuantity = Object.values(newAssignment).reduce((sum, qty) => sum + qty, 0);
            if (totalAssignedQuantity >= item.quantity) {
                setError(`Max quantity of ${item.quantity} already assigned.`);
                return;
            }
            newAssignment[personName] = 1;
        }
        onAssignmentChange(item.id, newAssignment);
    };
    
    const handleQuantityChange = (personName, newQuantity) => {
        setError(null);
        const newAssignment = { ...(assignment || {}) };
        let parsedQuantity = parseInt(newQuantity, 10);
        const assignedToOthers = Object.entries(newAssignment)
            .filter(([person]) => person !== personName)
            .reduce((sum, [, qty]) => sum + qty, 0);
        const maxAllowed = item.quantity - assignedToOthers;

        if (isNaN(parsedQuantity) || parsedQuantity < 1) parsedQuantity = 1;
        if (parsedQuantity > maxAllowed) {
            parsedQuantity = maxAllowed;
            setError(`Quantity capped at the maximum available (${maxAllowed}).`);
        }

        newAssignment[personName] = parsedQuantity;
        onAssignmentChange(item.id, newAssignment);
    };

    const handleShareChange = (personName, change) => {
        setError(null);
        const newAssignment = { ...(assignment || {}) };
        const currentShares = newAssignment[personName] || 0;
        let newShares = currentShares + change;

        if (newShares < 1) {
            delete newAssignment[personName];
        } else {
            newAssignment[personName] = newShares;
        }
        onAssignmentChange(item.id, newAssignment);
    };

    if (isEditing) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-md border border-indigo-300">
                <input type="text" value={editedItem.description} onChange={e => setEditedItem({...editedItem, description: e.target.value})} className="font-bold text-gray-900 bg-gray-100 p-2 rounded-md w-full mb-2" />
                <div className="flex space-x-2 mb-2">
                    <input type="number" value={editedItem.quantity} onChange={e => setEditedItem({...editedItem, quantity: e.target.value})} className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md w-1/2" placeholder="Qty" />
                    <input type="number" value={editedItem.totalPrice} onChange={e => setEditedItem({...editedItem, totalPrice: e.target.value})} className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md w-1/2" placeholder="Price" />
                </div>
                <div className="flex justify-end space-x-2">
                    <StyledButton onClick={handleCancel} variant="secondary" className="!py-1 !px-2"><FiX /></StyledButton>
                    <StyledButton onClick={handleSave} variant="primary" className="!py-1 !px-2"><FiCheck /></StyledButton>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl shadow-lg group transition-all duration-300 hover:shadow-xl border ${isSplit ? 'bg-purple-50 border-purple-400' : 'bg-white hover:border-indigo-400 border-transparent'}`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-bold text-gray-800">{item.description}</p>
                    <p className="text-sm text-gray-500">
                        {isSplit ? 
                            `Total Price: ${formatCurrency(item.totalPrice)}` :
                            `${item.quantity} x ${formatCurrency(item.totalPrice / item.quantity)} = ${formatCurrency(item.totalPrice)}`
                        }
                    </p>
                </div>
                <div className="flex items-center space-x-1 opacity-100">
                    <button
                        onClick={() => onToggleSplit(item.id)}
                        title="Toggle split mode"
                        className={`p-2 text-gray-500 rounded-md ${
                            isSplit
                            ? 'bg-purple-200 text-purple-700'
                            : 'hover:bg-teal-100 hover:text-teal-600'
                        }`}
                    >
                        <BiCut size={16} />
                    </button>
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-md"><FiEdit size={16} /></button>
                    <button onClick={() => onRemoveItem(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md"><FiTrash2 size={16} /></button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-dashed">
                {isSplit ? (
                    people.map(person => (
                        <div key={person} className={`flex items-center pl-3 pr-2 py-1 rounded-full transition-all duration-200 ${assignment && assignment[person] ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700'}`}>
                            <span>{person}</span>
                            <button onClick={() => handleShareChange(person, 1)} className="ml-2 text-white bg-purple-500 hover:bg-purple-400 rounded-full p-0.5 transition-colors"><FiPlus size={16} /></button>
                            {assignment?.[person] && <button onClick={() => handleShareChange(person, -1)} className="ml-2 text-white hover:bg-purple-500 rounded-full p-0.5 transition-colors"><FiMinus size={16} /></button>}
                            {assignment?.[person] && <span className="ml-2 text-xs font-bold">{assignment[person]}</span>}
                        </div>
                    ))
                ) : (
                    people.map(person => {
                        const isAssigned = assignment && assignment[person];
                        return (
                             <div key={person} className="flex items-center">
                                <button onClick={() => toggleAssignPerson(person)} className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-200 ${isAssigned ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {person}
                                </button>
                                {isAssigned && (
                                    <input type="number" min="1" value={assignment[person]} onChange={(e) => handleQuantityChange(person, e.target.value)} onClick={(e) => e.stopPropagation()} className="w-14 ml-2 p-1 border border-gray-300 rounded-md text-center text-xs bg-white" />
                                )}
                            </div>
                        );
                    })
                )}
                {people.length === 0 && <p className="text-xs text-gray-400 italic">Add people to start assigning items.</p>}
            </div>
            {error && ( <p className="text-red-600 text-xs font-semibold mt-2">{error}</p> )}
        </div>
    );
};

export default ItemCard;