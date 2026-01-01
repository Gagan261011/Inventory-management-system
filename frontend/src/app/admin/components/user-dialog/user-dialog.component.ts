import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { User } from '../../../core/models/user.model';
import { Warehouse } from '../../../core/models/inventory.model';

@Component({
  selector: 'app-user-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create User' : 'Edit User' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" [readonly]="data.mode === 'edit'">
          <mat-error>Valid email is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" *ngIf="data.mode === 'create'">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error>Password is required (min 6 characters)</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName">
          <mat-error>First name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName">
          <mat-error>Last name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Roles</mat-label>
          <mat-select formControlName="roles" multiple>
            <mat-option value="ROLE_USER">User</mat-option>
            <mat-option value="ROLE_ADMIN">Admin</mat-option>
          </mat-select>
          <mat-error>At least one role is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline">
          <mat-label>Warehouse (for User role)</mat-label>
          <mat-select formControlName="warehouseId">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let wh of warehouses" [value]="wh.id">
              {{ wh.code }} - {{ wh.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
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
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class UserDialogComponent implements OnInit {
  form: FormGroup;
  warehouses: Warehouse[] = [];
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    private authService: AuthService,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit'; user?: User }
  ) {
    const user = data.user;
    
    if (data.mode === 'create') {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        roles: [['ROLE_USER'], Validators.required],
        warehouseId: [null]
      });
    } else {
      this.form = this.fb.group({
        email: [user?.email, [Validators.required, Validators.email]],
        firstName: [user?.firstName, Validators.required],
        lastName: [user?.lastName, Validators.required],
        roles: [user?.roles, Validators.required],
        warehouseId: [user?.warehouseId]
      });
    }
  }
  
  ngOnInit(): void {
    this.loadWarehouses();
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
    
    if (this.data.mode === 'create') {
      this.authService.createUser(this.form.value).subscribe({
        next: () => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      const { email, ...updateData } = this.form.value;
      this.authService.updateUser(this.data.user!.id, updateData).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
