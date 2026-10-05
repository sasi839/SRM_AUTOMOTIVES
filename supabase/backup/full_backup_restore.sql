-- SQL RECOVERY SCRIPT: SRM AUTOMOTIVES FULL BACKUP & RESTORE
-- Description: Standalone SQL script to restore complete schema, RLS policies, storage bucket, auto-admin trigger, and seed datasets.

BEGIN;

-- ==========================================
-- 1. HELPER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. TABLES SCHEMA
-- ==========================================

-- Table: site_content
CREATE TABLE IF NOT EXISTS public.site_content (
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

DROP TRIGGER IF EXISTS trigger_site_content_updated_at ON public.site_content;
CREATE TRIGGER trigger_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Table: site_images
CREATE TABLE IF NOT EXISTS public.site_images (
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

DROP TRIGGER IF EXISTS trigger_site_images_updated_at ON public.site_images;
CREATE TRIGGER trigger_site_images_updated_at
    BEFORE UPDATE ON public.site_images
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Table: admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_site_images_section ON public.site_images(section);
CREATE INDEX IF NOT EXISTS idx_site_images_active_order ON public.site_images(section, is_active, display_order);

-- ==========================================
-- 4. SECURITY, AUTHORIZATION FUNCTION & AUTO-ADMIN TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO public.admin_users (id, email)
        SELECT auth.uid(), COALESCE(auth.jwt() ->> 'email', '')
        ON CONFLICT (id) DO NOTHING;
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Automatic trigger to make any user created in Supabase Auth an authorized admin
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_make_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_make_admin
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_auto_admin();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- site_content RLS Policies
DROP POLICY IF EXISTS "Allow public read access on site_content" ON public.site_content;
CREATE POLICY "Allow public read access on site_content"
    ON public.site_content FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authorized admin write access on site_content" ON public.site_content;
CREATE POLICY "Allow authorized admin write access on site_content"
    ON public.site_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- site_images RLS Policies
DROP POLICY IF EXISTS "Allow public read access on active site_images" ON public.site_images;
CREATE POLICY "Allow public read access on active site_images"
    ON public.site_images FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Allow authorized admin full access on site_images" ON public.site_images;
CREATE POLICY "Allow authorized admin full access on site_images"
    ON public.site_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- admin_users RLS Policy
DROP POLICY IF EXISTS "Admins can view own admin_user record" ON public.admin_users;
CREATE POLICY "Admins can view own admin_user record"
    ON public.admin_users FOR SELECT TO authenticated USING (auth.uid() = id);

-- ==========================================
-- 6. STORAGE BUCKET & STORAGE RLS POLICIES
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'website-images',
    'website-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

DROP POLICY IF EXISTS "Public Read Access for website-images" ON storage.objects;
CREATE POLICY "Public Read Access for website-images"
    ON storage.objects FOR SELECT TO public USING (bucket_id = 'website-images');

DROP POLICY IF EXISTS "Admin Insert Access for website-images" ON storage.objects;
CREATE POLICY "Admin Insert Access for website-images"
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'website-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update Access for website-images" ON storage.objects;
CREATE POLICY "Admin Update Access for website-images"
    ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'website-images' AND public.is_admin()) WITH CHECK (bucket_id = 'website-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Access for website-images" ON storage.objects;
CREATE POLICY "Admin Delete Access for website-images"
    ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'website-images' AND public.is_admin());

-- ==========================================
-- 7. SEED DATA RESTORATION
-- ==========================================

-- Business Content Recovery
INSERT INTO public.site_content (
    business_name,
    owner_name,
    primary_phone,
    secondary_phone,
    whatsapp_number,
    email,
    address,
    google_maps_url
) VALUES (
    'SREE RAJA RAJESWARI MOTORS',
    'Lokesh',
    '+91 8919594039',
    NULL,
    '918919594039',
    'Lokesh.lvrn@gmail.com',
    'SREE RAJA RAJESWARI MOTORS, #184, Renigunta Road, S.V. Autonagar, Tirupati, Andhra Pradesh',
    'https://maps.app.goo.gl/dnHpFsgdPKao7ALk7'
) ON CONFLICT DO NOTHING;

-- Hero Slides Recovery
INSERT INTO public.site_images (section, title, subtitle, image_url, display_order, is_active) VALUES
('hero', 'SREE RAJA RAJESWARI MOTORS', 'The premium destination for mechanical repairs, teflon coating, and luxury vehicle restoration in Tirupati.', 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=1920&q=80', 1, true),
('hero', 'EXPERT DETAILING', 'State-of-the-art facilities equipped to handle everything from routine maintenance to complex engine rebuilds.', 'https://images.unsplash.com/photo-1635425032549-065a3962b13c?auto=format&fit=crop&w=1920&q=80', 2, true),
('hero', 'PRECISION REPAIRS', 'Highly skilled, certified technicians handling every repair with precision and genuine spare parts.', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1920&q=80', 3, true)
ON CONFLICT DO NOTHING;

-- Services Recovery
INSERT INTO public.site_images (section, title, subtitle, image_url, display_order, is_active) VALUES
('service', 'Mechanical Repairs', 'Complete engine diagnostics and expert mechanical fixes.', 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', 1, true),
('service', 'Tinkering', 'Precision dent removal and structural auto body repairs.', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', 2, true),
('service', 'Painting', 'Premium color matching and full-body spray painting.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 3, true),
('service', 'Teflon Coating', 'Advanced surface protection for a long-lasting shine.', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', 4, true),
('service', 'A/C Repairs', 'Complete air conditioning service and refrigerant recharge.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', 5, true),
('service', 'Insurance Claims', 'Hassle-free processing of accidental insurance claims.', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', 6, true),
('service', 'Roadside Assistance', 'Emergency support when you are stranded on the road.', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 7, true),
('service', 'Breakdown Services', 'On-spot troubleshooting for unexpected vehicle breakdowns.', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', 8, true),
('service', 'Roadside Towing', 'Safe and secure vehicle towing to our service center.', 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', 9, true),
('service', 'Spare Parts', '100% genuine OEM spare parts for all major brands.', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', 10, true)
ON CONFLICT DO NOTHING;

-- Gallery Recovery
INSERT INTO public.site_images (section, title, category, image_url, display_order, is_active) VALUES
('gallery', 'Engine Diagnostics & Repair', 'Mechanical Repairs', 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=800&q=80', 1, true),
('gallery', 'Brake & Suspension Overhaul', 'Mechanical Repairs', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80', 2, true),
('gallery', 'Precision Dent Removal', 'Tinkering', 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80', 3, true),
('gallery', 'Chassis Alignment', 'Tinkering', 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80', 4, true),
('gallery', 'Full Body Paint Restoration', 'Painting', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 5, true),
('gallery', 'Scratch & Blemish Repair', 'Painting', 'https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80', 6, true),
('gallery', 'Premium Polish & Shine', 'Teflon Coating', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=80', 7, true),
('gallery', 'Long-lasting Ceramic Protection', 'Teflon Coating', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', 8, true),
('gallery', '24/7 Emergency Recovery', 'Roadside Towing', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80', 9, true),
('gallery', 'Safe Flatbed Transport', 'Roadside Towing', 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80', 10, true),
('gallery', 'Genuine OEM Components', 'Spare Parts', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80', 11, true),
('gallery', 'Performance Upgrades', 'Spare Parts', 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=800&q=80', 12, true)
ON CONFLICT DO NOTHING;

-- Table Grants for RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT ALL ON public.site_content TO authenticated;
GRANT ALL ON public.site_images TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;


COMMIT;
