import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { TokenStorage } from '../auth/jwt/token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorage);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();


  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  
  const user = authService.user$.getValue();
  if (user && user.isBlocked) {
    console.log('Pristup odbijen: Korisnik je blokiran.');
    router.navigate(['/login']); 
    return false;
  }
  return true;
};