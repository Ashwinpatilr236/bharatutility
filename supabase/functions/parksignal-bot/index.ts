// ==============================================================================
// Supabase Edge Function: parksignal-bot
// Description: Telegram Webhook handler for @ParkSignal_bot
// Product: ParkSignal by BharatUtility
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
  const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";

  // Verify Telegram secret token if configured
  if (webhookSecret) {
    const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (incomingSecret !== webhookSecret) {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const update = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const username = message.from?.username || message.from?.first_name || "Owner";

    // 1. Handle /start link_<token>
    if (text.startsWith("/start link_")) {
      const token = text.replace("/start ", "").trim();

      const { data: linkRec, error: linkErr } = await supabase
        .from("parksignal_telegram_link_tokens")
        .select("user_id, intent, expires_at, used_at")
        .eq("token", token)
        .maybeSingle();

      if (linkErr || !linkRec || linkRec.used_at !== null || new Date(linkRec.expires_at).getTime() < Date.now()) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "❌ This linking link has expired or has already been used.\n\nPlease open your ParkSignal dashboard on https://bharatutility.tech/parksignal/dashboard and click 'Connect Telegram' to generate a fresh link.",
            parse_mode: "Markdown",
          }),
        });
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Link telegram account
      const now = new Date().toISOString();
      await supabase
        .from("parksignal_telegram_accounts")
        .upsert(
          {
            user_id: linkRec.user_id,
            telegram_chat_id: chatId,
            telegram_username: message.from?.username || null,
            first_name: message.from?.first_name || "",
            is_active: true,
            linked_at: now,
          },
          { onConflict: "user_id" }
        );

      // Mark link token as used
      await supabase
        .from("parksignal_telegram_link_tokens")
        .update({ used_at: now })
        .eq("token", token);

      // Update profile
      await supabase
        .from("parksignal_profiles")
        .update({
          is_telegram_linked: true,
          telegram_username: message.from?.username || null,
          updated_at: now,
        })
        .eq("id", linkRec.user_id);

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ *ParkSignal Connected Successfully!*\n\nWelcome ${username}! Your Telegram account is now securely linked to ParkSignal by BharatUtility.\n\nYou will receive instant parking alerts and voice notes right here whenever someone scans your vehicle QR sticker.\n\nType /myvehicles to view your vehicles, or /help for guidance.`,
          parse_mode: "Markdown",
        }),
      });

      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Handle /unlink
    if (text === "/unlink") {
      const { data: tgAccount } = await supabase
        .from("parksignal_telegram_accounts")
        .select("user_id")
        .eq("telegram_chat_id", chatId)
        .maybeSingle();

      if (tgAccount) {
        await supabase
          .from("parksignal_telegram_accounts")
          .update({ is_active: false })
          .eq("telegram_chat_id", chatId);

        await supabase
          .from("parksignal_profiles")
          .update({ is_telegram_linked: false, updated_at: new Date().toISOString() })
          .eq("id", tgAccount.user_id);
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🔒 Your Telegram account has been disconnected from ParkSignal. You can reconnect anytime through your BharatUtility dashboard.",
          parse_mode: "Markdown",
        }),
      });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Handle /myvehicles
    if (text === "/myvehicles") {
      const { data: tgAccount } = await supabase
        .from("parksignal_telegram_accounts")
        .select("user_id")
        .eq("telegram_chat_id", chatId)
        .eq("is_active", true)
        .maybeSingle();

      if (!tgAccount) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⚠️ Your Telegram is not currently linked to a ParkSignal account. Log in at https://bharatutility.tech/parksignal to connect.",
          }),
        });
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { data: vehicles } = await supabase
        .from("parksignal_vehicles")
        .select("vehicle_number, vehicle_type, nickname, is_active")
        .eq("owner_id", tgAccount.user_id);

      const list = (vehicles || []).map((v: any, i: number) =>
        `${i + 1}. *${v.vehicle_number}* (${v.vehicle_type}) ${v.nickname ? `- ${v.nickname}` : ""} [${v.is_active ? "🟢 Active" : "🔴 Inactive"}]`
      ).join("\n") || "No registered vehicles found.";

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🚗 *Your Registered Vehicles:*\n\n${list}\n\nManage alerts and stickers in your dashboard: https://bharatutility.tech/parksignal/dashboard`,
          parse_mode: "Markdown",
        }),
      });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4. Default Help / Start
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🛡️ *ParkSignal by BharatUtility*\n\n_Your Vehicle. Your Privacy. Scan. Alert. Connect._\n\nCommands:\n• /myvehicles — View your registered vehicles\n• /unlink — Disconnect this Telegram account\n• /help — Show this guide\n\nVisit: https://bharatutility.tech/parksignal`,
        parse_mode: "Markdown",
      }),
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
