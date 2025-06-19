import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import {
  catchError,
  Observable,
  switchMap,
  throwError,
  BehaviorSubject,
  filter,
  take,
  finalize,
} from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  
  // Skip auth for public endpoints
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  // Check if we have both tokens
  const accessToken = authService.getValidToken();

  if (!accessToken) {
    authService.logOut();
    return throwError(() => new Error('Missing authentication tokens'));
  }

  // Check if token is expiring soon and refresh proactively
  if (authService.isTokenExpiringSoon()) {
    return authService.getAccessToken().pipe(
      switchMap(() => {
        const newToken = authService.getValidToken();
        if (newToken) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(authReq);
        } else {
          return throwError(() => new Error('Failed to get valid token'));
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Attach access token to request headers
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicEndpoint(req.url)) {
        return handleUnauthorizedError(authReq, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const handleUnauthorizedError = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.getAccessToken().pipe(
      switchMap((response) => {
        
        if (!response?.newAccessToken?.accessToken) {
          throw new Error('Invalid token response');
        }

        const newToken = response.newAccessToken.accessToken;
        
        // Notify all waiting requests about the new token
        refreshTokenSubject.next(newToken);

        // Retry the original request with the new token
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });

        return next(clonedReq);
      }),
      catchError((err) => {
        // Clear the subject before logging out
        refreshTokenSubject.next(null);
        authService.logOut();
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    // If already refreshing, wait for the new token    
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(clonedReq);
      })
    );
  }
};

// Helper function to check if endpoint is public
const isPublicEndpoint = (url: string): boolean => {
  const publicEndpoints = [
    '/api/user/login',
    '/api/user/register',
    '/api/user/verify-otp',
    '/api/user/refresh-token'
  ];
  
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};