-- ============================================================================
-- BHARATUTILITY SAFE INCREMENTAL MIGRATION (WITH WRITE RLS POLICIES)
-- Migration: 20260828_site_config.sql
-- Description: Creates persistent storage tables for administrator-managed
--              configurations (Site Config, Announcements, Feature Flags)
--              with RLS read & write policies.
-- ============================================================================

-- 1. SITE CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.site_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Public Read & Write Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Allow public read access to site_config'
  ) THEN
    CREATE POLICY "Allow public read access to site_config" 
    ON public.site_config FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_config' AND policyname = 'Allow all write operations to site_config'
  ) THEN
    CREATE POLICY "Allow all write operations to site_config" 
    ON public.site_config FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  link_url TEXT,
  link_text TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;

-- Public Read & Write Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_announcements' AND policyname = 'Allow public read access to site_announcements'
  ) THEN
    CREATE POLICY "Allow public read access to site_announcements" 
    ON public.site_announcements FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_announcements' AND policyname = 'Allow all write operations to site_announcements'
  ) THEN
    CREATE POLICY "Allow all write operations to site_announcements" 
    ON public.site_announcements FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key VARCHAR(100) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  category VARCHAR(50) DEFAULT 'general',
  rollout_percentage INT DEFAULT 100,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Public Read & Write Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feature_flags' AND policyname = 'Allow public read access to feature_flags'
  ) THEN
    CREATE POLICY "Allow public read access to feature_flags" 
    ON public.feature_flags FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feature_flags' AND policyname = 'Allow all write operations to feature_flags'
  ) THEN
    CREATE POLICY "Allow all write operations to feature_flags" 
    ON public.feature_flags FOR ALL 
    USING (true) WITH CHECK (true);
  END IF;
END $$;
