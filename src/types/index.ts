export interface AdminSession {
  userId: string;
  organizationId?: string;
  email: string;
  role: string;
}
