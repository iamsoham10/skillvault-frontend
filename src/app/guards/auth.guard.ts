import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { Observable, of, switchMap, catchError } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('accessToken');

  if (!token) {
    router.navigate(['']);
    return of(false);
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      // Try to refresh the token instead of immediately logging out
      return authService.getAccessToken().pipe(
        switchMap(() => {
          return of(true);
        }),
        catchError((error) => {
          authService.logOut();
          return of(false);
        })
      );
    }

    // If token is expiring soon, refresh it proactively
    if (authService.isTokenExpiringSoon()) {
      return authService.getAccessToken().pipe(
        switchMap(() => of(true)),
        catchError((error) => {
          authService.logOut();
          return of(false);
        })
      );
    }

    return of(true);
  } catch (error) {
    authService.logOut();
    return of(false);
  }
};
