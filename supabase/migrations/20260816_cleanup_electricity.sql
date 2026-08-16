-- ==============================================================================
-- Migration: 20260816_cleanup_electricity.sql
-- Description: Safely remove electricity tariff tables and functions from Supabase
-- PRESERVED: public.admin_profiles, public.is_super_admin(), public.has_active_admin_role()
-- ==============================================================================

-- 1. Drop electricity-specific functions
DROP FUNCTION IF EXISTS public.can_manage_tariffs() CASCADE;

-- 2. Drop electricity tariff tables and audit logs
DROP TABLE IF EXISTS public.tariff_audit_logs CASCADE;
DROP TABLE IF EXISTS public.tariff_versions CASCADE;
