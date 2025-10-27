import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export function roleGuard(expectedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    let currentUser: any = null;

    authService.getUser().subscribe(user => {
      currentUser = user;
      console.log('Trenutni korisnik:', currentUser);
    });

    if (!currentUser || !expectedRoles.includes(currentUser.role)) {
      console.log(`Pristup odbijen. Potrebna uloga: ${expectedRoles}, korisnik ima: ${currentUser?.role}`);
      router.navigate(['/home']);
      return false;
    }

    return true;
  };
}