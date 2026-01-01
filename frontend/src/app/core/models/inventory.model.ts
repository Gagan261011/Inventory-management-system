export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  active: boolean;
  createdAt: string;
}

export interface CreateWarehouseRequest {
  code: string;
  name: string;
  address?: string;
}

export interface StockLevel {
  id: number;
  itemId: number;
  itemSku: string;
  itemName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: number;
  itemId: number;
  itemSku: string;
  itemName: string;
  warehouseId: number;
  warehouseCode: string;
  movementType: string;
  quantity: number;
  reference: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateMovementRequest {
  itemId: number;
  warehouseId: number;
  movementType: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface ReplenishmentRequest {
  id?: number;
  itemId: number;
  itemSku: string;
  itemName: string;
  warehouseId: number;
  warehouseCode: string;
  requestedQuantity: number;
  currentQuantity: number;
  reorderLevel: number;
  status: string;
  priority: string;
  reason?: string;
  notes?: string;
  requestedBy: string;
  reviewedBy?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface CreateReplenishmentRequest {
  itemId: number;
  warehouseId: number;
  requestedQuantity: number;
  priority?: string;
  notes?: string;
}

export interface ApprovalRequest {
  approved: boolean;
  notes?: string;
}

export interface DashboardResponse {
  totalItems: number;
  totalWarehouses: number;
  lowStockCount: number;
  pendingReplenishments: number;
  recentMovements: StockMovement[];
  lowStockItems: StockLevel[];
}
