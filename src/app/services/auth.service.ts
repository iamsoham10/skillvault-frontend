import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { userLogInResponse } from '../models/user.interface';
import { jwtDecode } from 'jwt-decode';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private LOGIN_URL = environment.LOGIN_API;
  private SIGNUP_URL = environment.SIGNUP_API;
  private OTP_URL = environment.OTP_API;
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  private refreshTokenSubscription?: Subscription;

  constructor() {
    this.startProactiveTokenRefresh();
  }

  // BehaviorSubject to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.isTokenValid()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Add token validation methods
  isTokenValid(): boolean {
    const token = localStorage.getItem(this.accessTokenKey);
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime + 300;
    } catch {
      return false;
    }
  }

  getValidToken(): string | null {
    if (this.isTokenValid()) {
      return localStorage.getItem(this.accessTokenKey);
    }
    return null;
  }

  // Get refresh token from localStorage (fallback)
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const token = localStorage.getItem(this.accessTokenKey);
    if (!token) return true;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const bufferTime = 300; // 5 minutes
      return decodedToken.exp <= currentTime + bufferTime;
    } catch {
      return true;
    }
  }

  // Add token expiration check that returns time until expiry
  getTokenExpirationTime(): number | null {
    const token = localStorage.getItem(this.accessTokenKey);
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.exp * 1000;
    } catch {
      return null;
    }
  }

  private startProactiveTokenRefresh(): void {
    this.refreshTokenSubscription = interval(240000).subscribe(() => {
      if (this.isTokenValid() && this.isTokenExpiringSoon()) {
        this.getAccessToken().subscribe({
          next: () => console.log('Token refreshed proactively'),
          error: (error) =>
            console.error('Proactive token refresh failed:', error),
        });
      }
    });
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<userLogInResponse> {
    return this.http
      .post<userLogInResponse>(this.LOGIN_URL, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          // Store access token
          localStorage.setItem(
            this.accessTokenKey,
            response.data.tokens.accessToken
          );
          
          // Store refresh token as fallback (in case HTTP-only cookie fails)
          localStorage.setItem(
            this.refreshTokenKey,
            response.data.tokens.refreshToken
          );
          this.isAuthenticatedSubject.next(true);
          this.startProactiveTokenRefresh();
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  logOut() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('userID');
    this.isAuthenticatedSubject.next(false);
    this.refreshTokenSubscription?.unsubscribe();
    this.router.navigate(['']);
  }

  signUp(credentials: {
    username: string;
    email: string;
    password: string;
  }): Observable<Object> {
    return this.http.post(this.SIGNUP_URL, credentials);
  }

  otp(credentials: { email: string; otp: string }): Observable<Object> {
    return this.http
      .post<{ user: { tokens: { accessToken: string; refreshToken: string } } }>(
        this.OTP_URL,
        credentials,
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {          
          // Store access token
          localStorage.setItem(
            this.accessTokenKey,
            response.user.tokens.accessToken
          );
          
          // Store refresh token as fallback (in case HTTP-only cookie fails)
          localStorage.setItem(
            this.refreshTokenKey,
            response.user.tokens.refreshToken
          );
          this.isAuthenticatedSubject.next(true);
          this.startProactiveTokenRefresh();
          this.router.navigate(['/dashboard']);
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  getAccessToken(): Observable<{ newAccessToken: { accessToken: string } }> {
    return this.http
      .post<{ newAccessToken: { accessToken: string } }>(
        environment.NEW_ACCESS_TOKEN_API,
        {}, // Empty body - rely on HTTP-only cookie
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        tap((response) => {
          if (response?.newAccessToken?.accessToken) {
            localStorage.setItem(
              this.accessTokenKey,
              response.newAccessToken.accessToken
            );
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) => {
          if (error.status === 401 || error.status === 403) {
            return this.getAccessTokenWithBody();
          }
          
          return throwError(() => error);
        })
      );
  }

  // Fallback method using refresh token in request body
  private getAccessTokenWithBody(): Observable<{ newAccessToken: { accessToken: string } }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.logOut();
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http
      .post<{ newAccessToken: { accessToken: string } }>(
        environment.NEW_ACCESS_TOKEN_API,
        { refreshToken: refreshToken }, // Send in request body
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        tap((response) => {
          if (response?.newAccessToken?.accessToken) {
            localStorage.setItem(
              this.accessTokenKey,
              response.newAccessToken.accessToken
            );
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError((error) => { 
          if (error.status === 401 || error.status === 403) {
            this.logOut();
          }
          
          return throwError(() => error);
        })
      );
  }

  isUserAuthenticated(): boolean {
    return this.isTokenValid() || this.isTokenExpiringSoon();
  }

  // Method to manually refresh token if needed
  refreshTokenIfNeeded(): Observable<any> {
    if (this.isTokenExpiringSoon()) {
      return this.getAccessToken();
    }
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }
}
