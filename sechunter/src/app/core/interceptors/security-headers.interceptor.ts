import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const SecurityHeadersInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const secureReq = req.clone({
    headers: req.headers
      .set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'")
      .set('X-Content-Type-Options', 'nosniff')
      .set('Referrer-Policy', 'strict-origin-when-cross-origin')
  });
  return next(secureReq);
};