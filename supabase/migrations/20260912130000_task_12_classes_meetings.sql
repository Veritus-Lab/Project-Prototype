begin;

grant select on table public.classes, public.class_memberships, public.class_meetings to authenticated;

drop policy if exists classes_select_active_member on public.classes;
create policy classes_select_active_member on public.classes for select to authenticated
  using (private.is_active_team_member(assessoria_id));
drop policy if exists class_memberships_select_active_member on public.class_memberships;
create policy class_memberships_select_active_member on public.class_memberships for select to authenticated
  using (private.is_active_team_member(assessoria_id));
drop policy if exists class_meetings_select_active_member on public.class_meetings;
create policy class_meetings_select_active_member on public.class_meetings for select to authenticated
  using (private.is_active_team_member(assessoria_id));

create or replace function public.create_class(target_name text, target_description text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare aid uuid; created public.classes;
begin
  select tm.assessoria_id into aid from public.team_members tm where tm.profile_id = auth.uid() and tm.status = 'active' limit 1;
  if aid is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  if char_length(btrim(target_name)) not between 2 and 120 then raise exception using errcode = '22023', message = 'Class name is invalid'; end if;
  insert into public.classes (assessoria_id, name, description) values (aid, btrim(target_name), nullif(btrim(target_description), '')) returning * into created;
  return to_jsonb(created);
exception when unique_violation then raise exception using errcode = '23505', message = 'Class already exists';
end; $$;

create or replace function public.add_class_member(target_class_id uuid, target_student_id uuid, target_enrollment_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare aid uuid; created public.class_memberships;
begin
  select tm.assessoria_id into aid from public.team_members tm where tm.profile_id = auth.uid() and tm.status = 'active' limit 1;
  if aid is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  if not exists (select 1 from public.classes c where c.id = target_class_id and c.assessoria_id = aid and c.active) then raise exception using errcode = '22023', message = 'Class not found'; end if;
  if not exists (select 1 from public.enrollments e where e.id = target_enrollment_id and e.assessoria_id = aid and e.student_id = target_student_id and e.status in ('active','suspended')) then raise exception using errcode = '22023', message = 'Active enrollment required'; end if;
  insert into public.class_memberships (assessoria_id, class_id, student_id, enrollment_id, starts_on) values (aid, target_class_id, target_student_id, target_enrollment_id, current_date) returning * into created;
  return to_jsonb(created);
exception when unique_violation then raise exception using errcode = '23505', message = 'Student already belongs to this class';
end; $$;

create or replace function public.create_class_meeting(target_class_id uuid, target_starts_at timestamptz, target_ends_at timestamptz)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare aid uuid; created public.class_meetings;
begin
  select tm.assessoria_id into aid from public.team_members tm where tm.profile_id = auth.uid() and tm.status = 'active' limit 1;
  if aid is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  if target_ends_at <= target_starts_at then raise exception using errcode = '22023', message = 'Meeting end must be after start'; end if;
  if not exists (select 1 from public.classes c where c.id = target_class_id and c.assessoria_id = aid) then raise exception using errcode = '22023', message = 'Class not found'; end if;
  insert into public.class_meetings (assessoria_id, class_id, starts_at, ends_at) values (aid, target_class_id, target_starts_at, target_ends_at) returning * into created;
  return to_jsonb(created);
exception when unique_violation then raise exception using errcode = '23505', message = 'Meeting already exists';
end; $$;

create or replace function public.cancel_class_meeting(target_meeting_id uuid, target_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare aid uuid; updated public.class_meetings; reason text := nullif(btrim(target_reason), '');
begin
  select tm.assessoria_id into aid from public.team_members tm where tm.profile_id = auth.uid() and tm.status = 'active' limit 1;
  if aid is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  if reason is null or char_length(reason) > 500 then raise exception using errcode = '22023', message = 'Cancellation reason is required'; end if;
  update public.class_meetings set canceled_at = now(), cancellation_reason = reason where id = target_meeting_id and assessoria_id = aid returning * into updated;
  if updated.id is null then raise exception using errcode = '22023', message = 'Meeting not found'; end if;
  return to_jsonb(updated);
end; $$;

revoke all on function public.create_class(text, text) from public, anon;
revoke all on function public.add_class_member(uuid, uuid, uuid) from public, anon;
revoke all on function public.create_class_meeting(uuid, timestamptz, timestamptz) from public, anon;
revoke all on function public.cancel_class_meeting(uuid, text) from public, anon;
grant execute on function public.create_class(text, text) to authenticated;
grant execute on function public.add_class_member(uuid, uuid, uuid) to authenticated;
grant execute on function public.create_class_meeting(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.cancel_class_meeting(uuid, text) to authenticated;

commit;
