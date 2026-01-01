import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import { ReplenishmentRequest } from '../../../core/models/inventory.model';
import { ApprovalDialogComponent } from '../approval-dialog/approval-dialog.component';

@Component({
  selector: 'app-replenishment-approval',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Replenishment Request Approvals</h1>
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
                  <span [class]="'status-chip priority-' + item.priority.toLowerCase()">
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
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" 
                          *ngIf="item.status === 'PENDING'"
                          (click)="openApprovalDialog(item, true)" 
                          matTooltip="Approve">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          *ngIf="item.status === 'PENDING'"
                          (click)="openApprovalDialog(item, false)" 
                          matTooltip="Reject">
                    <mat-icon>cancel</mat-icon>
                  </button>
                  <span *ngIf="item.status !== 'PENDING'" class="reviewed-by">
                    {{ item.reviewedBy ? 'by ' + item.reviewedBy : '' }}
                  </span>
                </td>
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
    
    .status-chip.priority-low {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .status-chip.priority-medium {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .status-chip.priority-high {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.priority-critical {
      background-color: #880e4f;
      color: white;
    }
    
    .reviewed-by {
      color: #666;
      font-size: 12px;
    }
  `]
})
export class ReplenishmentApprovalComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  requests: ReplenishmentRequest[] = [];
  loading = true;
  selectedStatus = 'PENDING';
  
  displayedColumns = ['id', 'itemSku', 'itemName', 'warehouseCode', 'currentQuantity', 'requestedQuantity', 'priority', 'status', 'requestedBy', 'requestedAt', 'actions'];
  
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadRequests();
  }
  
  loadRequests(): void {
    this.loading = true;
    
    const request = this.selectedStatus
      ? this.inventoryService.getReplenishmentsByStatus(this.selectedStatus, this.currentPage, this.pageSize)
      : this.inventoryService.getAllReplenishmentRequests(this.currentPage, this.pageSize);
    
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
  
  openApprovalDialog(request: ReplenishmentRequest, approve: boolean): void {
    const dialogRef = this.dialog.open(ApprovalDialogComponent, {
      width: '500px',
      data: { request, approve }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRequests();
      }
    });
  }
}
