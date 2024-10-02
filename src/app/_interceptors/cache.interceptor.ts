import { HttpInterceptorFn } from '@angular/common/http';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithHeader = req.clone({
    headers: req.headers
      .set('Cache-Control', ['no-cache', 'must-revalidate', 'no-store', 'post-check=0', 'pre-check=0'])
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
  });
  return next(reqWithHeader)
};
