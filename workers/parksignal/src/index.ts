/**
 * PARKSIGNAL API - Cloudflare Worker
 * Product: ParkSignal by BharatUtility
 * Official Bot: @ParkSignal_bot
 */

// Ambient Cloudflare types for standalone compilation
export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: any }>;
  all<T = unknown>(): Promise<{ results?: T[]; success: boolean }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TELEGRAM_BOT_USERNAME?: string;
  APP_URL?: string;
}

// ── Security Helpers ──
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(derived))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateRandomToken(bytes: number = 18): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data: any, status: number = 200, req?: Request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(req ? corsHeaders(req) : { 'Access-Control-Allow-Origin': '*' }),
    },
  });
}

// Extract authenticated user from Bearer header
async function getAuthUser(req: Request, env: Env): Promise<{ id: string; email: string; fullName: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const session = await env.DB.prepare(
    'SELECT s.user_id, s.expires_at, u.id, u.email, u.full_name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ?'
  ).bind(token).first<any>();

  if (!session) return null;
  if (session.expires_at < Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
    return null;
  }

  return { id: session.id, email: session.email, fullName: session.full_name };
}

// Rate Limiting helper (sliding window)
async function checkRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;

  const record = await env.DB.prepare(
    'SELECT count, reset_at FROM rate_limits WHERE key = ?'
  ).bind(key).first<{ count: number; reset_at: number }>();

  if (!record || record.reset_at < now) {
    await env.DB.prepare(
      'INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = ?'
    ).bind(key, resetAt, resetAt).run();
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  await env.DB.prepare(
    'UPDATE rate_limits SET count = count + 1 WHERE key = ?'
  ).bind(key).run();
  return true;
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }

    const url = new URL(req.url);
    const path = url.pathname;

    try {
      // ─────────────────────────────────────────────────────────────
      // 1. HEALTH CHECK
      // ─────────────────────────────────────────────────────────────
      if (path === '/api/parksignal/health' && req.method === 'GET') {
        return jsonResponse({
          status: 'operational',
          product: 'ParkSignal',
          bot: `@${env.TELEGRAM_BOT_USERNAME || 'ParkSignal_bot'}`,
          timestamp: new Date().toISOString()
        }, 200, req);
      }

      // ─────────────────────────────────────────────────────────────
      // 2. OWNER AUTHENTICATION
      // ─────────────────────────────────────────────────────────────
      // POST /api/parksignal/auth/register
      if (path === '/api/parksignal/auth/register' && req.method === 'POST') {
        const body = await req.json() as any;
        const { fullName, email, password } = body;

        if (!fullName || !email || !password) {
          return jsonResponse({ error: 'Full name, email, and password are required' }, 400, req);
        }
        if (password.length < 8) {
          return jsonResponse({ error: 'Password must be at least 8 characters long' }, 400, req);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
        if (existing) {
          return jsonResponse({ error: 'An account with this email already exists' }, 409, req);
        }

        const userId = crypto.randomUUID();
        const salt = generateRandomToken(16);
        const hash = await hashPassword(password, salt);
        const now = Date.now();

        await env.DB.prepare(
          'INSERT INTO users (id, full_name, email, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, fullName.trim(), normalizedEmail, hash, salt, now, now).run();

        // Create 30-day session
        const sessionToken = generateRandomToken(32);
        const expiresAt = now + 30 * 24 * 3600 * 1000;
        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, device_info, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(sessionToken, userId, req.headers.get('User-Agent') || 'Browser', expiresAt, now).run();

        return jsonResponse({
          success: true,
          token: sessionToken,
          user: { id: userId, email: normalizedEmail, fullName: fullName.trim(), isTelegramLinked: false }
        }, 201, req);
      }

      // POST /api/parksignal/auth/login
      if (path === '/api/parksignal/auth/login' && req.method === 'POST') {
        const body = await req.json() as any;
        const { email, password } = body;

        if (!email || !password) {
          return jsonResponse({ error: 'Email and password are required' }, 400, req);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await env.DB.prepare(
          'SELECT id, full_name, email, password_hash, password_salt FROM users WHERE email = ?'
        ).bind(normalizedEmail).first<any>();

        if (!user) {
          return jsonResponse({ error: 'Invalid email or password' }, 401, req);
        }

        const computedHash = await hashPassword(password, user.password_salt);
        if (computedHash !== user.password_hash) {
          return jsonResponse({ error: 'Invalid email or password' }, 401, req);
        }

        const now = Date.now();
        const sessionToken = generateRandomToken(32);
        const expiresAt = now + 30 * 24 * 3600 * 1000;

        await env.DB.prepare(
          'INSERT INTO sessions (id, user_id, device_info, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(sessionToken, user.id, req.headers.get('User-Agent') || 'Browser', expiresAt, now).run();

        const tg = await env.DB.prepare(
          'SELECT is_active, telegram_username FROM telegram_accounts WHERE user_id = ?'
        ).bind(user.id).first<any>();

        return jsonResponse({
          success: true,
          token: sessionToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            isTelegramLinked: Boolean(tg && tg.is_active === 1),
            telegramUsername: tg ? tg.telegram_username : null
          }
        }, 200, req);
      }

      // POST /api/parksignal/auth/logout
      if (path === '/api/parksignal/auth/logout' && req.method === 'POST') {
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7).trim();
          await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
        }
        return jsonResponse({ success: true }, 200, req);
      }

      // ─────────────────────────────────────────────────────────────
      // 3. OWNER PROFILE & ACCOUNT SETTINGS
      // ─────────────────────────────────────────────────────────────
      // GET /api/parksignal/user/profile
      if (path === '/api/parksignal/user/profile' && req.method === 'GET') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const tg = await env.DB.prepare(
          'SELECT is_active, telegram_username, linked_at FROM telegram_accounts WHERE user_id = ?'
        ).bind(user.id).first<any>();

        return jsonResponse({
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isTelegramLinked: Boolean(tg && tg.is_active === 1),
            telegramUsername: tg ? tg.telegram_username : null,
            linkedAt: tg ? tg.linked_at : null
          }
        }, 200, req);
      }

      // PUT /api/parksignal/user/profile
      if (path === '/api/parksignal/user/profile' && req.method === 'PUT') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const body = await req.json() as any;
        const { fullName } = body;
        if (!fullName || !fullName.trim()) {
          return jsonResponse({ error: 'Full name cannot be empty' }, 400, req);
        }

        await env.DB.prepare(
          'UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?'
        ).bind(fullName.trim(), Date.now(), user.id).run();

        return jsonResponse({ success: true, fullName: fullName.trim() }, 200, req);
      }

      // POST /api/parksignal/user/change-password
      if (path === '/api/parksignal/user/change-password' && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const body = await req.json() as any;
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword || newPassword.length < 8) {
          return jsonResponse({ error: 'New password must be at least 8 characters' }, 400, req);
        }

        const currentRec = await env.DB.prepare(
          'SELECT password_hash, password_salt FROM users WHERE id = ?'
        ).bind(user.id).first<any>();

        const computedCurrent = await hashPassword(currentPassword, currentRec.password_salt);
        if (computedCurrent !== currentRec.password_hash) {
          return jsonResponse({ error: 'Current password is incorrect' }, 400, req);
        }

        const newSalt = generateRandomToken(16);
        const newHash = await hashPassword(newPassword, newSalt);

        await env.DB.prepare(
          'UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?'
        ).bind(newHash, newSalt, Date.now(), user.id).run();

        return jsonResponse({ success: true, message: 'Password updated successfully' }, 200, req);
      }

      // DELETE /api/parksignal/user/account
      if (path === '/api/parksignal/user/account' && req.method === 'DELETE') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        // Delete user (cascades to sessions, vehicles, settings, alerts)
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();
        return jsonResponse({ success: true, message: 'Account permanently deleted' }, 200, req);
      }

      // ─────────────────────────────────────────────────────────────
      // 4. TELEGRAM CONNECTION LIFECYCLE (@ParkSignal_bot)
      // ─────────────────────────────────────────────────────────────
      // POST /api/parksignal/telegram/create-link-token
      if (path === '/api/parksignal/telegram/create-link-token' && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const body = (await req.json().catch(() => ({}))) as any;
        const intent = body.intent === 'RECONNECT' ? 'RECONNECT' : 'CONNECT';

        const token = `link_${generateRandomToken(12)}`;
        const now = Date.now();
        const expiresAt = now + 10 * 60 * 1000; // 10 minutes

        await env.DB.prepare(
          'INSERT INTO telegram_link_tokens (token, user_id, intent, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(token, user.id, intent, expiresAt, now).run();

        const botUsername = env.TELEGRAM_BOT_USERNAME || 'ParkSignal_bot';
        const deepLink = `https://t.me/${botUsername}?start=${token}`;

        return jsonResponse({
          success: true,
          token,
          deepLink,
          expiresAt
        }, 200, req);
      }

      // POST /api/parksignal/telegram/disconnect
      if (path === '/api/parksignal/telegram/disconnect' && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        await env.DB.prepare('DELETE FROM telegram_accounts WHERE user_id = ?').bind(user.id).run();
        return jsonResponse({ success: true, message: 'Telegram unlinked successfully' }, 200, req);
      }

      // POST /api/parksignal/telegram/webhook (Telegram Server Webhook)
      if (path === '/api/parksignal/telegram/webhook' && req.method === 'POST') {
        const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
        if (env.TELEGRAM_WEBHOOK_SECRET && secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
          return new Response('Unauthorized Webhook', { status: 403 });
        }

        const update = await req.json() as any;
        const message = update.message;
        if (!message || !message.text) {
          return new Response('OK', { status: 200 });
        }

        const chatId = String(message.chat.id);
        const text = message.text.trim();
        const username = message.from?.username || message.from?.first_name || 'Owner';

        // Check for /start link_<token>
        if (text.startsWith('/start link_')) {
          const token = text.replace('/start ', '').trim();
          const linkRecord = await env.DB.prepare(
            'SELECT user_id, intent, expires_at, used_at FROM telegram_link_tokens WHERE token = ?'
          ).bind(token).first<any>();

          if (!linkRecord || linkRecord.used_at !== null || linkRecord.expires_at < Date.now()) {
            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '❌ This linking link has expired or has already been used. Please click "Connect Telegram" on your ParkSignal dashboard to generate a fresh link.',
                parse_mode: 'Markdown'
              })
            });
            return new Response('OK', { status: 200 });
          }

          // Link account
          const now = Date.now();
          await env.DB.prepare(`
            INSERT INTO telegram_accounts (id, user_id, telegram_chat_id, telegram_username, first_name, is_active, linked_at)
            VALUES (?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              telegram_chat_id = excluded.telegram_chat_id,
              telegram_username = excluded.telegram_username,
              first_name = excluded.first_name,
              is_active = 1,
              linked_at = excluded.linked_at
          `).bind(crypto.randomUUID(), linkRecord.user_id, chatId, username, message.from?.first_name || '', now).run();

          await env.DB.prepare('UPDATE telegram_link_tokens SET used_at = ? WHERE token = ?').bind(now, token).run();

          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ *ParkSignal Connected Successfully!*\n\nWelcome ${username}! Your Telegram account is now securely linked to ParkSignal by BharatUtility.\n\nYou will receive instant parking alerts and voice notes right here whenever someone scans your vehicle QR sticker.\n\nType /myvehicles to view your registered vehicles, or /help for guidance.`,
              parse_mode: 'Markdown'
            })
          });

          return new Response('OK', { status: 200 });
        }

        // Handle /unlink command
        if (text === '/unlink') {
          await env.DB.prepare('UPDATE telegram_accounts SET is_active = 0 WHERE telegram_chat_id = ?').bind(chatId).run();
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '🔒 Your Telegram account has been disconnected from ParkSignal. You can reconnect anytime through your BharatUtility ParkSignal dashboard.',
              parse_mode: 'Markdown'
            })
          });
          return new Response('OK', { status: 200 });
        }

        // Handle /myvehicles command
        if (text === '/myvehicles') {
          const account = await env.DB.prepare(
            'SELECT user_id FROM telegram_accounts WHERE telegram_chat_id = ? AND is_active = 1'
          ).bind(chatId).first<any>();

          if (!account) {
            await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '⚠️ Your Telegram is not currently linked to a ParkSignal account. Log in at https://bharatutility.tech/parksignal to connect.',
              })
            });
            return new Response('OK', { status: 200 });
          }

          const vehicles = await env.DB.prepare(
            'SELECT vehicle_number, vehicle_type, nickname, is_active FROM vehicles WHERE owner_id = ?'
          ).bind(account.user_id).all<any>();

          const list = (vehicles.results || []).map((v: any, i: number) =>
            `${i + 1}. *${v.vehicle_number}* (${v.vehicle_type}) ${v.nickname ? `- ${v.nickname}` : ''} [${v.is_active ? '🟢 Active' : '🔴 Inactive'}]`
          ).join('\n') || 'No registered vehicles found.';

          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🚗 *Your Registered Vehicles:*\n\n${list}\n\nManage alerts and stickers in your dashboard: https://bharatutility.tech/parksignal/dashboard`,
              parse_mode: 'Markdown'
            })
          });
          return new Response('OK', { status: 200 });
        }

        // Handle /help command
        if (text === '/help' || text === '/start') {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🛡️ *ParkSignal by BharatUtility*\n\n_Your Vehicle. Your Privacy. Scan. Alert. Connect._\n\nCommands:\n• /myvehicles — View your registered vehicles\n• /unlink — Disconnect this Telegram account\n• /help — Show this help message\n\nVisit: https://bharatutility.tech/parksignal`,
              parse_mode: 'Markdown'
            })
          });
          return new Response('OK', { status: 200 });
        }

        return new Response('OK', { status: 200 });
      }

      // ─────────────────────────────────────────────────────────────
      // 5. VEHICLE MANAGEMENT & QR GENERATION
      // ─────────────────────────────────────────────────────────────
      // GET /api/parksignal/vehicles
      if (path === '/api/parksignal/vehicles' && req.method === 'GET') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const vehicles = await env.DB.prepare(`
          SELECT 
            v.id, v.vehicle_number, v.vehicle_type, v.nickname, 
            v.display_plate_publicly, v.is_active, v.created_at,
            q.token AS qr_token,
            s.allow_blocking, s.allow_move_vehicle, s.allow_emergency, 
            s.allow_child_person_inside, s.allow_lights_on, s.allow_window_door_open, 
            s.allow_damage_alert, s.allow_custom_text, s.allow_voice_messages,
            s.max_custom_text_length, s.max_voice_duration_seconds,
            s.quiet_hours_enabled, s.quiet_hours_start, s.quiet_hours_end
          FROM vehicles v
          LEFT JOIN qr_tokens q ON v.id = q.vehicle_id AND q.is_active = 1
          LEFT JOIN vehicle_alert_settings s ON v.id = s.vehicle_id
          WHERE v.owner_id = ?
          ORDER BY v.created_at DESC
        `).bind(user.id).all();

        return jsonResponse({ vehicles: vehicles.results || [] }, 200, req);
      }

      // POST /api/parksignal/vehicles (Register new vehicle)
      if (path === '/api/parksignal/vehicles' && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const body = await req.json() as any;
        const { vehicleNumber, vehicleType, nickname, displayPlatePublicly } = body;

        if (!vehicleNumber || !vehicleNumber.trim()) {
          return jsonResponse({ error: 'Vehicle registration number is required' }, 400, req);
        }

        const normalizedPlate = vehicleNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const vehicleId = crypto.randomUUID();
        const now = Date.now();
        const qrToken = generateRandomToken(12);

        // Insert vehicle
        await env.DB.prepare(`
          INSERT INTO vehicles (id, owner_id, vehicle_number, vehicle_type, nickname, display_plate_publicly, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `).bind(
          vehicleId,
          user.id,
          normalizedPlate,
          vehicleType || 'Car',
          nickname ? nickname.trim() : null,
          displayPlatePublicly !== false ? 1 : 0,
          now,
          now
        ).run();

        // Insert QR token
        await env.DB.prepare(`
          INSERT INTO qr_tokens (token, vehicle_id, is_active, created_at)
          VALUES (?, ?, 1, ?)
        `).bind(qrToken, vehicleId, now).run();

        // Insert default vehicle alert settings
        await env.DB.prepare(`
          INSERT INTO vehicle_alert_settings (
            vehicle_id, allow_blocking, allow_move_vehicle, allow_emergency,
            allow_child_person_inside, allow_lights_on, allow_window_door_open,
            allow_damage_alert, allow_custom_text, allow_voice_messages,
            max_custom_text_length, max_voice_duration_seconds, updated_at
          ) VALUES (?, 1, 1, 1, 1, 1, 1, 1, 1, 0, 200, 60, ?)
        `).bind(vehicleId, now).run();

        return jsonResponse({
          success: true,
          vehicle: {
            id: vehicleId,
            vehicleNumber: normalizedPlate,
            vehicleType: vehicleType || 'Car',
            nickname: nickname || null,
            qrToken,
            isActive: true,
            displayPlatePublicly: displayPlatePublicly !== false
          }
        }, 201, req);
      }

      // PUT /api/parksignal/vehicles/:id/settings (Update alert & custom message settings)
      if (path.startsWith('/api/parksignal/vehicles/') && path.endsWith('/settings') && req.method === 'PUT') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const vehicleId = path.split('/')[4];
        // Ensure ownership
        const vehicle = await env.DB.prepare('SELECT id FROM vehicles WHERE id = ? AND owner_id = ?').bind(vehicleId, user.id).first();
        if (!vehicle) return jsonResponse({ error: 'Vehicle not found or unauthorized' }, 404, req);

        const body = await req.json() as any;
        const now = Date.now();

        await env.DB.prepare(`
          UPDATE vehicle_alert_settings SET
            allow_blocking = ?,
            allow_move_vehicle = ?,
            allow_emergency = ?,
            allow_child_person_inside = ?,
            allow_lights_on = ?,
            allow_window_door_open = ?,
            allow_damage_alert = ?,
            allow_custom_text = ?,
            allow_voice_messages = ?,
            max_custom_text_length = ?,
            max_voice_duration_seconds = ?,
            quiet_hours_enabled = ?,
            quiet_hours_start = ?,
            quiet_hours_end = ?,
            updated_at = ?
          WHERE vehicle_id = ?
        `).bind(
          body.allow_blocking ? 1 : 0,
          body.allow_move_vehicle ? 1 : 0,
          body.allow_emergency ? 1 : 0,
          body.allow_child_person_inside ? 1 : 0,
          body.allow_lights_on ? 1 : 0,
          body.allow_window_door_open ? 1 : 0,
          body.allow_damage_alert ? 1 : 0,
          body.allow_custom_text ? 1 : 0,
          body.allow_voice_messages ? 1 : 0,
          body.max_custom_text_length || 200,
          body.max_voice_duration_seconds || 60,
          body.quiet_hours_enabled ? 1 : 0,
          body.quiet_hours_start || '22:00',
          body.quiet_hours_end || '07:00',
          now,
          vehicleId
        ).run();

        // Also update plate display & nickname if provided
        if (typeof body.display_plate_publicly !== 'undefined' || typeof body.nickname !== 'undefined') {
          await env.DB.prepare(`
            UPDATE vehicles SET
              display_plate_publicly = ?,
              nickname = ?,
              updated_at = ?
            WHERE id = ?
          `).bind(
            body.display_plate_publicly ? 1 : 0,
            body.nickname !== undefined ? body.nickname : null,
            now,
            vehicleId
          ).run();
        }

        return jsonResponse({ success: true, message: 'Settings saved' }, 200, req);
      }

      // POST /api/parksignal/vehicles/:id/toggle-status
      if (path.startsWith('/api/parksignal/vehicles/') && path.endsWith('/toggle-status') && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const vehicleId = path.split('/')[4];
        const v = await env.DB.prepare('SELECT is_active FROM vehicles WHERE id = ? AND owner_id = ?').bind(vehicleId, user.id).first<any>();
        if (!v) return jsonResponse({ error: 'Vehicle not found' }, 404, req);

        const nextStatus = v.is_active === 1 ? 0 : 1;
        await env.DB.prepare('UPDATE vehicles SET is_active = ?, updated_at = ? WHERE id = ?').bind(nextStatus, Date.now(), vehicleId).run();

        return jsonResponse({ success: true, isActive: nextStatus === 1 }, 200, req);
      }

      // POST /api/parksignal/vehicles/:id/regenerate-qr
      if (path.startsWith('/api/parksignal/vehicles/') && path.endsWith('/regenerate-qr') && req.method === 'POST') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const vehicleId = path.split('/')[4];
        const v = await env.DB.prepare('SELECT id FROM vehicles WHERE id = ? AND owner_id = ?').bind(vehicleId, user.id).first();
        if (!v) return jsonResponse({ error: 'Vehicle not found' }, 404, req);

        const now = Date.now();
        // Invalidate old tokens
        await env.DB.prepare('UPDATE qr_tokens SET is_active = 0, revoked_at = ? WHERE vehicle_id = ?').bind(now, vehicleId).run();

        // Create new token
        const newToken = generateRandomToken(12);
        await env.DB.prepare('INSERT INTO qr_tokens (token, vehicle_id, is_active, created_at) VALUES (?, ?, 1, ?)').bind(newToken, vehicleId, now).run();

        return jsonResponse({ success: true, qrToken: newToken }, 200, req);
      }

      // DELETE /api/parksignal/vehicles/:id
      if (path.startsWith('/api/parksignal/vehicles/') && req.method === 'DELETE') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const vehicleId = path.split('/')[4];
        await env.DB.prepare('DELETE FROM vehicles WHERE id = ? AND owner_id = ?').bind(vehicleId, user.id).run();
        return jsonResponse({ success: true, message: 'Vehicle deleted' }, 200, req);
      }

      // ─────────────────────────────────────────────────────────────
      // 6. PUBLIC SCANNER ALERT ENDPOINTS
      // ─────────────────────────────────────────────────────────────
      // GET /api/parksignal/public/vehicle/:token
      if (path.startsWith('/api/parksignal/public/vehicle/') && req.method === 'GET') {
        const qrToken = path.split('/')[5];
        if (!qrToken) return jsonResponse({ error: 'Invalid QR token' }, 400, req);

        const vehicleData = await env.DB.prepare(`
          SELECT 
            v.id, v.vehicle_number, v.vehicle_type, v.nickname, 
            v.display_plate_publicly, v.is_active AS vehicle_active,
            q.is_active AS token_active,
            t.is_active AS telegram_active,
            s.allow_blocking, s.allow_move_vehicle, s.allow_emergency, 
            s.allow_child_person_inside, s.allow_lights_on, s.allow_window_door_open, 
            s.allow_damage_alert, s.allow_custom_text, s.allow_voice_messages,
            s.max_custom_text_length, s.max_voice_duration_seconds
          FROM qr_tokens q
          JOIN vehicles v ON q.vehicle_id = v.id
          LEFT JOIN telegram_accounts t ON v.owner_id = t.user_id
          LEFT JOIN vehicle_alert_settings s ON v.id = s.vehicle_id
          WHERE q.token = ?
        `).bind(qrToken).first<any>();

        if (!vehicleData || vehicleData.token_active !== 1) {
          return jsonResponse({
            valid: false,
            message: 'This QR code is invalid, revoked, or no longer active.'
          }, 404, req);
        }

        if (vehicleData.vehicle_active !== 1) {
          return jsonResponse({
            valid: false,
            message: 'The owner has temporarily disabled alert notifications for this vehicle.'
          }, 200, req);
        }

        // Return strictly permitted public info
        return jsonResponse({
          valid: true,
          vehicleType: vehicleData.vehicle_type,
          vehicleNumber: vehicleData.display_plate_publicly === 1 ? vehicleData.vehicle_number : null,
          isPlateMasked: vehicleData.display_plate_publicly !== 1,
          isTelegramLinked: Boolean(vehicleData.telegram_active === 1),
          settings: {
            allowBlocking: vehicleData.allow_blocking === 1,
            allowMoveVehicle: vehicleData.allow_move_vehicle === 1,
            allowEmergency: vehicleData.allow_emergency === 1,
            allowChildPersonInside: vehicleData.allow_child_person_inside === 1,
            allowLightsOn: vehicleData.allow_lights_on === 1,
            allowWindowDoorOpen: vehicleData.allow_window_door_open === 1,
            allowDamageAlert: vehicleData.allow_damage_alert === 1,
            allowCustomText: vehicleData.allow_custom_text === 1,
            allowVoiceMessages: vehicleData.allow_voice_messages === 1,
            maxCustomTextLength: vehicleData.max_custom_text_length || 200,
            maxVoiceDurationSeconds: vehicleData.max_voice_duration_seconds || 60,
          }
        }, 200, req);
      }

      // POST /api/parksignal/public/alert (Submit Text Alert)
      if (path === '/api/parksignal/public/alert' && req.method === 'POST') {
        const body = await req.json() as any;
        const { qrToken, category, customMessage } = body;

        if (!qrToken || !category) {
          return jsonResponse({ error: 'QR token and category are required' }, 400, req);
        }

        const ip = req.headers.get('CF-Connecting-IP') || '127.0.0.1';
        const ipHash = await sha256Hex(ip);

        // Rate limiting: max 3 alerts per vehicle per 10m, max 5 per IP
        const allowedIp = await checkRateLimit(env, `ip:${ipHash}`, 5, 600);
        if (!allowedIp) {
          return jsonResponse({ error: 'Too many alerts submitted. Please wait a few minutes before trying again.' }, 429, req);
        }

        const vehicle = await env.DB.prepare(`
          SELECT 
            v.id, v.vehicle_number, v.vehicle_type, v.is_active,
            q.is_active AS token_active,
            t.telegram_chat_id, t.is_active AS telegram_active,
            s.allow_custom_text, s.max_custom_text_length,
            s.quiet_hours_enabled, s.quiet_hours_start, s.quiet_hours_end
          FROM qr_tokens q
          JOIN vehicles v ON q.vehicle_id = v.id
          LEFT JOIN telegram_accounts t ON v.owner_id = t.user_id
          LEFT JOIN vehicle_alert_settings s ON v.id = s.vehicle_id
          WHERE q.token = ?
        `).bind(qrToken).first<any>();

        if (!vehicle || vehicle.token_active !== 1 || vehicle.is_active !== 1) {
          return jsonResponse({ error: 'This vehicle QR is not currently active.' }, 404, req);
        }

        const allowedVehicle = await checkRateLimit(env, `veh:${vehicle.id}`, 3, 600);
        if (!allowedVehicle) {
          return jsonResponse({ error: 'Multiple alerts have already been sent to this vehicle recently. Please allow the owner time to respond.' }, 429, req);
        }

        if (!vehicle.telegram_active || !vehicle.telegram_chat_id) {
          return jsonResponse({
            success: false,
            delivered: false,
            error: 'The owner has not connected notifications yet.'
          }, 200, req);
        }

        const sanitizedNote = customMessage ? customMessage.trim().substring(0, vehicle.max_custom_text_length || 200) : null;
        const now = Date.now();
        const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

        // Dispatch Telegram message
        const telegramText = `🚨 *PARKSIGNAL VEHICLE ALERT* 🚨\n\n🚗 *Vehicle:* \`${vehicle.vehicle_number}\` (${vehicle.vehicle_type})\n⚠️ *Alert:* ${category}${sanitizedNote ? `\n📝 *Note:* _"${sanitizedNote}"_` : ''}\n🕒 *Time:* ${dateStr}\n\n_Sent safely via ParkSignal QR • No contact details shared_`;

        let deliveryStatus = 'DELIVERED';
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: vehicle.telegram_chat_id,
              text: telegramText,
              parse_mode: 'Markdown'
            })
          });
          const tgData = await tgRes.json() as any;
          if (!tgData.ok) {
            deliveryStatus = 'FAILED_BOT_ERROR';
          }
        } catch {
          deliveryStatus = 'FAILED_BOT_ERROR';
        }

        // Record in alerts table
        await env.DB.prepare(`
          INSERT INTO parking_alerts (id, vehicle_id, alert_type, alert_category, custom_message, delivery_status, scanner_ip_hash, created_at)
          VALUES (?, ?, 'TEXT', ?, ?, ?, ?, ?)
        `).bind(crypto.randomUUID(), vehicle.id, category, sanitizedNote, deliveryStatus, ipHash, now).run();

        if (deliveryStatus === 'DELIVERED') {
          return jsonResponse({
            success: true,
            delivered: true,
            message: 'Alert delivered to vehicle owner successfully!'
          }, 200, req);
        } else {
          return jsonResponse({
            success: false,
            delivered: false,
            error: 'Failed to deliver message to owner via Telegram. Please try again shortly.'
          }, 502, req);
        }
      }

      // POST /api/parksignal/public/alert/voice (Submit Voice Alert)
      if (path === '/api/parksignal/public/alert/voice' && req.method === 'POST') {
        const formData = await req.formData();
        const qrToken = formData.get('qrToken') as string;
        const category = formData.get('category') as string || 'Voice Alert';
        const voiceBlob = formData.get('voice') as File;
        const durationSeconds = parseInt(formData.get('durationSeconds') as string || '0', 10);

        if (!qrToken || !voiceBlob) {
          return jsonResponse({ error: 'QR token and voice file are required' }, 400, req);
        }

        const ip = req.headers.get('CF-Connecting-IP') || '127.0.0.1';
        const ipHash = await sha256Hex(ip);

        // Rate limiting
        const allowedIp = await checkRateLimit(env, `ip:${ipHash}`, 3, 600);
        if (!allowedIp) {
          return jsonResponse({ error: 'Too many requests. Please wait a few minutes before trying again.' }, 429, req);
        }

        const vehicle = await env.DB.prepare(`
          SELECT 
            v.id, v.vehicle_number, v.vehicle_type, v.is_active,
            q.is_active AS token_active,
            t.telegram_chat_id, t.is_active AS telegram_active,
            s.allow_voice_messages, s.max_voice_duration_seconds
          FROM qr_tokens q
          JOIN vehicles v ON q.vehicle_id = v.id
          LEFT JOIN telegram_accounts t ON v.owner_id = t.user_id
          LEFT JOIN vehicle_alert_settings s ON v.id = s.vehicle_id
          WHERE q.token = ?
        `).bind(qrToken).first<any>();

        if (!vehicle || vehicle.token_active !== 1 || vehicle.is_active !== 1) {
          return jsonResponse({ error: 'This vehicle QR is not currently active.' }, 404, req);
        }

        if (vehicle.allow_voice_messages !== 1) {
          return jsonResponse({ error: 'Voice messages are not enabled for this vehicle.' }, 403, req);
        }

        if (!vehicle.telegram_active || !vehicle.telegram_chat_id) {
          return jsonResponse({
            success: false,
            delivered: false,
            error: 'The owner has not connected notifications yet.'
          }, 200, req);
        }

        // Ephemeral Telegram sendVoice
        const tgFormData = new FormData();
        tgFormData.append('chat_id', vehicle.telegram_chat_id);
        tgFormData.append('voice', voiceBlob, 'voice_alert.ogg');
        const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
        tgFormData.append('caption', `🚨 *PARKSIGNAL VOICE ALERT*\n🚗 Vehicle: \`${vehicle.vehicle_number}\` (${vehicle.vehicle_type})\n⚠️ Alert: ${category}\n🕒 ${dateStr}`);
        tgFormData.append('parse_mode', 'Markdown');

        let deliveryStatus = 'DELIVERED';
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendVoice`, {
            method: 'POST',
            body: tgFormData
          });
          const tgData = await tgRes.json() as any;
          if (!tgData.ok) {
            deliveryStatus = 'FAILED_BOT_ERROR';
          }
        } catch {
          deliveryStatus = 'FAILED_BOT_ERROR';
        }

        await env.DB.prepare(`
          INSERT INTO parking_alerts (id, vehicle_id, alert_type, alert_category, voice_duration_seconds, delivery_status, scanner_ip_hash, created_at)
          VALUES (?, ?, 'VOICE', ?, ?, ?, ?, ?)
        `).bind(crypto.randomUUID(), vehicle.id, category, durationSeconds, deliveryStatus, ipHash, Date.now()).run();

        if (deliveryStatus === 'DELIVERED') {
          return jsonResponse({
            success: true,
            delivered: true,
            message: 'Voice alert sent to owner via Telegram successfully!'
          }, 200, req);
        } else {
          return jsonResponse({
            success: false,
            delivered: false,
            error: 'Failed to deliver voice note. Please send a text alert instead.'
          }, 502, req);
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 7. OWNER NOTIFICATION / ALERT HISTORY
      // ─────────────────────────────────────────────────────────────
      // GET /api/parksignal/alerts/history
      if (path === '/api/parksignal/alerts/history' && req.method === 'GET') {
        const user = await getAuthUser(req, env);
        if (!user) return jsonResponse({ error: 'Unauthorized' }, 401, req);

        const alerts = await env.DB.prepare(`
          SELECT 
            a.id, a.alert_type, a.alert_category, a.custom_message,
            a.voice_duration_seconds, a.delivery_status, a.created_at,
            v.vehicle_number, v.vehicle_type, v.nickname
          FROM parking_alerts a
          JOIN vehicles v ON a.vehicle_id = v.id
          WHERE v.owner_id = ?
          ORDER BY a.created_at DESC
          LIMIT 50
        `).bind(user.id).all();

        return jsonResponse({ alerts: alerts.results || [] }, 200, req);
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404, req);
    } catch (err: any) {
      return jsonResponse({ error: 'Internal Server Error', message: err?.message }, 500, req);
    }
  }
};
