begin;

create extension if not exists pgtap with schema extensions;
set local role postgres;
set local search_path = public, extensions, auth, private, pg_catalog;

select plan(28);

select is(
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = any(array[
    'team_members','students','enrollments','enrollment_history','classes','class_memberships','class_meetings','attendances','absence_justifications',
    'plans','plan_versions','subscriptions','subscription_history','billing_cycles','billing_generation_runs','billing_generation_watermarks','charges',
    'charge_adjustments','payment_checkouts','payments','payment_settlements','payment_refunds','payment_disputes','financial_categories','expenses',
    'other_revenues','cash_movements','provider_events','integration_attempts','contact_preferences','message_templates','message_jobs','message_events',
    'leads','lead_history','audit_entries'
  ])),
  36::bigint,
  'all 36 target tables exist'
);

select is(
  (select count(*) from pg_catalog.pg_type where typnamespace = 'public'::regnamespace and typname = any(array[
    'team_member_role','team_member_status','enrollment_status','attendance_status','subscription_status','charge_status','checkout_status',
    'payment_status','settlement_status','refund_status','dispute_status','expense_status','provider_event_status','message_status','lead_status'
  ])),
  15::bigint,
  'all target state types exist'
);

select is(
  (select count(*) from pg_catalog.pg_class where relnamespace = 'public'::regnamespace and relname = any(array[
    'team_members','students','enrollments','enrollment_history','classes','class_memberships','class_meetings','attendances','absence_justifications',
    'plans','plan_versions','subscriptions','subscription_history','billing_cycles','billing_generation_runs','billing_generation_watermarks','charges',
    'charge_adjustments','payment_checkouts','payments','payment_settlements','payment_refunds','payment_disputes','financial_categories','expenses',
    'other_revenues','cash_movements','provider_events','integration_attempts','contact_preferences','message_templates','message_jobs','message_events',
    'leads','lead_history','audit_entries'
  ]) and relrowsecurity and relforcerowsecurity),
  36::bigint,
  'all target tables force RLS'
);

select is((select count(*) from information_schema.role_table_grants where grantee in ('anon','authenticated') and table_schema = 'public' and table_name in ('team_members','students','charges','payments','audit_entries')), 0::bigint, 'Data API roles receive no early grants');
select ok(has_table_privilege('service_role', 'public.students', 'SELECT,INSERT,UPDATE,DELETE'), 'service role can manage mutable foundation rows');
select ok(not has_table_privilege('service_role', 'public.audit_entries', 'UPDATE'), 'append-only audit rows cannot be updated by service role');
select ok(not has_table_privilege('service_role', 'public.cash_movements', 'DELETE'), 'cash facts cannot be deleted by service role');

insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
values
('00000000-0000-0000-0000-000000000000','61000000-0000-0000-0000-000000000001','authenticated','authenticated','owner@alpha.test','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','61000000-0000-0000-0000-000000000002','authenticated','authenticated','athlete@alpha.test','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','62000000-0000-0000-0000-000000000001','authenticated','authenticated','owner@beta.test','',now(),'{}','{}',now(),now(),'','','','');

insert into public.assessorias(id,nome,slug) values
('6a000000-0000-0000-0000-000000000001','Task 06 Alpha','task-06-alpha'),
('6b000000-0000-0000-0000-000000000001','Task 06 Beta','task-06-beta');
insert into public.profiles(id,assessoria_id,nome,papel) values
('61000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','Owner Alpha','treinador'),
('61000000-0000-0000-0000-000000000002','6a000000-0000-0000-0000-000000000001','Athlete Alpha','atleta'),
('62000000-0000-0000-0000-000000000001','6b000000-0000-0000-0000-000000000001','Owner Beta','treinador');
insert into public.treinadores(id,assessoria_id) values
('61000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001'),
('62000000-0000-0000-0000-000000000001','6b000000-0000-0000-0000-000000000001');
insert into public.atletas(id,assessoria_id,treinador_id) values
('61000000-0000-0000-0000-000000000002','6a000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001');

select lives_ok($$insert into public.students(id,assessoria_id,name) values ('63000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','Aluno sem login')$$, 'administrative student does not require an auth account');
select lives_ok($$insert into public.students(id,assessoria_id,auth_user_id,legacy_atleta_id,name,email) values ('63000000-0000-0000-0000-000000000002','6a000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000002','61000000-0000-0000-0000-000000000002','Aluno vinculado','athlete@alpha.test')$$, 'student links explicitly to auth and legacy athlete');
select throws_ok($$insert into public.students(assessoria_id,legacy_atleta_id,name) values ('6b000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000002','Vinculo cruzado')$$, '23503', null, 'student cannot link a legacy athlete from another organization');
select throws_ok($$insert into public.students(assessoria_id,auth_user_id,name) values ('6a000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000002','Conta duplicada')$$, '23505', null, 'one auth account cannot link to two students');

select lives_ok($$insert into public.team_members(id,assessoria_id,profile_id,role) values ('64000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001','socio')$$, 'team member uses the new owner role');
select throws_ok($$insert into public.team_members(assessoria_id,profile_id,role) values ('6a000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001','professor')$$, '23505', null, 'one profile cannot become two team members');
select throws_ok($$insert into public.team_members(assessoria_id,profile_id,role,status) values ('6b000000-0000-0000-0000-000000000001','62000000-0000-0000-0000-000000000001','professor','inactive')$$, '23514', null, 'inactive team member requires a deactivation timestamp');

select lives_ok($$insert into public.enrollments(id,assessoria_id,student_id,starts_on) values ('65000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001',current_date)$$, 'student receives one operational enrollment');
select throws_ok($$insert into public.enrollments(assessoria_id,student_id,starts_on) values ('6b000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001',current_date)$$, '23503', null, 'enrollment cannot cross organizations');
select throws_ok($$insert into public.enrollments(assessoria_id,student_id,starts_on,status) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001',current_date,'suspended')$$, '23505', null, 'student cannot have two current enrollments');

select lives_ok($$insert into public.plans(id,assessoria_id,name) values ('66000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','Mensal'); insert into public.plan_versions(id,assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values ('66000000-0000-0000-0000-000000000002','6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',1,15000,'monthly',10,current_date)$$, 'plan version freezes cents and billing rules');
select throws_ok($$insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,currency,periodicity,due_day,effective_from) values ('6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',2,15000,'USD','monthly',10,current_date)$$, '23514', null, 'foundation accepts BRL only');
select throws_ok($$insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values ('6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',2,-1,'monthly',10,current_date)$$, '23514', null, 'money cannot be negative');

select lives_ok($$insert into public.subscriptions(id,assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on) values ('67000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000002','active',15000,'monthly',10,current_date)$$, 'subscription references enrollment and frozen plan version');
select throws_ok($$insert into public.subscriptions(assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000002','paused',15000,'monthly',10,current_date)$$, '23505', null, 'student cannot have two current subscriptions');

select lives_ok($$insert into public.billing_cycles(id,assessoria_id,subscription_id,cycle_key,period_starts_on,period_ends_on,due_on) values ('68000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,date_trunc('month',current_date)::date,(date_trunc('month',current_date)+interval '1 month - 1 day')::date,(date_trunc('month',current_date)+interval '9 day')::date); insert into public.charges(id,assessoria_id,student_id,subscription_id,billing_cycle_id,cycle_key,status,amount_cents,due_on) values ('69000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001','68000000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,'open',15000,(date_trunc('month',current_date)+interval '9 day')::date)$$, 'cycle and charge are separate linked facts');
select throws_ok($$insert into public.charges(assessoria_id,student_id,subscription_id,billing_cycle_id,cycle_key,status,amount_cents,due_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001','68000000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,'open',15000,current_date)$$, '23505', null, 'subscription and cycle produce only one charge');
select throws_ok($$insert into public.contact_preferences(assessoria_id,student_id,whatsapp_phone,whatsapp_opt_in,billing_messages_enabled) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','5511999999999',false,true)$$, '23514', null, 'billing messages require WhatsApp opt-in');

select is((select count(*) from public.assessorias where id in ('6a000000-0000-0000-0000-000000000001','6b000000-0000-0000-0000-000000000001')), 2::bigint, 'foundation constraints preserve organization rows');
select is((select count(*) from public.atletas where id = '61000000-0000-0000-0000-000000000002'), 1::bigint, 'foundation keeps legacy athlete rows available');
select is((select count(*) from public.cobrancas where assessoria_id = '6a000000-0000-0000-0000-000000000001'), 0::bigint, 'foundation does not fabricate legacy charges');

select * from finish();
rollback;
