import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../../core/services/catalog.service';
import { Supplier } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-supplier-management',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Supplier Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateForm()">
          <mat-icon>add</mat-icon>
          Add Supplier
        </button>
      </div>
      
      <div class="card-grid">
        <!-- Create/Edit Form Card -->
        <mat-card *ngIf="showForm" class="form-card">
          <mat-card-header>
            <mat-card-title>{{ editingSupplier ? 'Edit Supplier' : 'New Supplier' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput [(ngModel)]="formData.name" required>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Contact Person</mat-label>
              <input matInput [(ngModel)]="formData.contactPerson">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="formData.email" type="email">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="formData.phone">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Address</mat-label>
              <textarea matInput [(ngModel)]="formData.address" rows="2"></textarea>
            </mat-form-field>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="cancelForm()">Cancel</button>
            <button mat-raised-button color="primary" [disabled]="!formData.name" (click)="saveSupplier()">
              {{ editingSupplier ? 'Update' : 'Create' }}
            </button>
          </mat-card-actions>
        </mat-card>
        
        <!-- Supplier Cards -->
        <mat-card *ngFor="let supplier of suppliers">
          <mat-card-header>
            <mat-card-title>{{ supplier.name }}</mat-card-title>
            <mat-card-subtitle>{{ supplier.itemCount }} items</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="supplier-info">
              <p *ngIf="supplier.contactPerson">
                <mat-icon>person</mat-icon> {{ supplier.contactPerson }}
              </p>
              <p *ngIf="supplier.email">
                <mat-icon>email</mat-icon> {{ supplier.email }}
              </p>
              <p *ngIf="supplier.phone">
                <mat-icon>phone</mat-icon> {{ supplier.phone }}
              </p>
              <p *ngIf="supplier.address">
                <mat-icon>location_on</mat-icon> {{ supplier.address }}
              </p>
            </div>
            <span [class]="'status-chip ' + (supplier.active ? 'approved' : 'rejected')">
              {{ supplier.active ? 'Active' : 'Inactive' }}
            </span>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-icon-button color="primary" (click)="editSupplier(supplier)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteSupplier(supplier)" 
                    [disabled]="supplier.itemCount > 0" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
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
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .form-card {
      grid-column: span 1;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .supplier-info {
      margin-bottom: 12px;
    }
    
    .supplier-info p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }
    
    .supplier-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #999;
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
export class SupplierManagementComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = true;
  showForm = false;
  editingSupplier: Supplier | null = null;
  formData = { name: '', contactPerson: '', email: '', phone: '', address: '' };
  
  constructor(
    private catalogService: CatalogService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadSuppliers();
  }
  
  loadSuppliers(): void {
    this.loading = true;
    this.catalogService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  
  openCreateForm(): void {
    this.editingSupplier = null;
    this.formData = { name: '', contactPerson: '', email: '', phone: '', address: '' };
    this.showForm = true;
  }
  
  editSupplier(supplier: Supplier): void {
    this.editingSupplier = supplier;
    this.formData = {
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address
    };
    this.showForm = true;
  }
  
  cancelForm(): void {
    this.showForm = false;
    this.editingSupplier = null;
  }
  
  saveSupplier(): void {
    if (!this.formData.name) return;
    
    if (this.editingSupplier) {
      this.catalogService.updateSupplier(this.editingSupplier.id, this.formData).subscribe({
        next: () => {
          this.snackBar.open('Supplier updated successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadSuppliers();
        }
      });
    } else {
      this.catalogService.createSupplier(this.formData).subscribe({
        next: () => {
          this.snackBar.open('Supplier created successfully', 'Close', { duration: 3000 });
          this.cancelForm();
          this.loadSuppliers();
        }
      });
    }
  }
  
  deleteSupplier(supplier: Supplier): void {
    if (supplier.itemCount > 0) {
      this.snackBar.open('Cannot delete supplier with items', 'Close', { duration: 3000 });
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
      this.catalogService.deleteSupplier(supplier.id).subscribe({
        next: () => {
          this.snackBar.open('Supplier deleted successfully', 'Close', { duration: 3000 });
          this.loadSuppliers();
        }
      });
    }
  }
}
