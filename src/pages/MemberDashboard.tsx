import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Layout from '../components/Layout';
import DealCard from '../components/DealCard';
import { Building, Users } from 'lucide-react';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { deals, optIns, stores, storeGroups, vendors } = useData();
  const [selectedVendor, setSelectedVendor] = useState<string>('');

  const userStores = stores.filter(store => user?.storeHraIds.includes(store.hraId));
  const hasMultipleStores = userStores.length > 1;

  const filteredDeals = selectedVendor 
    ? deals.filter(deal => deal.vendorHraId === selectedVendor)
    : deals;

  const isOptedIn = (dealId: string) => {
    return optIns.some(optIn => 
      optIn.dealId === dealId && 
      user?.storeHraIds.includes(optIn.storeHraId)
    );
  };

  const handleOptInAllFromVendor = (vendorId: string) => {
    const vendorDeals = deals.filter(deal => deal.vendorId === vendorId);
    // This would trigger opt-in for all deals from this vendor
    // Implementation would be similar to individual deal opt-in
  };

  return (
    <Layout title="Member Dashboard">
      <div className="space-y-6">
        {/* Store Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Stores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStores.map(store => {
              const group = storeGroups.find(g => g.parentStoreHraId === store.parentStoreHraId);
              return (
                <div key={store.hraId} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">{store.storeName}</h3>
                  </div>
                  <p className="text-sm text-gray-600">HRA ID: {store.hraId}</p>
                  {group && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Parent: {group.parentStoreHraId}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center gap-4">
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

            {selectedVendor && (
              <div className="flex-1">
                <button
                  onClick={() => handleOptInAllFromVendor(selectedVendor)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Opt-In All from {vendors.find(v => v.hraId === selectedVendor)?.name}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <DealCard
              key={deal.dealId}
              deal={deal}
              isOptedIn={isOptedIn(deal.dealId)}
              showMultiStoreToggle={hasMultipleStores}
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

export default MemberDashboard;