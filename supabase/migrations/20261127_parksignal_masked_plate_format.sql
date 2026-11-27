-- Update get_parksignal_vehicle_by_qr to return masked plate format (e.g., GJ06 •••• 88)
-- instead of NULL when display_plate_publicly is FALSE.

CREATE OR REPLACE FUNCTION public.get_parksignal_vehicle_by_qr(p_qr_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec RECORD;
  v_clean_plate TEXT;
  v_display_plate TEXT;
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

  v_clean_plate := UPPER(TRIM(COALESCE(v_rec.vehicle_number, '')));
  IF v_rec.display_plate_publicly = TRUE THEN
    v_display_plate := v_clean_plate;
  ELSIF LENGTH(v_clean_plate) > 4 THEN
    v_display_plate := LEFT(v_clean_plate, 4) || ' •••• ' || RIGHT(v_clean_plate, 2);
  ELSE
    v_display_plate := '••••';
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'vehicleType', v_rec.vehicle_type,
    'vehicleNumber', v_display_plate,
    'isPlateMasked', (v_rec.display_plate_publicly = FALSE),
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
