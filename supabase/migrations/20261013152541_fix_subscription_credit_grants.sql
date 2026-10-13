-- Ensure subscription webhooks grant the published plan allowance once per billing period.
-- The app keeps one wallet balance, so renewal grants top the balance up to the plan allowance
-- rather than deleting unused or one-time purchased credits.
ALTER TABLE public.billing_subscriptions
  ADD COLUMN IF NOT EXISTS credits_granted_period_start timestamptz;

CREATE OR REPLACE FUNCTION public.sync_subscription_entitlements(
  p_user_id uuid,
  p_plan text,
  p_status text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_credits integer;
  normalized_plan text;
  target_credits integer;
BEGIN
  IF current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  normalized_plan := CASE
    WHEN lower(coalesce(p_plan, '')) IN ('creator', 'pro') THEN lower(p_plan)
    ELSE 'free'
  END;
  IF lower(coalesce(p_status, '')) IN ('active', 'trialing') AND normalized_plan <> 'free' THEN
    SELECT public.get_plan_credits(normalized_plan) INTO target_credits;
    UPDATE public.profiles
      SET plan = normalized_plan, credits = greatest(credits, target_credits), updated_at = now()
      WHERE id = p_user_id RETURNING credits INTO new_credits;
  ELSE
    UPDATE public.profiles SET plan = 'free', updated_at = now()
      WHERE id = p_user_id RETURNING credits INTO new_credits;
  END IF;
  IF new_credits IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  RETURN new_credits;
END;
$function$;

CREATE OR REPLACE FUNCTION public.process_billing_subscription_event(
  p_provider text, p_event_id text, p_event_type text, p_user_id uuid,
  p_customer_id text, p_subscription_id text, p_plan text, p_status text,
  p_period_start timestamptz DEFAULT NULL, p_period_end timestamptz DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid;
  v_existing_status text;
  v_granted_period timestamptz;
  v_target_credits integer;
  v_current_credits integer;
  v_credit_delta integer := 0;
  v_paid_plan text;
BEGIN
  IF p_provider IS NULL OR p_event_id IS NULL OR p_event_type IS NULL
     OR p_user_id IS NULL OR p_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Missing subscription billing identifiers';
  END IF;

  INSERT INTO public.billing_events(provider, provider_event_id, event_type, status)
  VALUES (p_provider, p_event_id, p_event_type, 'received')
  ON CONFLICT (provider, provider_event_id) DO NOTHING
  RETURNING id INTO v_event_id;

  IF v_event_id IS NULL THEN
    SELECT id, status INTO v_event_id, v_existing_status
    FROM public.billing_events
    WHERE provider = p_provider AND provider_event_id = p_event_id
    FOR UPDATE;
    IF v_existing_status = 'processed' THEN
      RETURN jsonb_build_object('duplicate', true);
    ELSIF v_existing_status = 'received' THEN
      RETURN jsonb_build_object('processing', true);
    ELSIF v_existing_status = 'failed' THEN
      UPDATE public.billing_events SET status = 'received', error_message = NULL, event_type = p_event_type
      WHERE id = v_event_id;
    ELSE
      RAISE EXCEPTION 'Unknown billing event state';
    END IF;
  END IF;

  SELECT credits_granted_period_start INTO v_granted_period
  FROM public.billing_subscriptions
  WHERE provider = p_provider AND provider_subscription_id = p_subscription_id
  FOR UPDATE;

  INSERT INTO public.billing_subscriptions(
    user_id, provider, provider_customer_id, provider_subscription_id, plan, status,
    current_period_start, current_period_end, credits_granted_period_start
  )
  VALUES (
    p_user_id, p_provider, p_customer_id, p_subscription_id,
    coalesce(p_plan, 'free'), coalesce(p_status, 'pending'), p_period_start, p_period_end,
    CASE
      WHEN p_period_start IS NOT NULL AND p_period_start IS DISTINCT FROM v_granted_period
       AND lower(coalesce(p_status, '')) IN ('active', 'trialing')
       AND lower(coalesce(p_plan, '')) IN ('creator', 'pro')
      THEN p_period_start ELSE v_granted_period
    END
  )
  ON CONFLICT (provider, provider_subscription_id) DO UPDATE SET
    user_id = excluded.user_id,
    provider_customer_id = coalesce(excluded.provider_customer_id, billing_subscriptions.provider_customer_id),
    plan = excluded.plan,
    status = excluded.status,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    credits_granted_period_start = CASE
      WHEN excluded.credits_granted_period_start IS NOT NULL THEN excluded.credits_granted_period_start
      ELSE billing_subscriptions.credits_granted_period_start
    END,
    updated_at = now();

  v_paid_plan := CASE
    WHEN lower(coalesce(p_plan, '')) IN ('creator', 'pro') THEN lower(p_plan)
    ELSE NULL
  END;

  IF lower(coalesce(p_status, '')) IN ('active', 'trialing') AND v_paid_plan IS NOT NULL THEN
    UPDATE public.profiles SET plan = v_paid_plan, updated_at = now() WHERE id = p_user_id;
    IF p_period_start IS NOT NULL AND p_period_start IS DISTINCT FROM v_granted_period THEN
      v_target_credits := public.get_plan_credits(v_paid_plan);
      SELECT credits INTO v_current_credits FROM public.profiles WHERE id = p_user_id FOR UPDATE;
      IF v_current_credits IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
      v_credit_delta := greatest(0, v_target_credits - v_current_credits);
      IF v_credit_delta > 0 THEN
        UPDATE public.profiles SET credits = credits + v_credit_delta, updated_at = now() WHERE id = p_user_id;
        INSERT INTO public.credit_ledger(
          user_id, delta, reason, provider, provider_event_id, provider_transaction_id, metadata
        )
        VALUES (
          p_user_id, v_credit_delta, 'subscription_allowance', p_provider, p_event_id, NULL,
          coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
            'plan', v_paid_plan, 'period_start', p_period_start, 'period_end', p_period_end
          )
        )
        ON CONFLICT (provider, provider_event_id) DO NOTHING;
      END IF;
    END IF;
  ELSIF lower(coalesce(p_status, '')) IN ('canceled', 'paused') THEN
    UPDATE public.profiles SET plan = 'free', updated_at = now() WHERE id = p_user_id;
  END IF;

  UPDATE public.billing_events SET status = 'processed', processed_at = now(), error_message = NULL
  WHERE id = v_event_id;
  RETURN jsonb_build_object('processed', true, 'creditsGranted', v_credit_delta, 'periodStart', p_period_start);
EXCEPTION WHEN OTHERS THEN
  IF v_event_id IS NOT NULL THEN
    UPDATE public.billing_events SET status = 'failed', error_message = left(sqlerrm, 1000) WHERE id = v_event_id;
  END IF;
  RAISE;
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_subscription_entitlements(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_subscription_entitlements(uuid, text, text) TO service_role;
REVOKE ALL ON FUNCTION public.process_billing_subscription_event(text, text, text, uuid, text, text, text, text, timestamptz, timestamptz, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_billing_subscription_event(text, text, text, uuid, text, text, text, text, timestamptz, timestamptz, jsonb) TO service_role;
