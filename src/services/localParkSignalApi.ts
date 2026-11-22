/**
 * LOCAL PARKSIGNAL API HANDLER (For local dev server in server.ts)
 * Mirrors Cloudflare Worker logic for local development & testing
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

export const localParkSignalRouter = Router();

// In-memory / persistent dev store
interface LocalStore {
  users: Map<string, any>;
  sessions: Map<string, any>;
  telegramAccounts: Map<string, any>;
  linkTokens: Map<string, any>;
  vehicles: Map<string, any>;
  vehicleSettings: Map<string, any>;
  qrTokens: Map<string, any>;
  alerts: any[];
  rateLimits: Map<string, { count: number; resetAt: number }>;
}

const store: LocalStore = {
  users: new Map(),
  sessions: new Map(),
  telegramAccounts: new Map(),
  linkTokens: new Map(),
  vehicles: new Map(),
  vehicleSettings: new Map(),
  qrTokens: new Map(),
  alerts: [],
  rateLimits: new Map()
};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

function getAuthUser(req: Request): any | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7).trim();
  const session = store.sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) store.sessions.delete(token);
    return null;
  }
  return store.users.get(session.userId) || null;
}

// 1. Health
localParkSignalRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    mode: 'development-express',
    bot: '@ParkSignal_bot',
    timestamp: new Date().toISOString()
  });
});

// 2. Auth: Register
localParkSignalRouter.post('/auth/register', (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }
  const normEmail = email.toLowerCase().trim();
  for (const u of store.users.values()) {
    if (u.email === normEmail) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
  }

  const userId = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const user = {
    id: userId,
    fullName: fullName.trim(),
    email: normEmail,
    passwordHash,
    passwordSalt: salt,
    createdAt: Date.now()
  };
  store.users.set(userId, user);

  const sessionToken = crypto.randomBytes(32).toString('hex');
  store.sessions.set(sessionToken, {
    userId,
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000
  });

  res.status(201).json({
    success: true,
    token: sessionToken,
    user: { id: userId, email: normEmail, fullName: user.fullName, isTelegramLinked: false }
  });
});

// Auth: Login
localParkSignalRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normEmail = email.toLowerCase().trim();
  let foundUser: any = null;
  for (const u of store.users.values()) {
    if (u.email === normEmail) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hash = hashPassword(password, foundUser.passwordSalt);
  if (hash !== foundUser.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  store.sessions.set(sessionToken, {
    userId: foundUser.id,
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000
  });

  const tg = store.telegramAccounts.get(foundUser.id);
  res.json({
    success: true,
    token: sessionToken,
    user: {
      id: foundUser.id,
      email: foundUser.email,
      fullName: foundUser.fullName,
      isTelegramLinked: Boolean(tg && tg.isActive),
      telegramUsername: tg ? tg.username : null
    }
  });
});

// Auth: Logout
localParkSignalRouter.post('/auth/logout', (req: Request, res: Response) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7).trim();
    store.sessions.delete(token);
  }
  res.json({ success: true });
});

// 3. User Profile
localParkSignalRouter.get('/user/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const tg = store.telegramAccounts.get(user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isTelegramLinked: Boolean(tg && tg.isActive),
      telegramUsername: tg ? tg.username : null,
      linkedAt: tg ? tg.linkedAt : null
    }
  });
});

localParkSignalRouter.put('/user/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { fullName } = req.body;
  if (!fullName || !fullName.trim()) return res.status(400).json({ error: 'Full name required' });
  user.fullName = fullName.trim();
  res.json({ success: true, fullName: user.fullName });
});

localParkSignalRouter.post('/user/change-password', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const hash = hashPassword(currentPassword, user.passwordSalt);
  if (hash !== user.passwordHash) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  user.passwordSalt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, user.passwordSalt);
  res.json({ success: true, message: 'Password updated' });
});

localParkSignalRouter.delete('/user/account', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  store.users.delete(user.id);
  store.telegramAccounts.delete(user.id);
  res.json({ success: true });
});

// 4. Telegram Linking (@ParkSignal_bot)
localParkSignalRouter.post('/telegram/create-link-token', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const token = `link_${crypto.randomBytes(12).toString('hex')}`;
  store.linkTokens.set(token, {
    userId: user.id,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  const deepLink = `https://t.me/ParkSignal_bot?start=${token}`;
  res.json({ success: true, token, deepLink, expiresAt: Date.now() + 600000 });
});

localParkSignalRouter.post('/telegram/disconnect', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  store.telegramAccounts.delete(user.id);
  res.json({ success: true });
});

// 5. Vehicles
localParkSignalRouter.get('/vehicles', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicles: any[] = [];
  for (const v of store.vehicles.values()) {
    if (v.ownerId === user.id) {
      let activeQrToken = '';
      for (const q of store.qrTokens.values()) {
        if (q.vehicleId === v.id && q.isActive) {
          activeQrToken = q.token;
          break;
        }
      }
      const settings = store.vehicleSettings.get(v.id) || {};
      vehicles.push({
        ...v,
        qr_token: activeQrToken,
        ...settings
      });
    }
  }

  res.json({ vehicles });
});

localParkSignalRouter.post('/vehicles', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { vehicleNumber, vehicleType, nickname, displayPlatePublicly } = req.body;
  if (!vehicleNumber || !vehicleNumber.trim()) {
    return res.status(400).json({ error: 'Vehicle registration number is required' });
  }

  const normalizedPlate = vehicleNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const vehicleId = crypto.randomUUID();
  const qrToken = crypto.randomBytes(12).toString('hex');
  const now = Date.now();

  const vehicle = {
    id: vehicleId,
    ownerId: user.id,
    vehicle_number: normalizedPlate,
    vehicle_type: vehicleType || 'Car',
    nickname: nickname ? nickname.trim() : null,
    display_plate_publicly: displayPlatePublicly !== false ? 1 : 0,
    is_active: 1,
    created_at: now
  };
  store.vehicles.set(vehicleId, vehicle);

  store.qrTokens.set(qrToken, {
    token: qrToken,
    vehicleId,
    isActive: 1,
    createdAt: now
  });

  store.vehicleSettings.set(vehicleId, {
    allow_blocking: 1,
    allow_move_vehicle: 1,
    allow_emergency: 1,
    allow_child_person_inside: 1,
    allow_lights_on: 1,
    allow_window_door_open: 1,
    allow_damage_alert: 1,
    allow_custom_text: 1,
    allow_voice_messages: 0,
    max_custom_text_length: 200,
    max_voice_duration_seconds: 60,
    quiet_hours_enabled: 0,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00'
  });

  res.status(201).json({
    success: true,
    vehicle: {
      id: vehicleId,
      vehicleNumber: normalizedPlate,
      vehicleType: vehicle.vehicle_type,
      nickname: vehicle.nickname,
      qrToken,
      isActive: true,
      displayPlatePublicly: vehicle.display_plate_publicly === 1
    }
  });
});

localParkSignalRouter.put('/vehicles/:id/settings', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicleId = String(req.params.id);
  const vehicle = store.vehicles.get(vehicleId);
  if (!vehicle || vehicle.ownerId !== user.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const existing = store.vehicleSettings.get(vehicle.id) || {};
  store.vehicleSettings.set(vehicle.id, {
    ...existing,
    ...req.body
  });

  if (typeof req.body.display_plate_publicly !== 'undefined') {
    vehicle.display_plate_publicly = req.body.display_plate_publicly ? 1 : 0;
  }
  if (typeof req.body.nickname !== 'undefined') {
    vehicle.nickname = req.body.nickname;
  }

  res.json({ success: true, message: 'Settings saved' });
});

localParkSignalRouter.post('/vehicles/:id/toggle-status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicleId = String(req.params.id);
  const vehicle = store.vehicles.get(vehicleId);
  if (!vehicle || vehicle.ownerId !== user.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  vehicle.is_active = vehicle.is_active === 1 ? 0 : 1;
  res.json({ success: true, isActive: vehicle.is_active === 1 });
});

localParkSignalRouter.post('/vehicles/:id/regenerate-qr', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicleId = String(req.params.id);
  const vehicle = store.vehicles.get(vehicleId);
  if (!vehicle || vehicle.ownerId !== user.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  for (const q of store.qrTokens.values()) {
    if (q.vehicleId === vehicle.id) q.isActive = 0;
  }

  const newToken = crypto.randomBytes(12).toString('hex');
  store.qrTokens.set(newToken, {
    token: newToken,
    vehicleId: vehicle.id,
    isActive: 1,
    createdAt: Date.now()
  });

  res.json({ success: true, qrToken: newToken });
});

localParkSignalRouter.delete('/vehicles/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const vehicleId = String(req.params.id);
  const vehicle = store.vehicles.get(vehicleId);
  if (!vehicle || vehicle.ownerId !== user.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  store.vehicles.delete(vehicle.id);
  store.vehicleSettings.delete(vehicle.id);
  res.json({ success: true });
});

// 6. Public Alert Endpoints
localParkSignalRouter.get('/public/vehicle/:token', (req: Request, res: Response) => {
  const token = String(req.params.token);
  const qr = store.qrTokens.get(token);
  if (!qr || !qr.isActive) {
    return res.status(404).json({ valid: false, message: 'This QR code is invalid, revoked, or no longer active.' });
  }

  const vehicle = store.vehicles.get(qr.vehicleId);
  if (!vehicle) return res.status(404).json({ valid: false, message: 'Vehicle not found.' });

  if (!vehicle.is_active) {
    return res.json({ valid: false, message: 'The owner has temporarily disabled alert notifications for this vehicle.' });
  }

  const settings = store.vehicleSettings.get(vehicle.id) || {};
  const tg = store.telegramAccounts.get(vehicle.ownerId);

  res.json({
    valid: true,
    vehicleType: vehicle.vehicle_type,
    vehicleNumber: vehicle.display_plate_publicly === 1 ? vehicle.vehicle_number : null,
    isPlateMasked: vehicle.display_plate_publicly !== 1,
    isTelegramLinked: Boolean(tg && tg.isActive),
    settings: {
      allowBlocking: settings.allow_blocking !== 0,
      allowMoveVehicle: settings.allow_move_vehicle !== 0,
      allowEmergency: settings.allow_emergency !== 0,
      allowChildPersonInside: settings.allow_child_person_inside !== 0,
      allowLightsOn: settings.allow_lights_on !== 0,
      allowWindowDoorOpen: settings.allow_window_door_open !== 0,
      allowDamageAlert: settings.allow_damage_alert !== 0,
      allowCustomText: settings.allow_custom_text !== 0,
      allowVoiceMessages: settings.allow_voice_messages === 1,
      maxCustomTextLength: settings.max_custom_text_length || 200,
      maxVoiceDurationSeconds: settings.max_voice_duration_seconds || 60
    }
  });
});

localParkSignalRouter.post('/public/alert', async (req: Request, res: Response) => {
  const { qrToken, category, customMessage } = req.body;
  const qr = store.qrTokens.get(qrToken);
  if (!qr || !qr.isActive) return res.status(404).json({ error: 'Invalid QR token' });

  const vehicle = store.vehicles.get(qr.vehicleId);
  if (!vehicle || !vehicle.is_active) return res.status(404).json({ error: 'Vehicle inactive' });

  const tg = store.telegramAccounts.get(vehicle.ownerId);
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  let deliveryStatus: 'DELIVERED' | 'FAILED_BOT_ERROR' | 'UNLINKED' = 'DELIVERED';

  if (!tg || !tg.chatId) {
    // If no real Telegram linked yet, in dev mode we can log alert and report status
    if (!botToken) {
      deliveryStatus = 'DELIVERED'; // Dev simulation
    } else {
      return res.json({ success: false, delivered: false, error: 'Vehicle owner has not connected Telegram yet.' });
    }
  } else if (botToken) {
    try {
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const text = `🚨 *PARKSIGNAL ALERT*\n\n🚗 *Vehicle:* \`${vehicle.vehicle_number}\` (${vehicle.vehicle_type})\n⚠️ *Alert:* ${category}${customMessage ? `\n📝 *Note:* _"${customMessage}"_` : ''}\n🕒 ${dateStr}`;
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tg.chatId, text, parse_mode: 'Markdown' })
      });
      const tgData = await tgRes.json() as any;
      if (!tgData.ok) deliveryStatus = 'FAILED_BOT_ERROR';
    } catch {
      deliveryStatus = 'FAILED_BOT_ERROR';
    }
  }

  store.alerts.unshift({
    id: crypto.randomUUID(),
    vehicle_id: vehicle.id,
    vehicle_number: vehicle.vehicle_number,
    vehicle_type: vehicle.vehicle_type,
    nickname: vehicle.nickname,
    alert_type: 'TEXT',
    alert_category: category,
    custom_message: customMessage || null,
    delivery_status: deliveryStatus,
    created_at: Date.now()
  });

  if (deliveryStatus === 'DELIVERED') {
    res.json({ success: true, delivered: true, message: 'Alert delivered to vehicle owner successfully!' });
  } else {
    res.status(502).json({ success: false, delivered: false, error: 'Telegram delivery failed.' });
  }
});

localParkSignalRouter.get('/alerts/history', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userVehicleIds = new Set<string>();
  for (const v of store.vehicles.values()) {
    if (v.ownerId === user.id) userVehicleIds.add(v.id);
  }

  const userAlerts = store.alerts.filter(a => userVehicleIds.has(a.vehicle_id));
  res.json({ alerts: userAlerts.slice(0, 50) });
});
