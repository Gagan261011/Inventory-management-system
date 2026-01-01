import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Warehouse, CreateWarehouseRequest, 
  StockLevel, StockMovement, CreateMovementRequest,
  ReplenishmentRequest, CreateReplenishmentRequest, ApprovalRequest,
  DashboardResponse 
} from '../models/inventory.model';
import { Page } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl.inventory;

  constructor(private http: HttpClient) { }

  // Dashboard
  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/stock/dashboard`);
  }

  // Warehouses
  getAllWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/warehouses`);
  }

  getWarehouse(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/warehouses/${id}`);
  }

  createWarehouse(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(`${this.apiUrl}/warehouses`, request);
  }

  updateWarehouse(id: number, request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/warehouses/${id}`, request);
  }

  // Stock Levels
  getAllStockLevels(page = 0, size = 20): Observable<Page<StockLevel>> {
    return this.http.get<Page<StockLevel>>(`${this.apiUrl}/stock?page=${page}&size=${size}`);
  }

  getStockByWarehouse(warehouseId: number, page = 0, size = 20): Observable<Page<StockLevel>> {
    return this.http.get<Page<StockLevel>>(`${this.apiUrl}/stock/warehouse/${warehouseId}?page=${page}&size=${size}`);
  }

  getStockByItem(itemId: number): Observable<StockLevel[]> {
    return this.http.get<StockLevel[]>(`${this.apiUrl}/stock/item/${itemId}`);
  }

  getLowStock(page = 0, size = 20): Observable<Page<StockLevel>> {
    return this.http.get<Page<StockLevel>>(`${this.apiUrl}/stock/low?page=${page}&size=${size}`);
  }

  // Stock Movements
  getAllMovements(page = 0, size = 20): Observable<Page<StockMovement>> {
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/stock/movements?page=${page}&size=${size}`);
  }

  getMovementsByWarehouse(warehouseId: number, page = 0, size = 20): Observable<Page<StockMovement>> {
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/stock/movements/warehouse/${warehouseId}?page=${page}&size=${size}`);
  }

  getMovementsByItem(itemId: number, page = 0, size = 20): Observable<Page<StockMovement>> {
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/stock/movements/item/${itemId}?page=${page}&size=${size}`);
  }

  createMovement(request: CreateMovementRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock/movements`, request);
  }

  // Replenishment Requests
  getAllReplenishmentRequests(page = 0, size = 20): Observable<Page<ReplenishmentRequest>> {
    return this.http.get<Page<ReplenishmentRequest>>(`${this.apiUrl}/replenishment?page=${page}&size=${size}`);
  }

  getReplenishmentsByStatus(status: string, page = 0, size = 20): Observable<Page<ReplenishmentRequest>> {
    return this.http.get<Page<ReplenishmentRequest>>(`${this.apiUrl}/replenishment/status/${status}?page=${page}&size=${size}`);
  }

  getReplenishmentsByWarehouse(warehouseId: number, page = 0, size = 20): Observable<Page<ReplenishmentRequest>> {
    return this.http.get<Page<ReplenishmentRequest>>(`${this.apiUrl}/replenishment/warehouse/${warehouseId}?page=${page}&size=${size}`);
  }

  getReplenishment(id: number): Observable<ReplenishmentRequest> {
    return this.http.get<ReplenishmentRequest>(`${this.apiUrl}/replenishment/${id}`);
  }

  createReplenishmentRequest(request: CreateReplenishmentRequest): Observable<ReplenishmentRequest> {
    return this.http.post<ReplenishmentRequest>(`${this.apiUrl}/replenishment`, request);
  }

  approveReplenishment(id: number, notes?: string): Observable<ReplenishmentRequest> {
    return this.http.put<ReplenishmentRequest>(`${this.apiUrl}/replenishment/${id}/approve`, { notes });
  }

  rejectReplenishment(id: number, notes?: string): Observable<ReplenishmentRequest> {
    return this.http.put<ReplenishmentRequest>(`${this.apiUrl}/replenishment/${id}/reject`, { notes });
  }
}
