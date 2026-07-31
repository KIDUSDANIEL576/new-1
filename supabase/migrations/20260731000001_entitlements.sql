-- Trace Phase 4 — monetization.
-- "Trace Forever" ($29.99, one-time) unlocks BOTH partners, so the entitlement
-- is keyed by couple_id, not user_id. One row per couple = that couple is Pro.
--
-- Tiers (the source of truth for both clients is my_status() below):
--   Free — shared canvas, marker + chalk, 1 photo/day, widget, 7-day replay
--   Pro  — all brushes incl. invisible ink, unlimited photos, full replay

-- ---------- entitlements ----------

create table public.entitlements (
  couple_id    uuid primary key references public.couples(id) on delete cascade,
  product_id   text not null default 'trace_forever',
  store        text not null check (store in ('app_store', 'play_store', 'promo', 'test')),
  purchased_by uuid references auth.users(id) on delete set null,
  rc_event_id  text unique,  -- RevenueCat event id → webhook idempotency
  purchased_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "members read their entitlement"
  on public.entitlements for select to authenticated
  using (public.is_couple_member(couple_id));
-- deliberately no insert/update/delete policies: only the RevenueCat webhook
-- (service role) may grant or revoke. Clients can never mint their own unlock.

-- invisible ink is a Pro brush
alter table public.strokes drop constraint if exists strokes_brush_check;
alter table public.strokes add constraint strokes_brush_check
  check (brush in ('marker', 'glow', 'neon', 'chalk', 'invisible'));

-- ---------- helpers ----------

-- internal: triggers and my_status() only. Not granted to clients — otherwise
-- anyone could probe an arbitrary couple's paid status.
create or replace function public.couple_is_pro(cid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.entitlements where couple_id = cid);
$$;
revoke execute on function public.couple_is_pro(uuid) from public, anon, authenticated;

-- start of the current UTC day, as timestamptz
create or replace function public.utc_day_start()
returns timestamptz
language sql stable
set search_path = public
as $$
  select date_trunc('day', now() at time zone 'utc') at time zone 'utc';
$$;

-- ---------- free-tier enforcement (server-side, not just UI) ----------

create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_today int;
begin
  if new.kind <> 'photo' then return new; end if;
  if public.couple_is_pro(new.couple_id) then return new; end if;

  select count(*) into v_today
    from canvases
   where couple_id = new.couple_id
     and kind = 'photo'
     and created_at >= public.utc_day_start();

  if v_today >= 1 then
    raise exception 'FREE_PHOTO_LIMIT' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger canvases_photo_limit
  before insert on public.canvases
  for each row execute function public.enforce_photo_limit();

-- trigger functions are not API; PostgREST would otherwise expose them
revoke execute on function public.enforce_photo_limit() from public, anon, authenticated;

create or replace function public.enforce_brush_tier()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid;
begin
  if new.brush in ('marker', 'chalk') then return new; end if;

  select couple_id into v_couple from canvases where id = new.canvas_id;
  if public.couple_is_pro(v_couple) then return new; end if;

  raise exception 'PRO_BRUSH' using errcode = 'check_violation';
end;
$$;

create trigger strokes_brush_tier
  before insert on public.strokes
  for each row execute function public.enforce_brush_tier();

revoke execute on function public.enforce_brush_tier() from public, anon, authenticated;

-- ---------- what the client asks ----------
-- One round trip: am I Pro, how many photos have I used today, what are the
-- limits. Free limits returned as numbers; null means unlimited.

create or replace function public.my_status()
returns table (
  couple_id    uuid,
  is_pro       boolean,
  photos_today int,
  photo_limit  int,
  replay_days  int
)
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_couple uuid;
  v_pro    boolean;
begin
  select m.couple_id into v_couple from members m where m.user_id = auth.uid();
  if v_couple is null then return; end if;

  v_pro := public.couple_is_pro(v_couple);

  return query
    select
      v_couple,
      v_pro,
      (select count(*)::int from canvases c
        where c.couple_id = v_couple
          and c.kind = 'photo'
          and c.created_at >= public.utc_day_start()),
      case when v_pro then null else 1 end,
      case when v_pro then null else 7 end;
end;
$$;

-- revoke from PUBLIC first: `revoke ... from anon` alone leaves the default
-- PUBLIC grant in place, and anon inherits it.
revoke execute on function public.my_status() from public, anon;
grant execute on function public.my_status() to authenticated;

-- ---------- admin / testing ----------
-- Service role only (SQL editor, webhook). Lets you flip a couple to Pro to
-- test the paid paths before any store products exist.

create or replace function public.grant_entitlement(
  p_couple_id uuid,
  p_store text default 'promo',
  p_product text default 'trace_forever',
  p_purchased_by uuid default null,
  p_event_id text default null
)
returns void
language sql security definer
set search_path = public
as $$
  insert into entitlements (couple_id, product_id, store, purchased_by, rc_event_id)
  values (p_couple_id, p_product, p_store, p_purchased_by, p_event_id)
  on conflict (couple_id) do nothing;
$$;

create or replace function public.revoke_entitlement(p_couple_id uuid)
returns void
language sql security definer
set search_path = public
as $$
  delete from entitlements where couple_id = p_couple_id;
$$;

revoke execute on function public.grant_entitlement(uuid, text, text, uuid, text)
  from public, anon, authenticated;
revoke execute on function public.revoke_entitlement(uuid)
  from public, anon, authenticated;

-- revoking from public also strips service_role's implicit EXECUTE, and the
-- RevenueCat webhook calls these with the service role key. Grant it back —
-- to service_role only.
grant execute on function public.grant_entitlement(uuid, text, text, uuid, text) to service_role;
grant execute on function public.revoke_entitlement(uuid) to service_role;
grant execute on function public.couple_is_pro(uuid) to service_role;
