# CreatorFlow AI — User Action Items

এই ফাইলটিতে শুধু সেই কাজগুলো রাখা হবে যেগুলো CreatorFlow AI সম্পূর্ণ করতে SANJOY BANIK-এর নিজের পক্ষ থেকে করতে হবে। বাকি implementation, code, deployment, verification এবং technical fixes assistant করবে/যতটা সম্ভব connected tools দিয়ে সম্পন্ন করবে।

## এখনই আমার কাছ থেকে যা লাগতে পারে

- [ ] **কোনো API key / secret / password এখানে চ্যাটে পাঠাবেন না।** প্রয়োজন হলে Vercel/Supabase-এর নিজ নিজ dashboard-এ নিজে গিয়ে নিরাপদে সেট করবেন।
- [ ] **Paid service বা paid API চালু করার আগে অনুমোদন দিন।** আপনার অনুমতি ছাড়া কোনো paid service activate করা হবে না।
- [ ] **Email/Google/phone authentication-এর জন্য প্রয়োজনীয় account verification** (যেমন email confirmation) আপনার নিজের inbox/device থেকে সম্পন্ন করতে হবে।
- [ ] **যদি Supabase-এর default email rate limit production testing-এর জন্য যথেষ্ট না হয়**, custom SMTP নেওয়ার সিদ্ধান্ত/অনুমোদন আপনার কাছ থেকে লাগবে; খরচ থাকলে আগে জানানো হবে।
- [ ] **Payment provider** বেছে নেওয়া ও merchant/account verification আপনার পক্ষ থেকে করতে হবে যখন monetization চালু করার সময় আসবে।
- [ ] **Real social-platform publishing/analytics connections** (YouTube, Instagram, Facebook, TikTok, LinkedIn, Shopify ইত্যাদি) চালু করতে হলে সংশ্লিষ্ট account-এ OAuth/permission approval আপনার পক্ষ থেকে করতে হবে।
- [ ] **Platform terms/permissions/verification** যদি কোনো provider আপনার account owner হিসেবে চায়, সেই approval/verification আপনাকেই করতে হবে।
- [ ] **Final real-user acceptance test:** familiar test users দিয়ে signup → login → chat → image → voice → history → credits → support flow হাতে পরীক্ষা করে ফল জানাতে হবে।

## যখন আমি বলব “আপনার কাজ আছে”

আমি আগে স্পষ্ট করে জানাব:
1. ঠিক কোন dashboard/site খুলতে হবে।
2. কোন setting/field-এ যেতে হবে।
3. কী value দিতে হবে (secret নিজে টাইপ করলে এখানে শেয়ার করার দরকার নেই)।
4. কাজটি কেন দরকার।
5. কোনো খরচ হলে আগে জানাব।

## যা আমি নিজে এগিয়ে নেব

- App code এবং UI improvements
- AI workspace/chat flow
- Voice-agent browser layer এবং safe creator actions
- AI generation/image generation integration ও error handling
- Chat/history persistence
- Credits/refund safeguards
- Support Center improvements
- Build/deployment checks
- Production smoke tests ও runtime-error checks
- Security/RLS-related technical checks
- Creator tools/workflows-এর implementation
- Documentation এবং remaining-work tracking

## গুরুত্বপূর্ণ

এই তালিকা একটি living checklist। নতুন কোনো কাজ আপনার পক্ষ থেকে প্রয়োজন হলে এখানে যোগ করা হবে। কোনো secret, password, private token বা API key এই ফাইলে রাখা হবে না।
