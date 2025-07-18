import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, ArrowRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Layout from '../components/Layout';

const QRScanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { vendors } = useData();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const vendorId = searchParams.get('vendor');
    if (vendorId) {
      setSelectedVendor(vendorId);
    }
  }, [searchParams]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      if (selectedVendor) {
        // Navigate to member dashboard with vendor filter
        navigate(`/member?vendor=${selectedVendor}`);
      } else {
        navigate('/member');
      }
    }, 2000);
  };

  const handleManualSelect = () => {
    if (selectedVendor) {
      navigate(`/member?vendor=${selectedVendor}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <QrCode className="h-16 w-16 text-blue-900" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            QR Code Scanner
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Scan a vendor's QR code to view their exclusive deals
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Simulated QR Scanner */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {isScanning ? (
              <div className="animate-pulse">
                <div className="h-32 w-32 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                <p className="text-gray-600">Scanning QR code...</p>
              </div>
            ) : (
              <div>
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Point your camera at the QR code</p>
                <button
                  onClick={handleSimulateScan}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Simulate Scan
                </button>
              </div>
            )}
          </div>

          {/* Manual Vendor Selection */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Or select a vendor manually:</p>
            </div>
            
            <div>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Choose a vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedVendor && (
              <button
                onClick={handleManualSelect}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>View {vendors.find(v => v.vendorId === selectedVendor)?.name} Deals</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Access Links */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 text-center mb-3">Quick Access:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/member')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View All Deals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;