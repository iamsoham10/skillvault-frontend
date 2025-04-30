import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if(localStorage.getItem("accessToken")) {
    return true;
  }

  router.navigate(['']);
  return false;
}
