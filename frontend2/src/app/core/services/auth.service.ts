import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthUser, LoginForm, RegisterForm } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  user$ = this.userSubject.asObservable();
  isLoading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.userSubject.next(user);
        } catch (error) {
          localStorage.removeItem('auth_user');
        }
      }
    }
  }

  login(credentials: LoginForm): Observable<boolean> {
    this.loadingSubject.next(true);
    
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      map(response => {
        if (response.success) {
          const authUser: AuthUser = {
            ...response.user,
            token: response.token,
          };
          this.userSubject.next(authUser);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(authUser));
          }
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(false);
      }),
      tap(() => this.loadingSubject.next(false))
    );
  }

  register(data: RegisterForm): Observable<boolean> {
    this.loadingSubject.next(true);
    
    return this.http.post<any>('/api/auth/register', data).pipe(
      map(response => {
        if (response.success) {
          const authUser: AuthUser = {
            ...response.user,
            token: response.token,
          };
          this.userSubject.next(authUser);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_user', JSON.stringify(authUser));
          }
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of(false);
      }),
      tap(() => this.loadingSubject.next(false))
    );
  }

  logout(): void {
    this.userSubject.next(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_user');
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  getToken(): string | null {
    const user = this.userSubject.value;
    return user?.token || null;
  }
}