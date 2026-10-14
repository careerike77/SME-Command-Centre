export interface Tenant {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
  tax_identifier?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = "owner" | "admin" | "manager" | "cashier" | "staff" | "auditor";

export interface Membership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  custom_permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id?: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  cost_price: string; // Decimal string
  unit_price: string; // Decimal string
  min_stock_level: string;
  reorder_quantity: string;
  tax_rate: string; // percentage string (e.g., '15.00')
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockLevel {
  id: string;
  tenant_id: string;
  location_id: string;
  product_id: string;
  quantity: string;
  updated_at: string;
}

export type MovementType = "sale" | "restock" | "adjustment" | "transfer" | "return" | "spoilage";

export interface StockMovement {
  id: string;
  tenant_id: string;
  location_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_delta: string;
  balance_after: string;
  reference_type?: string;
  reference_id?: string;
  created_by?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  credit_limit: string;
  outstanding_balance: string;
  created_at: string;
  updated_at: string;
}

export type SaleStatus = "pending" | "completed" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "mobile_money" | "card" | "bank_transfer" | "credit";

export interface Sale {
  id: string;
  tenant_id: string;
  receipt_number: string;
  customer_id?: string;
  cashier_id?: string;
  subtotal: string;
  tax_total: string;
  discount_total: string;
  grand_total: string;
  paid_amount: string;
  change_due: string;
  payment_method: PaymentMethod;
  status: SaleStatus;
  currency: string;
  idempotency_key?: string;
  is_offline_sync: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  tenant_id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: string;
  unit_price: string;
  cost_price: string;
  tax_rate: string;
  tax_amount: string;
  subtotal: string;
  total: string;
}

export type FinanceType = "income" | "expense";
export type FinanceCategory =
  | "sale_revenue"
  | "other_income"
  | "inventory_purchase"
  | "rent"
  | "utilities"
  | "salaries"
  | "marketing"
  | "tax"
  | "other_expense";

export interface FinanceEntry {
  id: string;
  tenant_id: string;
  type: FinanceType;
  category: FinanceCategory;
  amount: string;
  currency: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  entry_date: string;
  created_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export type AIAuthorityLevel = "recommend" | "propose" | "approve" | "execute";

export interface AIActionLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  prompt_summary: string;
  action_type: string;
  authority_level: AIAuthorityLevel;
  proposed_payload: Record<string, unknown>;
  status: "pending" | "approved" | "executed" | "rejected";
  executed_at?: string;
  created_at: string;
}
