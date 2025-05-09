export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaVerified?: boolean;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  accountLockedUntil?: Date;
  clientId?: string;
  clientName?: string;
  lastLogin?: Date;
  sub?: string;
  iat?: number;
  exp?: number;
}

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  ANALYST = 'analyst',
  SUPERUSER = 'superuser'
}
