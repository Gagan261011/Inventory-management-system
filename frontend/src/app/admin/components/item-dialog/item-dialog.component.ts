import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CatalogService } from '../../../core/services/catalog.service';
import { Item, Category, Supplier } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-item-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Item' : 'Edit Item' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>SKU</mat-label>
            <input matInput formControlName="sku" [readonly]="data.mode === 'edit'">
            <mat-error>SKU is required</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name">
            <mat-error>Name is required</mat-error>
          </mat-form-field>
        </div>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
        
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</mat-option>
            </mat-select>
            <mat-error>Category is required</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Supplier</mat-label>
            <mat-select formControlName="supplierId">
              <mat-option *ngFor="let sup of suppliers" [value]="sup.id">{{ sup.name }}</mat-option>
            </mat-select>
            <mat-error>Supplier is required</mat-error>
          </mat-form-field>
        </div>
        
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Unit Price</mat-label>
            <input matInput formControlName="unitPrice" type="number" min="0" step="0.01">
            <span matPrefix>$&nbsp;</span>
            <mat-error>Price must be positive</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Lead Time (Days)</mat-label>
            <input matInput formControlName="leadTimeDays" type="number" min="1">
            <mat-error>Lead time must be at least 1</mat-error>
          </mat-form-field>
        </div>
        
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Reorder Level</mat-label>
            <input matInput formControlName="reorderLevel" type="number" min="0">
            <mat-error>Reorder level must be positive</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Reorder Quantity</mat-label>
            <input matInput formControlName="reorderQuantity" type="number" min="1">
            <mat-error>Reorder quantity must be at least 1</mat-error>
          </mat-form-field>
        </div>
        
        <mat-checkbox formControlName="active" *ngIf="data.mode === 'edit'">Active</mat-checkbox>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || loading"
              (click)="submit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ data.mode === 'create' ? 'Create' : 'Update' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
    }
    
    .form-row mat-form-field {
      flex: 1;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      margin-bottom: 8px;
    }
  `]
})
export class ItemDialogComponent implements OnInit {
  form: FormGroup;
  categories: Category[] = [];
  suppliers: Supplier[] = [];
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ItemDialogComponent>,
    private catalogService: CatalogService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; item?: Item }
  ) {
    const item = data.item;
    
    this.form = this.fb.group({
      sku: [item?.sku || '', Validators.required],
      name: [item?.name || '', Validators.required],
      description: [item?.description || ''],
      categoryId: [item?.categoryId || null, Validators.required],
      supplierId: [item?.supplierId || null, Validators.required],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      reorderLevel: [item?.reorderLevel || 10, [Validators.required, Validators.min(0)]],
      reorderQuantity: [item?.reorderQuantity || 50, [Validators.required, Validators.min(1)]],
      leadTimeDays: [item?.leadTimeDays || 7, [Validators.required, Validators.min(1)]],
      active: [item?.active ?? true]
    });
  }
  
  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();
  }
  
  loadCategories(): void {
    this.catalogService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      }
    });
  }
  
  loadSuppliers(): void {
    this.catalogService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
      }
    });
  }
  
  submit(): void {
    if (this.form.invalid) return;
    
    this.loading = true;
    
    if (this.data.mode === 'create') {
      this.catalogService.createItem(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Item created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      const { sku, ...updateData } = this.form.value;
      this.catalogService.updateItem(this.data.item!.id, updateData).subscribe({
        next: () => {
          this.snackBar.open('Item updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
