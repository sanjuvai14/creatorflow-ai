# CreateSoul AI — আপনার কাজ

শুধু যেগুলো সত্যিই আপনার হাতে করতে হবে সেগুলো এখানে থাকবে। বাকি technical কাজ আমি এগিয়ে নেব।

## আপনার হাতে
- [ ] Vercel/Supabase-এ required secret/API key নিজে দেওয়া — secret এখানে চ্যাটে পাঠাবেন না।
- [ ] Paid service/API চালু করার অনুমতি — কোনো খরচ হলে আগে জানানো হবে।
- [ ] নিজের social accounts (YouTube/Instagram/Facebook/TikTok/LinkedIn/Shopify ইত্যাদি) OAuth authorization দেওয়া, যখন live publishing চালু করা হবে।
- [ ] Payment merchant/account ownership বা identity verification, যদি provider আপনার উপস্থিতি চায়।

## AI/technical work
- [x] App code, UI, AI workspace, voice system, generation flow
- [x] Authentication, API protection, credits safeguards ও database/RLS safeguards
- [x] CI build-verification workflow added
- [ ] Production typecheck/build verification
- [ ] Vercel production deployment verification — বর্তমানে Vercel team authorization blocker আছে
- [ ] Reproducible dependency lockfile verification
- [ ] Live AI endpoint smoke test
- [ ] Payment integration/provider technical implementation
- [ ] Social platform OAuth/connection implementation and automated smoke tests
- [ ] Android/Capacitor build verification and APK artifact verification
- [ ] Real-user acceptance test flow

## নিরাপত্তা
- কোনো password, secret, private token বা API key এই ফাইলে রাখা যাবে না।
- Payment এবং external publishing production mode-এ কেবল verified credentials/configuration থাকলে চালু হবে।
- কোনো paid service/API নিজে থেকে সক্রিয় করা হবে না।

## Status rule
কোনো build, deployment, OAuth, payment বা API integration সত্যি পরীক্ষা/সফলভাবে যাচাই না হওয়া পর্যন্ত সেটিকে "complete" বলা হবে না।
