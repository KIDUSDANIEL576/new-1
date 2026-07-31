-- The shipped photo flow sets a background by UPDATEing canvases.photo_url on
-- the shared canvas — it does not insert a 'photo' canvas. So counting photo
-- canvas inserts measured nothing. photo_events is the real meter.
--
-- photo_url carries display state in its fragment (#fit=cover&dim=35), and
-- dragging the darken slider rewrites it constantly. Only a change to the part
-- BEFORE the '#' is a genuinely new photo.

create table public.photo_events (
  id         bigint generated always as identity primary key,
  couple_id  uuid references public.couples(id) on delete cascade not null,
  canvas_id  uuid references public.canvases(id) on delete cascade,
  set_by     uuid,
  created_at timestamptz not null default now()
);
create index photo_events_daily_idx on public.photo_events(couple_id, created_at desc);

alter table public.photo_events enable row level security;
create policy "members read their photo events"
  on public.photo_events for select to authenticated
  using (public.is_couple_member(couple_id));
-- writes happen only inside the security-definer trigger below

create or replace function public.photos_used_today(cid uuid)
returns int
language sql stable security definer
set search_path = public
as $$
  select count(*)::int from public.photo_events
   where couple_id = cid and created_at >= public.utc_day_start();
$$;
revoke execute on function public.photos_used_today(uuid) from public, anon, authenticated;
grant execute on function public.photos_used_today(uuid) to service_role;

-- replaces the insert-only version from 20260731000001
create or replace function public.enforce_photo_limit()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_new_photo text := split_part(coalesce(new.photo_url, ''), '#', 1);
  v_old_photo text := case when tg_op = 'UPDATE'
                           then split_part(coalesce(old.photo_url, ''), '#', 1)
                           else '' end;
begin
  -- not a new photo: bare canvas, photo cleared, or only fit/dim changed
  if v_new_photo = '' or v_new_photo = v_old_photo then
    return new;
  end if;

  if not public.couple_is_pro(new.couple_id)
     and public.photos_used_today(new.couple_id) >= 1 then
    raise exception 'FREE_PHOTO_LIMIT' using errcode = 'check_violation';
  end if;

  insert into public.photo_events (couple_id, canvas_id, set_by)
  values (new.couple_id, new.id, auth.uid());

  return new;
end;
$$;

drop trigger if exists canvases_photo_limit on public.canvases;
create trigger canvases_photo_limit
  before insert or update of photo_url on public.canvases
  for each row execute function public.enforce_photo_limit();

revoke execute on function public.enforce_photo_limit() from public, anon, authenticated;

-- my_status() now reports the real meter
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
      public.photos_used_today(v_couple),
      case when v_pro then null else 1 end,
      case when v_pro then null else 7 end;
end;
$$;

-- create-or-replace preserves the ACL, but restate it so this file is safe to
-- apply on its own
revoke execute on function public.my_status() from public, anon;
grant execute on function public.my_status() to authenticated;
