# CreatorFlow AI — Remaining Work Tracker

Last updated: 2026-09-15

This file is the single checklist for unfinished, partially verified, or intentionally deferred work. Update it whenever a task is completed.

## 🔴 Critical — finish before calling the core app READY

- [ ] **AI runtime generation verification**
  - Confirm the production runtime sees the configured AI provider key without exposing any secret.
  - Confirm `/api/generate` returns a real AI response for an authenticated user.
  - Confirm credits are consumed only on successful provider resolution/output and refunded on failure.
  - Current blocker: recent diagnostic deployment/runtime behavior has not yet proven provider availability end-to-end.

- [ ] **Production environment verification**
  - Verify the latest deployment is built from the current `main` commit and that runtime environment variables are available to server routes.
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

## Platform catalog status

The app catalog includes YouTube, Instagram, TikTok, Facebook, LinkedIn, Shopify, Pinterest, X, Threads, Reddit, Telegram, WhatsApp Business, Medium, WordPress, Google Business Profile, Email and Blog/SEO. **Catalog presence does not mean a live OAuth/publishing integration.** Each platform must be marked live only after its real connection flow is verified.

## Cost rule

No paid service, API upgrade, billing product, or external subscription should be activated without telling the owner first.

## Resume instruction

When continuing work, start with the first unchecked 🔴 item, then move to 🟠, then 🟡. Do not skip an unresolved blocker merely because the Vercel build is READY.
