-- Align free and paid plan credit entitlements with the current pricing UI.
-- Free users who still have the untouched 25-credit grant are upgraded to 50.
-- Existing users who have already spent credits are not reset.
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 50;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 50)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_plan_credits(p_plan text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE p_plan
    WHEN 'free' THEN 50
    WHEN 'creator' THEN 300
    WHEN 'pro' THEN 750
    ELSE 0
  END;
$function$;

CREATE OR REPLACE FUNCTION public.refund_credit(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_credits integer;
BEGIN
  IF NOT (
    (auth.uid() IS NOT NULL AND auth.uid() = p_user_id)
    OR current_setting('request.jwt.claim.role', true) = 'service_role'
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.profiles
  SET credits = LEAST(
    credits + 1,
    CASE WHEN plan = 'free' THEN 50 ELSE credits + 1 END
  ), updated_at = now()
  WHERE id = p_user_id
  RETURNING credits INTO new_credits;

  IF new_credits IS NULL THEN
    RAISE EXCEPTION 'profile not found';
  END IF;
  RETURN new_credits;
END;
$function$;

UPDATE public.profiles
SET credits = 50, updated_at = now()
WHERE plan = 'free' AND credits = 25;
