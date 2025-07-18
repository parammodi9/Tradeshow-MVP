import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, QrCode, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mockUsers } from '../data/mockData';
import { User } from '../types';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [storeHraId, setStoreHraId] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Member' | 'Guest' | 'Vendor' | 'Admin'>('Member');
  const [useTestUser, setUseTestUser] = useState(false);
  const [selectedTestUser, setSelectedTestUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { stores, addGuest } = useData();
  const navigate = useNavigate();

  const handleQRScan = () => {
    setStoreHraId('HRA-S001');
    toast.success('QR Code scanned! Store HRA ID auto-filled');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      let user: User;
      
      if (useTestUser && selectedTestUser) {
        // Use selected test user
        const testUser = mockUsers.find(u => u.hraId === selectedTestUser);
        if (!testUser) {
          toast.error('Selected test user not found');
          return;
        }
        user = testUser;
      } else {
      // Validation
      if (!email || !name || !address) {
        toast.error('Please fill in all required fields');
        return;
      }

      if ((role === 'Member' || role === 'Guest') && !storeHraId) {
        toast.error('Store HRA ID is required for members and guests');
        return;
      }

      // Create user object
      user = {
        hraId: `HRA${300 + Date.now() % 100}`,
        name,
        email,
        role,
        storeHraIds: role === 'Member' ? [storeHraId] : [],
        address
      };
      }

      // For guests, add to guest table
      if (role === 'Guest') {
        addGuest({
          hraId: `HRA${400 + Date.now() % 100}`,
          name,
          email,
          address,
          optedInDeals: []
        });
      }

      login(user);
      
      // Navigate based on role
      switch (role) {
        case 'Member':
          navigate('/member');
          break;
        case 'Guest':
          navigate('/guest');
          break;
        case 'Vendor':
          navigate('/vendor');
          break;
        case 'Admin':
          navigate('/admin');
          break;
      }

      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Store className="h-12 w-12 text-blue-900" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            HRA Tradeshow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access exclusive deals
          </p>
          
          {/* Test User Toggle */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useTestUser"
                checked={useTestUser}
                onChange={(e) => setUseTestUser(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useTestUser" className="text-sm text-yellow-800">
                Use test user (for demo)
              </label>
            </div>
            
            {useTestUser && (
              <div className="mt-2">
                <select
                  value={selectedTestUser}
                  onChange={(e) => setSelectedTestUser(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select test user...</option>
                  <option value="HRA301">John Smith (Group Store Member)</option>
                  <option value="HRA305">Sarah Johnson (Single Store Member)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!useTestUser && (
              <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="Member">Member</option>
                <option value="Guest">Guest</option>
                <option value="Vendor">Vendor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {(role === 'Member' || role === 'Guest') && (
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="storeHraId" className="block text-sm font-medium text-gray-700">
                    Store HRA ID
                  </label>
                  <button
                    type="button"
                    onClick={handleQRScan}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Scan QR</span>
                  </button>
                </div>
                <input
                  id="storeHraId"
                  type="text"
                  required
                  value={storeHraId}
                  onChange={(e) => setStoreHraId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter store HRA ID or scan QR"
                />
              </div>
            )}

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your address"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Google Maps autocomplete would be integrated here
              </p>
            </div>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;