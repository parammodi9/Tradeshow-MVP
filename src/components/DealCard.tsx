import React, { useState } from 'react';
import { Calendar, Package, DollarSign, CheckCircle } from 'lucide-react';
import { Deal, OptIn } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface DealCardProps {
  deal: Deal;
  isOptedIn: boolean;
  showMultiStoreToggle?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, isOptedIn, showMultiStoreToggle = false }) => {
  const { user } = useAuth();
  const { addOptIn, optIns, stores, storeGroups } = useData();
  const [caseCount, setCaseCount] = useState(deal.minQuantity);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showStoreSelection, setShowStoreSelection] = useState(false);

  const userStores = stores.filter(store => user?.storeHraIds.includes(store.hraId));
  const hasMultipleStores = userStores.length > 1;
  
  // Check if user is part of a store group
  const userStoreGroup = storeGroups.find(group => 
    group.parentStoreHraId === user?.storeHraIds?.[0] || 
    group.childStoreHraIds.includes(user?.storeHraIds?.[0] || '')
  );
  
  // Get all stores in the user's group
  const groupStores = userStoreGroup ? 
    stores.filter(store => 
      store.hraId === userStoreGroup.parentStoreHraId || 
      userStoreGroup.childStoreHraIds.includes(store.hraId)
    ) : [];

  const handleOptIn = () => {
    if (!user) return;

    let storesToApply: string[] = [];
    
    if (showStoreSelection && selectedStores.length > 0) {
      storesToApply = selectedStores;
    } else if (userStoreGroup && selectedStores.length === 0) {
      // If no specific selection and user is in a group, apply to their primary store only
      storesToApply = [user.storeHraIds[0]];
    } else {
      storesToApply = [user.storeHraIds[0]];
    }

    storesToApply.forEach(storeHraId => {
      const optIn: OptIn = {
        optInId: `${Date.now()}-${Math.random()}`,
        dealId: deal.dealId,
        storeHraId,
        userHraId: user.hraId,
        caseCount,
        timestamp: new Date().toISOString(),
        isGuest: user.role === 'Guest'
      };

      addOptIn(optIn);
    });

    const storeNames = storesToApply.map(storeHraId => 
      stores.find(s => s.hraId === storeHraId)?.storeName
    ).join(', ');

    toast.success(`Successfully opted in to ${deal.productName} for ${storeNames}`);
    setSelectedStores([]);
    setShowStoreSelection(false);
  };

  const handleSelectAllGroupStores = () => {
    if (userStoreGroup) {
      const allGroupStoreIds = [userStoreGroup.parentStoreHraId, ...userStoreGroup.childStoreHraIds];
      setSelectedStores(allGroupStoreIds);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9">
        <img 
          src={deal.image} 
          alt={deal.productName}
          className="w-full h-48 object-cover"
        />
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{deal.productName}</h3>
            <p className="text-sm text-gray-600">{deal.brand}</p>
            <p className="text-sm text-blue-600 font-medium">{deal.vendorName}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Expires: {format(new Date(deal.expiryDate), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>Min Quantity: {deal.minQuantity} cases</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">{deal.rebate}</span>
          </div>
        </div>

        {!isOptedIn && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-gray-700">
                Cases:
              </label>
              <input
                type="number"
                min={deal.minQuantity}
                value={caseCount}
                onChange={(e) => setCaseCount(Number(e.target.value))}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {userStoreGroup && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Store Selection:</span>
                  <button
                    type="button"
                    onClick={() => setShowStoreSelection(!showStoreSelection)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showStoreSelection ? 'Hide Options' : 'Select Stores'}
                  </button>
                </div>
                
                {showStoreSelection && (
                  <div className="border border-gray-200 rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Available Stores:</span>
                      <button
                        type="button"
                        onClick={handleSelectAllGroupStores}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Select All Group Stores
                      </button>
                    </div>
                    
                    {groupStores.map(store => (
                      <label key={store.hraId} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedStores.includes(store.hraId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStores([...selectedStores, store.hraId]);
                            } else {
                              setSelectedStores(selectedStores.filter(id => id !== store.hraId));
                            }
                          }}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">{store.hraId}</span> - {store.storeName}
                          {store.hraId === userStoreGroup.parentStoreHraId && (
                            <span className="text-xs text-blue-600 ml-1">(Parent)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleOptIn}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Opt In
            </button>
          </div>
        )}

        {isOptedIn && (
          <div className="flex items-center justify-center space-x-2 py-2 bg-green-50 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Already Opted In</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealCard;