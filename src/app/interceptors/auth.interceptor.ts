import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
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
} from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const accessToken = authService.getValidToken(); // Use the new validation method

  // Attach access token to request headers if available and valid
  if (accessToken) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return handleAccessTokens(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

const handleAccessTokens = (
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

        isRefreshing = false;
        const newToken = response.newAccessToken.accessToken;
        refreshTokenSubject.next(newToken);

        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });

        return next(clonedReq);
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logOut();
        return throwError(() => err);
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
