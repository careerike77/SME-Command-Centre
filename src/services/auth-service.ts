import { UserRole } from "@/types/database";

export type Permission =
  | "pos:create_sale"
  | "pos:refund_sale"
  | "inventory:read"
  | "inventory:update"
  | "inventory:restock"
  | "finance:read"
  | "finance:create_entry"
  | "crm:read"
  | "crm:update"
  | "staff:manage"
  | "settings:update"
  | "ai:execute_action";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    "pos:create_sale",
    "pos:refund_sale",
    "inventory:read",
    "inventory:update",
    "inventory:restock",
    "finance:read",
    "finance:create_entry",
    "crm:read",
    "crm:update",
    "staff:manage",
    "settings:update",
    "ai:execute_action",
  ],
  admin: [
    "pos:create_sale",
    "pos:refund_sale",
    "inventory:read",
    "inventory:update",
    "inventory:restock",
    "finance:read",
    "finance:create_entry",
    "crm:read",
    "crm:update",
    "staff:manage",
    "ai:execute_action",
  ],
  manager: [
    "pos:create_sale",
    "pos:refund_sale",
    "inventory:read",
    "inventory:update",
    "inventory:restock",
    "finance:read",
    "crm:read",
    "crm:update",
  ],
  cashier: ["pos:create_sale", "inventory:read", "crm:read"],
  staff: ["pos:create_sale", "inventory:read"],
  auditor: ["inventory:read", "finance:read", "crm:read"],
};

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized access or missing required permission") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function hasPermission(
  role: UserRole,
  permission: Permission,
  customPermissions: string[] = []
): boolean {
  if (role === "owner") return true;
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission) || customPermissions.includes(permission);
}

export function assertPermission(
  role: UserRole,
  permission: Permission,
  customPermissions: string[] = []
): void {
  if (!hasPermission(role, permission, customPermissions)) {
    throw new AuthorizationError(
      `Role '${role}' lacks mandatory permission '${permission}' for tenant context.`
    );
  }
}
