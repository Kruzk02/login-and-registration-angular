import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

function scheduleTokenRefresh(authService: AuthService) {
  setTimeout(() => {
    authService.refreshToken().subscribe({
      next: (newToken) => {
        if (newToken) {
          sessionStorage.setItem('token', newToken);
          scheduleTokenRefresh(authService);
        }
      }
    });
  }, REFRESH_INTERVAL_MS);
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authToken = sessionStorage.getItem('token');
  let clonedRequest = req;

  if (authToken) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
  }

  return next(clonedRequest).pipe(
    switchMap(event => {
      scheduleTokenRefresh(authService);
      return [event];
    }),
    catchError(() => {
      console.error('Authentication failed');
      router.navigate(['/login']);
      return throwError(() => new Error('Authentication failed'));
    })
  );
};
