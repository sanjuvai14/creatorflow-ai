# CreatorFlow AI — MVP v3

v3 adds persistent generation history, search, copy, save, delete, per-user server authorization, and a basic server-side credit system.

## Stack
- Next.js + TypeScript
- Supabase Auth/Postgres/RLS
- OpenAI Responses API + image generation from v2

## Setup
1. Copy `.env.example` to `.env.local`.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `OPENAI_API_KEY`.
3. Run `supabase/schema.sql` in Supabase SQL Editor.
4. Install and run:
   `npm install`
   `npm run dev`
5. Open `/login`, create an account, then use `/dashboard`.

## v3 features
- Every text generation is stored in `generations`.
- Each account starts with 10 credits; each successful text generation consumes 1 credit.
- `/history` provides search, copy, save and delete.
- Dashboard shows remaining credits and has a History button.
- Server routes verify the signed-in Supabase user before reading/writing data.
- `saved_images` table and RLS are prepared for persistent image storage in the next step.

## Important
This is still an MVP. Before public launch, add atomic credit deduction, monthly reset/entitlements, image storage in Supabase Storage, rate limiting, admin roles, billing, monitoring, and stronger production security.
