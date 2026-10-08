-- Disposable PostgreSQL harness. These stand-ins validate policy SQL, not Supabase services.
create role anon; create role authenticated;
create schema auth; create schema storage;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1]$$;
grant usage on schema public,auth,storage to authenticated,anon;
grant execute on function auth.uid() to authenticated,anon;
alter default privileges in schema public grant select,insert,update,delete on tables to authenticated,anon;
grant select,insert,update,delete on storage.objects to authenticated;
