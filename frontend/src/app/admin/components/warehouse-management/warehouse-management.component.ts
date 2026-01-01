import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from '../../../core/services/inventory.service';
import { Warehouse } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-warehouse-management',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Warehouse Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Add Warehouse
        </button>
      </div>
      
      <div class="card-grid">
        <!-- Create/Edit Form Card -->
        <mat-card *ngIf="showForm">
          <mat-card-header>
            <mat-card-title>{{ editingWarehouse ? 'Edit Warehouse' : 'New Warehouse' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline">
              <mat-label>Code</mat-label>
              <input matInput [(ngModel)]="formData.code" required [readonly]="!!editingWarehouse">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput [(ngModel)]="formData.name" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <textarea matInput [(ngModel)]="formData.address" rows="3"></textarea>
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="cancelForm()">Cancel</button>
            <button mat-raised-button color="primary" 
                    [disabled]="!formData.code || !formData.name" 
                    (click)="saveWarehouse()">
              {{ editingWarehouse ? 'Update' : 'Create' }}
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Warehouse Cards -->
        <mat-card *ngFor="let warehouse of warehouses">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>warehouse</mat-icon>
              {{ warehouse.code }}
            </mat-card-title>
            <mat-card-subtitle>{{ warehouse.name }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="address" *ngIf="warehouse.address">
              <mat-icon>location_on</mat-icon>
              {{ warehouse.address }}
            </p>
            <div class="warehouse-status">
              <span [class]="'status-chip ' + (warehouse.active ? 'approved' : 'rejected')">
                {{ warehouse.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <p class="created-date">Created: {{ warehouse.createdAt | date:'mediumDate' }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editWarehouse(warehouse)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .address {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: #666;
      margin-bottom: 12px;
    }
    
    .address mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-top: 2px;
    }
    
    .warehouse-status {
      margin-bottom: 8px;
    }
    
    .created-date {
      color: #999;
      font-size: 12px;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-chip.approved {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.rejected {
      background-color: #ffebee;
      color: #c62828;
    }
  `]
})
export class WarehouseManagementComponent implements OnInit {
  warehouses: Warehouse[] = [];
  loading = true;
  showForm = false;
  editingWarehouse: Warehouse | null = null;
  formData = { code: '', name: '', address: '' };
  
  constructor(
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadWarehouses();
  }
  
  loadWarehouses(): void {
    this.loading = true;
    this.inventoryService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  openCreateForm(): void {
    this.editingWarehouse = null;
    this.formData = { code: '', name: '', address: '' };
    this.showForm = true;
  }
  
  editWarehouse(warehouse: Warehouse): void {
    this.editingWarehouse = warehouse;
    this.formData = {
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address
    };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
    this.editingWarehouse = null;
  }
  
  saveWarehouse(): void {
    if (!this.formData.code || !this.formData.name) return;
    
    if (this.editingWarehouse) {
      this.inventoryService.updateWarehouse(this.editingWarehouse.id, this.formData).subscribe({
        next: () => {
          this.snackBar.open('Warehouse updated successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadWarehouses();
        }
      });
    } else {
      this.inventoryService.createWarehouse(this.formData).subscribe({
        next: () => {
          this.snackBar.open('Warehouse created successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadWarehouses();
        }
      });
    }
  }
}
