import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuditService } from '../../../core/services/audit.service';
import { DashboardResponse } from '../../../core/models/inventory.model';
import { AuditDashboard } from '../../../core/models/audit.model';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Admin Dashboard</h1>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
      
      <div *ngIf="!loading">
        <!-- Inventory Stats -->
        <h2>Inventory Overview</h2>
        <div class="stats-grid" *ngIf="inventoryDashboard">
          <mat-card class="stat-card">
            <div class="stat-value">{{ inventoryDashboard.totalItems }}</div>
            <div class="stat-label">Total Items</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ inventoryDashboard.totalWarehouses }}</div>
            <div class="stat-label">Warehouses</div>
          </mat-card>
          <mat-card class="stat-card warning">
            <div class="stat-value">{{ inventoryDashboard.lowStockCount }}</div>
            <div class="stat-label">Low Stock Items</div>
          </mat-card>
          <mat-card class="stat-card accent">
            <div class="stat-value">{{ inventoryDashboard.pendingReplenishments }}</div>
            <div class="stat-label">Pending Approvals</div>
          </mat-card>
        </div>
        
        <!-- Audit Stats -->
        <h2>System Activity (Last 24 Hours)</h2>
        <div class="stats-grid" *ngIf="auditDashboard">
          <mat-card class="stat-card">
            <div class="stat-value">{{ auditDashboard.totalEvents }}</div>
            <div class="stat-label">Total Events</div>
          </mat-card>
          <mat-card class="stat-card error">
            <div class="stat-value">{{ auditDashboard.errorCount }}</div>
            <div class="stat-label">Errors</div>
          </mat-card>
        </div>
        
        <div class="dashboard-grid">
          <!-- Service Activity -->
          <mat-card *ngIf="auditDashboard">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>dns</mat-icon>
                Service Activity
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let stat of auditDashboard.serviceStats" class="stat-row">
                <span class="stat-name">{{ stat.serviceName }}</span>
                <span class="stat-count">{{ stat.count }}</span>
                <div class="stat-bar" [style.width.%]="getPercentage(stat.count, auditDashboard.totalEvents)"></div>
              </div>
              <p *ngIf="auditDashboard.serviceStats.length === 0" class="no-data">No activity recorded</p>
            </mat-card-content>
          </mat-card>
          
          <!-- User Activity -->
          <mat-card *ngIf="auditDashboard">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>people</mat-icon>
                User Activity
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngFor="let stat of auditDashboard.userActivityStats" class="stat-row">
                <span class="stat-name">{{ stat.username }}</span>
                <span class="stat-count">{{ stat.count }}</span>
                <div class="stat-bar" [style.width.%]="getPercentage(stat.count, auditDashboard.totalEvents)"></div>
              </div>
              <p *ngIf="auditDashboard.userActivityStats.length === 0" class="no-data">No user activity</p>
            </mat-card-content>
          </mat-card>
          
          <!-- Low Stock Items -->
          <mat-card *ngIf="inventoryDashboard">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>warning</mat-icon>
                Low Stock Items
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="inventoryDashboard.lowStockItems" *ngIf="inventoryDashboard.lowStockItems.length > 0">
                <ng-container matColumnDef="itemSku">
                  <th mat-header-cell *matHeaderCellDef>SKU</th>
                  <td mat-cell *matCellDef="let item">{{ item.itemSku }}</td>
                </ng-container>
                <ng-container matColumnDef="itemName">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let item">{{ item.itemName }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let item">
                    <span class="status-chip low">{{ item.quantity }}</span>
                  </td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="lowStockColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: lowStockColumns;"></tr>
              </table>
              <p *ngIf="inventoryDashboard.lowStockItems.length === 0" class="no-data">No low stock items</p>
            </mat-card-content>
          </mat-card>
          
          <!-- Recent Movements -->
          <mat-card *ngIf="inventoryDashboard">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>swap_horiz</mat-icon>
                Recent Movements
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="inventoryDashboard.recentMovements" *ngIf="inventoryDashboard.recentMovements.length > 0">
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
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="movementColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: movementColumns;"></tr>
              </table>
              <p *ngIf="inventoryDashboard.recentMovements.length === 0" class="no-data">No recent movements</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h2 {
      margin: 24px 0 16px;
      color: #333;
    }
    
    .stat-card.warning .stat-value {
      color: #e65100;
    }
    
    .stat-card.accent .stat-value {
      color: #7b1fa2;
    }
    
    .stat-card.error .stat-value {
      color: #c62828;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }
    
    mat-card-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .stat-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      position: relative;
    }
    
    .stat-name {
      flex: 1;
      z-index: 1;
    }
    
    .stat-count {
      font-weight: 500;
      z-index: 1;
    }
    
    .stat-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background-color: rgba(63, 81, 181, 0.1);
      border-radius: 4px;
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
    
    .status-chip.low {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.in {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.out {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.adjustment, .status-chip.transfer {
      background-color: #e3f2fd;
      color: #1565c0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  inventoryDashboard: DashboardResponse | null = null;
  auditDashboard: AuditDashboard | null = null;
  loading = true;
  
  lowStockColumns = ['itemSku', 'itemName', 'quantity'];
  movementColumns = ['itemSku', 'movementType', 'quantity'];
  
  constructor(
    private inventoryService: InventoryService,
    private auditService: AuditService
  ) {}
  
  ngOnInit(): void {
    this.loadDashboards();
  }
  
  loadDashboards(): void {
    let completed = 0;
    const checkComplete = () => {
      completed++;
      if (completed >= 2) {
        this.loading = false;
      }
    };
    
    this.inventoryService.getDashboard().subscribe({
      next: (data) => {
        this.inventoryDashboard = data;
        checkComplete();
      },
      error: () => checkComplete()
    });
    
    this.auditService.getDashboard(24).subscribe({
      next: (data) => {
        this.auditDashboard = data;
        checkComplete();
      },
      error: () => checkComplete()
    });
  }
  
  getPercentage(count: number, total: number): number {
    if (!total) return 0;
    return (count / total) * 100;
  }
}
