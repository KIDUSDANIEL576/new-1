-- Account management: rename yourself, leave your couple, delete your account.
--
-- Deleting an auth user does NOT cascade to strokes or daily_marks (both are
-- NO ACTION), so anything that removes a user has to clear those first or the
-- delete fails on a foreign key. That's why this is an RPC and not a policy.

-- ---------- rename ----------
-- Deliberately an RPC rather than an UPDATE policy on members: a policy scoped
-- to `user_id = auth.uid()` would still let someone rewrite their own
-- couple_id and walk into another couple, straight past join_couple's
-- two-person limit. This function can only ever touch the name.

create or replace function public.set_display_name(p_name text)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text := nullif(trim(p_name), '');
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  if v_name is null then
    raise exception 'NAME_REQUIRED';
  end if;
  if length(v_name) > 24 then
    v_name := substr(v_name, 1, 24);
  end if;

  update members set display_name = v_name where user_id = auth.uid();
  return v_name;
end;
$$;

revoke execute on function public.set_display_name(text) from public, anon;
grant execute on function public.set_display_name(text) to authenticated;

-- ---------- leave the couple ----------
-- Your ink goes with you. Their ink, their photos, and a paid Trace Forever all
-- stay — the entitlement is on the couple, so the partner who stays keeps it
-- and whoever joins next inherits it. If nobody is left, the couple and
-- everything in it is deleted.

create or replace function public.leave_couple()
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_user   uuid := auth.uid();
  v_couple uuid;
  v_left   int;
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;

  select couple_id into v_couple from members where user_id = v_user;
  if v_couple is null then
    return jsonb_build_object('left', false, 'reason', 'not in a couple');
  end if;

  -- my strokes on any of this couple's canvases
  delete from strokes
   where author_id = v_user
     and canvas_id in (select id from canvases where couple_id = v_couple);

  delete from daily_marks where couple_id = v_couple and user_id = v_user;
  delete from members where couple_id = v_couple and user_id = v_user;

  select count(*) into v_left from members where couple_id = v_couple;

  if v_left = 0 then
    -- cascades canvases, strokes, entitlements, photo_events, buzz_log
    delete from couples where id = v_couple;
    return jsonb_build_object('left', true, 'coupleDeleted', true, 'coupleId', v_couple);
  end if;

  return jsonb_build_object('left', true, 'coupleDeleted', false, 'coupleId', v_couple);
end;
$$;

revoke execute on function public.leave_couple() from public, anon;
grant execute on function public.leave_couple() to authenticated;

-- ---------- used by the delete-account edge function ----------
-- Same teardown, for an arbitrary user, callable only by the service role.
-- The function deletes the auth user afterwards; this clears what would
-- otherwise block that delete.

create or replace function public.purge_user_data(p_user uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_couple uuid;
  v_left   int;
begin
  select couple_id into v_couple from members where user_id = p_user;

  -- strokes are NO ACTION against auth.users, so these must go first
  delete from strokes where author_id = p_user;
  delete from daily_marks where user_id = p_user;
  delete from push_tokens where user_id = p_user;
  delete from widget_tokens where user_id = p_user;

  if v_couple is null then
    return jsonb_build_object('coupleDeleted', false, 'coupleId', null);
  end if;

  delete from members where user_id = p_user;
  select count(*) into v_left from members where couple_id = v_couple;

  if v_left = 0 then
    delete from couples where id = v_couple;
    return jsonb_build_object('coupleDeleted', true, 'coupleId', v_couple);
  end if;

  return jsonb_build_object('coupleDeleted', false, 'coupleId', v_couple);
end;
$$;

revoke execute on function public.purge_user_data(uuid) from public, anon, authenticated;
grant execute on function public.purge_user_data(uuid) to service_role;
