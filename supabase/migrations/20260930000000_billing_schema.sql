-- Migration: 20260930000000_billing_schema.sql
-- Description: Dedicated & Isolated Billing Schema for SRM AUTOMOTIVES (Phase 2.1)
-- IMPORTANT: This schema is 100% isolated. It does NOT touch or modify any existing tables (e.g. site_content, site_images).

-- 1. Helper trigger function for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CREATE billing_works TABLE (Predefined Works Catalogue)
CREATE TABLE IF NOT EXISTS billing_works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_name TEXT NOT NULL UNIQUE,
    work_type TEXT NOT NULL CHECK (work_type IN ('Labour', 'Part')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for billing_works.updated_at
DROP TRIGGER IF EXISTS trigger_billing_works_updated_at ON billing_works;
CREATE TRIGGER trigger_billing_works_updated_at
    BEFORE UPDATE ON billing_works
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 3. CREATE billing_invoices TABLE (Bills Primary Record)
CREATE TABLE IF NOT EXISTS billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    number_plate TEXT NOT NULL, -- Primary billing search key
    mobile_number TEXT,         -- Optional customer contact
    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for billing_invoices.updated_at
DROP TRIGGER IF EXISTS trigger_billing_invoices_updated_at ON billing_invoices;
CREATE TRIGGER trigger_billing_invoices_updated_at
    BEFORE UPDATE ON billing_invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 4. CREATE billing_invoice_items TABLE (Bill Line Items with Snapshots)
CREATE TABLE IF NOT EXISTS billing_invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
    work_id UUID REFERENCES billing_works(id) ON DELETE SET NULL, -- Work catalogue reference
    s_no INT NOT NULL DEFAULT 1,
    work_name TEXT NOT NULL,       -- Work name snapshot
    work_type TEXT NOT NULL CHECK (work_type IN ('Labour', 'Part')), -- Work type snapshot
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PERFORMANCE & SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_billing_invoices_number_plate ON billing_invoices(number_plate);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_created_at ON billing_invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_invoice_items_invoice_id ON billing_invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoice_items_work_id ON billing_invoice_items(work_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE billing_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoice_items ENABLE ROW LEVEL SECURITY;

-- Select Policies
DROP POLICY IF EXISTS "Allow select for all on billing_works" ON billing_works;
CREATE POLICY "Allow select for all on billing_works" ON billing_works FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow select for all on billing_invoices" ON billing_invoices;
CREATE POLICY "Allow select for all on billing_invoices" ON billing_invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow select for all on billing_invoice_items" ON billing_invoice_items;
CREATE POLICY "Allow select for all on billing_invoice_items" ON billing_invoice_items FOR SELECT USING (true);

-- Insert Policies
DROP POLICY IF EXISTS "Allow insert for all on billing_invoices" ON billing_invoices;
CREATE POLICY "Allow insert for all on billing_invoices" ON billing_invoices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for all on billing_invoice_items" ON billing_invoice_items;
CREATE POLICY "Allow insert for all on billing_invoice_items" ON billing_invoice_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for all on billing_works" ON billing_works;
CREATE POLICY "Allow insert for all on billing_works" ON billing_works FOR INSERT WITH CHECK (true);

-- Update Policies
DROP POLICY IF EXISTS "Allow update for all on billing_works" ON billing_works;
CREATE POLICY "Allow update for all on billing_works" ON billing_works FOR UPDATE USING (true);

-- Table Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.billing_works TO anon, authenticated;
GRANT ALL ON public.billing_invoices TO anon, authenticated;
GRANT ALL ON public.billing_invoice_items TO anon, authenticated;
