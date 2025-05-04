import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn, 
  HttpEvent 
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable, catchError, from, mergeMap, throwError } from 'rxjs';

const addAuthHeader = (
  request: HttpRequest<unknown>, 
  token: string
): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
};

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const whitelist = ['/auth/login', '/auth/refresh', '/auth/reset-password'];

  if (whitelist.some(path => req.url.includes(path))) {
    return next(req);
  }

  return from(auth.getAccessToken() ?? throwError(() => new Error('No token'))).pipe(
    mergeMap((accessToken: string) => {
      const authReq = addAuthHeader(req, accessToken);
      return next(authReq).pipe(
        catchError((error) => {
          if (error.status === 401) {
            return handleUnauthorized(req, next, auth, router);
          }
          return throwError(() => error);
        })
      );
    })
  );
};

const handleUnauthorized = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> => {
  return auth.refreshToken().pipe(
    mergeMap(() => {
      const newToken = auth.getAccessToken()!;
      return next(addAuthHeader(req, newToken));
    }),
    catchError((refreshError) => {
      auth.logout();
      router.navigate(['/auth'], {
        queryParams: { sessionExpired: true }
      });
      return throwError(() => refreshError);
    })
  );
};