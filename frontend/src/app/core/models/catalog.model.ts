export interface Item {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  supplierId: number;
  supplierName: string;
  unitPrice: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  supplierId: number;
  unitPrice: number;
  reorderLevel: number;
  reorderQuantity: number;
  leadTimeDays: number;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  categoryId?: number;
  supplierId?: number;
  unitPrice?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  leadTimeDays?: number;
  active?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  itemCount: number;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}
