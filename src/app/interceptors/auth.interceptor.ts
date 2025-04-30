import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const accessToken = localStorage.getItem('accessToken');

  // Attach access token to request headers if available
  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return handleAccessTokens(req, next, authService); // ✅ Call refresh logic
      }
      return throwError(() => error);
    })
  );
};

interface TokenResponse {
  newAccessToken: {
    accessToken: string;
  };
}

const handleAccessTokens = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  return authService.getAccessToken().pipe(
    switchMap((response) => {
      if (!response?.newAccessToken?.accessToken) {
        return throwError(() => new Error('Invalid token response'));
      }

      const newToken = response.newAccessToken.accessToken;
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${newToken}` },
      });

      return next(clonedReq);
    }),
    catchError((err) => {
      // If refresh token fails, redirect to login
      authService.logOut();
      return throwError(() => err);
    })
  );
};
