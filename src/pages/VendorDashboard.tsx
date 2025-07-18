import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Layout from '../components/Layout';
import { Download, Package, Users } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { deals, optIns, stores } = useData();

  const vendorDeals = deals.filter(deal => deal.vendorHraId === user?.hraId);

  const exportCSV = (dealId: string) => {
    const dealOptIns = optIns.filter(opt => opt.dealId === dealId);
    const csvData = dealOptIns.map(opt => {
      const store = stores.find(s => s.hraId === opt.storeHraId);
      return {
        Store: store?.storeName || 'Unknown',
        StoreHraId: opt.storeHraId,
        CaseCount: opt.caseCount,
        Timestamp: format(new Date(opt.timestamp), 'yyyy-MM-dd HH:mm:ss')
      };
    });
    
    // Convert to CSV and download
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deal-${dealId}-signups.csv`;
    a.click();
    
    toast.success('CSV exported successfully!');
  };

  return (
    <Layout title="Vendor Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Your Deals</h2>
            <p className="text-gray-600">Track your product deals and engagement</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Note:</strong> Deal creation is managed by administrators. Contact your admin to add new deals for your products.
          </p>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Deals</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sign-ups
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendorDeals.map(deal => {
                  const dealOptIns = optIns.filter(opt => opt.dealId === deal.dealId);
                  const totalCases = dealOptIns.reduce((sum, opt) => sum + opt.caseCount, 0);
                  
                  return (
                    <tr key={deal.dealId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={deal.image} 
                            alt={deal.productName}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {deal.productName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deal.rebate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(deal.expiryDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 mr-1" />
                          {dealOptIns.length}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="h-4 w-4 mr-1" />
                          {totalCases}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => exportCSV(deal.dealId)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {vendorDeals.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No deals assigned to you yet. Contact your admin to get deals added.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VendorDashboard;