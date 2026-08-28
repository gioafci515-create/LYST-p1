-- Run once in the Supabase SQL editor.
-- Security model: the anon key can INSERT and nothing else; reading the
-- guest list requires an authenticated session. The admin UI is a
-- convenience — these policies are the lock.

create table rsvps (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  last_name    text not null,
  attendance   text not null check (attendance in ('attending','not-attending')),
  guest_count  int  not null default 1 check (guest_count between 1 and 6),
  message      text,
  language     text not null default 'ka',
  created_at   timestamptz not null default now()
);

create table invitation_opens (
  id         uuid primary key default gen_random_uuid(),
  opened_at  timestamptz not null default now(),
  language   text,
  referrer   text
);

alter table rsvps enable row level security;
alter table invitation_opens enable row level security;

-- guests may submit, and may not read
create policy "anon can insert rsvp" on rsvps
  for insert to anon with check (true);

create policy "anon can log open" on invitation_opens
  for insert to anon with check (true);

-- only signed-in admins may read
create policy "authenticated can read rsvps" on rsvps
  for select to authenticated using (true);

create policy "authenticated can read opens" on invitation_opens
  for select to authenticated using (true);
