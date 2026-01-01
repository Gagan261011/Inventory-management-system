import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" mode="side" opened>
        <mat-toolbar color="primary">
          <mat-icon>inventory_2</mat-icon>
          <span>IMS User</span>
        </mat-toolbar>
        
        <mat-nav-list>
          <a mat-list-item routerLink="dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="stock" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Stock Levels</span>
          </a>
          <a mat-list-item routerLink="movements" routerLinkActive="active">
            <mat-icon matListItemIcon>swap_horiz</mat-icon>
            <span matListItemTitle>Stock Movements</span>
          </a>
          <a mat-list-item routerLink="replenishments" routerLinkActive="active">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Replenishment Requests</span>
          </a>
        </mat-nav-list>
        
        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <div class="user-info">
            <mat-icon>person</mat-icon>
            <span>{{ userEmail }}</span>
          </div>
          <div class="warehouse-info" *ngIf="warehouseId">
            <mat-icon>warehouse</mat-icon>
            <span>Warehouse {{ warehouseId }}</span>
          </div>
        </div>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>{{ userEmail }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    
    .sidenav {
      width: 250px;
    }
    
    .sidenav mat-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .sidenav mat-nav-list a.active {
      background-color: rgba(63, 81, 181, 0.1);
    }
    
    .sidenav-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
    }
    
    .user-info, .warehouse-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: #666;
      font-size: 14px;
    }
    
    .content {
      padding: 20px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class UserLayoutComponent {
  userEmail: string;
  warehouseId: number | null;
  
  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
    this.warehouseId = user?.warehouseId || null;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
