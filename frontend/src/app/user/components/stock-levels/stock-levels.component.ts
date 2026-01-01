import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockLevel } from '../../../core/models/inventory.model';
import { CreateReplenishmentDialogComponent } from '../create-replenishment-dialog/create-replenishment-dialog.component';

@Component({
  selector: 'app-stock-levels',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Stock Levels</h1>
        <span class="warehouse-badge" *ngIf="warehouseId">
          <mat-icon>warehouse</mat-icon> Warehouse {{ warehouseId }}
        </span>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="stockLevels">
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
              
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="getQuantityClass(item)">{{ item.quantity }}</span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="reservedQuantity">
                <th mat-header-cell *matHeaderCellDef>Reserved</th>
                <td mat-cell *matCellDef="let item">{{ item.reservedQuantity }}</td>
              </ng-container>
              
              <ng-container matColumnDef="availableQuantity">
                <th mat-header-cell *matHeaderCellDef>Available</th>
                <td mat-cell *matCellDef="let item">{{ item.availableQuantity }}</td>
              </ng-container>
              
              <ng-container matColumnDef="reorderLevel">
                <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
                <td mat-cell *matCellDef="let item">{{ item.reorderLevel }}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" 
                          matTooltip="Request Replenishment"
                          [disabled]="item.quantity > item.reorderLevel"
                          (click)="openReplenishmentDialog(item)">
                    <mat-icon>shopping_cart</mat-icon>
                  </button>
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
    
    table {
      width: 100%;
    }
    
    .quantity-low {
      color: #c62828;
      font-weight: 500;
    }
    
    .quantity-warning {
      color: #e65100;
      font-weight: 500;
    }
    
    .quantity-ok {
      color: #2e7d32;
    }
  `]
})
export class StockLevelsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  stockLevels: StockLevel[] = [];
  loading = true;
  warehouseId: number | null;
  
  displayedColumns = ['itemSku', 'itemName', 'warehouseCode', 'quantity', 'reservedQuantity', 'availableQuantity', 'reorderLevel', 'actions'];
  
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
    this.loadStockLevels();
  }
  
  loadStockLevels(): void {
    this.loading = true;
    
    const request = this.warehouseId
      ? this.inventoryService.getStockByWarehouse(this.warehouseId, this.currentPage, this.pageSize)
      : this.inventoryService.getAllStockLevels(this.currentPage, this.pageSize);
    
    request.subscribe({
      next: (page) => {
        this.stockLevels = page.content;
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
    this.loadStockLevels();
  }
  
  getQuantityClass(item: StockLevel): string {
    if (item.quantity <= item.reorderLevel * 0.5) {
      return 'quantity-low';
    } else if (item.quantity <= item.reorderLevel) {
      return 'quantity-warning';
    }
    return 'quantity-ok';
  }
  
  openReplenishmentDialog(item: StockLevel): void {
    const dialogRef = this.dialog.open(CreateReplenishmentDialogComponent, {
      width: '500px',
      data: { stockLevel: item }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStockLevels();
      }
    });
  }
}
