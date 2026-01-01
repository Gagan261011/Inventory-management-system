import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from '../models/user.model';
import { Page } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl.auth;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => this.setSession(response)));
  }

  loginUser(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/user`, credentials)
      .pipe(tap(response => this.setSession(response)));
  }

  loginAdmin(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/admin`, credentials)
      .pipe(tap(response => this.setSession(response)));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(response));
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(response);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_ADMIN') || false;
  }

  isUser(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('ROLE_USER') || false;
  }

  getWarehouseId(): number | null {
    return this.getCurrentUser()?.warehouseId || null;
  }

  // User management (Admin only)
  getAllUsers(page = 0, size = 20): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.apiUrl}/users?page=${page}&size=${size}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, request);
  }

  resetPassword(id: number, request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/reset-password`, request);
  }

  deactivateUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
