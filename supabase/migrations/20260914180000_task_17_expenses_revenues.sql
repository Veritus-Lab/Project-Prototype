begin;
grant select on public.financial_categories,public.expenses,public.other_revenues to authenticated;
create policy categories_select_socio on public.financial_categories for select to authenticated using(private.is_active_socio(assessoria_id));
create policy expenses_select_socio on public.expenses for select to authenticated using(private.is_active_socio(assessoria_id));
create policy revenues_select_socio on public.other_revenues for select to authenticated using(private.is_active_socio(assessoria_id));
create or replace function public.record_financial_entry(target_kind text,target_category text,target_description text,target_amount_cents bigint,target_occurred_at timestamptz,target_realized boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare tenant uuid; actor uuid; category_id uuid; entry_id uuid;
begin
 select assessoria_id,id into tenant,actor from public.team_members where profile_id=auth.uid() and role='socio' and status='active' limit 1;
 if tenant is null then raise exception using errcode='42501',message='Active socio membership required';end if;
 if target_kind not in ('expense','revenue') or char_length(btrim(target_category)) not between 2 and 120 or char_length(btrim(target_description)) not between 2 and 240 or target_amount_cents<=0 or target_occurred_at is null then raise exception using errcode='22023',message='Invalid financial entry';end if;
 insert into public.financial_categories(assessoria_id,kind,name) values(tenant,target_kind,btrim(target_category)) on conflict(assessoria_id,kind,name) do update set active=true returning id into category_id;
 if target_kind='expense' then
  insert into public.expenses(assessoria_id,category_id,description,status,amount_cents,paid_at,created_by_team_member_id) values(tenant,category_id,btrim(target_description),case when target_realized then 'paid'::public.expense_status else 'planned'::public.expense_status end,target_amount_cents,case when target_realized then target_occurred_at else null end,actor) returning id into entry_id;
  if target_realized then insert into public.cash_movements(assessoria_id,direction,source_type,source_id,expense_id,idempotency_key,amount_cents,occurred_at) values(tenant,'out','expense',entry_id,entry_id,'expense:'||entry_id,target_amount_cents,target_occurred_at);end if;
 else
  insert into public.other_revenues(assessoria_id,category_id,description,status,amount_cents,received_at,created_by_team_member_id) values(tenant,category_id,btrim(target_description),case when target_realized then 'received' else 'planned' end,target_amount_cents,case when target_realized then target_occurred_at else null end,actor) returning id into entry_id;
  if target_realized then insert into public.cash_movements(assessoria_id,direction,source_type,source_id,other_revenue_id,idempotency_key,amount_cents,occurred_at) values(tenant,'in','other_revenue',entry_id,entry_id,'revenue:'||entry_id,target_amount_cents,target_occurred_at);end if;
 end if; return jsonb_build_object('entry_id',entry_id);end;$$;
revoke all on function public.record_financial_entry(text,text,text,bigint,timestamptz,boolean) from public,anon;grant execute on function public.record_financial_entry(text,text,text,bigint,timestamptz,boolean) to authenticated;commit;
