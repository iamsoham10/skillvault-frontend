import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { userLogInResponse } from '../models/user.interface';
import { jwtDecode } from 'jwt-decode';

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
      // Add buffer time (5 minutes) to refresh token before it expires
      return decodedToken.exp > currentTime + 300;
    } catch {
      return false;
    }
  }

  getValidToken(): string | null {
    if (this.isTokenValid()) {
      return localStorage.getItem(this.accessTokenKey);
    }
    return null; // Don't auto-logout here, let interceptor handle it
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
      return decodedToken.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
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
          localStorage.setItem(
            this.accessTokenKey,
            response.data.tokens.accessToken
          );
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logOut() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem('userID');
    this.isAuthenticatedSubject.next(false);
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
      .post<{ user: { tokens: { accessToken: string } } }>(
        this.OTP_URL,
        credentials,
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          localStorage.setItem(
            this.accessTokenKey,
            response.user.tokens.accessToken
          );
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  getAccessToken(): Observable<{ newAccessToken: { accessToken: string } }> {
    return this.http
      .post<{ newAccessToken: { accessToken: string } }>(
        environment.NEW_ACCESS_TOKEN_API,
        {},
        { withCredentials: true }
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
          // If refresh fails, user needs to login again
          this.logOut();
          return throwError(() => error);
        })
      );
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
