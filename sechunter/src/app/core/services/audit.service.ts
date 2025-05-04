import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';

export interface AuditEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  status: 'success' | 'error';
  user?: Pick<User, 'id' | 'email'>;
  metadata: { // Rendu obligatoire avec des propriétés optionnelles
    ipAddress?: string;
    userAgent?: string;
    error?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private queue: AuditEntry[] = [];

  log(entry: AuditEntry): void {
    this.queue.push(this.sanitizeEntry(entry));
    
    if (this.queue.length >= 5) {
      this.flush();
    }
  }

  private sanitizeEntry(entry: AuditEntry): AuditEntry {
    return {
      ...entry,
      metadata: {
        ...entry.metadata,
        ipAddress: entry.metadata.ipAddress || '0.0.0.0' // Valeur par défaut
      }
    };
  }

  private flush(): void {
    this.http.post('/api/audit-logs/bulk', this.queue).subscribe({
      next: () => this.queue = [],
      error: (err) => {
        console.error('Audit bulk upload failed:', err);
        this.queue = []; // Reset pour éviter les doublons
      }
    });
  }
}