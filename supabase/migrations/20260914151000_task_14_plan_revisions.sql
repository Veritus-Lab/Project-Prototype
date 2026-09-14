begin;
create or replace function public.create_plan_revision(target_plan_id uuid, target_amount_cents bigint, target_periodicity text, target_due_day integer, target_effective_from date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; next_version integer; created public.plan_versions;
begin
 select assessoria_id into tenant_id from public.team_members where profile_id=auth.uid() and role='socio' and status='active' limit 1;
 if tenant_id is null then raise exception using errcode='42501',message='Active socio membership required'; end if;
 if target_amount_cents < 0 or target_periodicity not in ('monthly','quarterly','semiannual','annual') or target_due_day not between 1 and 31 or target_effective_from is null then raise exception using errcode='22023',message='Invalid plan terms'; end if;
 if not exists(select 1 from public.plans where id=target_plan_id and assessoria_id=tenant_id) then raise exception using errcode='22023',message='Plan not found'; end if;
 if exists(select 1 from public.plan_versions where plan_id=target_plan_id and effective_until is not null and daterange(effective_from,effective_until,'[]') && daterange(target_effective_from,'infinity'::date,'[]')) then raise exception using errcode='22023',message='Plan version overlaps an existing term'; end if;
 update public.plan_versions set effective_until=target_effective_from-1 where plan_id=target_plan_id and effective_until is null and effective_from<target_effective_from;
 if not found and exists(select 1 from public.plan_versions where plan_id=target_plan_id) then raise exception using errcode='22023',message='Plan revision must start after current version'; end if;
 select coalesce(max(version_number),0)+1 into next_version from public.plan_versions where plan_id=target_plan_id;
 insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values(tenant_id,target_plan_id,next_version,target_amount_cents,target_periodicity,target_due_day,target_effective_from) returning * into created;
 return to_jsonb(created);
end; $$;
revoke all on function public.create_plan_revision(uuid,bigint,text,integer,date) from public,anon;
grant execute on function public.create_plan_revision(uuid,bigint,text,integer,date) to authenticated;
commit;
