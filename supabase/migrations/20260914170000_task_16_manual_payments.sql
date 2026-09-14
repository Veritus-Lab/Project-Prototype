begin;
grant select on public.payments, public.payment_settlements, public.cash_movements, public.audit_entries to authenticated;
create policy payments_select_socio on public.payments for select to authenticated using (private.is_active_socio(assessoria_id));
create policy settlements_select_socio on public.payment_settlements for select to authenticated using (private.is_active_socio(assessoria_id));
create policy cash_movements_select_socio on public.cash_movements for select to authenticated using (private.is_active_socio(assessoria_id));
create policy audit_entries_select_socio on public.audit_entries for select to authenticated using (private.is_active_socio(assessoria_id));

create or replace function public.record_manual_payment(target_charge_id uuid, target_paid_at timestamptz, target_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare tenant_id uuid; charge_row public.charges; payment_row public.payments; settlement_id uuid; correlation_id uuid:=gen_random_uuid();
begin
 select assessoria_id into tenant_id from public.team_members where profile_id=auth.uid() and role='socio' and status='active' limit 1;
 if tenant_id is null then raise exception using errcode='42501',message='Active socio membership required'; end if;
 if target_paid_at is null or char_length(btrim(coalesce(target_reason,''))) not between 2 and 1000 then raise exception using errcode='22023',message='Payment date and reason are required'; end if;
 select * into charge_row from public.charges where id=target_charge_id and assessoria_id=tenant_id for update;
 if charge_row.id is null then raise exception using errcode='P0002',message='Charge not found'; end if;
 if charge_row.status='paid' then select * into payment_row from public.payments where charge_id=charge_row.id and provider='manual' and status='confirmed' limit 1; return jsonb_build_object('payment_id',payment_row.id,'already_recorded',true); end if;
 if charge_row.status not in ('open','overdue') then raise exception using errcode='22023',message='Charge cannot be paid in current status'; end if;
 insert into public.payments(assessoria_id,charge_id,provider,idempotency_key,status,amount_cents,currency,confirmed_at,provider_occurred_at) values(tenant_id,charge_row.id,'manual','manual:'||charge_row.id,'confirmed',charge_row.amount_cents,charge_row.currency,target_paid_at,target_paid_at) returning * into payment_row;
 insert into public.payment_settlements(assessoria_id,payment_id,status,gross_amount_cents,fee_amount_cents,net_amount_cents,currency,received_at) values(tenant_id,payment_row.id,'received',charge_row.amount_cents,0,charge_row.amount_cents,charge_row.currency,target_paid_at) returning id into settlement_id;
 update public.charges set status='paid',paid_at=target_paid_at,effective_fact_at=target_paid_at where id=charge_row.id;
 insert into public.cash_movements(assessoria_id,direction,source_type,source_id,settlement_id,idempotency_key,amount_cents,currency,occurred_at) values(tenant_id,'in','settlement',settlement_id,settlement_id,'manual-settlement:'||payment_row.id,charge_row.amount_cents,charge_row.currency,target_paid_at);
 insert into public.audit_entries(assessoria_id,actor_user_id,actor_role,action,target_type,target_id,before_data,after_data,reason,correlation_id) values(tenant_id,auth.uid(),'socio','manual_payment_recorded','charge',charge_row.id,jsonb_build_object('status',charge_row.status),jsonb_build_object('status','paid','payment_id',payment_row.id,'amount_cents',charge_row.amount_cents),btrim(target_reason),correlation_id);
 return jsonb_build_object('payment_id',payment_row.id,'already_recorded',false);
exception when unique_violation then select * into payment_row from public.payments where assessoria_id=tenant_id and idempotency_key='manual:'||target_charge_id; return jsonb_build_object('payment_id',payment_row.id,'already_recorded',true); end; $$;
revoke all on function public.record_manual_payment(uuid,timestamptz,text) from public,anon; grant execute on function public.record_manual_payment(uuid,timestamptz,text) to authenticated;
commit;
