# CreatorFlow AI — Remaining Work Tracker

Last updated: 2026-09-19

This file is the single checklist for unfinished, partially verified, or intentionally deferred work. Update it whenever a task is completed.

## 🔴 Critical — finish before calling the core app READY

- [ ] **AI runtime generation verification**
  - Confirm the production runtime sees the configured AI provider key without exposing any secret.
  - Confirm `/api/generate` returns a real AI response for an authenticated user.
  - Confirm credits are consumed only on successful provider resolution/output and refunded on failure.
  - Current blocker: explicit text/image model configuration is not present in production, so a real paid-provider generation test cannot be performed yet.

- [x] **Production environment verification**
  - Verified 2026-09-19: production deployment `dpl_8mgf8f4vPYS485HpAnkrEfdFh4wN` is `READY` and built from `main` commit `54720e37814740df1da7e4861753b66bee9bd455`.
  - `/api/health` returns 200; `/api/ai-status-public` returns 200 and reports provider/model readiness without exposing secrets.
  - Current production status reports the OpenAI credential is present, but explicit text/image model configuration is not present, so paid AI generation remains intentionally disabled.
  - `/api/system/status` correctly requires authentication.
  - Do not paste API keys into GitHub, chat, or client-side code.

- [ ] **Image generation end-to-end test**
  - Verify authenticated image generation with the configured image model.
  - Verify failed image generation refunds credits.

## 🟠 Important — finish before public launch

- [ ] **Signup/email confirmation reliability**
  - Re-test new-user signup and confirmation-link flow.
  - Resolve any confirmation page/reload issue.
  - Re-test Supabase email rate-limit behavior for normal client onboarding.

- [ ] **Client authentication QA**
  - Test email/password signup, login, logout, session persistence and protected routes.
  - Verify Google/phone login only after their provider configuration is actually present.

- [ ] **Credits + monetization finalization**
  - Verify free-plan credit rules and deduction/refund behavior.
  - Configure Paddle product/price/customer metadata only when ready.
  - Verify billing webhook end-to-end in sandbox before paid launch.
  - Do not activate paid entitlements until the billing configuration is complete and tested.

- [ ] **Platform OAuth / publishing**
  - YouTube OAuth connection needs end-to-end verification.
  - Clearly distinguish connected/live integrations from connector-ready/planned platforms.
  - Complete write/publish permissions only where supported and properly configured.

## 🟡 Product features that are present but need real-world verification

- [ ] Search Web mode: currently UI/mode behavior; implement and verify true live web search before marketing it as live search.
- [ ] Think mode: verify deeper-reasoning behavior and UX.
- [ ] Schedule: verify actual persistence/reminders/automation behavior.
- [ ] Growth & Analytics: verify calculations and clearly label estimates vs live platform metrics.
- [ ] Content Calendar: verify save/edit/delete flows.
- [ ] Auto Social Setup: verify actual connection/setup flows.
- [ ] Support Center/ticket flow: verify persistence and user-facing status.
- [ ] Saved content/generation history: verify end-to-end persistence and retrieval.

## 🟢 Security / operational QA

- [ ] Run final production smoke test across homepage, auth, dashboard, generation, images, save/history, integrations and support.
- [ ] Review Supabase RLS/advisor notices again before launch; do not weaken RLS just to remove informational notices.
- [ ] Verify rate limiting under normal client usage.
- [ ] Verify no server secrets are exposed in browser responses/logs.
- [ ] Verify production error messages are user-friendly and do not reveal internal configuration.
- [x] **Production runtime error scan — 2026-09-19**
  - Checked the production project runtime error aggregation for the last 24 hours.
  - Result: no runtime errors found in the selected time range.
  - Historical errors remain in the 7-day aggregation, including an older billing-webhook configuration error and an older middleware Supabase configuration error; these were not observed in the latest 24-hour scan.

## Platform catalog status

The app catalog includes YouTube, Instagram, TikTok, Facebook, LinkedIn, Shopify, Pinterest, X, Threads, Reddit, Telegram, WhatsApp Business, Medium, WordPress, Google Business Profile, Email and Blog/SEO. **Catalog presence does not mean a live OAuth/publishing integration.** Each platform must be marked live only after its real connection flow is verified.

## Cost rule

No paid service, API upgrade, billing product, or external subscription should be activated without telling the owner first.

## Resume instruction

When continuing work, start with the first unchecked 🔴 item, then move to 🟠, then 🟡. Do not skip an unresolved blocker merely because the Vercel build is READY.
