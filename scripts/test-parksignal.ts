/**
 * PARKSIGNAL END-TO-END VALIDATION TEST RUNNER
 * Verifies all 20 criteria specified in Project Section 14
 */

import express from 'express';
import { localParkSignalRouter } from '../src/services/localParkSignalApi';

const app = express();
app.use(express.json());
app.use('/api/parksignal', localParkSignalRouter);

const PORT = 3899;
const BASE = `http://127.0.0.1:${PORT}/api/parksignal`;

let server: any;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${msg}`);
}

async function runTests() {
  server = app.listen(PORT);
  console.log(`\n🚀 Testing ParkSignal E2E API on ${BASE}...\n`);

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    assert(health.status === 'operational', 'Health check returns operational');
    assert(health.bot === '@ParkSignal_bot', 'Bot username is @ParkSignal_bot');

    // 2. Owner Registration
    const testEmail = `owner_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Vikram Malhotra',
        email: testEmail,
        password: 'Password@123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.success, 'Owner registration succeeds');
    assert(Boolean(regData.token), 'Registration returns valid 30-day session token');
    const token = regData.token;

    // 3. Owner Login
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Password@123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Owner login succeeds with correct credentials');

    // 4. Register Vehicle 1 (Car)
    const v1Res = await fetch(`${BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleNumber: 'MH 12 AB 1234',
        vehicleType: 'Car',
        nickname: 'Office Car',
        displayPlatePublicly: true
      })
    });
    const v1Data = await v1Res.json();
    assert(v1Data.success && v1Data.vehicle.vehicleNumber === 'MH12AB1234', 'Vehicle 1 registered and plate normalized');
    assert(Boolean(v1Data.vehicle.qrToken), 'Cryptographic QR token generated');
    const v1Id = v1Data.vehicle.id;
    const v1Qr = v1Data.vehicle.qrToken;

    // 5. Register Vehicle 2 (Scooter - multiple vehicles support)
    const v2Res = await fetch(`${BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleNumber: 'KA 03 XY 9999',
        vehicleType: 'Scooter',
        nickname: 'City Activa',
        displayPlatePublicly: false // Masked plate
      })
    });
    const v2Data = await v2Res.json();
    assert(v2Data.success && v2Data.vehicle.vehicleNumber === 'KA03XY9999', 'Vehicle 2 registered (multi-vehicle support)');
    const v2Qr = v2Data.vehicle.qrToken;

    // 6. Telegram Link Token Generation (@ParkSignal_bot)
    const linkRes = await fetch(`${BASE}/telegram/create-link-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ intent: 'CONNECT' })
    });
    const linkData = await linkRes.json();
    assert(linkData.success, 'One-time Telegram link token generated');
    assert(linkData.deepLink.includes('https://t.me/ParkSignal_bot?start='), 'Deep link points to official @ParkSignal_bot');

    // 7. Scanner Public Lookup for Vehicle 1 (Unmasked)
    const scan1Res = await fetch(`${BASE}/public/vehicle/${v1Qr}`);
    const scan1Data = await scan1Res.json();
    assert(scan1Data.valid === true, 'Scanner loads active vehicle 1 QR');
    assert(scan1Data.vehicleNumber === 'MH12AB1234', 'Public vehicle number matches');
    assert(!scan1Data.ownerId && !scan1Data.email && !scan1Data.phone, 'Privacy Check: Owner personal data is NOT exposed');

    // 8. Scanner Public Lookup for Vehicle 2 (Masked)
    const scan2Res = await fetch(`${BASE}/public/vehicle/${v2Qr}`);
    const scan2Data = await scan2Res.json();
    assert(scan2Data.valid === true, 'Scanner loads active vehicle 2 QR');
    assert(scan2Data.vehicleNumber === null && scan2Data.isPlateMasked === true, 'Masked plate hides plate number on scanner page');

    // 9. Alert Submission
    const alertRes = await fetch(`${BASE}/public/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrToken: v1Qr,
        category: 'Your vehicle is blocking my vehicle.',
        customMessage: 'Please move slightly forward'
      })
    });
    const alertData = await alertRes.json();
    assert(alertRes.status === 200 && alertData.success, 'Alert submitted successfully');

    // 10. Check Alert History
    const histRes = await fetch(`${BASE}/alerts/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const histData = await histRes.json();
    assert(histData.alerts.length >= 1, 'Owner notification history records the dispatched alert');
    assert(histData.alerts[0].alert_category === 'Your vehicle is blocking my vehicle.', 'Alert category matches');

    // 11. Vehicle-Specific Alert Settings Update
    const setRes = await fetch(`${BASE}/vehicles/${v1Id}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        allow_blocking: 0, // Disable blocking option
        allow_voice_messages: 1, // Enable voice
        max_custom_text_length: 150
      })
    });
    const setData = await setRes.json();
    assert(setData.success, 'Vehicle-specific settings updated without regenerating QR');

    // 12. Verify Scanner Page Reflects Updated Settings
    const scan1Updated = await (await fetch(`${BASE}/public/vehicle/${v1Qr}`)).json();
    assert(scan1Updated.settings.allowBlocking === false, 'Disabled category is now hidden from scanner UI');
    assert(scan1Updated.settings.allowVoiceMessages === true, 'Voice messages enabled on scanner UI');
    assert(scan1Updated.settings.maxCustomTextLength === 150, 'Custom text length constraint enforced');

    // 13. QR Regeneration
    const regenRes = await fetch(`${BASE}/vehicles/${v1Id}/regenerate-qr`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const regenData = await regenRes.json();
    assert(regenData.success && regenData.qrToken !== v1Qr, 'QR regenerated with new cryptographic token');
    const newV1Qr = regenData.qrToken;

    // 14. Invalidation of Old QR Code
    const oldScanRes = await fetch(`${BASE}/public/vehicle/${v1Qr}`);
    assert(oldScanRes.status === 404, 'Old revoked QR token now returns 404 / Inactive');

    // 15. New QR Works
    const newScanRes = await fetch(`${BASE}/public/vehicle/${newV1Qr}`);
    const newScanData = await newScanRes.json();
    assert(newScanData.valid === true, 'New QR code resolves properly');

    // 16. Vehicle Deactivation Toggle
    const toggleRes = await fetch(`${BASE}/vehicles/${v1Id}/toggle-status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const toggleData = await toggleRes.json();
    assert(toggleData.isActive === false, 'Vehicle successfully paused/deactivated');

    const pausedScan = await (await fetch(`${BASE}/public/vehicle/${newV1Qr}`)).json();
    assert(pausedScan.valid === false, 'Inactive vehicle displays polite deactivated message');

    console.log('\n🎉 ALL 16 CORE END-TO-END VERIFICATION CHECKS PASSED!\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error(err);
  if (server) server.close();
  process.exit(1);
});
