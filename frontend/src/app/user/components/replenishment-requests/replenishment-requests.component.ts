import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReplenishmentRequest } from '../../../core/models/inventory.model';
import { CreateReplenishmentDialogComponent } from '../create-replenishment-dialog/create-replenishment-dialog.component';

@Component({
  selector: 'app-replenishment-requests',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Replenishment Requests</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Request
        </button>
      </div>
      
      <div class="filter-row">
        <mat-form-field appearance="outline">
          <mat-label>Filter by Status</mat-label>
          <mat-select [(value)]="selectedStatus" (selectionChange)="onStatusChange()">
            <mat-option value="">All</mat-option>
            <mat-option value="PENDING">Pending</mat-option>
            <mat-option value="APPROVED">Approved</mat-option>
            <mat-option value="REJECTED">Rejected</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="requests">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let item">{{ item.id }}</td>
              </ng-container>
              
              <ng-container matColumnDef="itemSku">
                <th mat-header-cell *matHeaderCellDef>SKU</th>
                <td mat-cell *matCellDef="let item">{{ item.itemSku }}</td>
              </ng-container>
              
              <ng-container matColumnDef="itemName">
                <th mat-header-cell *matHeaderCellDef>Item Name</th>
                <td mat-cell *matCellDef="let item">{{ item.itemName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="warehouseCode">
                <th mat-header-cell *matHeaderCellDef>Warehouse</th>
                <td mat-cell *matCellDef="let item">{{ item.warehouseCode }}</td>
              </ng-container>
              
              <ng-container matColumnDef="currentQuantity">
                <th mat-header-cell *matHeaderCellDef>Current Qty</th>
                <td mat-cell *matCellDef="let item">{{ item.currentQuantity }}</td>
              </ng-container>
              
              <ng-container matColumnDef="requestedQuantity">
                <th mat-header-cell *matHeaderCellDef>Requested Qty</th>
                <td mat-cell *matCellDef="let item">{{ item.requestedQuantity }}</td>
              </ng-container>
              
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="'status-chip ' + item.priority.toLowerCase()">
                    {{ item.priority }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="'status-chip ' + item.status.toLowerCase()">
                    {{ item.status }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="requestedBy">
                <th mat-header-cell *matHeaderCellDef>Requested By</th>
                <td mat-cell *matCellDef="let item">{{ item.requestedBy }}</td>
              </ng-container>
              
              <ng-container matColumnDef="requestedAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let item">{{ item.requestedAt | date:'short' }}</td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <mat-paginator 
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)">
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
    }
    
    .filter-row mat-form-field {
      width: 200px;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-chip.pending {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .status-chip.approved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.rejected {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.low {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .status-chip.medium {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .status-chip.high {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.critical {
      background-color: #880e4f;
      color: white;
    }
  `]
})
export class ReplenishmentRequestsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  requests: ReplenishmentRequest[] = [];
  loading = true;
  warehouseId: number | null;
  selectedStatus = '';
  
  displayedColumns = ['id', 'itemSku', 'itemName', 'warehouseCode', 'currentQuantity', 'requestedQuantity', 'priority', 'status', 'requestedBy', 'requestedAt'];
  
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.warehouseId = this.authService.getWarehouseId();
  }
  
  ngOnInit(): void {
    this.loadRequests();
  }
  
  loadRequests(): void {
    this.loading = true;
    
    let request;
    if (this.selectedStatus) {
      request = this.inventoryService.getReplenishmentsByStatus(this.selectedStatus, this.currentPage, this.pageSize);
    } else if (this.warehouseId) {
      request = this.inventoryService.getReplenishmentsByWarehouse(this.warehouseId, this.currentPage, this.pageSize);
    } else {
      request = this.inventoryService.getAllReplenishmentRequests(this.currentPage, this.pageSize);
    }
    
    request.subscribe({
      next: (page) => {
        this.requests = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRequests();
  }
  
  onStatusChange(): void {
    this.currentPage = 0;
    this.loadRequests();
  }
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateReplenishmentDialogComponent, {
      width: '500px',
      data: { warehouseId: this.warehouseId }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRequests();
      }
    });
  }
}
