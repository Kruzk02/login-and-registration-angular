import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TokenGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = route.queryParamMap.get('token');

    if (token) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { error: 'missing_token' } });
      return false;
    }
  }
}

