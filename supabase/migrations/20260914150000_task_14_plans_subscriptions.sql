begin;
grant select on public.plans, public.plan_versions, public.subscriptions, public.subscription_history to authenticated;
create policy plans_select_socio on public.plans for select to authenticated using (private.is_active_socio(assessoria_id));
create policy plan_versions_select_socio on public.plan_versions for select to authenticated using (private.is_active_socio(assessoria_id));
create policy subscriptions_select_socio on public.subscriptions for select to authenticated using (private.is_active_socio(assessoria_id));
create policy subscription_history_select_socio on public.subscription_history for select to authenticated using (private.is_active_socio(assessoria_id));

create or replace function public.create_plan_version(target_name text, target_description text, target_amount_cents bigint, target_periodicity text, target_due_day integer, target_effective_from date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; plan_row public.plans; version_row public.plan_versions;
begin
 select assessoria_id into tenant_id from public.team_members where profile_id=auth.uid() and role='socio' and status='active' limit 1;
 if tenant_id is null then raise exception using errcode='42501', message='Active socio membership required'; end if;
 if char_length(btrim(target_name)) not between 2 and 120 or target_amount_cents < 0 or target_periodicity not in ('monthly','quarterly','semiannual','annual') or target_due_day not between 1 and 31 or target_effective_from is null then raise exception using errcode='22023', message='Invalid plan terms'; end if;
 insert into public.plans(assessoria_id,name,description) values(tenant_id,btrim(target_name),nullif(btrim(target_description),'')) returning * into plan_row;
 insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values(tenant_id,plan_row.id,1,target_amount_cents,target_periodicity,target_due_day,target_effective_from) returning * into version_row;
 return jsonb_build_object('plan',to_jsonb(plan_row),'version',to_jsonb(version_row));
exception when unique_violation then raise exception using errcode='23505',message='Plan already exists'; end; $$;

create or replace function public.create_subscription(target_student_id uuid, target_enrollment_id uuid, target_plan_version_id uuid, target_starts_on date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; actor_id uuid; version_row public.plan_versions; created public.subscriptions;
begin
 select assessoria_id,id into tenant_id,actor_id from public.team_members where profile_id=auth.uid() and role='socio' and status='active' limit 1;
 if tenant_id is null then raise exception using errcode='42501',message='Active socio membership required'; end if;
 if not exists(select 1 from public.enrollments where id=target_enrollment_id and assessoria_id=tenant_id and student_id=target_student_id and status in ('active','suspended')) then raise exception using errcode='22023',message='Active enrollment required'; end if;
 select * into version_row from public.plan_versions where id=target_plan_version_id and assessoria_id=tenant_id and effective_from<=target_starts_on and (effective_until is null or effective_until>=target_starts_on);
 if version_row.id is null then raise exception using errcode='22023',message='Plan version unavailable'; end if;
 insert into public.subscriptions(assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,currency,periodicity,due_day,starts_on) values(tenant_id,target_student_id,target_enrollment_id,version_row.plan_id,version_row.id,'active',version_row.amount_cents,version_row.currency,version_row.periodicity,version_row.due_day,target_starts_on) returning * into created;
 insert into public.subscription_history(assessoria_id,subscription_id,previous_status,new_status,actor_team_member_id,reason) values(tenant_id,created.id,null,'active',actor_id,'Contrato criado');
 return to_jsonb(created);
exception when unique_violation then raise exception using errcode='23505',message='Student already has a current subscription'; end; $$;
revoke all on function public.create_plan_version(text,text,bigint,text,integer,date), public.create_subscription(uuid,uuid,uuid,date) from public,anon;
grant execute on function public.create_plan_version(text,text,bigint,text,integer,date), public.create_subscription(uuid,uuid,uuid,date) to authenticated;
commit;
