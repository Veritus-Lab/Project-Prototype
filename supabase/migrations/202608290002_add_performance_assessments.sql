create table public.testes_desempenho (
  id uuid primary key default gen_random_uuid(),
  assessoria_id uuid not null,
  atleta_id uuid not null,
  treinador_id uuid not null,
  avaliado_em date not null,
  protocolo text not null check (protocolo in ('ritmo_limiar', 'vam', 'outro')),
  ritmo_limiar_segundos_por_km integer check (ritmo_limiar_segundos_por_km between 120 and 900),
  vam_metros_por_min integer check (vam_metros_por_min between 80 and 500),
  observacao text check (char_length(observacao) <= 500),
  created_at timestamptz not null default now(),
  constraint testes_desempenho_atleta_fkey
    foreign key (assessoria_id, atleta_id)
    references public.atletas (assessoria_id, id),
  constraint testes_desempenho_treinador_fkey
    foreign key (assessoria_id, treinador_id)
    references public.treinadores (assessoria_id, id),
  constraint testes_desempenho_assessoria_id_key unique (assessoria_id, id),
  constraint testes_desempenho_medida_check check (
    ritmo_limiar_segundos_por_km is not null
    or vam_metros_por_min is not null
    or protocolo = 'outro'
  )
);

create index testes_desempenho_atleta_avaliado_idx
  on public.testes_desempenho (assessoria_id, atleta_id, avaliado_em desc);

create table public.referencias_ritmo_atribuicoes (
  treino_atleta_id uuid primary key,
  assessoria_id uuid not null,
  teste_desempenho_id uuid not null,
  zonas jsonb not null check (jsonb_typeof(zonas) = 'object'),
  created_at timestamptz not null default now(),
  constraint referencias_ritmo_atribuicoes_assignment_fkey
    foreign key (assessoria_id, treino_atleta_id)
    references public.treinos_atletas (assessoria_id, id)
    on delete cascade,
  constraint referencias_ritmo_atribuicoes_teste_fkey
    foreign key (assessoria_id, teste_desempenho_id)
    references public.testes_desempenho (assessoria_id, id)
);

create or replace function private.registrar_referencia_ritmo_atribuicao()
returns trigger
language plpgsql
set search_path = public, private
as $$
declare
  teste public.testes_desempenho;
begin
  select * into teste
  from public.testes_desempenho
  where assessoria_id = new.assessoria_id
    and atleta_id = new.atleta_id
  order by avaliado_em desc, created_at desc
  limit 1;

  if teste is null or (
    teste.ritmo_limiar_segundos_por_km is null
    and teste.vam_metros_por_min is null
  ) then
    return new;
  end if;

  insert into public.referencias_ritmo_atribuicoes (
    treino_atleta_id, assessoria_id, teste_desempenho_id, zonas
  ) values (
    new.id,
    new.assessoria_id,
    teste.id,
    jsonb_strip_nulls(jsonb_build_object(
      'versao', 1,
      'ritmo', case when teste.ritmo_limiar_segundos_por_km is not null then jsonb_build_object(
        'unidade', 'segundos_por_km',
        'faixas', jsonb_build_array(
          jsonb_build_object('codigo', 'leve', 'minimo', teste.ritmo_limiar_segundos_por_km + 30, 'maximo', teste.ritmo_limiar_segundos_por_km + 60),
          jsonb_build_object('codigo', 'moderado', 'minimo', teste.ritmo_limiar_segundos_por_km + 10, 'maximo', teste.ritmo_limiar_segundos_por_km + 30),
          jsonb_build_object('codigo', 'limiar', 'minimo', teste.ritmo_limiar_segundos_por_km - 10, 'maximo', teste.ritmo_limiar_segundos_por_km + 10),
          jsonb_build_object('codigo', 'intenso', 'minimo', teste.ritmo_limiar_segundos_por_km - 30, 'maximo', teste.ritmo_limiar_segundos_por_km - 10)
        )
      ) end,
      'vam', case when teste.vam_metros_por_min is not null then jsonb_build_object(
        'unidade', 'metros_por_minuto',
        'faixas', jsonb_build_array(
          jsonb_build_object('codigo', 'leve', 'minimo', round(teste.vam_metros_por_min * 0.60), 'maximo', round(teste.vam_metros_por_min * 0.70)),
          jsonb_build_object('codigo', 'moderado', 'minimo', round(teste.vam_metros_por_min * 0.70), 'maximo', round(teste.vam_metros_por_min * 0.80)),
          jsonb_build_object('codigo', 'limiar', 'minimo', round(teste.vam_metros_por_min * 0.80), 'maximo', round(teste.vam_metros_por_min * 0.90)),
          jsonb_build_object('codigo', 'intenso', 'minimo', round(teste.vam_metros_por_min * 0.90), 'maximo', teste.vam_metros_por_min)
        )
      ) end
    ))
  );

  return new;
end;
$$;

create trigger treinos_atletas_registrar_referencia_ritmo
after insert on public.treinos_atletas
for each row execute function private.registrar_referencia_ritmo_atribuicao();

alter table public.testes_desempenho enable row level security;
alter table public.testes_desempenho force row level security;
alter table public.referencias_ritmo_atribuicoes enable row level security;
alter table public.referencias_ritmo_atribuicoes force row level security;

create policy testes_desempenho_treinador_responsavel
on public.testes_desempenho
for all to authenticated
using (exists (
  select 1 from public.atletas
  where atletas.assessoria_id = testes_desempenho.assessoria_id
    and atletas.id = testes_desempenho.atleta_id
    and atletas.treinador_id = (select auth.uid())
))
with check (
  treinador_id = (select auth.uid())
  and exists (
    select 1 from public.atletas
    where atletas.assessoria_id = testes_desempenho.assessoria_id
      and atletas.id = testes_desempenho.atleta_id
      and atletas.treinador_id = (select auth.uid())
  )
);

create policy referencias_ritmo_atribuicoes_treinador_responsavel
on public.referencias_ritmo_atribuicoes
for select to authenticated
using (exists (
  select 1 from public.treinos_atletas ta
  join public.atletas a on a.assessoria_id = ta.assessoria_id and a.id = ta.atleta_id
  where ta.assessoria_id = referencias_ritmo_atribuicoes.assessoria_id
    and ta.id = referencias_ritmo_atribuicoes.treino_atleta_id
    and a.treinador_id = (select auth.uid())
));

create policy referencias_ritmo_atribuicoes_treinador_insert
on public.referencias_ritmo_atribuicoes
for insert to authenticated
with check (exists (
  select 1 from public.treinos_atletas ta
  join public.atletas a on a.assessoria_id = ta.assessoria_id and a.id = ta.atleta_id
  where ta.assessoria_id = referencias_ritmo_atribuicoes.assessoria_id
    and ta.id = referencias_ritmo_atribuicoes.treino_atleta_id
    and a.treinador_id = (select auth.uid())
));

revoke all on public.testes_desempenho, public.referencias_ritmo_atribuicoes from public, anon, authenticated;
grant select, insert, update, delete on public.testes_desempenho to authenticated;
grant select, insert on public.referencias_ritmo_atribuicoes to authenticated;
