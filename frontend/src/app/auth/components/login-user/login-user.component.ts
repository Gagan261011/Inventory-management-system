import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-user',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">person</mat-icon>
            User Login
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>
            
            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
            
            <button mat-raised-button color="primary" type="submit" [disabled]="loading || loginForm.invalid">
              <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
              <span *ngIf="!loading">Login as User</span>
            </button>
          </form>
          
          <div class="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <p>User 1: user1&#64;demo.com / User&#64;123 (Warehouse 1)</p>
            <p>User 2: user2&#64;demo.com / User&#64;123 (Warehouse 2)</p>
          </div>
          
          <a mat-button routerLink="/auth/login" class="back-link">
            <mat-icon>arrow_back</mat-icon> Back to Login Selection
          </a>
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
      max-width: 400px;
      width: 100%;
    }
    
    mat-card-header {
      margin-bottom: 24px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .title-icon {
      color: #3f51b5;
    }
    
    form {
      display: flex;
      flex-direction: column;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
    
    button[type="submit"] {
      margin-top: 16px;
      height: 48px;
    }
    
    .error-message {
      color: #f44336;
      background-color: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-top: 8px;
    }
    
    .demo-credentials {
      margin-top: 24px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .demo-credentials p {
      margin: 4px 0;
    }
    
    .back-link {
      margin-top: 16px;
    }
  `]
})
export class LoginUserComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.loginUser(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/user/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
