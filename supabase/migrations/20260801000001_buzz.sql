-- Buzz: the partner's phone rings, not just banners.
--
-- Unlike notify-partner (automatic, on every stroke, 10-minute throttle) a buzz
-- is deliberate — a button press — so it gets a much shorter limit. But it does
-- get one: this is an attention weapon pointed at someone you love, and the
-- rate limit belongs on the server where the client can't argue with it.
--
-- Throttled per RECIPIENT, not per sender, so the limit protects the person
-- being buzzed. Partners can still buzz each other back immediately.

create table public.buzz_log (
  id           bigint generated always as identity primary key,
  couple_id    uuid references public.couples(id) on delete cascade not null,
  sender_id    uuid not null,
  recipient_id uuid not null,
  sent_at      timestamptz not null default now()
);
create index buzz_log_recent_idx on public.buzz_log(recipient_id, sent_at desc);

alter table public.buzz_log enable row level security;
-- no policies, same as push_log: only the buzz-partner function (service role)
-- reads or writes this. A client that could forge rows could defeat its own
-- rate limit.
