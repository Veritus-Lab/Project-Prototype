begin;

create extension if not exists pgtap with schema extensions;
set local role postgres;
set local search_path = public, extensions, auth, private, pg_catalog;

select plan(44);

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

select is((select count(*) from information_schema.role_table_grants where grantee in ('anon','authenticated') and table_schema = 'public' and table_name = any(array[
  'team_members','students','enrollments','enrollment_history','classes','class_memberships','class_meetings','attendances','absence_justifications',
  'plans','plan_versions','subscriptions','subscription_history','billing_cycles','billing_generation_runs','billing_generation_watermarks','charges',
  'charge_adjustments','payment_checkouts','payments','payment_settlements','payment_refunds','payment_disputes','financial_categories','expenses',
  'other_revenues','cash_movements','provider_events','integration_attempts','contact_preferences','message_templates','message_jobs','message_events',
  'leads','lead_history','audit_entries'
])), 0::bigint, 'Data API roles receive no early grants on any target table');
select ok(has_table_privilege('service_role', 'public.students', 'SELECT,INSERT,UPDATE,DELETE'), 'service role can manage mutable foundation rows');
select ok(not has_table_privilege('service_role', 'public.audit_entries', 'UPDATE'), 'append-only audit rows cannot be updated by service role');
select ok(not has_table_privilege('service_role', 'public.cash_movements', 'DELETE'), 'cash facts cannot be deleted by service role');
select ok(not has_table_privilege('service_role', 'public.payments', 'DELETE'), 'payment facts cannot be deleted by service role');
select ok(not has_table_privilege('service_role', 'public.provider_events', 'DELETE'), 'provider events cannot be deleted by service role');
select has_column('provider_events', 'next_attempt_at', 'provider event retries have a durable schedule');
select has_column('message_jobs', 'next_attempt_at', 'message job retries have a durable schedule');
select has_column('message_events', 'processing_status', 'message delivery events track processing separately');
select has_column('message_events', 'lease_expires_at', 'message delivery events support recoverable claims');

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

insert into public.students(id,assessoria_id,name) values ('63000000-0000-0000-0000-000000000003','6a000000-0000-0000-0000-000000000001','Segundo aluno');
insert into public.enrollments(id,assessoria_id,student_id,starts_on) values ('65000000-0000-0000-0000-000000000003','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000003',current_date);
insert into public.classes(id,assessoria_id,name) values ('65100000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','Turma Alpha');
select throws_ok($$insert into public.class_memberships(assessoria_id,class_id,student_id,enrollment_id,starts_on) values ('6a000000-0000-0000-0000-000000000001','65100000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000003',current_date)$$, '23503', null, 'class membership cannot combine a student with another enrollment');
insert into public.class_memberships(id,assessoria_id,class_id,student_id,enrollment_id,starts_on) values ('65200000-0000-0000-0000-000000000003','6a000000-0000-0000-0000-000000000001','65100000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000003','65000000-0000-0000-0000-000000000003',current_date);
insert into public.class_meetings(id,assessoria_id,class_id,starts_at,ends_at) values ('65300000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','65100000-0000-0000-0000-000000000001',now(),now()+interval '1 hour');
select throws_ok($$insert into public.attendances(assessoria_id,class_id,meeting_id,membership_id,student_id) values ('6a000000-0000-0000-0000-000000000001','65100000-0000-0000-0000-000000000001','65300000-0000-0000-0000-000000000001','65200000-0000-0000-0000-000000000003','63000000-0000-0000-0000-000000000001')$$, '23503', null, 'attendance cannot combine another student membership');

select lives_ok($$insert into public.plans(id,assessoria_id,name) values ('66000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','Mensal'); insert into public.plan_versions(id,assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values ('66000000-0000-0000-0000-000000000002','6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',1,15000,'monthly',10,current_date)$$, 'plan version freezes cents and billing rules');
select throws_ok($$insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,currency,periodicity,due_day,effective_from) values ('6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',2,15000,'USD','monthly',10,current_date)$$, '23514', null, 'foundation accepts BRL only');
select throws_ok($$insert into public.plan_versions(assessoria_id,plan_id,version_number,amount_cents,periodicity,due_day,effective_from) values ('6a000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001',2,-1,'monthly',10,current_date)$$, '23514', null, 'money cannot be negative');

select lives_ok($$insert into public.subscriptions(id,assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on) values ('67000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000002','active',15000,'monthly',10,current_date)$$, 'subscription references enrollment and frozen plan version');
select throws_ok($$insert into public.subscriptions(assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000002','paused',15000,'monthly',10,current_date)$$, '23505', null, 'student cannot have two current subscriptions');
select throws_ok($$insert into public.subscriptions(assessoria_id,student_id,enrollment_id,plan_id,plan_version_id,status,amount_cents,periodicity,due_day,starts_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','65000000-0000-0000-0000-000000000003','66000000-0000-0000-0000-000000000001','66000000-0000-0000-0000-000000000002','ended',15000,'monthly',10,current_date)$$, '23503', null, 'subscription cannot combine a student with another enrollment');

select lives_ok($$insert into public.billing_generation_runs(id,assessoria_id,window_starts_on,window_ends_on,status,expected_count,generated_count,completed_at) values ('67500000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001',current_date,current_date,'completed',1,1,now()); insert into public.billing_cycles(id,assessoria_id,subscription_id,generation_run_id,cycle_key,period_starts_on,period_ends_on,due_on) values ('68000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001','67500000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,date_trunc('month',current_date)::date,(date_trunc('month',current_date)+interval '1 month - 1 day')::date,(date_trunc('month',current_date)+interval '9 day')::date); insert into public.charges(id,assessoria_id,student_id,subscription_id,billing_cycle_id,cycle_key,status,amount_cents,due_on) values ('69000000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001','68000000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,'open',15000,(date_trunc('month',current_date)+interval '9 day')::date)$$, 'cycle and charge are separate linked facts with generation provenance');
select throws_ok($$insert into public.charges(assessoria_id,student_id,subscription_id,billing_cycle_id,cycle_key,status,amount_cents,due_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','67000000-0000-0000-0000-000000000001','68000000-0000-0000-0000-000000000001',date_trunc('month',current_date)::date,'open',15000,current_date)$$, '23505', null, 'subscription and cycle produce only one charge');
select throws_ok($$insert into public.charges(assessoria_id,student_id,subscription_id,billing_cycle_id,cycle_key,status,amount_cents,due_on) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000003','67000000-0000-0000-0000-000000000001','68000000-0000-0000-0000-000000000001',(date_trunc('month',current_date)+interval '1 month')::date,'open',15000,current_date)$$, '23503', null, 'charge cannot combine another student or cycle key');
select throws_ok($$insert into public.contact_preferences(assessoria_id,student_id,whatsapp_phone,whatsapp_opt_in,billing_messages_enabled) values ('6a000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','5511999999999',false,true)$$, '23514', null, 'billing messages require WhatsApp opt-in');
insert into public.payments(id,assessoria_id,charge_id,provider,idempotency_key,status,amount_cents,confirmed_at) values ('69800000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','69000000-0000-0000-0000-000000000001','manual','manual:1','confirmed',15000,now());
insert into public.payment_settlements(id,assessoria_id,payment_id,status,gross_amount_cents,fee_amount_cents,net_amount_cents,received_at) values ('69900000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','69800000-0000-0000-0000-000000000001','received',15000,0,15000,now());
select lives_ok($$insert into public.cash_movements(assessoria_id,direction,source_type,source_id,settlement_id,idempotency_key,amount_cents,occurred_at) values ('6a000000-0000-0000-0000-000000000001','in','settlement','69900000-0000-0000-0000-000000000001','69900000-0000-0000-0000-000000000001','settlement:1',15000,now())$$, 'cash movement accepts a valid anchored settlement');
select throws_ok($$insert into public.cash_movements(assessoria_id,direction,source_type,source_id,settlement_id,idempotency_key,amount_cents,occurred_at) values ('6a000000-0000-0000-0000-000000000001','in','settlement','69900000-0000-0000-0000-000000000001','69900000-0000-0000-0000-000000000001','different-key',15000,now())$$, '23505', null, 'one source fact cannot generate two cash movements');
select throws_ok($$insert into public.cash_movements(assessoria_id,direction,source_type,source_id,settlement_id,idempotency_key,amount_cents,occurred_at) values ('6a000000-0000-0000-0000-000000000001','out','settlement','69900000-0000-0000-0000-000000000001','69900000-0000-0000-0000-000000000001','wrong-direction',15000,now())$$, '23514', null, 'cash direction must match source type');
select throws_ok($$insert into public.cash_movements(assessoria_id,direction,source_type,source_id,settlement_id,idempotency_key,amount_cents,occurred_at) values ('6a000000-0000-0000-0000-000000000001','in','settlement','69900000-0000-0000-0000-000000000099','69900000-0000-0000-0000-000000000099','missing-source',15000,now())$$, '23503', null, 'cash source must exist');

insert into public.message_templates(id,assessoria_id,code,version,body_preview) values ('69a00000-0000-0000-0000-000000000001','6a000000-0000-0000-0000-000000000001','billing_due',1,'Lembrete');
select throws_ok($$insert into public.message_jobs(assessoria_id,charge_id,student_id,template_id,template_version,cadence_offset,scheduled_for) values ('6a000000-0000-0000-0000-000000000001','69000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000003','69a00000-0000-0000-0000-000000000001',1,-1,now())$$, '23503', null, 'message job student must own the charge');
select throws_ok($$insert into public.message_jobs(assessoria_id,charge_id,student_id,template_id,template_version,cadence_offset,scheduled_for) values ('6a000000-0000-0000-0000-000000000001','69000000-0000-0000-0000-000000000001','63000000-0000-0000-0000-000000000001','69a00000-0000-0000-0000-000000000001',2,-1,now())$$, '23503', null, 'message job template version must exist');

select is((select count(*) from public.assessorias where id in ('6a000000-0000-0000-0000-000000000001','6b000000-0000-0000-0000-000000000001')), 2::bigint, 'foundation constraints preserve organization rows');
select is((select count(*) from public.atletas where id = '61000000-0000-0000-0000-000000000002'), 1::bigint, 'foundation keeps legacy athlete rows available');
select is((select count(*) from public.cobrancas where assessoria_id = '6a000000-0000-0000-0000-000000000001'), 0::bigint, 'foundation does not fabricate legacy charges');

select * from finish();
rollback;
