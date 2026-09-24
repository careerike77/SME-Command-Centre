export interface DomainEvent<T = any> {
  id: string;
  name: string;
  tenantId: string;
  timestamp: string;
  payload: T;
}

export interface TenantRegisteredPayload {
  tenantId: string;
  tenantName: string;
  adminUserId: string;
  adminEmail: string;
}

export interface UserLoggedInPayload {
  userId: string;
  tenantId: string;
  ipAddress?: string;
}

export const DOMAIN_EVENTS = {
  TENANT_REGISTERED: 'tenant.registered',
  USER_LOGGED_IN: 'user.logged_in',
  MFA_ENABLED: 'user.mfa_enabled',
  BRANCH_CREATED: 'branch.created',
  TAX_SETTINGS_UPDATED: 'tax_settings.updated',
} as const;
