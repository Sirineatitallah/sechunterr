export interface User {
  id: string;
  email: string;
  name: string;  
  roles: string[];
  mfaEnabled: boolean;
  sub?: string;
  iat?: number;
  exp?: number;
}