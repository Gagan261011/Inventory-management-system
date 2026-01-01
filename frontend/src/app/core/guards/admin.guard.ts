import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAdmin()) {
      return true;
    }
    
    // If user is logged in but not admin, redirect to user dashboard
    if (this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/user/dashboard']);
    }
    
    return this.router.createUrlTree(['/auth/login']);
  }
}
