-- ==============================================================================
-- Migration: 20260816_fix_admin_roles_rls.sql
-- Description: Robust, secure authorization helper functions and RLS policies for admin access
-- ==============================================================================

-- 1. Helper Function: Check if user is Super Admin
-- Includes search_path = public, auth and checks user_id, auth email, and app_metadata
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1
        FROM public.admin_profiles
        WHERE (user_id = auth.uid() OR (user_id IS NULL AND lower(email) = lower(auth.jwt() ->> 'email')))
          AND role = 'super_admin'
          AND status = 'active'
      )
      OR ((auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin')
    )
  );
$$;

-- 2. Helper Function: Check if user has an active admin role
CREATE OR REPLACE FUNCTION public.has_active_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1
        FROM public.admin_profiles
        WHERE (user_id = auth.uid() OR (user_id IS NULL AND lower(email) = lower(auth.jwt() ->> 'email')))
          AND status = 'active'
      )
      OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'content_admin', 'data_admin', 'support_admin', 'analyst', 'admin'))
    )
  );
$$;

-- 3. Grant execute permissions on functions to authenticated role
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_admin_role() TO authenticated;

-- 4. Re-apply strict RLS policies on public.contact_messages
DROP POLICY IF EXISTS "contact_messages_admin_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_delete" ON public.contact_messages;

CREATE POLICY "contact_messages_admin_select"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
  public.has_active_admin_role()
);

CREATE POLICY "contact_messages_admin_update"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (
  public.has_active_admin_role()
)
WITH CHECK (
  public.has_active_admin_role()
);

CREATE POLICY "contact_messages_admin_delete"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  public.has_active_admin_role()
);

-- 5. Re-apply strict RLS policies on public.tool_requests
DROP POLICY IF EXISTS "tool_requests_admin_select" ON public.tool_requests;
DROP POLICY IF EXISTS "tool_requests_admin_update" ON public.tool_requests;
DROP POLICY IF EXISTS "tool_requests_admin_delete" ON public.tool_requests;

CREATE POLICY "tool_requests_admin_select"
ON public.tool_requests
FOR SELECT
TO authenticated
USING (
  public.has_active_admin_role()
);

CREATE POLICY "tool_requests_admin_update"
ON public.tool_requests
FOR UPDATE
TO authenticated
USING (
  public.has_active_admin_role()
)
WITH CHECK (
  public.has_active_admin_role()
);

CREATE POLICY "tool_requests_admin_delete"
ON public.tool_requests
FOR DELETE
TO authenticated
USING (
  public.has_active_admin_role()
);
