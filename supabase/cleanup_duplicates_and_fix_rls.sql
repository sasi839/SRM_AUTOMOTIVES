-- Clean up duplicate images and fix RLS policies for SRM AUTOMOTIVES

-- 1. Enable Row Level Security
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 2. Reset RLS Policies on site_images
DROP POLICY IF EXISTS "Allow public read access on active site_images" ON site_images;
DROP POLICY IF EXISTS "Allow public read access on site_images" ON site_images;
DROP POLICY IF EXISTS "Allow authenticated full access on site_images" ON site_images;
DROP POLICY IF EXISTS "Allow authorized admin full access on site_images" ON site_images;
DROP POLICY IF EXISTS "Allow anon select active site_images" ON site_images;
DROP POLICY IF EXISTS "Allow authenticated full access site_images" ON site_images;

-- Public/Anon role gets SELECT access to active images
CREATE POLICY "Allow anon select active site_images"
    ON site_images
    FOR SELECT
    TO anon
    USING (is_active = true);

-- Authenticated (Admin) role gets full CRUD access to ALL images (active & inactive)
CREATE POLICY "Allow authenticated full access site_images"
    ON site_images
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Reset RLS Policies on site_content
DROP POLICY IF EXISTS "Allow public read access on site_content" ON site_content;
DROP POLICY IF EXISTS "Allow authorized admin write access on site_content" ON site_content;

CREATE POLICY "Allow anon select site_content"
    ON site_content
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated full access site_content"
    ON site_content
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Apply Schema Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT ALL ON public.site_content TO authenticated;
GRANT ALL ON public.site_images TO authenticated;

-- 5. Delete All Duplicate Image Rows (Keep 1 newest row per section, title, image_url)
DELETE FROM site_images
WHERE id NOT IN (
    SELECT DISTINCT ON (section, title, image_url) id
    FROM site_images
    ORDER BY section, title, image_url, created_at DESC
);
