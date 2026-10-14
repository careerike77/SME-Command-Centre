-- AI-BOSS Master Database Schema & RLS Policies v1.0
-- Jurisdiction Target: Ghana (GHS / GH₵ default)
-- Multi-Tenant Isolation via RLS (app.current_tenant_id)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS / BUSINESSES
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(10) NOT NULL DEFAULT 'GH',
    currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Africa/Accra',
    tax_identifier VARCHAR(100),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BUSINESS MEMBERSHIPS & ROLES
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'cashier', 'staff', 'auditor');

CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    custom_permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 4. PRODUCTS & CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    cost_price NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    unit_price NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    min_stock_level NUMERIC(15, 4) NOT NULL DEFAULT 5.0000,
    reorder_quantity NUMERIC(15, 4) NOT NULL DEFAULT 20.0000,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- e.g. 15.00% VAT/NHIL
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, sku)
);

-- 5. INVENTORY & STOCK MOVEMENTS (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Main Store',
    address TEXT,
    is_default BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS stock_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, location_id, product_id)
);

CREATE TYPE movement_type AS ENUM ('sale', 'restock', 'adjustment', 'transfer', 'return', 'spoilage');

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    quantity_delta NUMERIC(15, 4) NOT NULL, -- negative for sales, positive for restock
    balance_after NUMERIC(15, 4) NOT NULL,
    reference_type VARCHAR(50), -- e.g., 'sale_id', 'po_id'
    reference_id UUID,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CRM (CUSTOMERS & INTERACTION HISTORY)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    credit_limit NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    outstanding_balance NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SALES & POS
CREATE TYPE sale_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'card', 'bank_transfer', 'credit');

CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subtotal NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    tax_total NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    discount_total NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    grand_total NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    paid_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    change_due NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    status sale_status NOT NULL DEFAULT 'completed',
    currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
    idempotency_key VARCHAR(255),
    is_offline_sync BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL,
    unit_price NUMERIC(15, 4) NOT NULL,
    cost_price NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    subtotal NUMERIC(15, 4) NOT NULL,
    total NUMERIC(15, 4) NOT NULL
);

-- 8. FINANCE (STRUCTURED INCOME & EXPENSE LEDGER)
CREATE TYPE finance_type AS ENUM ('income', 'expense');
CREATE TYPE finance_category AS ENUM (
    'sale_revenue', 'other_income',
    'inventory_purchase', 'rent', 'utilities', 'salaries', 'marketing', 'tax', 'other_expense'
);

CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type finance_type NOT NULL,
    category finance_category NOT NULL,
    amount NUMERIC(15, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- e.g., 'sale_id', 'manual', 'expense_voucher'
    reference_id UUID,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    payload JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AI ACTION & PROPOSAL GOVERNANCE LOGS
CREATE TYPE ai_authority_level AS ENUM ('recommend', 'propose', 'approve', 'execute');

CREATE TABLE IF NOT EXISTS ai_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prompt_summary TEXT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g. 'restock_proposal', 'customer_followup'
    authority_level ai_authority_level NOT NULL,
    proposed_payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, executed, rejected
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all Tenant-Owned Tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_action_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current tenant ID safely
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;

-- RLS Isolation Policies
CREATE POLICY tenant_isolation_tenants ON tenants
    USING (id = current_tenant_id());

CREATE POLICY tenant_isolation_memberships ON memberships
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_categories ON categories
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_products ON products
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_inventory_locations ON inventory_locations
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_stock_levels ON stock_levels
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_stock_movements ON stock_movements
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_customers ON customers
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_sales ON sales
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_sale_items ON sale_items
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_finance_entries ON finance_entries
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_ai_action_logs ON ai_action_logs
    USING (tenant_id = current_tenant_id());
