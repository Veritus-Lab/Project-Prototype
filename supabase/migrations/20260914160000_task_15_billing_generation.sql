begin;

-- Task 15: every billing period is represented once, regardless of how many
-- times an operator runs the generator. The database owns the calendar rules.
grant select on public.billing_cycles, public.billing_generation_runs, public.billing_generation_watermarks, public.charges, public.subscription_history to authenticated;
create policy billing_cycles_select_socio on public.billing_cycles for select to authenticated using (private.is_active_socio(assessoria_id));
create policy billing_generation_runs_select_socio on public.billing_generation_runs for select to authenticated using (private.is_active_socio(assessoria_id));
create policy billing_generation_watermarks_select_socio on public.billing_generation_watermarks for select to authenticated using (private.is_active_socio(assessoria_id));
create policy charges_select_socio on public.charges for select to authenticated using (private.is_active_socio(assessoria_id));

create or replace function private.billing_due_date(target_month date, target_due_day integer)
returns date language sql immutable set search_path = '' as $$
  select make_date(
    extract(year from target_month)::integer,
    extract(month from target_month)::integer,
    least(target_due_day, extract(day from (date_trunc('month', target_month)::date + interval '1 month - 1 day'))::integer)
  );
$$;

create or replace function public.generate_billing_cycles(target_window_starts_on date, target_window_ends_on date)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  tenant_id uuid; run_id uuid; subscription_row public.subscriptions; cycle_id uuid;
  cycle_due_on date; cycle_month date; cycle_key date; period_starts date; period_ends date;
  interval_months integer; generated integer := 0;
begin
  select assessoria_id into tenant_id from public.team_members
  where profile_id = auth.uid() and role = 'socio' and status = 'active' limit 1;
  if tenant_id is null then raise exception using errcode = '42501', message = 'Active socio membership required'; end if;
  if target_window_starts_on is null or target_window_ends_on is null or target_window_ends_on < target_window_starts_on
     or target_window_ends_on > target_window_starts_on + 366 then
    raise exception using errcode = '22023', message = 'Billing window must be between one and 367 days';
  end if;

  -- Serializes generators for this assessoria while unique keys remain the final guard.
  perform pg_advisory_xact_lock(hashtext(tenant_id::text));
  insert into public.billing_generation_runs(assessoria_id, window_starts_on, window_ends_on, status)
  values (tenant_id, target_window_starts_on, target_window_ends_on, 'running') returning id into run_id;

  for subscription_row in
    select * from public.subscriptions
    where assessoria_id = tenant_id and status = 'active'
  loop
    interval_months := case subscription_row.periodicity when 'monthly' then 1 when 'quarterly' then 3 when 'semiannual' then 6 else 12 end;
    cycle_month := date_trunc('month', subscription_row.starts_on)::date;
    cycle_due_on := private.billing_due_date(cycle_month, subscription_row.due_day);
    if cycle_due_on < subscription_row.starts_on then
      cycle_month := (cycle_month + make_interval(months => interval_months))::date;
      cycle_due_on := private.billing_due_date(cycle_month, subscription_row.due_day);
    end if;

    while cycle_due_on <= target_window_ends_on loop
      if cycle_due_on >= target_window_starts_on and (subscription_row.ends_on is null or cycle_due_on <= subscription_row.ends_on) then
        cycle_key := cycle_month;
        period_starts := cycle_month;
        period_ends := (cycle_month + make_interval(months => interval_months) - interval '1 day')::date;
        insert into public.billing_cycles(assessoria_id, subscription_id, generation_run_id, cycle_key, period_starts_on, period_ends_on, due_on)
        values (tenant_id, subscription_row.id, run_id, cycle_key, period_starts, period_ends, cycle_due_on)
        on conflict (subscription_id, cycle_key) do nothing returning id into cycle_id;
        if cycle_id is not null then
          insert into public.charges(assessoria_id, student_id, subscription_id, billing_cycle_id, cycle_key, status, amount_cents, currency, due_on)
          values (tenant_id, subscription_row.student_id, subscription_row.id, cycle_id, cycle_key, 'open', subscription_row.amount_cents, subscription_row.currency, cycle_due_on);
          insert into public.billing_generation_watermarks(assessoria_id, subscription_id, last_cycle_key, generation_run_id)
          values (tenant_id, subscription_row.id, cycle_key, run_id)
          on conflict (subscription_id) do update set last_cycle_key = greatest(public.billing_generation_watermarks.last_cycle_key, excluded.last_cycle_key), generation_run_id = excluded.generation_run_id;
          generated := generated + 1;
        end if;
      end if;
      cycle_month := (cycle_month + make_interval(months => interval_months))::date;
      cycle_due_on := private.billing_due_date(cycle_month, subscription_row.due_day);
    end loop;
  end loop;

  update public.billing_generation_runs set status = 'completed', expected_count = generated, generated_count = generated, completed_at = now() where id = run_id;
  return jsonb_build_object('generation_run_id', run_id, 'generated_count', generated);
exception when others then
  if run_id is not null then update public.billing_generation_runs set status = 'failed', expected_count = generated, generated_count = generated, error_code = sqlstate, completed_at = now() where id = run_id; end if;
  raise;
end;
$$;

create or replace function public.change_subscription_status(target_subscription_id uuid, target_status public.subscription_status, target_effective_on date, target_reason text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare tenant_id uuid; actor_id uuid; subscription_row public.subscriptions; previous_status public.subscription_status;
begin
  select assessoria_id, id into tenant_id, actor_id from public.team_members where profile_id = auth.uid() and role = 'socio' and status = 'active' limit 1;
  if tenant_id is null then raise exception using errcode = '42501', message = 'Active socio membership required'; end if;
  if target_status not in ('active','paused','ended','canceled','exempt') or target_effective_on is null then raise exception using errcode = '22023', message = 'Invalid subscription status change'; end if;
  select * into subscription_row from public.subscriptions where id = target_subscription_id and assessoria_id = tenant_id for update;
  if subscription_row.id is null then raise exception using errcode = 'P0002', message = 'Subscription not found'; end if;
  if subscription_row.status = target_status then return to_jsonb(subscription_row); end if;
  if target_effective_on < subscription_row.starts_on then raise exception using errcode = '22023', message = 'Effective date cannot precede the contract start'; end if;
  previous_status := subscription_row.status;
  update public.subscriptions set status = target_status,
    ends_on = case when target_status in ('ended','canceled') then target_effective_on else ends_on end
  where id = subscription_row.id returning * into subscription_row;
  insert into public.subscription_history(assessoria_id, subscription_id, previous_status, new_status, actor_team_member_id, reason)
  values (tenant_id, subscription_row.id, previous_status, target_status, actor_id, nullif(btrim(target_reason),''));
  return to_jsonb(subscription_row);
end;
$$;

revoke all on function private.billing_due_date(date,integer), public.generate_billing_cycles(date,date), public.change_subscription_status(uuid,public.subscription_status,date,text) from public, anon;
grant execute on function public.generate_billing_cycles(date,date), public.change_subscription_status(uuid,public.subscription_status,date,text) to authenticated;
commit;
