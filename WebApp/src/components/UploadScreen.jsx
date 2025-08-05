import { FiUpload, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { clsx } from 'clsx';

// Status upload
const STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error'
};

const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <FiLoader className="animate-spin text-5xl text-brand-pink" />
        <p className="text-xl font-medium text-brand-lavender">Analyzing your receipt...</p>
        <p className="text-sm text-brand-lavender/80">This might take a moment.</p>
    </div>
);

const UploadScreen = ({ onUploadSuccess }) => {
    const [uploadStatus, setUploadStatus] = React.useState(STATUS.IDLE);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleFile = React.useCallback(async (file) => {
        if (!file) return;

        // Tolak jenis file yang tidak disupport
        const supportedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff'];
        if (!supportedTypes.includes(file.type)) {
            alert('Unsupported file type. Please upload a JPEG, PNG, BMP, or TIFF image.');
            return;
        }

        localStorage.removeItem('bitsplit_people');
        localStorage.removeItem('bitsplit_items');
        localStorage.removeItem('bitsplit_assignments');

        setUploadStatus(STATUS.UPLOADING);

        const functionAppUrl = 'https://billsplitterfunction-node-hjb6gye8f4bsgqdy.eastus-01.azurewebsites.net';
        const getSasUrlFunction = `${functionAppUrl}/api/get_upload_url`;
        const getResultsFunction = `${functionAppUrl}/api/get_receipt_results`;

        try {
            const sasResponse = await fetch(getSasUrlFunction);
            if (!sasResponse.ok) throw new Error('Could not get the upload URL.');
            const { sasUrl, blobName } = await sasResponse.json();

            await fetch(sasUrl, {
                method: 'PUT',
                body: file,
                headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
            });

            // Polling hasil sudah siap atau tidak setiap 3 detik
            const pollForResults = setInterval(async () => {
                try {
                    const resultsResponse = await fetch(`${getResultsFunction}/${blobName.split('.')[0]}`);
                    if (resultsResponse.ok) {
                        clearInterval(pollForResults);
                        const receiptObject = await resultsResponse.json();
                        
                        if (receiptObject && typeof receiptObject.items === 'string') {
                            receiptObject.items = JSON.parse(receiptObject.items);
                        }
                        
                        onUploadSuccess(receiptObject);
                        setUploadStatus(STATUS.SUCCESS);
                    }
                } catch (pollError) {
                    console.error('Polling error:', pollError);
                }
            }, 3000);
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus(STATUS.ERROR);
        }
    }, [onUploadSuccess]);

    const handleFileChange = (e) => handleFile(e.target.files[0]);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    return (
        <div className="flex items-center justify-center px-4">
            <div className="bg-brand-light-p-purple backdrop-blur-xl shadow-2xl shadow-brand-deep-purple/50 rounded-3xl border-[#ffaddb] border-2 p-10 max-w-md w-full text-center transition-all duration-500 ease-in-out transform hover:scale-105 animate-float">
                {uploadStatus === STATUS.UPLOADING ? <LoadingIndicator /> : (
                    <>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploadStatus === STATUS.UPLOADING} />
                        <h2 className="text-3xl font-bold text-white mb-2">Upload Your Receipt</h2>
                        <p className="text-brand-lavender mb-8">Drag and drop or click to upload.</p>
                        <div
                            onClick={() => fileInputRef.current.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={clsx(
                                'border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300',
                                {
                                    'border-brand-pink bg-brand-pink/10': isDragging,
                                    'border-brand-lavender/50 hover:border-brand-pink hover:bg-brand-pink/10': !isDragging
                                }
                            )}
                        >
                            <FiUpload className="text-4xl text-brand-pink mx-auto mb-4" />
                            <p className="text-white font-semibold">Drop your receipt here</p>
                            <p className="text-sm text-brand-lavender/80">or click to browse</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadScreen;