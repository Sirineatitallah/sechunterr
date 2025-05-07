import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Communication, CommunicationPriority, CommunicationType } from '../models/communication.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = '/api/communications';
  private communicationsSubject = new BehaviorSubject<Communication[]>([]);
  public communications$ = this.communicationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadCommunications();
  }

  private loadCommunications(): void {
    if (isDevMode()) {
      // In development mode, use mock data
      const mockCommunications = this.getMockCommunications();
      this.communicationsSubject.next(mockCommunications);
    } else {
      // In production, fetch from API
      this.http.get<Communication[]>(this.apiUrl).pipe(
        catchError(error => {
          console.error('Error loading communications:', error);
          return of([]);
        })
      ).subscribe(communications => {
        this.communicationsSubject.next(communications);
      });
    }
  }

  getCommunications(): Observable<Communication[]> {
    const user = this.authService.getDecodedToken();
    
    return this.communications$.pipe(
      map(communications => {
        // If user is admin or superuser, return all communications
        if (user?.roles?.includes('admin') || user?.roles?.includes('superuser')) {
          return communications;
        }
        
        // If user is client, return only their communications
        if (user?.roles?.includes('client') && user?.clientId) {
          return communications.filter(comm => 
            comm.clientId === user.clientId || 
            comm.recipients.some(r => r.id === user.id)
          );
        }
        
        // Default: return empty array
        return [];
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.getCommunications().pipe(
      map(communications => communications.filter(comm => !comm.read).length)
    );
  }

  sendCommunication(communication: Partial<Communication>): Observable<Communication> {
    const user = this.authService.getDecodedToken();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const newCommunication: Communication = {
      id: `comm-${Date.now()}`,
      title: communication.title || 'New Communication',
      message: communication.message || '',
      priority: communication.priority || CommunicationPriority.MEDIUM,
      type: communication.type || CommunicationType.MESSAGE,
      sender: {
        id: user.id,
        name: user.name,
        role: user.roles[0]
      },
      recipients: communication.recipients || [],
      clientId: communication.clientId,
      read: false,
      createdAt: new Date(),
      expiresAt: communication.expiresAt
    };
    
    if (isDevMode()) {
      // In development mode, add to local state
      const currentCommunications = this.communicationsSubject.value;
      this.communicationsSubject.next([...currentCommunications, newCommunication]);
      
      return of(newCommunication);
    } else {
      // In production, create via API
      return this.http.post<Communication>(this.apiUrl, newCommunication).pipe(
        tap(comm => {
          const currentCommunications = this.communicationsSubject.value;
          this.communicationsSubject.next([...currentCommunications, comm]);
        })
      );
    }
  }

  markAsRead(id: string): Observable<boolean> {
    if (isDevMode()) {
      // In development mode, update local state
      const currentCommunications = this.communicationsSubject.value;
      const updatedCommunications = currentCommunications.map(comm => 
        comm.id === id ? { ...comm, read: true } : comm
      );
      this.communicationsSubject.next(updatedCommunications);
      
      return of(true);
    } else {
      // In production, update via API
      return this.http.patch<boolean>(`${this.apiUrl}/${id}/read`, {}).pipe(
        tap(() => {
          const currentCommunications = this.communicationsSubject.value;
          const updatedCommunications = currentCommunications.map(comm => 
            comm.id === id ? { ...comm, read: true } : comm
          );
          this.communicationsSubject.next(updatedCommunications);
        })
      );
    }
  }

  // Mock data generators
  private getMockCommunications(): Communication[] {
    return [
      {
        id: 'comm-1',
        title: 'Critical Security Update',
        message: 'We have detected a critical vulnerability in your system. Please update your software immediately.',
        priority: CommunicationPriority.CRITICAL,
        type: CommunicationType.ALERT,
        sender: {
          id: 'admin-1',
          name: 'Administrator',
          role: 'admin'
        },
        recipients: [
          {
            id: 'client-1',
            name: 'Client User 1',
            role: 'client'
          }
        ],
        clientId: '1',
        read: false,
        createdAt: new Date('2024-06-01T10:30:00')
      },
      {
        id: 'comm-2',
        title: 'Weekly Security Report',
        message: 'Your weekly security report is now available. Click here to view it.',
        priority: CommunicationPriority.MEDIUM,
        type: CommunicationType.REPORT,
        sender: {
          id: 'admin-1',
          name: 'Administrator',
          role: 'admin'
        },
        recipients: [
          {
            id: 'client-1',
            name: 'Client User 1',
            role: 'client'
          }
        ],
        clientId: '1',
        read: true,
        createdAt: new Date('2024-05-28T14:15:00')
      },
      {
        id: 'comm-3',
        title: 'Scan Request Approved',
        message: 'Your scan request for the Development Server has been approved and scheduled.',
        priority: CommunicationPriority.LOW,
        type: CommunicationType.NOTIFICATION,
        sender: {
          id: 'admin-1',
          name: 'Administrator',
          role: 'admin'
        },
        recipients: [
          {
            id: 'client-2',
            name: 'Client User 2',
            role: 'client'
          }
        ],
        clientId: '2',
        read: false,
        createdAt: new Date('2024-06-02T09:45:00')
      },
      {
        id: 'comm-4',
        title: 'Maintenance Notification',
        message: 'Scheduled maintenance will be performed on your systems on June 10, 2024, from 2:00 AM to 4:00 AM UTC.',
        priority: CommunicationPriority.MEDIUM,
        type: CommunicationType.NOTIFICATION,
        sender: {
          id: 'admin-1',
          name: 'Administrator',
          role: 'admin'
        },
        recipients: [
          {
            id: 'client-1',
            name: 'Client User 1',
            role: 'client'
          },
          {
            id: 'client-2',
            name: 'Client User 2',
            role: 'client'
          },
          {
            id: 'client-3',
            name: 'Client User 3',
            role: 'client'
          }
        ],
        read: false,
        createdAt: new Date('2024-06-03T11:00:00')
      },
      {
        id: 'comm-5',
        title: 'Support Request',
        message: 'We are experiencing issues with our API Gateway. Can you please investigate?',
        priority: CommunicationPriority.HIGH,
        type: CommunicationType.MESSAGE,
        sender: {
          id: 'client-3',
          name: 'Client User 3',
          role: 'client'
        },
        recipients: [
          {
            id: 'admin-1',
            name: 'Administrator',
            role: 'admin'
          }
        ],
        clientId: '3',
        read: true,
        createdAt: new Date('2024-06-01T16:20:00')
      }
    ];
  }
}
