-- ==============================================================================
-- Migration: 20261122_parksignal_schema.sql
-- Description: Complete ParkSignal PostgreSQL Schema with RLS, Triggers & RPCs
-- Product: ParkSignal by BharatUtility
-- Official Bot: @ParkSignal_bot
-- ==============================================================================

-- 1. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.parksignal_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_telegram_linked BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parksignal_profiles_email ON public.parksignal_profiles(email);

-- 2. TELEGRAM ACCOUNTS
CREATE TABLE IF NOT EXISTS public.parksignal_telegram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_chat_id TEXT NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parksignal_telegram_chat ON public.parksignal_telegram_accounts(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_parksignal_telegram_user ON public.parksignal_telegram_accounts(user_id);

-- 3. ONE-TIME TELEGRAM LINKING & RECONNECT TOKENS
CREATE TABLE IF NOT EXISTS public.parksignal_telegram_link_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL DEFAULT 'CONNECT',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parksignal_link_token_lookup ON public.parksignal_telegram_link_tokens(token, used_at, expires_at);

-- 4. REGISTERED VEHICLES
CREATE TABLE IF NOT EXISTS public.parksignal_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'Car',
  nickname TEXT,
  display_plate_publicly BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parksignal_vehicles_owner ON public.parksignal_vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_parksignal_vehicles_number ON public.parksignal_vehicles(vehicle_number);

-- 5. VEHICLE-SPECIFIC ALERT SETTINGS
CREATE TABLE IF NOT EXISTS public.parksignal_vehicle_settings (
  vehicle_id UUID PRIMARY KEY REFERENCES public.parksignal_vehicles(id) ON DELETE CASCADE,
  allow_blocking BOOLEAN NOT NULL DEFAULT TRUE,
  allow_move_vehicle BOOLEAN NOT NULL DEFAULT TRUE,
  allow_emergency BOOLEAN NOT NULL DEFAULT TRUE,
  allow_child_person_inside BOOLEAN NOT NULL DEFAULT TRUE,
  allow_lights_on BOOLEAN NOT NULL DEFAULT TRUE,
  allow_window_door_open BOOLEAN NOT NULL DEFAULT TRUE,
  allow_damage_alert BOOLEAN NOT NULL DEFAULT TRUE,
  allow_custom_text BOOLEAN NOT NULL DEFAULT TRUE,
  allow_voice_messages BOOLEAN NOT NULL DEFAULT FALSE,
  max_custom_text_length INTEGER NOT NULL DEFAULT 200,
  max_voice_duration_seconds INTEGER NOT NULL DEFAULT 60,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
  quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. QR TOKENS
CREATE TABLE IF NOT EXISTS public.parksignal_qr_tokens (
  token TEXT PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.parksignal_vehicles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_parksignal_qr_tokens_active ON public.parksignal_qr_tokens(token, is_active);
CREATE INDEX IF NOT EXISTS idx_parksignal_qr_vehicle ON public.parksignal_qr_tokens(vehicle_id);

-- 7. PARKING ALERTS LOG
CREATE TABLE IF NOT EXISTS public.parksignal_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.parksignal_vehicles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('TEXT', 'VOICE')),
  alert_category TEXT NOT NULL,
  custom_message TEXT,
  voice_duration_seconds INTEGER,
  delivery_status TEXT NOT NULL DEFAULT 'DELIVERED',
  scanner_ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parksignal_alerts_vehicle_time ON public.parksignal_alerts(vehicle_id, created_at DESC);

-- 8. RATE LIMITING LOG
CREATE TABLE IF NOT EXISTS public.parksignal_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.parksignal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_telegram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_telegram_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_vehicle_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parksignal_rate_limits ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select & update their own profile
CREATE POLICY "Users can view own profile"
  ON public.parksignal_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.parksignal_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.parksignal_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Vehicles: Users can CRUD only their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.parksignal_vehicles FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own vehicles"
  ON public.parksignal_vehicles FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own vehicles"
  ON public.parksignal_vehicles FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own vehicles"
  ON public.parksignal_vehicles FOR DELETE
  USING (auth.uid() = owner_id);

-- Settings: Only vehicle owner can manage settings
CREATE POLICY "Users can view settings of own vehicles"
  ON public.parksignal_vehicle_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update settings of own vehicles"
  ON public.parksignal_vehicle_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

CREATE POLICY "Users can insert settings for own vehicles"
  ON public.parksignal_vehicle_settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

-- QR Tokens: Only vehicle owner can view/manage QR tokens
CREATE POLICY "Users can view QR tokens of own vehicles"
  ON public.parksignal_qr_tokens FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage QR tokens of own vehicles"
  ON public.parksignal_qr_tokens FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

-- Telegram Accounts: Owner can view/delete
CREATE POLICY "Users can view own telegram connection"
  ON public.parksignal_telegram_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own telegram connection"
  ON public.parksignal_telegram_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts History: Vehicle owner can view incoming alerts
CREATE POLICY "Users can view alerts for own vehicles"
  ON public.parksignal_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parksignal_vehicles v
    WHERE v.id = vehicle_id AND v.owner_id = auth.uid()
  ));

-- Telegram Link Tokens: Owner can view/create tokens
CREATE POLICY "Users can view own link tokens"
  ON public.parksignal_telegram_link_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own link tokens"
  ON public.parksignal_telegram_link_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- DATABASE TRIGGERS & RPC SECURITY DEFINER FUNCTIONS
-- ==============================================================================

-- Automatically create a parksignal_profile when an auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_parksignal_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parksignal_profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_parksignal ON auth.users;
CREATE TRIGGER on_auth_user_created_parksignal
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_parksignal_new_user();

-- RPC 1: Public vehicle scan lookup (SECURITY DEFINER, strictly sanitized)
CREATE OR REPLACE FUNCTION public.get_parksignal_vehicle_by_qr(p_qr_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT 
    v.id AS vehicle_id,
    v.vehicle_number,
    v.vehicle_type,
    v.display_plate_publicly,
    v.is_active AS vehicle_active,
    q.is_active AS token_active,
    (t.is_active = TRUE) AS is_telegram_linked,
    s.allow_blocking,
    s.allow_move_vehicle,
    s.allow_emergency,
    s.allow_child_person_inside,
    s.allow_lights_on,
    s.allow_window_door_open,
    s.allow_damage_alert,
    s.allow_custom_text,
    s.allow_voice_messages,
    COALESCE(s.max_custom_text_length, 200) AS max_custom_text_length,
    COALESCE(s.max_voice_duration_seconds, 60) AS max_voice_duration_seconds
  INTO v_rec
  FROM public.parksignal_qr_tokens q
  JOIN public.parksignal_vehicles v ON q.vehicle_id = v.id
  LEFT JOIN public.parksignal_telegram_accounts t ON v.owner_id = t.user_id AND t.is_active = TRUE
  LEFT JOIN public.parksignal_vehicle_settings s ON v.id = s.vehicle_id
  WHERE q.token = p_qr_token;

  IF NOT FOUND OR v_rec.token_active IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'This QR code is invalid, revoked, or no longer active.'
    );
  END IF;

  IF v_rec.vehicle_active IS NOT TRUE THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'The owner has temporarily disabled alert notifications for this vehicle.'
    );
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'vehicleType', v_rec.vehicle_type,
    'vehicleNumber', CASE WHEN v_rec.display_plate_publicly = TRUE THEN v_rec.vehicle_number ELSE NULL END,
    'isPlateMasked', (v_rec.display_plate_publicly = FALSE),
    'isTelegramLinked', COALESCE(v_rec.is_telegram_linked, false),
    'settings', jsonb_build_object(
      'allowBlocking', COALESCE(v_rec.allow_blocking, true),
      'allowMoveVehicle', COALESCE(v_rec.allow_move_vehicle, true),
      'allowEmergency', COALESCE(v_rec.allow_emergency, true),
      'allowChildPersonInside', COALESCE(v_rec.allow_child_person_inside, true),
      'allowLightsOn', COALESCE(v_rec.allow_lights_on, true),
      'allowWindowDoorOpen', COALESCE(v_rec.allow_window_door_open, true),
      'allowDamageAlert', COALESCE(v_rec.allow_damage_alert, true),
      'allowCustomText', COALESCE(v_rec.allow_custom_text, true),
      'allowVoiceMessages', COALESCE(v_rec.allow_voice_messages, false),
      'maxCustomTextLength', v_rec.max_custom_text_length,
      'maxVoiceDurationSeconds', v_rec.max_voice_duration_seconds
    )
  );
END;
$$;

-- RPC 2: Generate One-Time Telegram Link Deep Link
CREATE OR REPLACE FUNCTION public.create_parksignal_telegram_link(p_intent TEXT DEFAULT 'CONNECT')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_token TEXT;
  v_expires TIMESTAMPTZ;
  v_deep_link TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_token := 'link_' || encode(gen_random_bytes(12), 'hex');
  v_expires := now() + interval '10 minutes';

  INSERT INTO public.parksignal_telegram_link_tokens (token, user_id, intent, expires_at, created_at)
  VALUES (v_token, v_uid, p_intent, v_expires, now());

  v_deep_link := 'https://t.me/ParkSignal_bot?start=' || v_token;

  RETURN jsonb_build_object(
    'success', true,
    'token', v_token,
    'deepLink', v_deep_link,
    'expiresAt', extract(epoch from v_expires) * 1000
  );
END;
$$;
