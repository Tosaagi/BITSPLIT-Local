import { useState, useMemo, useEffect, useCallback } from 'react';
import { FiChevronsLeft, FiPlus } from 'react-icons/fi';
import StyledButton from '../components/StyledButton';
import PeopleManager from '../components/PeopleManager';
import ItemCard from '../components/ItemCard';
import Summary from '../components/Summary';
import ConfirmationSummaryModal from '../components/ConfirmationSummaryModal';

const ItemAssignmentScreen = ({ receiptData, onBack }) => {
    // Memuat data dari localStorage
    const loadFromStorage = (key, defaultValue) => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return defaultValue;
        }
    };

    const [people, setPeople] = useState(() => loadFromStorage('bitsplit_people', []));
    const [items, setItems] = useState(() => {
        const storedItems = loadFromStorage('bitsplit_items', null);
        if (storedItems) return storedItems;
        return Array.isArray(receiptData?.items) 
            ? receiptData.items.map(item => ({ ...item, id: crypto.randomUUID() })) 
            : [];
    });
    const [assignments, setAssignments] = useState(() => loadFromStorage('bitsplit_assignments', {}));
    const [splitItems, setSplitItems] = useState(() => loadFromStorage('bitsplit_splitItems', {}));
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    // Simpan data ke localStorage setiap kali ada perubahan pada state utama
    useEffect(() => {
        localStorage.setItem('bitsplit_people', JSON.stringify(people));
        localStorage.setItem('bitsplit_items', JSON.stringify(items));
        localStorage.setItem('bitsplit_assignments', JSON.stringify(assignments));
        localStorage.setItem('bitsplit_splitItems', JSON.stringify(splitItems));
    }, [people, items, assignments, splitItems]);

    // Mencegah kalkulasi yang tidak perlu pada setiap render menggunakan useMemo
    const receiptDetails = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
        const tax = receiptData?.tax || 0;
        const total = Number(subtotal) + Number(tax);
        return { subtotal, tax, total };
    }, [items, receiptData?.tax]);

    const handleAddPerson = useCallback((name) => {
        if (name && !people.includes(name)) setPeople(prev => [...prev, name]);
    }, [people]);

    const handleRemovePerson = useCallback((personToRemove) => {
        setPeople(prev => prev.filter(p => p !== personToRemove));
        const newAssignments = { ...assignments };
        Object.keys(newAssignments).forEach(itemId => {
            delete newAssignments[itemId]?.[personToRemove];
        });
        setAssignments(newAssignments);
    }, [assignments]);

    const handleAddItem = useCallback(() => {
        const newItem = { id: crypto.randomUUID(), description: 'New Item', quantity: 1, totalPrice: 0 };
        setItems(prev => [...prev, newItem]);
    }, []);

    const handleRemoveItem = useCallback((id) => {
        setItems(prev => prev.filter(item => item.id !== id));
        const { [id]: _, ...rest } = assignments;
        setAssignments(rest);
    }, [assignments]);

    const handleItemChange = useCallback((id, field, value) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    }, []);

    const handleAssignmentChange = useCallback((itemId, newAssignment) => {
        setAssignments(prev => ({ ...prev, [itemId]: newAssignment }));
    }, []);

    // Mode split, yaitu membagi item untuk banyak orang hingga tak terbatas tanpa memperhatikan kuantitas
    const handleToggleSplit = useCallback((itemId) => {
        setSplitItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
        setAssignments(prev => ({ ...prev, [itemId]: {} }));
    }, []);

    // Menghitung total tagihan untuk setiap orang berdasarkan item yang dialokasikan kepada mereka.
    const totals = useMemo(() => {
        const personTotals = {};
        people.forEach(person => { personTotals[person] = { subtotal: 0, items: [] }; });
        personTotals['Unassigned'] = { subtotal: 0, items: [] };

        items.forEach(item => {
            const assignment = assignments[item.id];
            const isSplit = splitItems[item.id];
            
            if (isSplit && assignment) {
                const totalShares = Object.values(assignment).reduce((sum, shares) => sum + shares, 0);
                if (totalShares === 0) {
                    personTotals['Unassigned'].subtotal += item.totalPrice;
                    return;
                }
                const pricePerShare = item.totalPrice / totalShares;
                Object.entries(assignment).forEach(([person, shares]) => {
                    if (personTotals[person]) {
                        const itemPrice = pricePerShare * shares;
                        personTotals[person].subtotal += itemPrice;
                        personTotals[person].items.push({
                            description: `share${shares > 1 ? 's' : ''} of ${item.description}`,
                            quantity: shares,
                            price: itemPrice
                        });
                    }
                });
            } else {
                const pricePerUnit = item.totalPrice / (item.quantity || 1);
                const totalAssignedQuantity = assignment ? Object.values(assignment).reduce((sum, qty) => sum + qty, 0) : 0;
                
                if (assignment) {
                    Object.entries(assignment).forEach(([person, quantity]) => {
                        if (personTotals[person]) {
                            const itemPrice = pricePerUnit * quantity;
                            personTotals[person].subtotal += itemPrice;
                            personTotals[person].items.push({
                                description: item.description,
                                quantity: quantity,
                                price: itemPrice
                            });
                        }
                    });
                }
                if (totalAssignedQuantity < item.quantity) {
                    const unassignedQuantity = item.quantity - totalAssignedQuantity;
                    personTotals['Unassigned'].subtotal += pricePerUnit * unassignedQuantity;
                }
            }
        });

        const { subtotal: totalSubtotal, tax: totalTax } = receiptDetails;

        // Membagi pajak secara proporsional
        // Orang yang total harga itemnya makin besar, maka distribusi pajak akan semakin besar
        Object.keys(personTotals).forEach(person => {
            const pSubtotal = personTotals[person].subtotal;
            const pTax = totalSubtotal > 0 ? (pSubtotal / totalSubtotal) * totalTax : 0;
            personTotals[person].tax = pTax;
            personTotals[person].total = pSubtotal + pTax;
        });

        return personTotals;
    }, [assignments, people, items, receiptDetails, splitItems]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 lg:px-32 font-sans">
                <div className="max-w-7xl mx-auto">
                    <button onClick={onBack} className="flex items-center space-x-2 mb-2 text-indigo-600 font-semibold hover:text-indigo-800 hover:cursor-pointer transition-colors">
                        <FiChevronsLeft />
                        <span>Scan Another</span>
                    </button>
                    <div className='mb-6'>
                        <h1 className="text-3xl font-bold text-gray-800">Split the Bill</h1>
                        <p className="text-gray-500 mt-1">Assign items to people and we'll do the math.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            <PeopleManager people={people} onAddPerson={handleAddPerson} onRemovePerson={handleRemovePerson} />
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">Receipt Items</h3>
                                    <StyledButton className='hover:cursor-pointer' onClick={handleAddItem} variant="secondary">
                                        <FiPlus />
                                        <span>Add Item</span>
                                    </StyledButton>
                                </div>
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            people={people}
                                            assignment={assignments[item.id]}
                                            isSplit={!!splitItems[item.id]}
                                            onToggleSplit={handleToggleSplit}
                                            onAssignmentChange={handleAssignmentChange}
                                            onItemChange={handleItemChange}
                                            onRemoveItem={handleRemoveItem}
                                        />
                                    ))}
                                    {items.length === 0 && <p className="text-center text-gray-500 py-8">No items on this receipt. Add one to get started!</p>}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <Summary
                                totals={totals}
                                receiptDetails={receiptDetails}
                                people={people}
                                onConfirm={() => setIsSummaryModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                totals={totals}
                receiptDetails={receiptDetails}
                people={people}
            />
        </>
    );
};

export default ItemAssignmentScreen;
