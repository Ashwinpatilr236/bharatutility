-- ==============================================================================
-- Migration: 20260823_india_post_offices.sql
-- Description: Create public.india_post_offices table with normalized postal fields,
--              unique constraints, performance indexes, and RLS for public search.
-- ==============================================================================

-- 1. Create table public.india_post_offices
CREATE TABLE IF NOT EXISTS public.india_post_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pincode TEXT NOT NULL,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  description TEXT,
  branch_type TEXT,
  delivery_status TEXT,
  circle TEXT,
  district TEXT,
  division TEXT,
  region TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  source TEXT NOT NULL DEFAULT 'api.postalpincode.in',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_pincode_office UNIQUE (pincode, name_normalized)
);

-- 2. Indexes for fast postal searches
CREATE INDEX IF NOT EXISTS idx_india_post_offices_pincode ON public.india_post_offices(pincode);
CREATE INDEX IF NOT EXISTS idx_india_post_offices_name_norm ON public.india_post_offices(name_normalized);
CREATE INDEX IF NOT EXISTS idx_india_post_offices_district ON public.india_post_offices(district);
CREATE INDEX IF NOT EXISTS idx_india_post_offices_state ON public.india_post_offices(state);

-- 3. Enable Row Level Security
ALTER TABLE public.india_post_offices ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing policies if any
DROP POLICY IF EXISTS "india_post_offices_public_select" ON public.india_post_offices;

-- 5. RLS Policies
-- Policy 1: Allow all users (anon & authenticated) to read/search post offices
CREATE POLICY "india_post_offices_public_select"
ON public.india_post_offices
FOR SELECT
TO anon, authenticated
USING (true);
