begin;

create extension if not exists pgtap with schema extensions;
set local role postgres;
select plan(10);

insert into auth.users (id, email)
values
  ('70000000-0000-4000-8000-000000000001', 'socio@example.invalid'),
  ('70000000-0000-4000-8000-000000000002', 'professor@example.invalid'),
  ('70000000-0000-4000-8000-000000000003', 'aluno-a@example.invalid'),
  ('70000000-0000-4000-8000-000000000004', 'aluno-b@example.invalid');

insert into public.assessorias (id, nome, slug)
values
  ('70000000-0000-4000-8000-000000000100', 'FLERNK Teste', 'flernk-task-07');

insert into public.profiles (id, assessoria_id, nome, papel)
values
  ('70000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000100', 'Sócio', 'treinador'),
  ('70000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000100', 'Professor', 'treinador'),
  ('70000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000100', 'Aluno A', 'atleta'),
  ('70000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000100', 'Aluno B', 'atleta');

insert into public.team_members (id, assessoria_id, profile_id, role, status)
values
  ('70000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000100', '70000000-0000-4000-8000-000000000001', 'socio', 'active'),
  ('70000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000100', '70000000-0000-4000-8000-000000000002', 'professor', 'active');

insert into public.students (id, assessoria_id, auth_user_id, name)
values
  ('70000000-0000-4000-8000-000000000021', '70000000-0000-4000-8000-000000000100', '70000000-0000-4000-8000-000000000003', 'Aluno A'),
  ('70000000-0000-4000-8000-000000000022', '70000000-0000-4000-8000-000000000100', '70000000-0000-4000-8000-000000000004', 'Aluno B');

select ok(has_table_privilege('authenticated', 'public.students', 'SELECT'), 'authenticated can reach the protected students table');
select ok(not has_table_privilege('anon', 'public.students', 'SELECT'), 'anon cannot reach students');
select ok(not has_table_privilege('authenticated', 'public.charges', 'SELECT'), 'financial details remain unavailable through direct Data API access');

set local role authenticated;
select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000003', true);
select results_eq(
  $$select id from public.students order by id$$,
  array['70000000-0000-4000-8000-000000000021'::uuid],
  'student A can read only their own student row'
);
select is_empty(
  $$select id from public.students where id = '70000000-0000-4000-8000-000000000022'$$,
  'student A cannot read student B'
);

select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000002', true);
select throws_ok(
  $$select * from public.charges$$,
  '42501', null,
  'professor cannot read direct financial rows'
);
select throws_ok($$select * from public.cobrancas$$, '42501', null, 'professor cannot read legacy financial rows');
select throws_ok($$insert into public.assinaturas_atletas (assessoria_id, atleta_id, valor_centavos, periodicidade, dia_vencimento, inicio_em) values ('70000000-0000-4000-8000-000000000100', '70000000-0000-4000-8000-000000000003', 100, 'mensal', 1, current_date)$$, '42501', null, 'professor cannot write legacy subscriptions');
select results_eq(
  $$select public.get_student_financial_status('70000000-0000-4000-8000-000000000021')::text$$,
  array['nao_configurado'],
  'professor receives only the aggregate enum for a student in the same assessoria'
);

select set_config('request.jwt.claim.sub', '70000000-0000-4000-8000-000000000004', true);
select throws_ok(
  $$select public.get_student_financial_status('70000000-0000-4000-8000-000000000021')$$,
  '42501', null,
  'student cannot call the professor financial-status RPC'
);

select * from finish();
rollback;
