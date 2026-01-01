import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" mode="side" opened>
        <mat-toolbar color="warn">
          <mat-icon>inventory_2</mat-icon>
          <span>IMS Admin</span>
        </mat-toolbar>
        
        <mat-nav-list>
          <a mat-list-item routerLink="dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          
          <mat-divider></mat-divider>
          <div class="nav-section">User Management</div>
          
          <a mat-list-item routerLink="users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
          
          <mat-divider></mat-divider>
          <div class="nav-section">Catalog</div>
          
          <a mat-list-item routerLink="items" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Items</span>
          </a>
          <a mat-list-item routerLink="categories" routerLinkActive="active">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categories</span>
          </a>
          <a mat-list-item routerLink="suppliers" routerLinkActive="active">
            <mat-icon matListItemIcon>local_shipping</mat-icon>
            <span matListItemTitle>Suppliers</span>
          </a>
          
          <mat-divider></mat-divider>
          <div class="nav-section">Inventory</div>
          
          <a mat-list-item routerLink="warehouses" routerLinkActive="active">
            <mat-icon matListItemIcon>warehouse</mat-icon>
            <span matListItemTitle>Warehouses</span>
          </a>
          <a mat-list-item routerLink="replenishments" routerLinkActive="active">
            <mat-icon matListItemIcon>shopping_cart</mat-icon>
            <span matListItemTitle>Replenishment Requests</span>
          </a>
          
          <mat-divider></mat-divider>
          <div class="nav-section">System</div>
          
          <a mat-list-item routerLink="audit" routerLinkActive="active">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Audit Logs</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="warn">
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
            <button mat-menu-item disabled>
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Administrator</span>
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
      background-color: rgba(244, 67, 54, 0.1);
    }
    
    .nav-section {
      padding: 16px 16px 8px;
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }
    
    .content {
      padding: 20px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class AdminLayoutComponent {
  userEmail: string;
  
  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
