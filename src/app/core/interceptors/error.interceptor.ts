import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = new URL(request.url, globalThis.location.origin)
        .pathname.endsWith('/auth/login');

      if (error.status === 401 && !isLoginRequest) {
        auth.cerrarSesion('expirada', globalThis.location.pathname + globalThis.location.search);
      }

      return throwError(() => error);
    }),
  );
};
