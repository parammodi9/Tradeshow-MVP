export interface User {
  hraId?: string; // Optional - only for Members
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
  vendorId: string; // Updated to match Vendor interface
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
  userId: string; // Generic user identifier
  caseCount: number;
  timestamp: string;
  isGuest: boolean;
}

export interface Vendor {
  vendorId: string; // Use vendorId instead of hraId
  name: string;
  contactInfo: string;
}

export interface Guest {
  guestId: string; // Use guestId instead of hraId
  name: string;
  email: string;
  address: string;
  optedInDeals: string[];
}