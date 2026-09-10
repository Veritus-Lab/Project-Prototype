begin;

create type public.student_financial_status as enum (
  'em_dia',
  'pendente',
  'nao_configurado',
  'indisponivel'
);

create or replace function private.is_active_team_member(target_assessoria_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members member
    where member.assessoria_id = target_assessoria_id
      and member.profile_id = auth.uid()
      and member.status = 'active'
  );
$$;

create or replace function private.is_active_socio(target_assessoria_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members member
    where member.assessoria_id = target_assessoria_id
      and member.profile_id = auth.uid()
      and member.role = 'socio'
      and member.status = 'active'
  );
$$;

create or replace function private.is_student_owner(target_assessoria_id uuid, target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students student
    where student.assessoria_id = target_assessoria_id
      and student.id = target_student_id
      and student.auth_user_id = auth.uid()
  );
$$;

revoke all on function private.is_active_team_member(uuid) from public, anon;
revoke all on function private.is_active_socio(uuid) from public, anon;
revoke all on function private.is_student_owner(uuid, uuid) from public, anon;
grant execute on function private.is_active_team_member(uuid) to authenticated;
grant execute on function private.is_active_socio(uuid) to authenticated;
grant execute on function private.is_student_owner(uuid, uuid) to authenticated;

grant select on table public.team_members, public.students, public.enrollments to authenticated;

drop policy if exists team_members_select_active_member on public.team_members;
create policy team_members_select_active_member
  on public.team_members for select to authenticated
  using (
    profile_id = auth.uid()
    or private.is_active_socio(assessoria_id)
  );

drop policy if exists students_select_member_or_owner on public.students;
create policy students_select_member_or_owner
  on public.students for select to authenticated
  using (
    private.is_active_team_member(assessoria_id)
    or private.is_student_owner(assessoria_id, id)
  );

drop policy if exists enrollments_select_member_or_owner on public.enrollments;
create policy enrollments_select_member_or_owner
  on public.enrollments for select to authenticated
  using (
    private.is_active_team_member(assessoria_id)
    or private.is_student_owner(assessoria_id, student_id)
  );

drop policy if exists assinaturas_atletas_trainer on public.assinaturas_atletas;
drop policy if exists cobrancas_trainer on public.cobrancas;
drop policy if exists eventos_financeiros_trainer_select on public.eventos_financeiros;
drop policy if exists eventos_financeiros_trainer_insert on public.eventos_financeiros;
drop policy if exists preferencias_comunicacao_trainer on public.preferencias_comunicacao;
drop policy if exists lembretes_cobranca_trainer on public.lembretes_cobranca;

create policy assinaturas_atletas_socio on public.assinaturas_atletas for all to authenticated using (private.is_active_socio(assessoria_id)) with check (private.is_active_socio(assessoria_id));
create policy cobrancas_socio on public.cobrancas for all to authenticated using (private.is_active_socio(assessoria_id)) with check (private.is_active_socio(assessoria_id));
create policy eventos_financeiros_socio_select on public.eventos_financeiros for select to authenticated using (private.is_active_socio(assessoria_id));
create policy eventos_financeiros_socio_insert on public.eventos_financeiros for insert to authenticated with check (private.is_active_socio(assessoria_id) and ator_id = auth.uid());
create policy preferencias_comunicacao_socio on public.preferencias_comunicacao for all to authenticated using (private.is_active_socio(assessoria_id)) with check (private.is_active_socio(assessoria_id));
create policy lembretes_cobranca_socio on public.lembretes_cobranca for all to authenticated using (private.is_active_socio(assessoria_id)) with check (private.is_active_socio(assessoria_id));

create or replace function public.get_student_financial_status(target_student_id uuid)
returns public.student_financial_status
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_assessoria_id uuid;
  has_active_subscription boolean;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select student.assessoria_id
    into target_assessoria_id
    from public.students student
   where student.id = target_student_id;

  if target_assessoria_id is null then
    raise exception using errcode = '42501', message = 'Student unavailable';
  end if;

  if not (
    private.is_active_socio(target_assessoria_id)
    or exists (
      select 1
      from public.team_members member
      where member.assessoria_id = target_assessoria_id
        and member.profile_id = auth.uid()
        and member.role = 'professor'
        and member.status = 'active'
    )
  ) then
    raise exception using errcode = '42501', message = 'Financial status unavailable';
  end if;

  select exists (
    select 1
    from public.subscriptions subscription
    where subscription.assessoria_id = target_assessoria_id
      and subscription.student_id = target_student_id
      and subscription.status = 'active'
  ) into has_active_subscription;

  if not has_active_subscription then
    return 'nao_configurado';
  end if;

  if not exists (
    select 1
    from public.billing_generation_watermarks watermark
    join public.subscriptions subscription
      on subscription.assessoria_id = watermark.assessoria_id
     and subscription.id = watermark.subscription_id
    where watermark.assessoria_id = target_assessoria_id
      and subscription.student_id = target_student_id
      and subscription.status = 'active'
  ) then
    return 'indisponivel';
  end if;

  if exists (
    select 1
    from public.charges charge
    where charge.assessoria_id = target_assessoria_id
      and charge.student_id = target_student_id
      and charge.status in ('open', 'overdue')
      and charge.due_on < current_date
  ) then
    return 'pendente';
  end if;

  return 'em_dia';
end;
$$;

revoke all on function public.get_student_financial_status(uuid) from public, anon;
grant execute on function public.get_student_financial_status(uuid) to authenticated;

commit;
