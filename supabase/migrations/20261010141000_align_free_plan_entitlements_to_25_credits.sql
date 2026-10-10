-- Keep the free-plan entitlement helper in sync with the 25-credit signup grant.
CREATE OR REPLACE FUNCTION public.get_plan_credits(p_plan text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE p_plan
    WHEN 'free' THEN 25
    WHEN 'creator' THEN 100
    WHEN 'pro' THEN 300
    ELSE 0
  END;
$function$;
