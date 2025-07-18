import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, Download, Users, Package, TrendingUp, Building } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    deals, 
    optIns, 
    stores, 
    storeGroups, 
    vendors, 
    guests,
    addStoreGroup,
    updateStoreGroup,
    deleteStoreGroup
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'reporting' | 'groups' | 'guests' | 'deals'>('analytics');
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState({
    parentStoreHraId: '',
    childStoreHraIds: [] as string[]
  });
  const [dealForm, setDealForm] = useState({
    vendorHraId: '',
    productName: '',
    brand: '',
    image: '',
    expiryDate: '',
    minQuantity: 1,
    rebate: ''
  });
  const [storeSearch, setStoreSearch] = useState('');
  const [filters, setFilters] = useState({
    vendor: '',
    store: '',
    storeGroup: '',
    dateRange: ''
  });

  // Analytics calculations
  const totalOptIns = optIns.length;
  const totalGuests = guests.length;
  const totalMembers = stores.length; // Simplified
  const totalVendors = vendors.length;

  const vendorStats = vendors.map(vendor => {
    const vendorOptIns = optIns.filter(opt => 
      deals.find(deal => deal.dealId === opt.dealId && deal.vendorHraId === vendor.hraId)
    );
    return {
      vendor: vendor.name,
      optIns: vendorOptIns.length,
      totalCases: vendorOptIns.reduce((sum, opt) => sum + opt.caseCount, 0)
    };
  });

  const topProducts = deals.map(deal => {
    const dealOptIns = optIns.filter(opt => opt.dealId === deal.dealId);
    return {
      product: deal.productName,
      vendor: deal.vendorName,
      optIns: dealOptIns.length,
      totalCases: dealOptIns.reduce((sum, opt) => sum + opt.caseCount, 0)
    };
  }).sort((a, b) => b.optIns - a.optIns).slice(0, 5);

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupForm.parentStoreHraId) {
      toast.error('Please select a parent store HRA ID');
      return;
    }
    
    if (editingGroup) {
      updateStoreGroup(editingGroup, {
        groupId: editingGroup,
        ...groupForm
      });
      toast.success('Store group updated successfully!');
      setEditingGroup(null);
    } else {
      addStoreGroup({
        groupId: `group-${Date.now()}`,
        ...groupForm
      });
      toast.success('Store group created successfully!');
    }
    
    setShowGroupForm(false);
    setGroupForm({
      parentStoreHraId: '',
      childStoreHraIds: []
    });
  };

  const handleEditGroup = (group: any) => {
    setGroupForm({
      parentStoreHraId: group.parentStoreHraId,
      childStoreHraIds: group.childStoreHraIds
    });
    setEditingGroup(group.groupId);
    setShowGroupForm(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteStoreGroup(groupId);
      toast.success('Store group deleted successfully!');
    }
  };

  const exportReportCSV = () => {
    const reportData = optIns.map(optIn => {
      const deal = deals.find(d => d.dealId === optIn.dealId);
      const store = stores.find(s => s.storeId === optIn.storeId);
      const group = storeGroups.find(g => g.groupId === store?.groupId);
      
      return {
        Deal: deal?.productName || 'Unknown',
        Store: store?.storeName || 'Unknown',
        StoreId: optIn.storeId,
        Vendor: deal?.vendorName || 'Unknown',
        Group: group?.groupName || 'Individual',
        CaseCount: optIn.caseCount,
        IsGuest: optIn.isGuest ? 'Yes' : 'No',
        Timestamp: format(new Date(optIn.timestamp), 'yyyy-MM-dd HH:mm:ss')
      };
    });
    
    const csvContent = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hra-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast.success('Report exported successfully!');
  };

  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const vendor = vendors.find(v => v.hraId === dealForm.vendorHraId);
    if (!vendor) {
      toast.error('Please select a valid vendor');
      return;
    }
    
    if (editingDeal) {
      const updatedDeal = {
        ...deals.find(d => d.dealId === editingDeal)!,
        ...dealForm,
        vendorName: vendor.name
      };
      updateDeal(editingDeal, updatedDeal);
      toast.success('Deal updated successfully!');
      setEditingDeal(null);
    } else {
      const newDeal = {
        dealId: `deal-${Date.now()}`,
        vendorName: vendor.name,
        ...dealForm,
        image: dealForm.image || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400'
      };
      addDeal(newDeal);
      toast.success('Deal created successfully!');
    }
    
    setShowDealForm(false);
    setDealForm({
      vendorHraId: '',
      productName: '',
      brand: '',
      image: '',
      expiryDate: '',
      minQuantity: 1,
      rebate: ''
    });
  };

  const handleEditDeal = (deal: any) => {
    setDealForm({
      vendorHraId: deal.vendorHraId,
      productName: deal.productName,
      brand: deal.brand,
      image: deal.image,
      expiryDate: deal.expiryDate,
      minQuantity: deal.minQuantity,
      rebate: deal.rebate
    });
    setEditingDeal(deal.dealId);
    setShowDealForm(true);
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'reporting', label: 'Reporting', icon: Package },
              { id: 'groups', label: 'Store Groups', icon: Building },
              { id: 'guests', label: 'Guests', icon: Users },
              { id: 'deals', label: 'Deal Management', icon: Package }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Opt-ins</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalOptIns}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Guests</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalGuests}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Stores</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalMembers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalVendors}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Performance */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opt-ins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendorStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stat.vendor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.optIns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stat.totalCases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opt-ins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.vendor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.optIns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.totalCases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reporting Tab */}
        {activeTab === 'reporting' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Opt-in Reports</h3>
                <button
                  onClick={exportReportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters({...filters, vendor: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Vendors</option>
                  {vendors.map(vendor => (
                    <option key={vendor.hraId} value={vendor.hraId}>{vendor.name}</option>
                  ))}
                </select>
                
                <select
                  value={filters.store}
                  onChange={(e) => setFilters({...filters, store: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Stores</option>
                  {stores.map(store => (
                    <option key={store.hraId} value={store.hraId}>{store.storeName} ({store.hraId})</option>
                  ))}
                </select>
                
                <select
                  value={filters.storeGroup}
                  onChange={(e) => setFilters({...filters, storeGroup: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Groups</option>
                  {storeGroups.map(group => (
                    <option key={group.groupId} value={group.groupId}>{group.groupName}</option>
                  ))}
                </select>
                
                <input
                  type="date"
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {/* Report Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cases</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {optIns.map(optIn => {
                      const deal = deals.find(d => d.dealId === optIn.dealId);
                      const store = stores.find(s => s.hraId === optIn.storeHraId);
                      const group = storeGroups.find(g => g.parentStoreHraId === store?.parentStoreHraId);
                      
                      return (
                        <tr key={optIn.optInId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deal?.productName || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {store?.storeName || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deal?.vendorName || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {group ? `Parent: ${group.parentStoreHraId}` : 'Individual'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {optIn.caseCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              optIn.isGuest ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {optIn.isGuest ? 'Guest' : 'Member'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(optIn.timestamp), 'MMM dd, yyyy')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Store Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Store Groups</h3>
              <button
                onClick={() => setShowGroupForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Group</span>
              </button>
            </div>

            {/* Group Form */}
            {showGroupForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold mb-4">
                  {editingGroup ? 'Edit Store Group' : 'Create Store Group'}
                </h4>
                <form onSubmit={handleGroupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Store HRA ID
                    </label>
                    <select
                      required
                      value={groupForm.parentStoreHraId}
                      onChange={(e) => setGroupForm({...groupForm, parentStoreHraId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Parent Store...</option>
                      {stores.map(store => (
                        <option key={store.hraId} value={store.hraId}>
                          {store.hraId} - {store.storeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child Store HRA IDs
                    </label>
                    
                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Search by HRA ID..."
                        value={storeSearch}
                        onChange={(e) => setStoreSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {stores
                        .filter(store => 
                          store.hraId !== groupForm.parentStoreHraId && 
                          (storeSearch === '' || store.hraId.toLowerCase().includes(storeSearch.toLowerCase()) || store.storeName.toLowerCase().includes(storeSearch.toLowerCase()))
                        )
                        .map(store => (
                        <label key={store.hraId} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={groupForm.childStoreHraIds.includes(store.hraId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupForm({
                                  ...groupForm,
                                  childStoreHraIds: [...groupForm.childStoreHraIds, store.hraId]
                                });
                              } else {
                                setGroupForm({
                                  ...groupForm,
                                  childStoreHraIds: groupForm.childStoreHraIds.filter(id => id !== store.hraId)
                                });
                              }
                            }}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            <span className="font-medium">{store.hraId}</span> - {store.storeName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      {editingGroup ? 'Update Group' : 'Create Group'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGroupForm(false);
                        setEditingGroup(null);
                        setGroupForm({
                          parentStoreHraId: '',
                          childStoreHraIds: []
                        });
                        setStoreSearch('');
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Groups List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent Store HRA ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Stores</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {storeGroups.map(group => {
                      const parentStore = stores.find(s => s.hraId === group.parentStoreHraId);
                      const childStores = stores.filter(s => group.childStoreHraIds.includes(s.hraId));
                      
                      return (
                      <tr key={group.groupId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div>
                            <div className="font-medium">{group.parentStoreHraId}</div>
                            <div className="text-gray-500 text-xs">{parentStore?.storeName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            {childStores.map(store => (
                              <div key={store.hraId} className="text-xs">
                                <span className="font-medium">{store.hraId}</span> - {store.storeName}
                              </div>
                            ))}
                            {childStores.length === 0 && (
                              <span className="text-gray-400 text-xs">No child stores</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(group.groupId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
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
          </div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Guest Submissions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opted Deals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {guests.map(guest => (
                      <tr key={guest.guestId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.optedInDeals.length} deals
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deal Management Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Deal Management</h3>
              <button
                onClick={() => setShowDealForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Deal</span>
              </button>
            </div>

            {/* Deal Form */}
            {showDealForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold mb-4">
                  {editingDeal ? 'Edit Deal' : 'Create New Deal'}
                </h4>
                <form onSubmit={handleDealSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor
                    </label>
                    <select
                      required
                      value={dealForm.vendorHraId}
                      onChange={(e) => setDealForm({...dealForm, vendorHraId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Vendor...</option>
                      {vendors.map(vendor => (
                        <option key={vendor.hraId} value={vendor.hraId}>
                          {vendor.name} ({vendor.hraId})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={dealForm.productName}
                      onChange={(e) => setDealForm({...dealForm, productName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      required
                      value={dealForm.brand}
                      onChange={(e) => setDealForm({...dealForm, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={dealForm.image}
                      onChange={(e) => setDealForm({...dealForm, image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={dealForm.expiryDate}
                      onChange={(e) => setDealForm({...dealForm, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={dealForm.minQuantity}
                      onChange={(e) => setDealForm({...dealForm, minQuantity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rebate Details
                    </label>
                    <input
                      type="text"
                      required
                      value={dealForm.rebate}
                      onChange={(e) => setDealForm({...dealForm, rebate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., $2.00 per case"
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex space-x-3">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      {editingDeal ? 'Update Deal' : 'Create Deal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDealForm(false);
                        setEditingDeal(null);
                        setDealForm({
                          vendorHraId: '',
                          productName: '',
                          brand: '',
                          image: '',
                          expiryDate: '',
                          minQuantity: 1,
                          rebate: ''
                        });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Deals Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opt-ins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deals.map(deal => {
                      const dealOptIns = optIns.filter(opt => opt.dealId === deal.dealId);
                      
                      return (
                        <tr key={deal.dealId}>
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
                            {deal.vendorName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {deal.brand}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(deal.expiryDate), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dealOptIns.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditDeal(deal)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;