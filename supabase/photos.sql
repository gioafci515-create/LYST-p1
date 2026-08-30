-- Run once in the Supabase SQL editor, after schema.sql.
-- Guest photo uploads. Same security model as rsvps: the anon key can
-- only insert/upload, never list or read back. Only a signed-in admin
-- session can browse the gallery.

-- Storage bucket for the actual image files. Private (not public) —
-- admin views them through authenticated signed URLs, not a public link.
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', false)
on conflict (id) do nothing;

-- Metadata: who (optionally) shared it and when, so the admin gallery
-- can list/sort without paging through the storage API directly.
create table photo_uploads (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  guest_name    text,
  created_at    timestamptz not null default now()
);

alter table photo_uploads enable row level security;

create policy "anon can insert photo record" on photo_uploads
  for insert to anon with check (true);

create policy "authenticated can read photo records" on photo_uploads
  for select to authenticated using (true);

create policy "authenticated can delete photo records" on photo_uploads
  for delete to authenticated using (true);

-- storage.objects is Supabase's own table for file metadata — policy it
-- the same way: anon can only add files to this one bucket, never list
-- or read them back; only an authenticated session can.
create policy "anon can upload wedding photos" on storage.objects
  for insert to anon with check (bucket_id = 'wedding-photos');

create policy "authenticated can read wedding photos" on storage.objects
  for select to authenticated using (bucket_id = 'wedding-photos');

create policy "authenticated can delete wedding photos" on storage.objects
  for delete to authenticated using (bucket_id = 'wedding-photos');
