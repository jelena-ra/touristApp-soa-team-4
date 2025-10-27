import { HttpInterceptorFn } from '@angular/common/http';
import { ACCESS_TOKEN } from '../../shared/constants';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(ACCESS_TOKEN);

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};