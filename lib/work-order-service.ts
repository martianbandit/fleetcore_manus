/**
 * FleetCommand - Service de gestion des bons de travail
 * Module connexe pour la création et le suivi des réparations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type WorkOrderStatus = 'DRAFT' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WorkOrderItem {
  id: string;
  description: string;
  componentCode: string; // Code VMRS
  defectType: 'MINOR' | 'MAJOR';
  estimatedTime: number; // en minutes
  estimatedCost: number;
  actualTime?: number;
  actualCost?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  partsUsed?: InventoryItemUsage[];
}

export interface InventoryItemUsage {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  vehicleId: string;
  vehicleName: string;
  inspectionId?: string;
  technicianId?: string;
  technicianName?: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  title: string;
  description: string;
  items: WorkOrderItem[];
  estimatedTotalTime: number;
  estimatedTotalCost: number;
  actualTotalTime?: number;
  actualTotalCost?: number;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  attachments?: string[];
}

const STORAGE_KEY = '@fleetcore_work_orders';

// Helper functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO-${year}${month}-${random}`;
};

// CRUD Operations
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting work orders:', error);
    return [];
  }
};

export const getWorkOrder = async (id: string): Promise<WorkOrder | null> => {
  try {
    const orders = await getWorkOrders();
    return orders.find(o => o.id === id) || null;
  } catch (error) {
    console.error('Error getting work order:', error);
    return null;
  }
};

export const getWorkOrdersByVehicle = async (vehicleId: string): Promise<WorkOrder[]> => {
  try {
    const orders = await getWorkOrders();
    return orders.filter(o => o.vehicleId === vehicleId);
  } catch (error) {
    console.error('Error getting work orders by vehicle:', error);
    return [];
  }
};

export const getWorkOrdersByTechnician = async (technicianId: string): Promise<WorkOrder[]> => {
  try {
    const orders = await getWorkOrders();
    return orders.filter(o => o.technicianId === technicianId);
  } catch (error) {
    console.error('Error getting work orders by technician:', error);
    return [];
  }
};

export const createWorkOrder = async (
  data: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<WorkOrder> => {
  try {
    const orders = await getWorkOrders();
    const newOrder: WorkOrder = {
      ...data,
      id: generateId(),
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return newOrder;
  } catch (error) {
    console.error('Error creating work order:', error);
    throw error;
  }
};

export const updateWorkOrder = async (
  id: string,
  updates: Partial<WorkOrder>
): Promise<WorkOrder | null> => {
  try {
    const orders = await getWorkOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return orders[index];
  } catch (error) {
    console.error('Error updating work order:', error);
    throw error;
  }
};

export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    const orders = await getWorkOrders();
    const filtered = orders.filter(o => o.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting work order:', error);
    return false;
  }
};

// Work Order Item Operations
export const addWorkOrderItem = async (
  orderId: string,
  item: Omit<WorkOrderItem, 'id'>
): Promise<WorkOrder | null> => {
  try {
    const order = await getWorkOrder(orderId);
    if (!order) return null;
    
    const newItem: WorkOrderItem = {
      ...item,
      id: generateId(),
    };
    
    const updatedItems = [...order.items, newItem];
    const estimatedTotalTime = updatedItems.reduce((sum, i) => sum + i.estimatedTime, 0);
    const estimatedTotalCost = updatedItems.reduce((sum, i) => sum + i.estimatedCost, 0);
    
    return updateWorkOrder(orderId, {
      items: updatedItems,
      estimatedTotalTime,
      estimatedTotalCost,
    });
  } catch (error) {
    console.error('Error adding work order item:', error);
    throw error;
  }
};

export const updateWorkOrderItem = async (
  orderId: string,
  itemId: string,
  updates: Partial<WorkOrderItem>
): Promise<WorkOrder | null> => {
  try {
    const order = await getWorkOrder(orderId);
    if (!order) return null;
    
    const updatedItems = order.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    
    const estimatedTotalTime = updatedItems.reduce((sum, i) => sum + i.estimatedTime, 0);
    const estimatedTotalCost = updatedItems.reduce((sum, i) => sum + i.estimatedCost, 0);
    const actualTotalTime = updatedItems.reduce((sum, i) => sum + (i.actualTime || 0), 0);
    const actualTotalCost = updatedItems.reduce((sum, i) => sum + (i.actualCost || 0), 0);
    
    return updateWorkOrder(orderId, {
      items: updatedItems,
      estimatedTotalTime,
      estimatedTotalCost,
      actualTotalTime: actualTotalTime > 0 ? actualTotalTime : undefined,
      actualTotalCost: actualTotalCost > 0 ? actualTotalCost : undefined,
    });
  } catch (error) {
    console.error('Error updating work order item:', error);
    throw error;
  }
};

// Status Operations
export const assignTechnician = async (
  orderId: string,
  technicianId: string,
  technicianName: string
): Promise<WorkOrder | null> => {
  return updateWorkOrder(orderId, {
    technicianId,
    technicianName,
    status: 'ASSIGNED',
  });
};

export const startWorkOrder = async (orderId: string): Promise<WorkOrder | null> => {
  return updateWorkOrder(orderId, {
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
  });
};

export const completeWorkOrder = async (orderId: string): Promise<WorkOrder | null> => {
  const order = await getWorkOrder(orderId);
  if (!order) return null;
  
  // Calculate actual totals from items
  const actualTotalTime = order.items.reduce((sum, i) => sum + (i.actualTime || i.estimatedTime), 0);
  const actualTotalCost = order.items.reduce((sum, i) => sum + (i.actualCost || i.estimatedCost), 0);
  
  return updateWorkOrder(orderId, {
    status: 'COMPLETED',
    completedAt: new Date().toISOString(),
    actualTotalTime,
    actualTotalCost,
  });
};

export const cancelWorkOrder = async (orderId: string, reason?: string): Promise<WorkOrder | null> => {
  return updateWorkOrder(orderId, {
    status: 'CANCELLED',
    notes: reason ? `Annulé: ${reason}` : 'Annulé',
  });
};

// Create Work Order from Inspection
export const createWorkOrderFromInspection = async (
  inspectionId: string,
  vehicleId: string,
  vehicleName: string,
  defects: Array<{
    description: string;
    componentCode: string;
    defectType: 'MINOR' | 'MAJOR';
  }>
): Promise<WorkOrder> => {
  const items: WorkOrderItem[] = defects.map(defect => ({
    id: generateId(),
    description: defect.description,
    componentCode: defect.componentCode,
    defectType: defect.defectType,
    estimatedTime: defect.defectType === 'MAJOR' ? 120 : 60, // 2h for major, 1h for minor
    estimatedCost: defect.defectType === 'MAJOR' ? 500 : 150, // Estimated costs
    status: 'PENDING',
  }));

  const majorCount = defects.filter(d => d.defectType === 'MAJOR').length;
  const priority: WorkOrderPriority = majorCount > 2 ? 'URGENT' : majorCount > 0 ? 'HIGH' : 'MEDIUM';

  return createWorkOrder({
    vehicleId,
    vehicleName,
    inspectionId,
    status: 'PENDING',
    priority,
    title: `Réparations suite à inspection - ${vehicleName}`,
    description: `Bon de travail généré automatiquement suite à l'inspection ${inspectionId}. ${defects.length} défaut(s) détecté(s) dont ${majorCount} majeur(s).`,
    items,
    estimatedTotalTime: items.reduce((sum, i) => sum + i.estimatedTime, 0),
    estimatedTotalCost: items.reduce((sum, i) => sum + i.estimatedCost, 0),
  });
};

// Statistics
export const getWorkOrderStats = async (): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  averageCompletionTime: number;
}> => {
  const orders = await getWorkOrders();
  
  const completed = orders.filter(o => o.status === 'COMPLETED');
  const avgTime = completed.length > 0
    ? completed.reduce((sum, o) => sum + (o.actualTotalTime || 0), 0) / completed.length
    : 0;

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING' || o.status === 'ASSIGNED').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    completed: completed.length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    totalEstimatedCost: orders.reduce((sum, o) => sum + o.estimatedTotalCost, 0),
    totalActualCost: completed.reduce((sum, o) => sum + (o.actualTotalCost || 0), 0),
    averageCompletionTime: Math.round(avgTime),
  };
};
