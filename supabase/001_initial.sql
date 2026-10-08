begin;
-- Run in the Supabase SQL editor. New projects only; review before applying.
create table public.profiles (user_id uuid primary key references auth.users on delete cascade, preferences jsonb not null, updated_at timestamptz default now());
create table public.plans (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, data jsonb not null, created_at timestamptz default now());
create table public.meal_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, day date not null, data jsonb not null, created_at timestamptz default now());
create table public.workout_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, day date not null, data jsonb not null, created_at timestamptz default now());
create table public.weight_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, day date not null, weight numeric not null check(weight between 30 and 300));
create table public.tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, day date not null, title text not null check(length(title) between 1 and 200), completed boolean not null default false);
create table public.body_analyses (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade, path text not null, result jsonb not null, created_at timestamptz default now());
create table public.subscriptions (id text primary key, user_id uuid not null references auth.users on delete cascade, status text not null default 'created', mode text not null check(mode in ('test','live')), current_end bigint, event_at bigint not null default 0, created_at timestamptz default now());
create index on public.plans(user_id,created_at desc);
create index on public.subscriptions(user_id);
create unique index one_open_subscription on public.subscriptions(user_id) where status in ('created','authenticated','active','pending','halted','paused');
create table public.rate_limits (user_id uuid references auth.users on delete cascade, bucket text, started_at timestamptz not null default now(), count int not null default 1, primary key(user_id,bucket));
create function public.take_rate_limit(p_bucket text, p_limit integer) returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 if auth.uid() is null then return false; end if;
 insert into rate_limits(user_id,bucket) values(auth.uid(),p_bucket)
 on conflict(user_id,bucket) do update set count=case when rate_limits.started_at < now()-interval '1 hour' then 1 else rate_limits.count+1 end, started_at=case when rate_limits.started_at < now()-interval '1 hour' then now() else rate_limits.started_at end returning count into n;
 return n<=p_limit;
end $$;
revoke all on function public.take_rate_limit(text,integer) from public;
grant execute on function public.take_rate_limit(text,integer) to authenticated;
alter table public.rate_limits enable row level security;
do $$ declare t text; begin foreach t in array array['profiles','plans','meal_logs','workout_logs','weight_logs','tasks','body_analyses'] loop execute format('alter table public.%I enable row level security',t); execute format('create policy own_rows on public.%I for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id)',t); end loop; end $$;
alter table public.subscriptions enable row level security;
create policy read_own_subscription on public.subscriptions for select to authenticated using(auth.uid()=user_id);
-- Clients cannot grant themselves Premium.
revoke insert,update,delete on public.subscriptions from anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('body-photos','body-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy own_photos on storage.objects for all to authenticated using(bucket_id='body-photos' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='body-photos' and (storage.foldername(name))[1]=auth.uid()::text);

commit;
