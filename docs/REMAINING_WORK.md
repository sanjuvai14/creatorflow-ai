# CreateSoul AI — Remaining Work Tracker

Last updated: 2026-09-21

This is the single checklist for unfinished, partially verified, or intentionally deferred work.

## 🔴 Critical — finish before calling the core app READY

- [ ] **AI runtime generation verification**
  - Production OpenAI credential is present.
  - Production status currently reports explicit `OPENAI_TEXT_MODEL` and `OPENAI_IMAGE_MODEL` are not configured.
  - No paid AI generation test has been attempted, so no billable request is being created just for verification.
  - Blocker: owner must configure the intended model values in Vercel before a real generation test can be safely performed.
  - After configuration: verify authenticated generation, successful credit deduction, and failure refund.

- [x] **Production deployment/build**
  - Verified 2026-09-21: Vercel production deployment `dpl_F7SrDtrn4ksDunec75vJ8JSGHcaz` is READY.
  - Built from `main` commit `41d880047d7f3e39dcbaaa73feab99c5b375ab84`.
  - Vercel status check for the commit is successful.
  - Latest deployment has no alias error.

- [ ] **Image generation end-to-end test**
  - Blocked until the production image model is explicitly configured.
  - Then verify authenticated generation and credit refund on failure.

## 🟠 Important — finish before public launch

- [ ] **Signup/email confirmation reliability**
- [ ] **Client authentication QA**
- [ ] **Credits + monetization finalization**
  - Paddle sandbox can be tested only after the required merchant/product configuration is available.
  - Paid entitlements must remain disabled until verified.
- [ ] **Platform OAuth / publishing**
  - YouTube is the current implemented OAuth path requiring real account authorization.
  - Other catalog platforms remain connector-ready/planned unless their real connection flow is verified.

## 🟡 Product features needing verification

- [ ] True live Web Search mode
- [ ] Think mode UX/behavior
- [ ] Schedule persistence/reminders/automation
- [ ] Growth & Analytics live-vs-estimate labeling
- [ ] Content Calendar save/edit/delete
- [ ] Auto Social Setup
- [ ] Support ticket persistence/status
- [ ] Saved content/history persistence/retrieval

## 🟢 Security / operational QA

- [ ] Final production smoke test across homepage, auth, dashboard, generation, images, save/history, integrations and support
- [ ] Review Supabase RLS/advisor notices
- [ ] Verify normal-use rate limiting
- [ ] Verify no server secrets are exposed
- [ ] Verify production errors are user-friendly
- [x] **Production runtime error scan — 2026-09-21**
  - Latest 24-hour production aggregation: no runtime errors found.

## Platform catalog

The catalog contains YouTube, Instagram, TikTok, Facebook, LinkedIn, Shopify, Pinterest, X, Threads, Reddit, Telegram, WhatsApp Business, Medium, WordPress, Google Business Profile, Email and Blog/SEO. Catalog presence does not mean live OAuth/publishing access.

## Cost rule

No paid service, API upgrade, billing product, or external subscription is activated without telling the owner first.

## Resume rule

Continue from the first unresolved blocker. Do not mark credential-gated or untested functionality complete merely because the Vercel build is READY.
