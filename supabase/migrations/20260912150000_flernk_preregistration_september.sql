begin;

-- Pré-cadastro operacional da FLERNK. A competência e o status informado ficam
-- em notes até que o motor financeiro gere cobranças oficiais.
with source(student_name, class_name, payment_status) as (
  values
    ('Carly Costa', 'Turma Adaptado', 'pendente'),
    ('Déborah Moreno', 'Turma Adaptado', 'pago'),
    ('Italo Bezerra', 'Turma Adaptado', 'pendente'),
    ('Talita Pinheiro', 'Turma Adaptado', 'pendente'),
    ('Thicyane Costa', 'Turma Adaptado', 'pago'),
    ('Vitória Mayra', 'Turma Adaptado', 'pago'),
    ('Wanderson Alves', 'Turma Adaptado', 'pendente'),
    ('Nileia', 'Turma Adaptado', 'pendente'),
    ('Antonia Mayara Cavalcante Silva', 'Turma 1 — Iniciantes', 'pendente'),
    ('Christyane Costa de Aquino', 'Turma 1 — Iniciantes', 'pago'),
    ('Daniele De Oliveira Moreno Ferreira', 'Turma 1 — Iniciantes', 'pago'),
    ('Daniele Kelly de Sousa Nunes', 'Turma 1 — Iniciantes', 'pago'),
    ('Juliana Rodrigues', 'Turma 1 — Iniciantes', 'pago'),
    ('Mirian de Oliveira Moreno Vasconcelos', 'Turma 1 — Iniciantes', 'pago'),
    ('Viviane Castro', 'Turma 1 — Iniciantes', 'pago'),
    ('Itamara', 'Turma 1 — Iniciantes', 'pendente'),
    ('Alana Thalita Vasconcelos Rocha', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Christine Pinheiro da Silva', 'Turma 2 — Iniciantes Intermediários', 'pago'),
    ('Clésia Pereira de Azevedo', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Daymison da Rocha Alves', 'Turma 2 — Iniciantes Intermediários', 'pago'),
    ('Gislane Mendes de Morais', 'Turma 2 — Iniciantes Intermediários', 'pago'),
    ('Janaina Soares e Silva', 'Turma 2 — Iniciantes Intermediários', 'pago'),
    ('João Paulo Frota', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Juliana Barroso Brandão', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Julyana', 'Turma 2 — Iniciantes Intermediários', 'pago'),
    ('Maria de Jesus', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Maria do Socorro Pinheiro Maia', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Mirelle Araujo da Silva', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Priscilla Rayanni Neres Pessoa', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Suzana Rocha Lima', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Ana Paula', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Thiago', 'Turma 2 — Iniciantes Intermediários', 'pendente'),
    ('Edwirges Aranha Alencar', 'Turma 3 — Iniciantes Avançados', 'pago'),
    ('Francisco Geovani Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Francisco Jose Rodrigues Brandao', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Gerôncio Bezerra', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Marcus George Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Maria Grazieli da Silva', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Marilia Rocha', 'Turma 3 — Iniciantes Avançados', 'pago'),
    ('Mikeas Duarte Braga', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Nilton Cesar Alves dos Santos Júnior', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Raquel Xavier da Silva', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Thales Alves', 'Turma 3 — Iniciantes Avançados', 'pendente'),
    ('Wagner Pimentel', 'Turma 3 — Iniciantes Avançados', 'pendente')
), target AS (
  select id as assessoria_id from public.assessorias where id = 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid
)
insert into public.students (assessoria_id, name, notes)
  select target.assessoria_id, source.student_name,
    format('Pré-cadastro FLERNK · setembro/2026 · mensalidade R$ 109,90 · status informado: %s', source.payment_status)
    from source cross join target
   where not exists (
     select 1 from public.students existing
      where existing.assessoria_id = target.assessoria_id and lower(existing.name) = lower(source.student_name)
   );

insert into public.classes (assessoria_id, name, description)
select 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid, class_name,
       'Turma pré-cadastrada da FLERNK · setembro/2026'
  from (values
    ('Turma Adaptado'),
    ('Turma 1 — Iniciantes'),
    ('Turma 2 — Iniciantes Intermediários'),
    ('Turma 3 — Iniciantes Avançados')
  ) classes(class_name)
 where not exists (
   select 1 from public.classes existing
    where existing.assessoria_id = 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid
      and existing.name = classes.class_name
 );

with source(student_name, class_name) as (
  values
    ('Carly Costa', 'Turma Adaptado'), ('Déborah Moreno', 'Turma Adaptado'), ('Italo Bezerra', 'Turma Adaptado'), ('Talita Pinheiro', 'Turma Adaptado'), ('Thicyane Costa', 'Turma Adaptado'), ('Vitória Mayra', 'Turma Adaptado'), ('Wanderson Alves', 'Turma Adaptado'), ('Nileia', 'Turma Adaptado'),
    ('Antonia Mayara Cavalcante Silva', 'Turma 1 — Iniciantes'), ('Christyane Costa de Aquino', 'Turma 1 — Iniciantes'), ('Daniele De Oliveira Moreno Ferreira', 'Turma 1 — Iniciantes'), ('Daniele Kelly de Sousa Nunes', 'Turma 1 — Iniciantes'), ('Juliana Rodrigues', 'Turma 1 — Iniciantes'), ('Mirian de Oliveira Moreno Vasconcelos', 'Turma 1 — Iniciantes'), ('Viviane Castro', 'Turma 1 — Iniciantes'), ('Itamara', 'Turma 1 — Iniciantes'),
    ('Alana Thalita Vasconcelos Rocha', 'Turma 2 — Iniciantes Intermediários'), ('Christine Pinheiro da Silva', 'Turma 2 — Iniciantes Intermediários'), ('Clésia Pereira de Azevedo', 'Turma 2 — Iniciantes Intermediários'), ('Daymison da Rocha Alves', 'Turma 2 — Iniciantes Intermediários'), ('Gislane Mendes de Morais', 'Turma 2 — Iniciantes Intermediários'), ('Janaina Soares e Silva', 'Turma 2 — Iniciantes Intermediários'), ('João Paulo Frota', 'Turma 2 — Iniciantes Intermediários'), ('Juliana Barroso Brandão', 'Turma 2 — Iniciantes Intermediários'), ('Julyana', 'Turma 2 — Iniciantes Intermediários'), ('Maria de Jesus', 'Turma 2 — Iniciantes Intermediários'), ('Maria do Socorro Pinheiro Maia', 'Turma 2 — Iniciantes Intermediários'), ('Mirelle Araujo da Silva', 'Turma 2 — Iniciantes Intermediários'), ('Priscilla Rayanni Neres Pessoa', 'Turma 2 — Iniciantes Intermediários'), ('Suzana Rocha Lima', 'Turma 2 — Iniciantes Intermediários'), ('Ana Paula', 'Turma 2 — Iniciantes Intermediários'), ('Thiago', 'Turma 2 — Iniciantes Intermediários'),
    ('Edwirges Aranha Alencar', 'Turma 3 — Iniciantes Avançados'), ('Francisco Geovani Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Francisco Jose Rodrigues Brandao', 'Turma 3 — Iniciantes Avançados'), ('Gerôncio Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Marcus George Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Maria Grazieli da Silva', 'Turma 3 — Iniciantes Avançados'), ('Marilia Rocha', 'Turma 3 — Iniciantes Avançados'), ('Mikeas Duarte Braga', 'Turma 3 — Iniciantes Avançados'), ('Nilton Cesar Alves dos Santos Júnior', 'Turma 3 — Iniciantes Avançados'), ('Raquel Xavier da Silva', 'Turma 3 — Iniciantes Avançados'), ('Thales Alves', 'Turma 3 — Iniciantes Avançados'), ('Wagner Pimentel', 'Turma 3 — Iniciantes Avançados')
), target AS (select 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid as assessoria_id), created_enrollments AS (
  insert into public.enrollments (assessoria_id, student_id, status, starts_on)
  select target.assessoria_id, student.id, 'active', date '2026-09-01'
    from source cross join target
    join public.students student on student.assessoria_id = target.assessoria_id and lower(student.name) = lower(source.student_name)
   where not exists (select 1 from public.enrollments current where current.assessoria_id = target.assessoria_id and current.student_id = student.id and current.status in ('active', 'suspended'))
  returning id, assessoria_id, student_id
)
insert into public.enrollment_history (assessoria_id, enrollment_id, new_status, reason)
select assessoria_id, id, 'active', 'Importação de pré-cadastro setembro/2026' from created_enrollments;

with source(student_name, class_name) as (
  values
    ('Carly Costa', 'Turma Adaptado'), ('Déborah Moreno', 'Turma Adaptado'), ('Italo Bezerra', 'Turma Adaptado'), ('Talita Pinheiro', 'Turma Adaptado'), ('Thicyane Costa', 'Turma Adaptado'), ('Vitória Mayra', 'Turma Adaptado'), ('Wanderson Alves', 'Turma Adaptado'), ('Nileia', 'Turma Adaptado'),
    ('Antonia Mayara Cavalcante Silva', 'Turma 1 — Iniciantes'), ('Christyane Costa de Aquino', 'Turma 1 — Iniciantes'), ('Daniele De Oliveira Moreno Ferreira', 'Turma 1 — Iniciantes'), ('Daniele Kelly de Sousa Nunes', 'Turma 1 — Iniciantes'), ('Juliana Rodrigues', 'Turma 1 — Iniciantes'), ('Mirian de Oliveira Moreno Vasconcelos', 'Turma 1 — Iniciantes'), ('Viviane Castro', 'Turma 1 — Iniciantes'), ('Itamara', 'Turma 1 — Iniciantes'),
    ('Alana Thalita Vasconcelos Rocha', 'Turma 2 — Iniciantes Intermediários'), ('Christine Pinheiro da Silva', 'Turma 2 — Iniciantes Intermediários'), ('Clésia Pereira de Azevedo', 'Turma 2 — Iniciantes Intermediários'), ('Daymison da Rocha Alves', 'Turma 2 — Iniciantes Intermediários'), ('Gislane Mendes de Morais', 'Turma 2 — Iniciantes Intermediários'), ('Janaina Soares e Silva', 'Turma 2 — Iniciantes Intermediários'), ('João Paulo Frota', 'Turma 2 — Iniciantes Intermediários'), ('Juliana Barroso Brandão', 'Turma 2 — Iniciantes Intermediários'), ('Julyana', 'Turma 2 — Iniciantes Intermediários'), ('Maria de Jesus', 'Turma 2 — Iniciantes Intermediários'), ('Maria do Socorro Pinheiro Maia', 'Turma 2 — Iniciantes Intermediários'), ('Mirelle Araujo da Silva', 'Turma 2 — Iniciantes Intermediários'), ('Priscilla Rayanni Neres Pessoa', 'Turma 2 — Iniciantes Intermediários'), ('Suzana Rocha Lima', 'Turma 2 — Iniciantes Intermediários'), ('Ana Paula', 'Turma 2 — Iniciantes Intermediários'), ('Thiago', 'Turma 2 — Iniciantes Intermediários'),
    ('Edwirges Aranha Alencar', 'Turma 3 — Iniciantes Avançados'), ('Francisco Geovani Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Francisco Jose Rodrigues Brandao', 'Turma 3 — Iniciantes Avançados'), ('Gerôncio Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Marcus George Gonçalves Bezerra', 'Turma 3 — Iniciantes Avançados'), ('Maria Grazieli da Silva', 'Turma 3 — Iniciantes Avançados'), ('Marilia Rocha', 'Turma 3 — Iniciantes Avançados'), ('Mikeas Duarte Braga', 'Turma 3 — Iniciantes Avançados'), ('Nilton Cesar Alves dos Santos Júnior', 'Turma 3 — Iniciantes Avançados'), ('Raquel Xavier da Silva', 'Turma 3 — Iniciantes Avançados'), ('Thales Alves', 'Turma 3 — Iniciantes Avançados'), ('Wagner Pimentel', 'Turma 3 — Iniciantes Avançados')
)
insert into public.class_memberships (assessoria_id, class_id, student_id, enrollment_id, starts_on)
select 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid, class.id, student.id, enrollment.id, date '2026-09-01'
  from source
  join public.students student on student.assessoria_id = 'b8b49b94-ce66-49b6-8e4c-2dd98081abcf'::uuid and lower(student.name) = lower(source.student_name)
  join public.classes class on class.assessoria_id = student.assessoria_id and class.name = source.class_name
  join public.enrollments enrollment on enrollment.assessoria_id = student.assessoria_id and enrollment.student_id = student.id and enrollment.status in ('active', 'suspended')
 where not exists (select 1 from public.class_memberships existing where existing.assessoria_id = student.assessoria_id and existing.class_id = class.id and existing.student_id = student.id and existing.ends_on is null);

commit;
