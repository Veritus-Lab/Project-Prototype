-- Task 17: bind manual trainings to the safe catalog and require structured blocks.
begin;

alter table public.treinos
  add column tipo_treino_id uuid
    references public.tipos_treino_catalogo (id) on delete set null;

alter table public.treinos
  add constraint treinos_descricao_length_check
    check (descricao is null or char_length(btrim(descricao)) <= 500);

alter table public.treinos
  drop constraint if exists treinos_estrutura_check;

alter table public.treinos
  add constraint treinos_estrutura_blocos_check check (
    jsonb_typeof(estrutura) = 'object'
    and estrutura ? 'blocos'
    and jsonb_typeof(estrutura -> 'blocos') = 'array'
    and jsonb_array_length(estrutura -> 'blocos') between 1 and 8
  );

create index treinos_assessoria_tipo_created_idx
  on public.treinos (assessoria_id, tipo_treino_id, created_at desc);

commit;
