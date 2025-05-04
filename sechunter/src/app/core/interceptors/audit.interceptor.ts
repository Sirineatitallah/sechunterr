import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuditService } from '../services/audit.service';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs';
import { User } from '../models/user.model';

export const auditInterceptor: HttpInterceptorFn = (req, next) => {
  const auditService = inject(AuditService);
  const authService = inject(AuthService);
  const user = authService.getDecodedToken();

  const baseEntry = {
    timestamp: new Date().toISOString(),
    endpoint: req.url,
    method: req.method,
    status: 'success' as const,
    user: user ? { id: user.id, email: user.email } : undefined,
    metadata: {
      ipAddress: '', // À remplacer par la vraie IP
      userAgent: navigator.userAgent
    }
  };

  return next(req).pipe(
    tap({
      next: () => {
        auditService.log({ 
          ...baseEntry,
          status: 'success'
        });
      },
      error: (err) => {
        auditService.log({ 
          ...baseEntry,
          status: 'error',
          metadata: {
            ...baseEntry.metadata,
            error: err.message
          }
        });
      }
    })
  );
};