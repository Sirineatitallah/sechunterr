export interface Communication {
  id: string;
  title: string;
  message: string;
  priority: CommunicationPriority;
  type: CommunicationType;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  recipients: {
    id: string;
    name: string;
    role: string;
  }[];
  clientId?: string;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export enum CommunicationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum CommunicationType {
  NOTIFICATION = 'notification',
  ALERT = 'alert',
  MESSAGE = 'message',
  REPORT = 'report'
}
