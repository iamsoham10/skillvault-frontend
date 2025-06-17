import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  // Add token validation methods
  isTokenValid(): boolean {
    const token = localStorage.getItem(this.accessTokenKey);
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch {
      return false;
    }
  }

  getValidToken(): string | null {
    if (this.isTokenValid()) {
      return localStorage.getItem(this.accessTokenKey);
    }
    this.logOut();
    return null;
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
          this.router.navigate(['/dashboard']);
        })
      );
  }

  logOut() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem('userID'); // Clear userID as well
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
          }
        })
      );
  }
}
