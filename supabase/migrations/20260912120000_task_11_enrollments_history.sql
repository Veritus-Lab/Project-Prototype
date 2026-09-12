begin;

grant select on table public.enrollments, public.enrollment_history to authenticated;

drop policy if exists enrollments_insert_active_member on public.enrollments;
create policy enrollments_insert_active_member
  on public.enrollments for insert to authenticated
  with check (private.is_active_team_member(assessoria_id));

drop policy if exists enrollment_history_select_member_or_owner on public.enrollment_history;
create policy enrollment_history_select_member_or_owner
  on public.enrollment_history for select to authenticated
  using (
    private.is_active_team_member(assessoria_id)
    or exists (
      select 1
        from public.enrollments enrollment
       where enrollment.assessoria_id = enrollment_history.assessoria_id
         and enrollment.id = enrollment_history.enrollment_id
         and private.is_student_owner(enrollment.assessoria_id, enrollment.student_id)
    )
  );

create or replace function public.create_enrollment(target_student_id uuid, target_starts_on date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_assessoria_id uuid;
  member_id uuid;
  created_enrollment public.enrollments;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select tm.assessoria_id, tm.id
    into member_assessoria_id, member_id
    from public.team_members tm
   where tm.profile_id = auth.uid()
     and tm.status = 'active'
   limit 1;

  if member_assessoria_id is null then
    raise exception using errcode = '42501', message = 'Active team membership required';
  end if;

  if target_starts_on is null then
    raise exception using errcode = '22023', message = 'Start date is required';
  end if;

  if not exists (
    select 1 from public.students s
     where s.id = target_student_id
       and s.assessoria_id = member_assessoria_id
  ) then
    raise exception using errcode = '22023', message = 'Student not found';
  end if;

  insert into public.enrollments (assessoria_id, student_id, status, starts_on)
  values (member_assessoria_id, target_student_id, 'active', target_starts_on)
  returning * into created_enrollment;

  insert into public.enrollment_history
    (assessoria_id, enrollment_id, previous_status, new_status, actor_team_member_id, reason)
  values
    (member_assessoria_id, created_enrollment.id, null, 'active', member_id, 'Matrícula criada');

  return to_jsonb(created_enrollment);
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'Student already has a current enrollment';
end;
$$;

create or replace function public.change_enrollment_status(
  target_enrollment_id uuid,
  target_status public.enrollment_status,
  target_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_assessoria_id uuid;
  member_id uuid;
  current_enrollment public.enrollments;
  previous_status public.enrollment_status;
  normalized_reason text := nullif(btrim(target_reason), '');
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select tm.assessoria_id, tm.id
    into member_assessoria_id, member_id
    from public.team_members tm
   where tm.profile_id = auth.uid()
     and tm.status = 'active'
   limit 1;

  if member_assessoria_id is null then
    raise exception using errcode = '42501', message = 'Active team membership required';
  end if;

  select * into current_enrollment
    from public.enrollments e
   where e.id = target_enrollment_id
     and e.assessoria_id = member_assessoria_id
   for update;

  if current_enrollment.id is null then
    raise exception using errcode = '22023', message = 'Enrollment not found';
  end if;

  if target_status is null then
    raise exception using errcode = '22023', message = 'Status is required';
  end if;

  previous_status := current_enrollment.status;

  if current_enrollment.status = target_status then
    raise exception using errcode = '22023', message = 'Enrollment already has this status';
  end if;

  if current_enrollment.status = 'ended' then
    raise exception using errcode = '22023', message = 'Ended enrollment cannot be reactivated';
  end if;

  if target_status = 'suspended' and normalized_reason is null then
    raise exception using errcode = '22023', message = 'Suspension reason is required';
  end if;

  if normalized_reason is not null and char_length(normalized_reason) > 500 then
    raise exception using errcode = '22023', message = 'Reason is too long';
  end if;

  update public.enrollments
     set status = target_status,
         ends_on = case when target_status = 'ended' then current_date else null end,
         suspension_reason = case when target_status = 'suspended' then normalized_reason else null end
   where id = current_enrollment.id
     and assessoria_id = member_assessoria_id
  returning * into current_enrollment;

  insert into public.enrollment_history
    (assessoria_id, enrollment_id, previous_status, new_status, actor_team_member_id, reason)
  values
    (member_assessoria_id, current_enrollment.id, previous_status, target_status, member_id, normalized_reason);

  return to_jsonb(current_enrollment);
end;
$$;

revoke all on function public.create_enrollment(uuid, date) from public, anon;
revoke all on function public.change_enrollment_status(uuid, public.enrollment_status, text) from public, anon;
grant execute on function public.create_enrollment(uuid, date) to authenticated;
grant execute on function public.change_enrollment_status(uuid, public.enrollment_status, text) to authenticated;

commit;
