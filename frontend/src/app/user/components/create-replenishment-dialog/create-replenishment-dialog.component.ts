import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from '../../../core/services/inventory.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Item } from '../../../core/models/catalog.model';
import { Warehouse, StockLevel } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-create-replenishment-dialog',
  template: `
    <h2 mat-dialog-title>Create Replenishment Request</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" *ngIf="!data.stockLevel">
          <mat-label>Item</mat-label>
          <mat-select formControlName="itemId" required>
            <mat-option *ngFor="let item of items" [value]="item.id">
              {{ item.sku }} - {{ item.name }}
            </mat-option>
          </mat-select>
          <mat-error>Item is required</mat-error>
        </mat-form-field>
        
        <div *ngIf="data.stockLevel" class="selected-item">
          <strong>Item:</strong> {{ data.stockLevel.itemSku }} - {{ data.stockLevel.itemName }}
        </div>
        
        <mat-form-field appearance="outline" *ngIf="!data.stockLevel">
          <mat-label>Warehouse</mat-label>
          <mat-select formControlName="warehouseId" required>
            <mat-option *ngFor="let wh of warehouses" [value]="wh.id">
              {{ wh.code }} - {{ wh.name }}
            </mat-option>
          </mat-select>
          <mat-error>Warehouse is required</mat-error>
        </mat-form-field>
        
        <div *ngIf="data.stockLevel" class="selected-item">
          <strong>Warehouse:</strong> {{ data.stockLevel.warehouseCode }} - {{ data.stockLevel.warehouseName }}
        </div>
        
        <div *ngIf="data.stockLevel" class="current-stock">
          <div><strong>Current Quantity:</strong> {{ data.stockLevel.quantity }}</div>
          <div><strong>Reorder Level:</strong> {{ data.stockLevel.reorderLevel }}</div>
        </div>
        
        <mat-form-field appearance="outline">
          <mat-label>Requested Quantity</mat-label>
          <input matInput formControlName="requestedQuantity" type="number" min="1" required>
          <mat-error>Quantity must be at least 1</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="LOW">Low</mat-option>
            <mat-option value="MEDIUM">Medium</mat-option>
            <mat-option value="HIGH">High</mat-option>
            <mat-option value="CRITICAL">Critical</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || loading"
              (click)="submit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Submit Request</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
    
    .selected-item {
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .current-stock {
      padding: 12px;
      background-color: #fff3e0;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .current-stock div {
      margin-bottom: 4px;
    }
  `]
})
export class CreateReplenishmentDialogComponent implements OnInit {
  form: FormGroup;
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateReplenishmentDialogComponent>,
    private inventoryService: InventoryService,
    private catalogService: CatalogService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { warehouseId?: number; stockLevel?: StockLevel }
  ) {
    const stockLevel = data.stockLevel;
    
    this.form = this.fb.group({
      itemId: [stockLevel?.itemId || null, Validators.required],
      warehouseId: [stockLevel?.warehouseId || data.warehouseId || null, Validators.required],
      requestedQuantity: [stockLevel ? Math.max(stockLevel.reorderLevel * 2 - stockLevel.quantity, 10) : 10, [Validators.required, Validators.min(1)]],
      priority: [this.calculatePriority(stockLevel)],
      notes: ['']
    });
  }
  
  ngOnInit(): void {
    if (!this.data.stockLevel) {
      this.loadItems();
      this.loadWarehouses();
    }
  }
  
  loadItems(): void {
    this.catalogService.getAllItems(0, 1000).subscribe({
      next: (page) => {
        this.items = page.content;
      }
    });
  }
  
  loadWarehouses(): void {
    this.inventoryService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      }
    });
  }
  
  calculatePriority(stockLevel?: StockLevel): string {
    if (!stockLevel) return 'MEDIUM';
    
    const ratio = stockLevel.quantity / stockLevel.reorderLevel;
    if (ratio <= 0.25) return 'CRITICAL';
    if (ratio <= 0.5) return 'HIGH';
    if (ratio <= 0.75) return 'MEDIUM';
    return 'LOW';
  }
  
  submit(): void {
    if (this.form.invalid) return;
    
    this.loading = true;
    
    this.inventoryService.createReplenishmentRequest(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Replenishment request created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
