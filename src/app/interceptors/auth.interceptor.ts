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
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Skip auth for public endpoints
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = authService.getValidToken();

  // Attach access token to request headers if available and valid
  let authReq = req;
  if (accessToken) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

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
          return throwError(() => new Error('Invalid token response'));
        }

        const newToken = response.newAccessToken.accessToken;
        refreshTokenSubject.next(newToken);

        // Retry the original request with the new token
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });

        return next(clonedReq);
      }),
      catchError((err) => {
        // If refresh fails, redirect to login
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
      filter((token) => token != null),
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

// Helper function to check if endpoint is public (doesn't need auth)
const isPublicEndpoint = (url: string): boolean => {
  const publicEndpoints = [
    '/api/user/login',
    '/api/user/register',
    '/api/user/verify-otp',
    '/api/user/refresh-token',
  ];

  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};
