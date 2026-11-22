-- ============================================================================
-- PARKSIGNAL DATABASE SCHEMA (CLOUDFLARE D1)
-- ============================================================================

-- 1. VEHICLE OWNERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    reset_token TEXT,
    reset_token_expires_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 2. AUTHENTICATION SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_info TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TELEGRAM ACCOUNTS
CREATE TABLE IF NOT EXISTS telegram_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    telegram_chat_id TEXT NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    linked_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. ONE-TIME TELEGRAM LINKING & RECONNECT TOKENS
CREATE TABLE IF NOT EXISTS telegram_link_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    intent TEXT NOT NULL DEFAULT 'CONNECT',
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. REGISTERED VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    nickname TEXT,
    display_plate_publicly INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. VEHICLE-SPECIFIC ALERT SETTINGS
CREATE TABLE IF NOT EXISTS vehicle_alert_settings (
    vehicle_id TEXT PRIMARY KEY,
    allow_blocking INTEGER NOT NULL DEFAULT 1,
    allow_move_vehicle INTEGER NOT NULL DEFAULT 1,
    allow_emergency INTEGER NOT NULL DEFAULT 1,
    allow_child_person_inside INTEGER NOT NULL DEFAULT 1,
    allow_lights_on INTEGER NOT NULL DEFAULT 1,
    allow_window_door_open INTEGER NOT NULL DEFAULT 1,
    allow_damage_alert INTEGER NOT NULL DEFAULT 1,
    allow_custom_text INTEGER NOT NULL DEFAULT 1,
    allow_voice_messages INTEGER NOT NULL DEFAULT 0,
    max_custom_text_length INTEGER NOT NULL DEFAULT 200,
    max_voice_duration_seconds INTEGER NOT NULL DEFAULT 60,
    quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
    quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
    quiet_hours_end TEXT NOT NULL DEFAULT '07:00',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 7. QR TOKENS
CREATE TABLE IF NOT EXISTS qr_tokens (
    token TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    revoked_at INTEGER,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 8. PARKING ALERTS LOG
CREATE TABLE IF NOT EXISTS parking_alerts (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    alert_category TEXT NOT NULL,
    custom_message TEXT,
    voice_duration_seconds INTEGER,
    delivery_status TEXT NOT NULL,
    scanner_ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 9. RATE LIMITING LOG
CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_qr_tokens_active ON qr_tokens(token, is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_user ON telegram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_time ON parking_alerts(vehicle_id, created_at DESC);
