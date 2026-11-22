// ==============================================================================
// Supabase Edge Function: parksignal-alert
// Description: Secure public parking alert dispatcher (Text & Voice Notes)
// Product: ParkSignal by BharatUtility
// Official Bot: @ParkSignal_bot
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Sliding-window rate limit checker
async function checkRateLimit(supabase: any, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();

  const { data: rec } = await supabase
    .from("parksignal_rate_limits")
    .select("count, reset_at")
    .eq("key", key)
    .maybeSingle();

  if (!rec || new Date(rec.reset_at).getTime() < now.getTime()) {
    await supabase.from("parksignal_rate_limits").upsert({
      key,
      count: 1,
      reset_at: resetAt,
    });
    return true;
  }

  if (rec.count >= limit) {
    return false;
  }

  await supabase
    .from("parksignal_rate_limits")
    .update({ count: rec.count + 1 })
    .eq("key", key);

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "127.0.0.1";
  const ipHash = await sha256Hex(ip);

  try {
    const contentType = req.headers.get("content-type") || "";

    // ─────────────────────────────────────────────────────────────
    // 1. VOICE ALERT DISPATCH (multipart/form-data)
    // ─────────────────────────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const qrToken = formData.get("qrToken") as string;
      const category = (formData.get("category") as string) || "Voice Alert";
      const voiceBlob = formData.get("voice") as File;
      const durationSeconds = parseInt((formData.get("durationSeconds") as string) || "0", 10);

      if (!qrToken || !voiceBlob) {
        return new Response(JSON.stringify({ error: "QR token and voice file are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rate limit IP: max 3 voice alerts per 10m
      const allowedIp = await checkRateLimit(supabase, `voice_ip:${ipHash}`, 3, 600);
      if (!allowedIp) {
        return new Response(JSON.stringify({ error: "Too many voice requests. Please wait a few minutes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch vehicle by QR
      const { data: qrRec } = await supabase
        .from("parksignal_qr_tokens")
        .select("vehicle_id, is_active")
        .eq("token", qrToken)
        .maybeSingle();

      if (!qrRec || !qrRec.is_active) {
        return new Response(JSON.stringify({ error: "Invalid or inactive QR code" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: vehicle } = await supabase
        .from("parksignal_vehicles")
        .select("id, owner_id, vehicle_number, vehicle_type, is_active")
        .eq("id", qrRec.vehicle_id)
        .maybeSingle();

      if (!vehicle || !vehicle.is_active) {
        return new Response(JSON.stringify({ error: "Vehicle is not currently accepting alerts" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: settings } = await supabase
        .from("parksignal_vehicle_settings")
        .select("allow_voice_messages")
        .eq("vehicle_id", vehicle.id)
        .maybeSingle();

      if (settings?.allow_voice_messages !== true) {
        return new Response(JSON.stringify({ error: "Voice messages are not enabled for this vehicle" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: tgAccount } = await supabase
        .from("parksignal_telegram_accounts")
        .select("telegram_chat_id, is_active")
        .eq("user_id", vehicle.owner_id)
        .maybeSingle();

      if (!tgAccount || !tgAccount.is_active || !tgAccount.telegram_chat_id) {
        return new Response(
          JSON.stringify({ success: false, delivered: false, error: "Vehicle owner has not connected Telegram notifications yet." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let deliveryStatus = "DELIVERED";
      if (botToken) {
        try {
          const tgForm = new FormData();
          tgForm.append("chat_id", tgAccount.telegram_chat_id);
          tgForm.append("voice", voiceBlob, "voice_alert.ogg");
          const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
          tgForm.append("caption", `🚨 *PARKSIGNAL VOICE ALERT*\n🚗 Vehicle: \`${vehicle.vehicle_number}\` (${vehicle.vehicle_type})\n⚠️ Alert: ${category}\n🕒 ${dateStr}\n\n_Delivered privately via ParkSignal_`);
          tgForm.append("parse_mode", "Markdown");

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendVoice`, {
            method: "POST",
            body: tgForm,
          });
          const tgData = await tgRes.json();
          if (!tgData.ok) deliveryStatus = "FAILED_BOT_ERROR";
        } catch {
          deliveryStatus = "FAILED_BOT_ERROR";
        }
      }

      // Record alert
      await supabase.from("parksignal_alerts").insert({
        vehicle_id: vehicle.id,
        alert_type: "VOICE",
        alert_category: category,
        voice_duration_seconds: durationSeconds,
        delivery_status: deliveryStatus,
        scanner_ip_hash: ipHash,
      });

      if (deliveryStatus === "DELIVERED") {
        return new Response(
          JSON.stringify({ success: true, delivered: true, message: "Voice alert sent to owner via Telegram successfully!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, delivered: false, error: "Failed to dispatch voice message. Please try sending a text alert instead." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. TEXT ALERT DISPATCH (application/json)
    // ─────────────────────────────────────────────────────────────
    const body = await req.json();
    const { qrToken, category, customMessage } = body;

    if (!qrToken || !category) {
      return new Response(JSON.stringify({ error: "QR token and category are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limits: max 5 alerts per IP / 10m
    const allowedIp = await checkRateLimit(supabase, `alert_ip:${ipHash}`, 5, 600);
    if (!allowedIp) {
      return new Response(JSON.stringify({ error: "Too many alerts sent recently. Please wait a few minutes." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch vehicle by QR
    const { data: qrRec } = await supabase
      .from("parksignal_qr_tokens")
      .select("vehicle_id, is_active")
      .eq("token", qrToken)
      .maybeSingle();

    if (!qrRec || !qrRec.is_active) {
      return new Response(JSON.stringify({ error: "Invalid or inactive QR code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle } = await supabase
      .from("parksignal_vehicles")
      .select("id, owner_id, vehicle_number, vehicle_type, is_active")
      .eq("id", qrRec.vehicle_id)
      .maybeSingle();

    if (!vehicle || !vehicle.is_active) {
      return new Response(JSON.stringify({ error: "Vehicle is not currently accepting alerts" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit vehicle: max 3 per 10m
    const allowedVehicle = await checkRateLimit(supabase, `veh:${vehicle.id}`, 3, 600);
    if (!allowedVehicle) {
      return new Response(JSON.stringify({ error: "Multiple alerts have already been sent to this vehicle recently. Please allow the owner time to respond." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tgAccount } = await supabase
      .from("parksignal_telegram_accounts")
      .select("telegram_chat_id, is_active")
      .eq("user_id", vehicle.owner_id)
      .maybeSingle();

    if (!tgAccount || !tgAccount.is_active || !tgAccount.telegram_chat_id) {
      return new Response(
        JSON.stringify({ success: false, delivered: false, error: "The vehicle owner has not connected notifications yet." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedNote = customMessage ? String(customMessage).trim().substring(0, 300) : null;
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
    const textMsg = `🚨 *PARKSIGNAL VEHICLE ALERT* 🚨\n\n🚗 *Vehicle:* \`${vehicle.vehicle_number}\` (${vehicle.vehicle_type})\n⚠️ *Alert:* ${category}${sanitizedNote ? `\n📝 *Note:* _"${sanitizedNote}"_` : ""}\n🕒 *Time:* ${dateStr}\n\n_Sent safely via ParkSignal QR • 100% Privacy Protected_`;

    let deliveryStatus = "DELIVERED";
    if (botToken) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgAccount.telegram_chat_id,
            text: textMsg,
            parse_mode: "Markdown",
          }),
        });
        const tgData = await tgRes.json();
        if (!tgData.ok) deliveryStatus = "FAILED_BOT_ERROR";
      } catch {
        deliveryStatus = "FAILED_BOT_ERROR";
      }
    }

    // Record alert
    await supabase.from("parksignal_alerts").insert({
      vehicle_id: vehicle.id,
      alert_type: "TEXT",
      alert_category: category,
      custom_message: sanitizedNote,
      delivery_status: deliveryStatus,
      scanner_ip_hash: ipHash,
    });

    if (deliveryStatus === "DELIVERED") {
      return new Response(
        JSON.stringify({ success: true, delivered: true, message: "Alert delivered to vehicle owner successfully!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, delivered: false, error: "Failed to deliver message via Telegram. Please try again shortly." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
