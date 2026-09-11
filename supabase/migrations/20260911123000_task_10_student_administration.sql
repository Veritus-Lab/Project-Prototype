begin;

create policy students_insert_active_member
  on public.students for insert to authenticated
  with check (private.is_active_team_member(assessoria_id));

create policy students_update_active_member
  on public.students for update to authenticated
  using (private.is_active_team_member(assessoria_id))
  with check (private.is_active_team_member(assessoria_id));

commit;
