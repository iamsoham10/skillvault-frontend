import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('accessToken');

  if (!token) {
    router.navigate(['']);
    return false;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      console.log('Token expired, logging out');
      authService.logOut();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    authService.logOut();
    return false;
  }
};
