-- ============================================================================
-- Migration: 20261127_fix_site_config_rls.sql
-- Description: Restrict write operations on site_config, site_announcements,
--              and feature_flags strictly to active Central Admin roles.
--              Public SELECT remains enabled for website rendering.
-- ============================================================================

-- 1. SITE_CONFIG
DROP POLICY IF EXISTS "Allow all write operations to site_config" ON public.site_config;
CREATE POLICY "Admins can manage site_config"
  ON public.site_config FOR ALL
  TO authenticated
  USING (public.has_active_admin_role())
  WITH CHECK (public.has_active_admin_role());

-- 2. SITE_ANNOUNCEMENTS
DROP POLICY IF EXISTS "Allow all write operations to site_announcements" ON public.site_announcements;
CREATE POLICY "Admins can manage site_announcements"
  ON public.site_announcements FOR ALL
  TO authenticated
  USING (public.has_active_admin_role())
  WITH CHECK (public.has_active_admin_role());

-- 3. FEATURE_FLAGS
DROP POLICY IF EXISTS "Allow all write operations to feature_flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature_flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.has_active_admin_role())
  WITH CHECK (public.has_active_admin_role());
