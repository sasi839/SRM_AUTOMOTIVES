-- Migration: 20260928000000_phase1_schema.sql
-- Description: Database foundation, image management schema, and Row Level Security for SRM AUTOMOTIVES

-- 1. Helper function for auto-updating timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CREATE site_content TABLE
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL DEFAULT 'SRM AUTOMOTIVES',
    owner_name TEXT,
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    whatsapp_number TEXT,
    email TEXT,
    address TEXT,
    google_maps_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for site_content.updated_at
DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON site_content;
CREATE TRIGGER trigger_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 3. CREATE site_images TABLE
-- Supports hero slides, individual service card images, and gallery/our works images.
CREATE TABLE IF NOT EXISTS site_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL CHECK (section IN ('hero', 'service', 'gallery')),
    title TEXT,
    subtitle TEXT,
    category TEXT,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for site_images.updated_at
DROP TRIGGER IF EXISTS trigger_site_images_updated_at ON site_images;
CREATE TRIGGER trigger_site_images_updated_at
    BEFORE UPDATE ON site_images
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_site_images_section ON site_images(section);
CREATE INDEX IF NOT EXISTS idx_site_images_active_order ON site_images(section, is_active, display_order);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on both tables
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Only active content for images)
DROP POLICY IF EXISTS "Allow public read access on site_content" ON site_content;
CREATE POLICY "Allow public read access on site_content"
    ON site_content
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow public read access on active site_images" ON site_images;
CREATE POLICY "Allow public read access on active site_images"
    ON site_images
    FOR SELECT
    TO public
    USING (is_active = true);

-- SECURITY REQUIREMENT:
-- Public/anon users must NOT be able to insert, update, or delete content.
-- By default with RLS enabled, omitting INSERT, UPDATE, and DELETE policies for 'public' / 'anon'
-- enforces read-only access for non-authenticated public users.

-- Table Grants for RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT ALL ON public.site_content TO authenticated;
GRANT ALL ON public.site_images TO authenticated;

