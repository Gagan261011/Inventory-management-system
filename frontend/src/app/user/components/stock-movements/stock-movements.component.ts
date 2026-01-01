import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { StockMovement } from '../../../core/models/inventory.model';
import { CreateMovementDialogComponent } from '../create-movement-dialog/create-movement-dialog.component';

@Component({
  selector: 'app-stock-movements',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Stock Movements</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Create Movement
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="movements">
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
              
              <ng-container matColumnDef="movementType">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let item">
                  <span [class]="'status-chip ' + item.movementType.toLowerCase()">
                    {{ item.movementType }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantity</th>
                <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
              </ng-container>
              
              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Reference</th>
                <td mat-cell *matCellDef="let item">{{ item.reference }}</td>
              </ng-container>
              
              <ng-container matColumnDef="createdBy">
                <th mat-header-cell *matHeaderCellDef>Created By</th>
                <td mat-cell *matCellDef="let item">{{ item.createdBy }}</td>
              </ng-container>
              
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let item">{{ item.createdAt | date:'short' }}</td>
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
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-chip.in {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.out {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-chip.adjustment {
      background-color: #fff3e0;
      color: #e65100;
    }
    
    .status-chip.transfer {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .status-chip.return {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }
  `]
})
export class StockMovementsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  movements: StockMovement[] = [];
  loading = true;
  warehouseId: number | null;
  
  displayedColumns = ['id', 'itemSku', 'itemName', 'warehouseCode', 'movementType', 'quantity', 'reference', 'createdBy', 'createdAt'];
  
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
    this.loadMovements();
  }
  
  loadMovements(): void {
    this.loading = true;
    
    const request = this.warehouseId
      ? this.inventoryService.getMovementsByWarehouse(this.warehouseId, this.currentPage, this.pageSize)
      : this.inventoryService.getAllMovements(this.currentPage, this.pageSize);
    
    request.subscribe({
      next: (page) => {
        this.movements = page.content;
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
    this.loadMovements();
  }
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateMovementDialogComponent, {
      width: '500px',
      data: { warehouseId: this.warehouseId }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMovements();
      }
    });
  }
}
