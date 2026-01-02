/**
 * FleetCrew - Service de gestion du matériel et de l'inventaire
 * Module connexe pour la gestion des équipements, pièces et outils
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type InventoryCategory = 
  | 'PARTS' // Pièces de rechange
  | 'TOOLS' // Outils
  | 'FLUIDS' // Fluides (huile, liquide de frein, etc.)
  | 'CONSUMABLES' // Consommables (filtres, courroies, etc.)
  | 'SAFETY' // Équipements de sécurité
  | 'ELECTRICAL' // Composants électriques
  | 'OTHER';

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER';

export interface InventoryItem {
  id: string;
  sku: string; // Numéro de référence
  name: string;
  description?: string;
  category: InventoryCategory;
  vmrsCode?: string; // Code VMRS associé
  quantity: number;
  minQuantity: number; // Seuil d'alerte stock bas
  maxQuantity?: number;
  unitCost: number;
  supplier?: string;
  location?: string; // Emplacement dans l'entrepôt
  status: InventoryStatus;
  lastRestocked?: string;
  expirationDate?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  workOrderId?: string;
  technicianId?: string;
  technicianName?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  INVENTORY: '@fleetcrew_inventory',
  TRANSACTIONS: '@fleetcrew_transactions',
  SUPPLIERS: '@fleetcrew_suppliers',
};

// Helper functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateSku = (category: InventoryCategory): string => {
  const prefix = {
    PARTS: 'PRT',
    TOOLS: 'TLS',
    FLUIDS: 'FLD',
    CONSUMABLES: 'CSM',
    SAFETY: 'SFT',
    ELECTRICAL: 'ELC',
    OTHER: 'OTH',
  };
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix[category]}-${random}`;
};

const calculateStatus = (quantity: number, minQuantity: number): InventoryStatus => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minQuantity) return 'LOW_STOCK';
  return 'IN_STOCK';
};

// CRUD Operations - Inventory Items
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting inventory items:', error);
    return [];
  }
};

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  try {
    const items = await getInventoryItems();
    return items.find(i => i.id === id) || null;
  } catch (error) {
    console.error('Error getting inventory item:', error);
    return null;
  }
};

export const getInventoryByCategory = async (category: InventoryCategory): Promise<InventoryItem[]> => {
  try {
    const items = await getInventoryItems();
    return items.filter(i => i.category === category);
  } catch (error) {
    console.error('Error getting inventory by category:', error);
    return [];
  }
};

export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  try {
    const items = await getInventoryItems();
    return items.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');
  } catch (error) {
    console.error('Error getting low stock items:', error);
    return [];
  }
};

export const searchInventory = async (query: string): Promise<InventoryItem[]> => {
  try {
    const items = await getInventoryItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.sku.toLowerCase().includes(lowerQuery) ||
      i.description?.toLowerCase().includes(lowerQuery) ||
      i.vmrsCode?.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching inventory:', error);
    return [];
  }
};

export const createInventoryItem = async (
  data: Omit<InventoryItem, 'id' | 'sku' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<InventoryItem> => {
  try {
    const items = await getInventoryItems();
    const newItem: InventoryItem = {
      ...data,
      id: generateId(),
      sku: generateSku(data.category),
      status: calculateStatus(data.quantity, data.minQuantity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    return newItem;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItem>
): Promise<InventoryItem | null> => {
  try {
    const items = await getInventoryItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate status if quantity changed
    if (updates.quantity !== undefined || updates.minQuantity !== undefined) {
      updatedItem.status = calculateStatus(
        updates.quantity ?? items[index].quantity,
        updates.minQuantity ?? items[index].minQuantity
      );
    }

    items[index] = updatedItem;
    await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    return updatedItem;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const items = await getInventoryItems();
    const filtered = items.filter(i => i.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};

// Inventory Transactions
export const getTransactions = async (): Promise<InventoryTransaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const getItemTransactions = async (itemId: string): Promise<InventoryTransaction[]> => {
  try {
    const transactions = await getTransactions();
    return transactions.filter(t => t.itemId === itemId);
  } catch (error) {
    console.error('Error getting item transactions:', error);
    return [];
  }
};

export const addStock = async (
  itemId: string,
  quantity: number,
  reason?: string
): Promise<InventoryItem | null> => {
  try {
    const item = await getInventoryItem(itemId);
    if (!item) return null;

    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + quantity;

    // Create transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      itemId,
      itemName: item.name,
      type: 'IN',
      quantity,
      previousQuantity,
      newQuantity,
      reason: reason || 'Réapprovisionnement',
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();
    transactions.unshift(transaction);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update item
    return updateInventoryItem(itemId, {
      quantity: newQuantity,
      lastRestocked: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding stock:', error);
    throw error;
  }
};

export const removeStock = async (
  itemId: string,
  quantity: number,
  workOrderId?: string,
  technicianId?: string,
  technicianName?: string,
  reason?: string
): Promise<InventoryItem | null> => {
  try {
    const item = await getInventoryItem(itemId);
    if (!item) return null;

    const previousQuantity = item.quantity;
    const newQuantity = Math.max(0, previousQuantity - quantity);

    // Create transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      itemId,
      itemName: item.name,
      type: 'OUT',
      quantity,
      previousQuantity,
      newQuantity,
      reason: reason || 'Utilisation',
      workOrderId,
      technicianId,
      technicianName,
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();
    transactions.unshift(transaction);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update item
    return updateInventoryItem(itemId, { quantity: newQuantity });
  } catch (error) {
    console.error('Error removing stock:', error);
    throw error;
  }
};

export const adjustStock = async (
  itemId: string,
  newQuantity: number,
  reason: string
): Promise<InventoryItem | null> => {
  try {
    const item = await getInventoryItem(itemId);
    if (!item) return null;

    const previousQuantity = item.quantity;

    // Create transaction
    const transaction: InventoryTransaction = {
      id: generateId(),
      itemId,
      itemName: item.name,
      type: 'ADJUSTMENT',
      quantity: Math.abs(newQuantity - previousQuantity),
      previousQuantity,
      newQuantity,
      reason,
      createdAt: new Date().toISOString(),
    };

    const transactions = await getTransactions();
    transactions.unshift(transaction);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update item
    return updateInventoryItem(itemId, { quantity: newQuantity });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    throw error;
  }
};

// Suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return [];
  }
};

export const createSupplier = async (
  data: Omit<Supplier, 'id' | 'createdAt'>
): Promise<Supplier> => {
  try {
    const suppliers = await getSuppliers();
    const newSupplier: Supplier = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    suppliers.push(newSupplier);
    await AsyncStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    return newSupplier;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

// Statistics
export const getInventoryStats = async (): Promise<{
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryCounts: Record<InventoryCategory, number>;
}> => {
  const items = await getInventoryItems();

  const categoryCounts: Record<InventoryCategory, number> = {
    PARTS: 0,
    TOOLS: 0,
    FLUIDS: 0,
    CONSUMABLES: 0,
    SAFETY: 0,
    ELECTRICAL: 0,
    OTHER: 0,
  };

  items.forEach(item => {
    categoryCounts[item.category]++;
  });

  return {
    totalItems: items.length,
    totalValue: items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0),
    lowStockCount: items.filter(i => i.status === 'LOW_STOCK').length,
    outOfStockCount: items.filter(i => i.status === 'OUT_OF_STOCK').length,
    categoryCounts,
  };
};

// Category labels
export const categoryLabels: Record<InventoryCategory, string> = {
  PARTS: 'Pièces de rechange',
  TOOLS: 'Outils',
  FLUIDS: 'Fluides',
  CONSUMABLES: 'Consommables',
  SAFETY: 'Équipements de sécurité',
  ELECTRICAL: 'Composants électriques',
  OTHER: 'Autres',
};
