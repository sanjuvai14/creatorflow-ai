create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  plan text not null default 'free',
  credits integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_type text not null,
  language text not null,
  input_text text not null,
  output_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  type text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.saved_content enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "generations own rows" on public.generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved content own rows" on public.saved_content for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
-- CreatorFlow AI v3: saved images and safer per-user history
create table if not exists public.saved_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  image_url text not null,
  image_type text not null default 'generated',
  prompt text,
  created_at timestamptz not null default now()
);

alter table public.saved_images enable row level security;
drop policy if exists "saved images own rows" on public.saved_images;
create policy "saved images own rows" on public.saved_images for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists generations_user_created_idx on public.generations(user_id, created_at desc);
create index if not exists saved_content_user_created_idx on public.saved_content(user_id, created_at desc);
create index if not exists saved_images_user_created_idx on public.saved_images(user_id, created_at desc);
