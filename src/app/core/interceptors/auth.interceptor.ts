import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthService).token();
  const apiOrigin = new URL(environment.apiUrl).origin;
  const requestUrl = new URL(request.url, globalThis.location.origin);

  if (!token || requestUrl.origin !== apiOrigin || !requestUrl.pathname.startsWith('/api/v1/')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
