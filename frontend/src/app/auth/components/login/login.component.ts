import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="logo-icon">inventory_2</mat-icon>
            Inventory Management System
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p class="subtitle">Select your login type to continue</p>
          
          <div class="login-options">
            <mat-card class="option-card" (click)="goToUserLogin()">
              <mat-icon class="option-icon">person</mat-icon>
              <h3>User Login</h3>
              <p>For warehouse staff to manage inventory, create movements, and submit replenishment requests</p>
            </mat-card>
            
            <mat-card class="option-card" (click)="goToAdminLogin()">
              <mat-icon class="option-icon">admin_panel_settings</mat-icon>
              <h3>Admin Login</h3>
              <p>For administrators to manage users, approve requests, and view system-wide reports</p>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    
    mat-card-header {
      justify-content: center;
      margin-bottom: 24px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
    }
    
    .logo-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3f51b5;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 24px;
    }
    
    .login-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .option-card {
      cursor: pointer;
      padding: 24px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .option-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .option-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }
    
    .option-card h3 {
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .option-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  
  constructor(private router: Router) {}
  
  goToUserLogin(): void {
    this.router.navigate(['/auth/login/user']);
  }
  
  goToAdminLogin(): void {
    this.router.navigate(['/auth/login/admin']);
  }
}
