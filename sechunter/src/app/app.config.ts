import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: JWT_OPTIONS,
      useValue: {
        tokenGetter: () => {
          const platformId = inject(PLATFORM_ID);
          return isPlatformBrowser(platformId) 
            ? localStorage.getItem('access_token') 
            : null;
        },
        allowedDomains: ['localhost:4200']
      }
    },
    JwtHelperService
  ]
};