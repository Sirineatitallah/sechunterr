import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

// Create an interface for audit entries
interface AuditEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  user: string;
}

// Create a simple AuditService since it's missing
@Injectable({ providedIn: 'root' })
export class AuditService {
  log(entry: AuditEntry): void {
    // Implementation of logging logic
    console.log('Audit log:', entry);
  }
}

@Injectable()
export class AuditInterceptor implements HttpInterceptor {
  constructor(private audit: AuditService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      endpoint: request.url,
      method: request.method,
      user: 'currentUser' // Replace with actual user context
    };
    
    this.audit.log(auditEntry);
    return next.handle(request);
  }
}
