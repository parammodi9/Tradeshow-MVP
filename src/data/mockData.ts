import { Deal, Store, Vendor, StoreGroup } from '../types';

export const mockDeals: Deal[] = [
  {
    dealId: '1',
    vendorId: 'V001',
    brand: 'PepsiCo',
    productName: 'Pepsi Cola 12-Pack',
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    expiryDate: '2025-03-15',
    minQuantity: 10,
    rebate: '$2.00 per case',
    vendorName: 'PepsiCo Beverages'
  },
  {
    dealId: '2',
    vendorId: 'V002',
    brand: 'Coca-Cola',
    productName: 'Coca-Cola Classic 24-Pack',
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    expiryDate: '2025-04-01',
    minQuantity: 5,
    rebate: '$1.50 per case',
    vendorName: 'Coca-Cola Company'
  },
  {
    dealId: '3',
    vendorId: 'V001',
    brand: 'Frito-Lay',
    productName: 'Lays Chips Variety Pack',
    image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
    expiryDate: '2025-02-28',
    minQuantity: 15,
    rebate: '$3.00 per case',
    vendorName: 'PepsiCo Beverages'
  },
  {
    dealId: '4',
    vendorId: 'V003',
    brand: 'General Mills',
    productName: 'Cheerios Cereal 18oz',
    image: 'https://images.pexels.com/photos/5945771/pexels-photo-5945771.jpeg?auto=compress&cs=tinysrgb&w=400',
    expiryDate: '2025-05-15',
    minQuantity: 12,
    rebate: '$1.25 per case',
    vendorName: 'General Mills'
  },
  {
    dealId: '5',
    vendorId: 'V004',
    brand: 'Procter & Gamble',
    productName: 'Tide Laundry Detergent',
    image: 'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400',
    expiryDate: '2025-06-30',
    minQuantity: 8,
    rebate: '$4.00 per case',
    vendorName: 'P&G Consumer Products'
  }
];

export const mockStores: Store[] = [
  { hraId: 'HRA101', storeName: 'Downtown Market', ownerHraId: 'HRA301', parentStoreHraId: 'HRA101' },
  { hraId: 'HRA102', storeName: 'Riverside Grocery', ownerHraId: 'HRA301', parentStoreHraId: 'HRA101' },
  { hraId: 'HRA103', storeName: 'Hillside Store', ownerHraId: 'HRA302' },
  { hraId: 'HRA104', storeName: 'Metro Foods', ownerHraId: 'HRA303', parentStoreHraId: 'HRA104' },
  { hraId: 'HRA105', storeName: 'Corner Market', ownerHraId: 'HRA303', parentStoreHraId: 'HRA104' },
  { hraId: 'HRA106', storeName: 'Valley Supermarket', ownerHraId: 'HRA304' }
];

export const mockVendors: Vendor[] = [
  { vendorId: 'V001', name: 'PepsiCo Beverages', contactInfo: 'sales@pepsico.com' },
  { vendorId: 'V002', name: 'Coca-Cola Company', contactInfo: 'partners@coca-cola.com' },
  { vendorId: 'V003', name: 'General Mills', contactInfo: 'retail@generalmills.com' },
  { vendorId: 'V004', name: 'P&G Consumer Products', contactInfo: 'business@pg.com' }
];

export const mockStoreGroups: StoreGroup[] = [
  {
    groupId: 'G001',
    parentStoreHraId: 'HRA101',
    childStoreHraIds: ['HRA102']
  },
  {
    groupId: 'G002',
    parentStoreHraId: 'HRA104',
    childStoreHraIds: ['HRA105']
  }
];

// Sample users for testing
export const mockUsers = [
  // Member with store group (parent store)
  {
    hraId: 'HRA301',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Member' as const,
    storeHraIds: ['HRA101', 'HRA102'], // All stores in group G001 (parent + child)
    address: '123 Main St, Downtown City'
  },
  // Member with single store (not in group)
  {
    hraId: 'HRA305',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Member' as const,
    storeHraIds: ['HRA106'], // Single store, not in any group
    address: '456 Oak Ave, Valley Town'
  }
];