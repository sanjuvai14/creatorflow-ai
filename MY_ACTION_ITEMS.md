# CreateSoul AI — Launch checklist

Last verified: 2026-09-21

## Verified technical status
- [x] App code, UI, AI workspace, voice system, generation flow
- [x] Authentication, API protection, credits safeguards and database/RLS safeguards
- [x] CI build-verification workflow present
- [x] Vercel Git-connected production deployment verified READY
- [x] Production homepage verified HTTP 200
- [x] Production runtime errors checked for the last 24h — none found
- [x] Latest production deployment uses main commit 41d880047d7f3e39dcbaaa73feab99c5b375ab84
- [x] Latest production fix: removed invalid duplicate comma in tool category configuration

## Remaining technical verification
- [ ] Live authenticated AI endpoint smoke test with a real user session
- [ ] Live image-generation smoke test with an enabled image provider
- [ ] Payment provider integration and sandbox end-to-end test
- [ ] Social OAuth connection and publishing smoke tests
- [ ] Android/Capacitor build and APK artifact verification
- [ ] Reproducible dependency lockfile verification
- [ ] Final real-user acceptance test

## User/provider prerequisites
- [ ] Keep required API/provider secrets configured in Vercel/Supabase; never place secrets in source files.
- [ ] Enable/approve paid AI or image services only when the owner authorizes the cost.
- [ ] Complete payment merchant ownership/identity verification when required by the provider.
- [ ] Authorize the owner's YouTube/Instagram/Facebook/TikTok/LinkedIn/Shopify accounts before live publishing.
- [ ] Provide/approve payment provider credentials before real-money checkout is enabled.

## Launch rule
Payment and external publishing remain disabled until credentials, signatures/webhooks, authorization and end-to-end tests are verified. No item is marked complete merely because code exists.
