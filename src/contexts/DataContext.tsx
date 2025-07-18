import React, { createContext, useContext, useState } from 'react';
import { Deal, OptIn, Store, StoreGroup, Vendor, Guest } from '../types';
import { mockDeals, mockStores, mockVendors, mockStoreGroups } from '../data/mockData';

interface DataContextType {
  deals: Deal[];
  optIns: OptIn[];
  stores: Store[];
  storeGroups: StoreGroup[];
  vendors: Vendor[];
  guests: Guest[];
  addOptIn: (optIn: OptIn) => void;
  addDeal: (deal: Deal) => void;
  addStoreGroup: (group: StoreGroup) => void;
  updateStoreGroup: (id: string, group: StoreGroup) => void;
  deleteStoreGroup: (id: string) => void;
  addGuest: (guest: Guest) => void;
  updateDeal: (id: string, deal: Deal) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [optIns, setOptIns] = useState<OptIn[]>([]);
  const [stores] = useState<Store[]>(mockStores);
  const [storeGroups, setStoreGroups] = useState<StoreGroup[]>(mockStoreGroups);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [guests, setGuests] = useState<Guest[]>([]);

  const addOptIn = (optIn: OptIn) => {
    setOptIns(prev => [...prev, optIn]);
  };

  const addDeal = (deal: Deal) => {
    setDeals(prev => [...prev, deal]);
  };

  const addStoreGroup = (group: StoreGroup) => {
    setStoreGroups(prev => [...prev, group]);
  };

  const updateStoreGroup = (id: string, group: StoreGroup) => {
    setStoreGroups(prev => prev.map(g => g.groupId === id ? group : g));
  };

  const deleteStoreGroup = (id: string) => {
    setStoreGroups(prev => prev.filter(g => g.groupId !== id));
  };

  const addGuest = (guest: Guest) => {
    setGuests(prev => [...prev, guest]);
  };

  const updateDeal = (id: string, deal: Deal) => {
    setDeals(prev => prev.map(d => d.dealId === id ? deal : d));
  };

  return (
    <DataContext.Provider value={{
      deals,
      optIns,
      stores,
      storeGroups,
      vendors,
      guests,
      addOptIn,
      addDeal,
      addStoreGroup,
      updateStoreGroup,
      deleteStoreGroup,
      addGuest,
      updateDeal
    }}>
      {children}
    </DataContext.Provider>
  );
};