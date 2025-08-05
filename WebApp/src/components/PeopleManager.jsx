import useState from 'react';
import { FiUsers, FiPlus, FiX } from 'react-icons/fi';
import StyledButton from './StyledButton';
import StyledInput from './StyledInput';

const PeopleManager = ({ people, onAddPerson, onRemovePerson }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onAddPerson(name.trim());
            setName('');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><FiUsers className="mr-3 text-indigo-500" />Add People</h3>
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <StyledInput
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter a name..."
                />
                <StyledButton type="submit" className="h-full !px-3"><FiPlus size={20} /></StyledButton>
            </form>
            <div className="flex flex-wrap gap-2 mt-4">
                {people.map(person => (
                    <div key={person} className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-semibold pl-3 pr-2 py-1 rounded-full animate-fadeAndZoomIn">
                        <span>{person}</span>
                        <button onClick={() => onRemovePerson(person)} className="ml-2 text-indigo-500 hover:text-indigo-800 hover:bg-indigo-200 rounded-full p-0.5 transition-colors">
                            <FiX size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeopleManager;