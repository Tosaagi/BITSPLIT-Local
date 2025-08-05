import useState from 'react';
import Header from "./components/Header";
import UploadScreen from "./components/UploadScreen";
import ItemAssignmentScreen from "./components/ItemAssignmentScreen";
import Footer from './components/Footer';

function App() {
  // Menggunakan data pada localStorage jika ada
  const [receiptData, setReceiptData] = useState(() => {
    const savedItems = localStorage.getItem('bitsplit_items');
    const savedTax = localStorage.getItem('bitsplit_tax');

    if (savedItems && JSON.parse(savedItems).length > 0) {
      return {
        items: JSON.parse(savedItems),
        tax: savedTax ? JSON.parse(savedTax) : 0,
      };
    }
    
    return null;
  });

  // lifting state up dari UploadScreen.jsx
  const handleUploadSuccess = (data) => {
    const receiptObject = data || null;

    if (receiptObject && receiptObject.items && Array.isArray(receiptObject.items)) {
      setReceiptData(receiptObject);
    } else {
      console.error("Received invalid data from backend.", data);
    }
  };

  const handleBack = () => {
    setReceiptData(null);
  };

  return (
    <div className="min-h-screen font-myfont bg-[url('/Clouds.png')] bg-fixed bg-center bg-cover bg-no-repeat">
      <Header />
      <main>
        {/* Mengatur layar apa yang akan ditampilkan berdasarkan ada atau tidaknya nilai receiptData */}
        {receiptData ? (
          <ItemAssignmentScreen receiptData={receiptData} onBack={handleBack} />
        ) : (
          <UploadScreen onUploadSuccess={handleUploadSuccess} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;