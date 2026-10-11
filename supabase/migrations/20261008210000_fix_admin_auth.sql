-- Migration: 20261008210000_fix_admin_auth.sql
-- Description: Fixes catastrophic authorization flaws by properly checking admin_users table instead of granting access to all authenticated users.

-- 1. FIX is_admin() FUNCTION
-- We replace the deeply flawed function that auto-inserted users and unconditionally returned TRUE.
-- The new function performs a strict EXISTS check against the admin_users table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        -- Only return true if the user's ID explicitly exists in admin_users
        RETURN EXISTS (
            SELECT 1 
            FROM public.admin_users 
            WHERE id = auth.uid()
        );
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. DROP THE AUTO-ADMIN TRIGGER
-- Remove the trigger that automatically grants admin rights to every new user
DROP TRIGGER IF EXISTS on_auth_user_created_make_admin ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_auto_admin();
