begin;

create extension if not exists pgtap with schema extensions;

-- The remote pg_prove session does not guarantee that the extensions schema
-- is visible or that its temporary login role inherits postgres privileges.
set local role postgres;
set local search_path = public, extensions, auth, private, pg_catalog;

select plan(65);

-- Fixed IDs keep every assertion deterministic and independent from remote data.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'treinador@alpha.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'treinador@beta.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'atleta@alpha.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'atleta@beta.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'outro@alpha.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'convidado@alpha.test', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into public.assessorias (id, nome, slug)
values
  ('a0000000-0000-0000-0000-000000000001', 'Assessoria Alfa', 'assessoria-alfa'),
  ('b0000000-0000-0000-0000-000000000001', 'Assessoria Beta', 'assessoria-beta');

insert into public.profiles (id, assessoria_id, nome, papel)
values
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Treinador Alfa', 'treinador'),
  ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Treinador Beta', 'treinador'),
  ('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Atleta Alfa', 'atleta'),
  ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Atleta Beta', 'atleta'),
  ('20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Outro Atleta Alfa', 'atleta');

insert into public.treinadores (id, assessoria_id)
values
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001');

insert into public.atletas (id, assessoria_id, treinador_id)
values
  ('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001');

insert into public.convites_atletas (
  id,
  assessoria_id,
  treinador_id,
  email,
  token_hash,
  expira_em
)
values
  ('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'atleta@alpha.test', repeat('a', 64), now() + interval '7 days'),
  ('50000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'atleta@beta.test', repeat('b', 64), now() + interval '7 days'),
  ('50000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'convidado@alpha.test', repeat('c', 64), now() + interval '7 days');

insert into public.treinos (id, assessoria_id, treinador_id, titulo, origem, estrutura)
values
  ('30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Treino Alfa atribuido', 'manual', '{"blocos":[]}'::jsonb),
  ('30000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Treino Alfa de outro atleta', 'manual', '{"blocos":[]}'::jsonb),
  ('30000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Treino Beta', 'manual', '{"blocos":[]}'::jsonb);

insert into public.treinos_atletas (id, assessoria_id, treino_id, atleta_id)
values
  ('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002');

-- RLS must be both enabled and forced on every public business table.
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.assessorias'::regclass), 'assessorias has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.profiles'::regclass), 'profiles has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.treinadores'::regclass), 'treinadores has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.atletas'::regclass), 'atletas has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.convites_atletas'::regclass), 'convites_atletas has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.treinos'::regclass), 'treinos has forced RLS');
select ok((select relrowsecurity and relforcerowsecurity from pg_catalog.pg_class where oid = 'public.treinos_atletas'::regclass), 'treinos_atletas has forced RLS');

select ok(not has_table_privilege('anon', 'public.assessorias', 'SELECT'), 'anon cannot read assessorias');
select ok(not has_table_privilege('anon', 'public.profiles', 'SELECT'), 'anon cannot read profiles');
select ok(not has_table_privilege('anon', 'public.treinadores', 'SELECT'), 'anon cannot read treinadores');
select ok(not has_table_privilege('anon', 'public.atletas', 'SELECT'), 'anon cannot read atletas');
select ok(not has_table_privilege('anon', 'public.convites_atletas', 'SELECT'), 'anon cannot read invitation rows');
select ok(not has_table_privilege('anon', 'public.treinos', 'SELECT'), 'anon cannot read treinos');
select ok(not has_table_privilege('anon', 'public.treinos_atletas', 'SELECT'), 'anon cannot read treino links');
select ok(not has_column_privilege('authenticated', 'public.convites_atletas', 'token_hash', 'SELECT'), 'invitation token hash is never exposed to authenticated clients');

select ok(has_function_privilege('anon', 'public.validar_convite(text)', 'EXECUTE'), 'anon may execute only invitation validation');
select ok(has_function_privilege('authenticated', 'public.validar_convite(text)', 'EXECUTE'), 'authenticated may validate invitations');
select ok(not has_function_privilege('anon', 'public.aceitar_convite(text,uuid,text)', 'EXECUTE'), 'anon cannot accept invitations');
select ok(has_function_privilege('authenticated', 'public.aceitar_convite(text,uuid,text)', 'EXECUTE'), 'authenticated may accept invitations');
select ok(not has_function_privilege('anon', 'public.bootstrap_treinador()', 'EXECUTE'), 'anon cannot execute bootstrap directly');
select ok(not has_function_privilege('authenticated', 'public.bootstrap_treinador()', 'EXECUTE'), 'authenticated cannot execute bootstrap directly');
select ok(not has_function_privilege('anon', 'private.current_assessoria_id()', 'EXECUTE'), 'anon cannot execute tenant helper');
select ok(has_function_privilege('authenticated', 'private.current_assessoria_id()', 'EXECUTE'), 'authenticated may execute the tenant helper required by policies');
select ok(not has_function_privilege('anon', 'private.is_treinador(uuid)', 'EXECUTE'), 'anon cannot execute role helper');
select ok(has_function_privilege('authenticated', 'private.is_treinador(uuid)', 'EXECUTE'), 'authenticated may execute the role helper required by policies');

-- The auth trigger creates all trainer records atomically from validated metadata.
select lives_ok(
  $$
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      '10000000-0000-0000-0000-000000000009',
      'authenticated',
      'authenticated',
      'bootstrap@test.local',
      '',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"papel":"treinador","nome":"Treinador Bootstrap","assessoria_nome":"Assessoria Bootstrap"}',
      now(), now(), '', '', '', ''
    )
  $$,
  'trainer bootstrap succeeds with valid metadata'
);
select is((select count(*) from public.assessorias where nome = 'Assessoria Bootstrap'), 1::bigint, 'bootstrap creates one tenant');
select is((select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000009' and papel = 'treinador'), 1::bigint, 'bootstrap creates trainer profile');
select is((select count(*) from public.treinadores where id = '10000000-0000-0000-0000-000000000009'), 1::bigint, 'bootstrap creates trainer extension');

set local role anon;
select results_eq(
  $$select coalesce(email_mascarado, '∅') || '|' || coalesce(assessoria_nome, '∅') || '|' || estado from public.validar_convite(repeat('a', 64))$$,
  array['a****a@alpha.test|Assessoria Alfa|pendente'::text],
  'public validation returns only masked email, tenant name and state'
);
select results_eq(
  $$select coalesce(email_mascarado, '∅') || '|' || coalesce(assessoria_nome, '∅') || '|' || estado from public.validar_convite('')$$,
  array['∅|∅|invalido'::text],
  'empty invitation hash has a safe response'
);
set local role postgres;

-- Trainer Alfa sees its tenant and nothing from Beta.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;
select results_eq($$select count(*) from public.profiles where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[3::bigint], 'trainer Alfa sees Alfa profiles');
select results_eq($$select count(*) from public.profiles where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Alfa cannot see Beta profiles');
select results_eq($$select count(*) from public.convites_atletas where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[2::bigint], 'trainer Alfa sees Alfa invitations');
select results_eq($$select count(*) from public.convites_atletas where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Alfa cannot see Beta invitations');
select results_eq($$select count(*) from public.treinos where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[2::bigint], 'trainer Alfa sees Alfa workouts');
select results_eq($$select count(*) from public.treinos where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Alfa cannot see Beta workouts');
select results_eq($$select count(*) from public.treinos_atletas where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[2::bigint], 'trainer Alfa sees Alfa links');
select results_eq($$select count(*) from public.treinos_atletas where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Alfa cannot see Beta links');
set local role postgres;

-- Trainer Beta sees its tenant and nothing from Alfa.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select results_eq($$select count(*) from public.profiles where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[2::bigint], 'trainer Beta sees Beta profiles');
select results_eq($$select count(*) from public.profiles where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Beta cannot see Alfa profiles');
select results_eq($$select count(*) from public.convites_atletas where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'trainer Beta sees Beta invitations');
select results_eq($$select count(*) from public.convites_atletas where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Beta cannot see Alfa invitations');
select results_eq($$select count(*) from public.treinos where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'trainer Beta sees Beta workouts');
select results_eq($$select count(*) from public.treinos where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Beta cannot see Alfa workouts');
select results_eq($$select count(*) from public.treinos_atletas where assessoria_id = 'b0000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'trainer Beta sees Beta links');
select results_eq($$select count(*) from public.treinos_atletas where assessoria_id = 'a0000000-0000-0000-0000-000000000001'$$, array[0::bigint], 'trainer Beta cannot see Alfa links');
set local role postgres;

-- An athlete sees only its own identity, extension, links and assigned workouts.
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;
select results_eq($$select count(*) from public.profiles where id = '20000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'athlete sees own profile');
select results_eq($$select count(*) from public.profiles where id = '20000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'athlete cannot see another profile in the same tenant');
select results_eq($$select count(*) from public.profiles where id = '20000000-0000-0000-0000-000000000002'$$, array[0::bigint], 'athlete cannot see a profile in another tenant');
select results_eq($$select count(*) from public.atletas where id = '20000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'athlete sees own extension');
select results_eq($$select count(*) from public.atletas where id = '20000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'athlete cannot see another extension in the same tenant');
select results_eq($$select count(*) from public.atletas where id = '20000000-0000-0000-0000-000000000002'$$, array[0::bigint], 'athlete cannot see an extension in another tenant');
select results_eq($$select count(*) from public.treinos where id = '30000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'athlete sees assigned workout');
select results_eq($$select count(*) from public.treinos where id = '30000000-0000-0000-0000-000000000002'$$, array[0::bigint], 'athlete cannot see unassigned workout in the same tenant');
select results_eq($$select count(*) from public.treinos where id = '30000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'athlete cannot see workout in another tenant');
select results_eq($$select count(*) from public.treinos_atletas where atleta_id = '20000000-0000-0000-0000-000000000001'$$, array[1::bigint], 'athlete sees own link');
select results_eq($$select count(*) from public.treinos_atletas where atleta_id = '20000000-0000-0000-0000-000000000003'$$, array[0::bigint], 'athlete cannot see another link in the same tenant');
select results_eq($$select count(*) from public.treinos_atletas where atleta_id = '20000000-0000-0000-0000-000000000002'$$, array[0::bigint], 'athlete cannot see a link in another tenant');

select throws_ok(
  $$select public.aceitar_convite(repeat('c', 64), '20000000-0000-0000-0000-000000000004', 'Convidado Alfa')$$,
  '42501',
  'sessao nao corresponde ao usuario',
  'acceptance rejects a client-supplied user different from auth.uid()'
);
set local role postgres;

select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$select public.aceitar_convite(repeat('c', 64), '20000000-0000-0000-0000-000000000004', 'Convidado Alfa')$$,
  'matching authenticated user accepts invitation'
);
select results_eq($$select count(*) from public.profiles where id = '20000000-0000-0000-0000-000000000004' and papel = 'atleta'$$, array[1::bigint], 'acceptance creates athlete profile');
select results_eq($$select count(*) from public.atletas where id = '20000000-0000-0000-0000-000000000004'$$, array[1::bigint], 'acceptance creates athlete extension');
set local role postgres;
select results_eq(
  $$select (status::text || '|' || (usado_em is not null)::text) from public.convites_atletas where id = '50000000-0000-0000-0000-000000000003'$$,
  array['aceito|true'::text],
  'acceptance marks invitation used atomically'
);
set local role authenticated;
select throws_ok(
  $$select public.aceitar_convite(repeat('c', 64), '20000000-0000-0000-0000-000000000004', 'Convidado Alfa')$$,
  '22023',
  'convite ja utilizado',
  'used invitation cannot be accepted again'
);
set local role postgres;

select * from finish();
rollback;
