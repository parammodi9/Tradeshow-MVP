import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Layout from '../components/Layout';
import DealCard from '../components/DealCard';
import { UserPlus, Crown } from 'lucide-react';

const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const { deals, optIns, vendors } = useData();
  const [selectedVendor, setSelectedVendor] = useState<string>('');

  const filteredDeals = selectedVendor 
    ? deals.filter(deal => deal.vendorHraId === selectedVendor)
    : deals;

  const isOptedIn = (dealId: string) => {
    return optIns.some(optIn => 
      optIn.dealId === dealId && 
      optIn.userId === (user?.hraId || `${user?.role}-${user?.email}`)
    );
  };

  return (
    <Layout title="Guest Dashboard">
      <div className="space-y-6">
        {/* Become a Member Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Crown className="h-12 w-12" />
              <div>
                <h2 className="text-2xl font-bold">Become a Member</h2>
                <p className="text-blue-100">
                  Unlock exclusive benefits and manage multiple stores
                </p>
              </div>
            </div>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Join Now</span>
            </button>
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Guest Mode:</strong> You're browsing as a guest. All deal opt-ins will be tracked separately and can be converted to member benefits when you join.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Vendor
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor.hraId} value={vendor.hraId}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <DealCard
              key={deal.dealId}
              deal={deal}
              isOptedIn={isOptedIn(deal.dealId)}
              showMultiStoreToggle={false}
            />
          ))}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No deals available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GuestDashboard;