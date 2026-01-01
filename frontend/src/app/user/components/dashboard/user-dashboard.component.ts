import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../core/services/inventory.service';
import { DashboardResponse } from '../../../core/models/inventory.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <span class="warehouse-badge" *ngIf="warehouseId">
          <mat-icon>warehouse</mat-icon> Warehouse {{ warehouseId }}
        </span>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading && dashboard">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-value">{{ dashboard.totalItems }}</div>
            <div class="stat-label">Total Items</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ dashboard.totalWarehouses }}</div>
            <div class="stat-label">Warehouses</div>
          </mat-card>
          <mat-card class="stat-card warning">
            <div class="stat-value">{{ dashboard.lowStockCount }}</div>
            <div class="stat-label">Low Stock Items</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ dashboard.pendingReplenishments }}</div>
            <div class="stat-label">Pending Requests</div>
          </mat-card>
        </div>
        
        <div class="dashboard-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>warning</mat-icon>
                Low Stock Items
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="dashboard.lowStockItems" *ngIf="dashboard.lowStockItems.length > 0">
                <ng-container matColumnDef="itemSku">
                  <th mat-header-cell *matHeaderCellDef>SKU</th>
                  <td mat-cell *matCellDef="let item">{{ item.itemSku }}</td>
                </ng-container>
                <ng-container matColumnDef="itemName">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let item">{{ item.itemName }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="status-chip low">{{ item.quantity }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="reorderLevel">
                  <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
                  <td mat-cell *matCellDef="let item">{{ item.reorderLevel }}</td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="lowStockColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: lowStockColumns;"></tr>
              </table>
              <p *ngIf="dashboard.lowStockItems.length === 0" class="no-data">No low stock items</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                <mat-icon>swap_horiz</mat-icon>
                Recent Movements
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="dashboard.recentMovements" *ngIf="dashboard.recentMovements.length > 0">
                <ng-container matColumnDef="itemSku">
                  <th mat-header-cell *matHeaderCellDef>SKU</th>
                  <td mat-cell *matCellDef="let item">{{ item.itemSku }}</td>
                </ng-container>
                <ng-container matColumnDef="movementType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let item">
                    <span [class]="'status-chip ' + item.movementType.toLowerCase()">{{ item.movementType }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let item">{{ item.createdAt | date:'short' }}</td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="movementColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: movementColumns;"></tr>
              </table>
              <p *ngIf="dashboard.recentMovements.length === 0" class="no-data">No recent movements</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .warehouse-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
    }
    
    .stat-card.warning .stat-value {
      color: #e65100;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }
    
    mat-card-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    table {
      width: 100%;
    }
    
    .no-data {
      text-align: center;
      color: #666;
      padding: 24px;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
    }
    
    .status-chip.low, .status-chip.out {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.in, .status-chip.adjustment {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.transfer {
      background-color: #e3f2fd;
      color: #1565c0;
    }
  `]
})
export class UserDashboardComponent implements OnInit {
  dashboard: DashboardResponse | null = null;
  loading = true;
  warehouseId: number | null;
  
  lowStockColumns = ['itemSku', 'itemName', 'quantity', 'reorderLevel'];
  movementColumns = ['itemSku', 'movementType', 'quantity', 'createdAt'];
  
  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {
    this.warehouseId = this.authService.getWarehouseId();
  }
  
  ngOnInit(): void {
    this.loadDashboard();
  }
  
  loadDashboard(): void {
    this.inventoryService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
