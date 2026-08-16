-- ==============================================================================
-- Migration: 20260816_tool_requests.sql
-- Description: Create public.tool_requests table with RLS for public submissions & admin management
-- ==============================================================================

-- 1. Create table public.tool_requests
CREATE TABLE IF NOT EXISTS public.tool_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_tool TEXT NOT NULL,
  description TEXT,
  category TEXT,
  name TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'planned', 'in_development', 'completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast status & date queries
CREATE INDEX IF NOT EXISTS idx_tool_requests_status ON public.tool_requests(status);
CREATE INDEX IF NOT EXISTS idx_tool_requests_created_at ON public.tool_requests(created_at DESC);

-- 2. Enable Row Level Security
ALTER TABLE public.tool_requests ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies if any
DROP POLICY IF EXISTS "tool_requests_public_insert" ON public.tool_requests;
DROP POLICY IF EXISTS "tool_requests_admin_select" ON public.tool_requests;
DROP POLICY IF EXISTS "tool_requests_admin_update" ON public.tool_requests;
DROP POLICY IF EXISTS "tool_requests_admin_delete" ON public.tool_requests;

-- 4. RLS Policies
-- Policy 1: Public / Anonymous users can only INSERT requests
CREATE POLICY "tool_requests_public_insert"
ON public.tool_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(requested_tool)) > 0
);

-- Policy 2: Active authenticated admins can read all tool requests
CREATE POLICY "tool_requests_admin_select"
ON public.tool_requests
FOR SELECT
TO authenticated
USING (
  public.has_active_admin_role()
);

-- Policy 3: Active authenticated admins can update tool requests
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

-- Policy 4: Active authenticated admins can delete tool requests
CREATE POLICY "tool_requests_admin_delete"
ON public.tool_requests
FOR DELETE
TO authenticated
USING (
  public.has_active_admin_role()
);
