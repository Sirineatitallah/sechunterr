import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const securityHeaders: { [key: string]: string } = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()'
  };

  // Browser-only headers
  if (isPlatformBrowser(platformId)) {
    securityHeaders['Content-Security-Policy'] = 
      "default-src 'self';" +
      "script-src 'self' 'unsafe-eval';" +  // Remove for production
      "style-src 'self' 'unsafe-inline'";
  }

  const secureReq = req.clone({
    setHeaders: securityHeaders
  });

  return next(secureReq);
};