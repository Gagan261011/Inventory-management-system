import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-management',
  template: `
    <div class="container">
      <div class="page-header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-spinner">
            <mat-spinner></mat-spinner>
          </div>
          
          <div class="table-container" *ngIf="!loading">
            <table mat-table [dataSource]="users">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let user">{{ user.id }}</td>
              </ng-container>
              
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>
              
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
              </ng-container>
              
              <ng-container matColumnDef="roles">
                <th mat-header-cell *matHeaderCellDef>Roles</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip-set>
                    <mat-chip *ngFor="let role of user.roles" [color]="role === 'ROLE_ADMIN' ? 'warn' : 'primary'">
                      {{ role.replace('ROLE_', '') }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="warehouseId">
                <th mat-header-cell *matHeaderCellDef>Warehouse</th>
                <td mat-cell *matCellDef="let user">{{ user.warehouseId || '-' }}</td>
              </ng-container>
              
              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <span [class]="'status-chip ' + (user.active ? 'approved' : 'rejected')">
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button color="primary" (click)="openEditDialog(user)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="toggleUserStatus(user)" 
                          [matTooltip]="user.active ? 'Deactivate' : 'Activate'">
                    <mat-icon>{{ user.active ? 'block' : 'check_circle' }}</mat-icon>
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
    table {
      width: 100%;
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
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  users: User[] = [];
  loading = true;
  
  displayedColumns = ['id', 'email', 'name', 'roles', 'warehouseId', 'active', 'actions'];
  
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;
  
  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading = true;
    
    this.authService.getAllUsers(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.users = page.content;
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
    this.loadUsers();
  }
  
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }
  
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { mode: 'edit', user }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }
  
  toggleUserStatus(user: User): void {
    if (user.active) {
      this.authService.deactivateUser(user.id).subscribe({
        next: () => this.loadUsers()
      });
    } else {
      this.authService.updateUser(user.id, { active: true }).subscribe({
        next: () => this.loadUsers()
      });
    }
  }
}
