-- ==============================================================================
-- Migration: 20260816_admin_profiles.sql
-- Description: Create public.admin_profiles table with safe, non-recursive RLS
-- ==============================================================================

-- 1. Create table public.admin_profiles
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'content_admin', 'data_admin', 'support_admin', 'analyst')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user_id and email lookups
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);

-- 2. Enable Row Level Security
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Non-Recursive Security Helper Function
-- SECURITY DEFINER with fixed search_path prevents infinite recursion in RLS evaluations
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- 4. Clean up any existing policies
DROP POLICY IF EXISTS "Allow users to view own admin profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow Super Admins full access" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_delete_policy" ON public.admin_profiles;

-- 5. Strict, Non-Recursive RLS Policies
-- Policy 1: Authenticated users can view their own profile; Super Admins can view all profiles
CREATE POLICY "admin_profiles_select_policy"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_super_admin()
);

-- Policy 2: Only active Super Admins can insert new admin profiles
CREATE POLICY "admin_profiles_insert_policy"
ON public.admin_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_super_admin()
);

-- Policy 3: Super Admins can update any profile; users can update their own non-privileged profile details
CREATE POLICY "admin_profiles_update_policy"
ON public.admin_profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR public.is_super_admin()
)
WITH CHECK (
  public.is_super_admin()
);

-- Policy 4: Only active Super Admins can delete admin profiles
CREATE POLICY "admin_profiles_delete_policy"
ON public.admin_profiles
FOR DELETE
TO authenticated
USING (
  public.is_super_admin()
);
