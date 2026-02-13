import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { tap, of } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { User } from '../types/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  get currentUserId(): string | null {
    return this.currentUser()?._id ?? null;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.setUserFromAuthResponse(response);
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.saveToken(response.token);
        this.setUserFromAuthResponse(response);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  loadUserFromToken(): Observable<User | null> {
    const token = this.getToken();

    if (!token) {
      this.currentUserSignal.set(null);
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        return of(null);
      }),
    );
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private setUserFromAuthResponse(response: AuthResponse): void {
    this.currentUserSignal.set(response.user);
  }
}
