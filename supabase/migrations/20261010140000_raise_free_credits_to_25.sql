-- Raise the free-plan allowance to 25 credits.
-- Existing free users at the old untouched 10-credit grant are upgraded;
-- users who have already spent credits are not reset.
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 25;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 25)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
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
    CASE WHEN plan = 'free' THEN 25 ELSE credits + 1 END
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
SET credits = 25, updated_at = now()
WHERE plan = 'free' AND credits = 10;
