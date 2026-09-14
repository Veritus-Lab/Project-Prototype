begin;

create extension if not exists pgtap with schema extensions;
set local role postgres;
set local search_path = public, extensions, auth, private, pg_catalog;

select plan(12);

insert into auth.users (id, email)
values
  ('80000000-0000-4000-8000-000000000001', 'socio-1@task08.test'),
  ('80000000-0000-4000-8000-000000000002', 'socio-2@task08.test'),
  ('80000000-0000-4000-8000-000000000003', 'professor@task08.test'),
  ('80000000-0000-4000-8000-000000000004', 'invitee@task08.test');

insert into public.assessorias (id, nome, slug)
values ('80000000-0000-4000-8000-000000000100', 'FLERNK Task 08', 'flernk-task-08');

insert into public.profiles (id, assessoria_id, nome, papel)
values
  ('80000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000100', 'Sócio 1', 'treinador'),
  ('80000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000100', 'Sócio 2', 'treinador'),
  ('80000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000100', 'Professor', 'treinador');

insert into public.team_members (id, assessoria_id, profile_id, role, status)
values
  ('80000000-0000-4000-8000-000000000011', '80000000-0000-4000-8000-000000000100', '80000000-0000-4000-8000-000000000001', 'socio', 'active'),
  ('80000000-0000-4000-8000-000000000012', '80000000-0000-4000-8000-000000000100', '80000000-0000-4000-8000-000000000002', 'socio', 'active'),
  ('80000000-0000-4000-8000-000000000013', '80000000-0000-4000-8000-000000000100', '80000000-0000-4000-8000-000000000003', 'professor', 'active');

select ok(not has_function_privilege('anon', 'public.bootstrap_treinador()', 'EXECUTE'), 'anon cannot execute retired bootstrap');
select ok(not has_function_privilege('authenticated', 'public.bootstrap_treinador()', 'EXECUTE'), 'authenticated cannot execute retired bootstrap');
select ok(not has_table_privilege('anon', 'public.team_invitations', 'SELECT'), 'anon cannot read team invitations');
select ok(not has_function_privilege('anon', 'public.create_team_invitation(text,public.team_member_role,text)', 'EXECUTE'), 'anon cannot create team invitations');
select ok(has_function_privilege('authenticated', 'public.create_team_invitation(text,public.team_member_role,text)', 'EXECUTE'), 'authenticated can use the controlled invitation RPC');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"80000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
select throws_ok(
  $$select public.create_team_invitation('blocked@task08.test', 'professor', encode(extensions.digest('blocked-token', 'sha256'), 'hex'))$$,
  '42501', 'Only socios may invite team members', 'professor cannot create a team invitation'
);

select set_config('request.jwt.claims', '{"sub":"80000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
select lives_ok(
  $$select public.create_team_invitation('invitee@task08.test', 'professor', encode(extensions.digest('team-token', 'sha256'), 'hex'))$$,
  'active socio creates a controlled team invitation'
);

select set_config('request.jwt.claims', '{"sub":"80000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
select lives_ok(
  $$select public.accept_team_invitation('team-token', 'Pessoa Convidada')$$,
  'matching authenticated account accepts the invitation'
);

set local role postgres;
select is((select role::text from public.team_members where profile_id = '80000000-0000-4000-8000-000000000004'), 'professor', 'acceptance applies the server-side invited role');
select is((select count(*) from public.profiles where id = '80000000-0000-4000-8000-000000000004'), 1::bigint, 'acceptance creates exactly one team profile');
select lives_ok($$delete from public.team_members where id = '80000000-0000-4000-8000-000000000011'$$, 'a socio can be removed while another active socio remains');
select throws_ok($$delete from public.team_members where id = '80000000-0000-4000-8000-000000000012'$$, '23514', 'A assessoria precisa manter ao menos um sócio ativo', 'last active socio cannot be removed');

select * from finish();
rollback;
