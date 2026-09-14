begin;

create table public.attendance_history (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, attendance_id uuid not null,
  previous_status public.attendance_status, new_status public.attendance_status not null,
  actor_team_member_id uuid not null, occurred_at timestamptz not null default now(),
  unique (assessoria_id, id),
  foreign key (assessoria_id, attendance_id) references public.attendances(assessoria_id, id) on delete restrict,
  foreign key (assessoria_id, actor_team_member_id) references public.team_members(assessoria_id, id) on delete restrict,
  check (previous_status is null or previous_status <> new_status)
);
alter table public.attendance_history enable row level security;
alter table public.attendance_history force row level security;
revoke all on public.attendance_history from public, anon;
grant select on public.attendances, public.attendance_history to authenticated;
create policy attendances_select_active_member on public.attendances for select to authenticated using (private.is_active_team_member(assessoria_id));
create policy attendance_history_select_active_member on public.attendance_history for select to authenticated using (private.is_active_team_member(assessoria_id));

create or replace function public.record_attendance_batch(target_meeting_id uuid, entries jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; actor_id uuid; meeting public.class_meetings; entry jsonb; attendance_row public.attendances; previous public.attendance_status; expected_count integer; recorded_count integer := 0; target_status public.attendance_status; target_student_id uuid;
begin
  select tm.assessoria_id, tm.id into tenant_id, actor_id from public.team_members tm where tm.profile_id = auth.uid() and tm.status = 'active' limit 1;
  if tenant_id is null then raise exception using errcode = '42501', message = 'Active team membership required'; end if;
  select * into meeting from public.class_meetings cm where cm.id = target_meeting_id and cm.assessoria_id = tenant_id for update;
  if meeting.id is null then raise exception using errcode = '22023', message = 'Meeting not found'; end if;
  if meeting.canceled_at is not null then raise exception using errcode = '22023', message = 'Canceled meeting cannot receive attendance'; end if;
  if jsonb_typeof(entries) <> 'array' then raise exception using errcode = '22023', message = 'Attendance entries are required'; end if;
  select count(*) into expected_count from public.class_memberships m where m.assessoria_id = tenant_id and m.class_id = meeting.class_id and m.starts_on <= (meeting.starts_at at time zone 'America/Sao_Paulo')::date and (m.ends_on is null or m.ends_on >= (meeting.starts_at at time zone 'America/Sao_Paulo')::date);
  if expected_count = 0 then raise exception using errcode = '22023', message = 'Meeting has no eligible students'; end if;
  if jsonb_array_length(entries) <> expected_count then raise exception using errcode = '22023', message = 'Attendance must include every eligible student'; end if;
  if (select count(distinct (item->>'student_id')) from jsonb_array_elements(entries) item) <> expected_count then raise exception using errcode = '22023', message = 'Duplicate attendance student'; end if;
  for entry in select * from jsonb_array_elements(entries) loop
    target_student_id := (entry->>'student_id')::uuid;
    target_status := (entry->>'status')::public.attendance_status;
    if target_status not in ('present','absent','excused','not_recorded') or not exists (select 1 from public.class_memberships m where m.assessoria_id = tenant_id and m.class_id = meeting.class_id and m.student_id = target_student_id and m.starts_on <= (meeting.starts_at at time zone 'America/Sao_Paulo')::date and (m.ends_on is null or m.ends_on >= (meeting.starts_at at time zone 'America/Sao_Paulo')::date)) then raise exception using errcode = '22023', message = 'Invalid attendance entry'; end if;
    select * into attendance_row from public.attendances a where a.meeting_id = meeting.id and a.student_id = target_student_id for update;
    if attendance_row.id is null then
      insert into public.attendances(assessoria_id,class_id,meeting_id,membership_id,student_id,status,recorded_by_team_member_id,recorded_at) select tenant_id, meeting.class_id, meeting.id, m.id, target_student_id, target_status, case when target_status = 'not_recorded' then null else actor_id end, case when target_status = 'not_recorded' then null else now() end from public.class_memberships m where m.assessoria_id = tenant_id and m.class_id = meeting.class_id and m.student_id = target_student_id and m.starts_on <= (meeting.starts_at at time zone 'America/Sao_Paulo')::date and (m.ends_on is null or m.ends_on >= (meeting.starts_at at time zone 'America/Sao_Paulo')::date) returning * into attendance_row;
      insert into public.attendance_history(assessoria_id,attendance_id,previous_status,new_status,actor_team_member_id) values(tenant_id,attendance_row.id,null,target_status,actor_id);
    elsif attendance_row.status <> target_status then
      previous := attendance_row.status;
      update public.attendances set status=target_status, recorded_by_team_member_id=case when target_status='not_recorded' then null else actor_id end, recorded_at=case when target_status='not_recorded' then null else now() end where id=attendance_row.id returning * into attendance_row;
      insert into public.attendance_history(assessoria_id,attendance_id,previous_status,new_status,actor_team_member_id) values(tenant_id,attendance_row.id,previous,target_status,actor_id);
    end if;
    recorded_count := recorded_count + 1;
  end loop;
  return recorded_count;
end; $$;
revoke all on function public.record_attendance_batch(uuid, jsonb) from public, anon;
grant execute on function public.record_attendance_batch(uuid, jsonb) to authenticated;
commit;
