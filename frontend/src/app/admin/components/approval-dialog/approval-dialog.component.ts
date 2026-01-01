import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventoryService } from '../../../core/services/inventory.service';
import { ReplenishmentRequest } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-approval-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.approve ? 'Approve' : 'Reject' }} Request #{{ data.request.id }}</h2>
    
    <mat-dialog-content>
      <div class="request-details">
        <p><strong>Item:</strong> {{ data.request.itemName }} ({{ data.request.itemSku }})</p>
        <p><strong>Warehouse:</strong> {{ data.request.warehouseCode }}</p>
        <p><strong>Current Quantity:</strong> {{ data.request.currentQuantity }}</p>
        <p><strong>Requested Quantity:</strong> {{ data.request.requestedQuantity }}</p>
        <p><strong>Priority:</strong> 
          <span [class]="'status-chip priority-' + data.request.priority.toLowerCase()">
            {{ data.request.priority }}
          </span>
        </p>
        <p><strong>Requested By:</strong> {{ data.request.requestedBy }}</p>
        <p *ngIf="data.request.reason"><strong>Reason:</strong> {{ data.request.reason }}</p>
      </div>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Notes (optional)</mat-label>
        <textarea matInput [(ngModel)]="notes" rows="3" 
                  placeholder="Add any notes for this {{ data.approve ? 'approval' : 'rejection' }}"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button 
              [color]="data.approve ? 'primary' : 'warn'"
              (click)="onSubmit()"
              [disabled]="loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ data.approve ? 'Approve' : 'Reject' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .request-details {
      margin-bottom: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .request-details p {
      margin: 8px 0;
    }
    
    .full-width {
      width: 100%;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
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
    
    mat-dialog-actions button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class ApprovalDialogComponent {
  notes = '';
  loading = false;
  
  constructor(
    public dialogRef: MatDialogRef<ApprovalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: ReplenishmentRequest; approve: boolean },
    private inventoryService: InventoryService
  ) {}
  
  onCancel(): void {
    this.dialogRef.close(false);
  }
  
  onSubmit(): void {
    this.loading = true;
    
    const request = this.data.approve
      ? this.inventoryService.approveReplenishment(this.data.request.id!, this.notes)
      : this.inventoryService.rejectReplenishment(this.data.request.id!, this.notes);
    
    request.subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
