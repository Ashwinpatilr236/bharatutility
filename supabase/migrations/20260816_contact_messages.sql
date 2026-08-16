-- ==============================================================================
-- Migration: 20260816_contact_messages.sql
-- Description: Create public.contact_messages table with RLS for public submissions & admin management
-- ==============================================================================

-- 1. Create table public.contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for status and date filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- 2. Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies if any
DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_update" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_delete" ON public.contact_messages;

-- 4. RLS Policies
-- Policy 1: Public / Anonymous users can ONLY INSERT contact messages
CREATE POLICY "contact_messages_public_insert"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(email)) > 0 AND length(trim(message)) > 0
);

-- Policy 2: Active authenticated admins can read all contact messages
CREATE POLICY "contact_messages_admin_select"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
  public.has_active_admin_role()
);

-- Policy 3: Active authenticated admins can update contact messages
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

-- Policy 4: Active authenticated admins can delete contact messages
CREATE POLICY "contact_messages_admin_delete"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  public.has_active_admin_role()
);
