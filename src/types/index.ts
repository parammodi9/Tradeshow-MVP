export interface User {
  hraId: string;
  name: string;
  email: string;
  role: 'Member' | 'Guest' | 'Vendor' | 'Admin';
  storeHraIds: string[];
  address: string;
}

export interface Store {
  hraId: string;
  storeName: string;
  ownerHraId: string;
  parentStoreHraId?: string;
}

export interface StoreGroup {
  groupId: string;
  parentStoreHraId: string;
  childStoreHraIds: string[];
}

export interface Deal {
  dealId: string;
  vendorHraId: string;
  brand: string;
  productName: string;
  image: string;
  expiryDate: string;
  minQuantity: number;
  rebate: string;
  vendorName: string;
}

export interface OptIn {
  optInId: string;
  dealId: string;
  storeHraId: string;
  userHraId: string;
  caseCount: number;
  timestamp: string;
  isGuest: boolean;
}

export interface Vendor {
  hraId: string;
  name: string;
  contactInfo: string;
}

export interface Guest {
  hraId: string;
  name: string;
  email: string;
  address: string;
  optedInDeals: string[];
}