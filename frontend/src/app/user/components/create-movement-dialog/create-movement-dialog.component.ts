import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from '../../../core/services/inventory.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Item } from '../../../core/models/catalog.model';
import { Warehouse } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-create-movement-dialog',
  template: `
    <h2 mat-dialog-title>Create Stock Movement</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Item</mat-label>
          <mat-select formControlName="itemId" required>
            <mat-option *ngFor="let item of items" [value]="item.id">
              {{ item.sku }} - {{ item.name }}
            </mat-option>
          </mat-select>
          <mat-error>Item is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Warehouse</mat-label>
          <mat-select formControlName="warehouseId" required>
            <mat-option *ngFor="let wh of warehouses" [value]="wh.id">
              {{ wh.code }} - {{ wh.name }}
            </mat-option>
          </mat-select>
          <mat-error>Warehouse is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Movement Type</mat-label>
          <mat-select formControlName="movementType" required>
            <mat-option value="IN">IN (Receiving)</mat-option>
            <mat-option value="OUT">OUT (Shipping)</mat-option>
            <mat-option value="ADJUSTMENT">ADJUSTMENT</mat-option>
            <mat-option value="TRANSFER">TRANSFER</mat-option>
            <mat-option value="RETURN">RETURN</mat-option>
          </mat-select>
          <mat-error>Movement type is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Quantity</mat-label>
          <input matInput formControlName="quantity" type="number" min="1" required>
          <mat-error>Quantity must be at least 1</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Reference</mat-label>
          <input matInput formControlName="reference" placeholder="PO#, SO#, etc.">
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
        <span *ngIf="!loading">Create</span>
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
  `]
})
export class CreateMovementDialogComponent implements OnInit {
  form: FormGroup;
  items: Item[] = [];
  warehouses: Warehouse[] = [];
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateMovementDialogComponent>,
    private inventoryService: InventoryService,
    private catalogService: CatalogService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { warehouseId?: number }
  ) {
    this.form = this.fb.group({
      itemId: [null, Validators.required],
      warehouseId: [data.warehouseId, Validators.required],
      movementType: ['IN', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reference: [''],
      notes: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadItems();
    this.loadWarehouses();
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
  
  submit(): void {
    if (this.form.invalid) return;
    
    this.loading = true;
    
    this.inventoryService.createMovement(this.form.value).subscribe({
      next: () => {
        this.snackBar.open('Movement created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
