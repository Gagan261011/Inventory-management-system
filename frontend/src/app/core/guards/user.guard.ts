import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isUser()) {
      return true;
    }
    
    // If user is admin, redirect to admin dashboard
    if (this.authService.isAdmin()) {
      return this.router.createUrlTree(['/admin/dashboard']);
    }
    
    return this.router.createUrlTree(['/auth/login']);
  }
}
