begin;

drop policy if exists students_insert_active_member on public.students;
drop policy if exists students_update_active_member on public.students;
create policy students_insert_socio on public.students for insert to authenticated
  with check (private.is_active_socio(assessoria_id));
create policy students_update_socio on public.students for update to authenticated
  using (private.is_active_socio(assessoria_id)) with check (private.is_active_socio(assessoria_id));

drop policy if exists enrollments_insert_active_member on public.enrollments;
create policy enrollments_insert_socio on public.enrollments for insert to authenticated
  with check (private.is_active_socio(assessoria_id));

create or replace function public.create_enrollment(target_student_id uuid, target_starts_on date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; member_id uuid; created public.enrollments;
begin
  select tm.assessoria_id, tm.id into tenant_id, member_id from public.team_members tm where tm.profile_id = auth.uid() and tm.role = 'socio' and tm.status = 'active' limit 1;
  if tenant_id is null then raise exception using errcode = '42501', message = 'Active socio membership required'; end if;
  if target_starts_on is null then raise exception using errcode = '22023', message = 'Start date is required'; end if;
  if not exists (select 1 from public.students s where s.id = target_student_id and s.assessoria_id = tenant_id) then raise exception using errcode = '22023', message = 'Student not found'; end if;
  insert into public.enrollments(assessoria_id, student_id, status, starts_on) values(tenant_id, target_student_id, 'active', target_starts_on) returning * into created;
  insert into public.enrollment_history(assessoria_id, enrollment_id, previous_status, new_status, actor_team_member_id, reason) values(tenant_id, created.id, null, 'active', member_id, 'Matrícula criada');
  return to_jsonb(created);
exception when unique_violation then raise exception using errcode = '23505', message = 'Student already has a current enrollment'; end;
$$;

create or replace function public.change_enrollment_status(target_enrollment_id uuid, target_status public.enrollment_status, target_reason text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; member_id uuid; current_row public.enrollments; previous public.enrollment_status; reason text := nullif(btrim(target_reason), '');
begin
  select tm.assessoria_id, tm.id into tenant_id, member_id from public.team_members tm where tm.profile_id = auth.uid() and tm.role = 'socio' and tm.status = 'active' limit 1;
  if tenant_id is null then raise exception using errcode = '42501', message = 'Active socio membership required'; end if;
  select * into current_row from public.enrollments e where e.id = target_enrollment_id and e.assessoria_id = tenant_id for update;
  if current_row.id is null then raise exception using errcode = '22023', message = 'Enrollment not found'; end if;
  if target_status is null or current_row.status = target_status then raise exception using errcode = '22023', message = 'Invalid enrollment transition'; end if;
  if current_row.status = 'ended' then raise exception using errcode = '22023', message = 'Ended enrollment cannot be reactivated'; end if;
  if target_status = 'suspended' and reason is null then raise exception using errcode = '22023', message = 'Suspension reason is required'; end if;
  if reason is not null and char_length(reason) > 500 then raise exception using errcode = '22023', message = 'Reason is too long'; end if;
  previous := current_row.status;
  update public.enrollments set status = target_status, ends_on = case when target_status = 'ended' then current_date else null end, suspension_reason = case when target_status = 'suspended' then reason else null end where id = current_row.id returning * into current_row;
  insert into public.enrollment_history(assessoria_id, enrollment_id, previous_status, new_status, actor_team_member_id, reason) values(tenant_id, current_row.id, previous, target_status, member_id, reason);
  return to_jsonb(current_row);
end;
$$;

commit;
