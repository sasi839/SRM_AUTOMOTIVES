-- Migration: 20260928000001_phase2_auth_rls.sql
-- Description: Admin authentication tables, authorization function, auto-admin trigger, and RLS write policies for SRM AUTOMOTIVES

-- 1. CREATE admin_users TABLE
-- Stores authorized admin user IDs linked to Supabase Auth (auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can view their own record in admin_users
DROP POLICY IF EXISTS "Admins can view own admin_user record" ON public.admin_users;
CREATE POLICY "Admins can view own admin_user record"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 2. CREATE SECURITY DEFINER FUNCTION: public.is_admin()
-- Checks if calling user is authenticated and ensures they exist in admin_users
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


-- 3. AUTOMATIC ADMIN REGISTRATION TRIGGER
-- Automatically adds any user created in Supabase Auth to admin_users table
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

-- 4. UPDATE RLS WRITE POLICIES ON site_content AND site_images

-- site_content: Allow authorized admins full access (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow authorized admin write access on site_content" ON public.site_content;
CREATE POLICY "Allow authorized admin write access on site_content"
    ON public.site_content
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- site_images: Allow authorized admins full access (INSERT, UPDATE, DELETE, and SELECT all including inactive)
DROP POLICY IF EXISTS "Allow authorized admin full access on site_images" ON public.site_images;
CREATE POLICY "Allow authorized admin full access on site_images"
    ON public.site_images
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
