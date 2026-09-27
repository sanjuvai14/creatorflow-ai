# CreateSoul AI — Billing & Deployment Handoff
Last verified: 2026-09-27

## Project
- GitHub: sanjuvai14/creatorflow-ai
- Vercel project: creatorflow-ai
- Vercel project ID: prj_XJK2osiiNSXw65MwFXLzDi89rLZf
- Vercel team: sanjuvai14 (team_BhFuNJYuliRvrkZUuT4Dssoi)
- Production deployment verified READY.
- Latest production commit: 275b2467d654bcaec8009ab4bc1f046d21806618
- Latest commit message: fix: report billing payment availability correctly

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
The current application code still expects only:
- PADDLE_CREATOR_PRICE_ID
- PADDLE_PRO_PRICE_ID
and the pricing UI currently displays $14.99 Creator and $29.99 Pro.

These do not match the six Paddle prices currently configured in Sandbox. Real billing must NOT be enabled until the app's plan catalog and Vercel environment variables are aligned with the intended six-price CreateSoul catalog.

## Resume procedure
1. Align application pricing and server-side price mapping with the six actual Paddle prices.
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
