-- Migration: 20260928000002_phase3_storage.sql
-- Description: Supabase Storage bucket creation and RLS policies for website images

-- 1. CREATE BUCKET IN storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'website-images',
    'website-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

-- 2. STORAGE ROW LEVEL SECURITY (RLS) POLICIES ON storage.objects

-- Allow public read access to website-images bucket
DROP POLICY IF EXISTS "Public Read Access for website-images" ON storage.objects;
CREATE POLICY "Public Read Access for website-images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'website-images');

-- Allow authorized admins to upload images to website-images bucket
DROP POLICY IF EXISTS "Admin Insert Access for website-images" ON storage.objects;
CREATE POLICY "Admin Insert Access for website-images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'website-images' AND
        public.is_admin()
    );

-- Allow authorized admins to update/replace images in website-images bucket
DROP POLICY IF EXISTS "Admin Update Access for website-images" ON storage.objects;
CREATE POLICY "Admin Update Access for website-images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'website-images' AND
        public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'website-images' AND
        public.is_admin()
    );

-- Allow authorized admins to delete images from website-images bucket
DROP POLICY IF EXISTS "Admin Delete Access for website-images" ON storage.objects;
CREATE POLICY "Admin Delete Access for website-images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'website-images' AND
        public.is_admin()
    );
