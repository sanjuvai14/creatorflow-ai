# CreateSoul AI — Billing & Deployment Handoff
Last verified: 2026-09-27 18:00 UTC

## Project
- GitHub: sanjuvai14/creatorflow-ai
- Vercel project: creatorflow-ai
- Vercel project ID: prj_XJK2osiiNSXw65MwFXLzDi89rLZf
- Vercel team: sanjuvai14 (team_BhFuNJYuliRvrkZUuT4Dssoi)
- A production deployment was triggered automatically from the latest billing commits; final READY status must be rechecked after the build completes.
- Latest GitHub commit: 5d268785f51932c82931fe41efcd49f7aceacca0
- Latest commit message: chore: document expanded Paddle price configuration

## Paddle prices configured in Sandbox
1. $4.99 one-time AI credit purchase — pri_01m3hrj4baqgr45r2pgg4jj2pv
2. $99.99 yearly subscription — pri_01m3hrepn4842scdvvtbgfbdqf
3. $9.99 monthly subscription — pri_01m3hrbhadjh70fdw2jspx67z2
4. $4.99 monthly Starter
5. $19.99 monthly Creator — pri_01m3hry5rd48f7cfvaarhmzd9q
6. $199.99 yearly Creator — pri_01m3hs19zad22c8fx5xmkpsw6s

## Paddle notification destination
- Environment: Sandbox
- Usage type: Both
- Events: 56 / All
- URL currently configured in Paddle:
  https://creatorflow-ai-sanjuvai14.vercel.app/api/billing/webhook
- Destination status: Active

## Paddle simulation
- Simulation: CreateSoul AI Subscription Test
- ID: ntfsim_01m3htghgyjx6rs1fqjhftg58x
- Scenario: Subscription created from a checkout
- Configuration saved:
  Customer: New customer
  Business: None
  Discount: Not provided
  Line items: Price
  Product: CreateSoul AI
  Price: $9.99 Monthly
  Quantity: 1
- Important: configuration is saved, but an actual simulation run/delivery has NOT been verified because the Run simulation action was not available/clickable in the user's current Paddle UI.
- Do not create another simulation unless the existing simulation is confirmed invalid.

## Vercel webhook verification
Checked production runtime errors for /api/billing/webhook over the last 24 hours:
- No runtime errors found.
- No matching runtime logs found.
Interpretation: this confirms no observed webhook failure, but it does not prove a Paddle simulation delivery occurred.

## Current application billing implementation
Relevant files:
- app/api/billing/checkout/route.ts
- app/api/billing/webhook/route.ts
- app/api/billing/status/route.ts
- app/api/billing/transactions/route.ts
- app/pricing/page.tsx
- .env.example

Webhook implementation includes:
- Paddle signature verification
- timestamp tolerance
- primary/secondary webhook secret support
- subscription event processing
- transaction paid/completed/failed/past_due/canceled processing
- credit-price map support
- adjustment/refund handling
- Supabase RPC processing
- idempotency delegated to billing RPC/event IDs

## Important code/config mismatch to resolve before enabling real money
The checkout and webhook code have now been expanded to support a Starter plan and a one-time credit purchase through server-side environment mappings. The environment template now documents PADDLE_STARTER_PRICE_ID and PADDLE_CREDIT_PRICE_ID in addition to the existing plan mappings.

The pricing UI still needs to be aligned with the exact final six-price catalog, because the exact missing Starter annual price/ID and the final business naming of the $9.99/$99.99 pair have not been verified from Paddle. Real billing must NOT be enabled until the app's plan catalog and Vercel environment variables are aligned with the intended six-price CreateSoul catalog.

## Resume procedure
1. Verify the exact six Paddle prices and align the pricing UI/server-side mappings with them.
2. Ensure Vercel production environment variables contain the matching Paddle API key, webhook secret, billing-enabled flag, environment, subscription price IDs, and credit map.
3. Deploy and verify production build.
4. Run a Paddle Sandbox checkout using a configured subscription price.
5. Verify Paddle signed webhook delivery to /api/billing/webhook.
6. Verify Supabase subscription/transaction/credit records.
7. Verify duplicate webhook idempotency.
8. Verify refund/adjustment credit reversal.
9. Only after Sandbox E2E passes, prepare Paddle Live notification destination and Live credentials.
10. Never mark Live billing ready merely because Sandbox configuration is complete.

## Security
Never store Paddle API keys or webhook secrets in this document, GitHub, or client-side code. They belong only in Vercel server-side environment variables/Paddle dashboard.


## Changes made in this work session
- Expanded app/api/billing/checkout/route.ts to accept starter, creator, pro, and credit purchases via server-side price environment variables.
- Added purchase_type metadata so credit purchases are distinguishable from subscriptions.
- Expanded app/api/billing/webhook/route.ts to recognize the Starter plan.
- Expanded .env.example with PADDLE_STARTER_PRICE_ID and PADDLE_CREDIT_PRICE_ID.
- GitHub commits created automatically from these changes: 8b3ddf8e4ba5259ce00013a9efbad0f972e3a04d, b784f9c99b6eb5987a36f36ea6cc35e5eb14718b, 5d268785f51932c82931fe41efcd49f7aceacca0.
- Vercel automatically started production deployments for these commits; final build/READY verification remains required.

## Hard blocker before final billing completion
- The exact missing Starter annual price ID and the definitive mapping/name for the $9.99 monthly + $99.99 yearly pair are not available in the verified record. Do not guess these values.
- Paddle simulation run/delivery is still unverified. Paddle documentation confirms a configured simulation must be explicitly run before delivery results exist. The simulation's last-run state must be verified.
- Live Paddle billing has not been verified and must remain separate from Sandbox until Sandbox E2E succeeds.
