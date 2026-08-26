-- Task 14: operational athlete data. Forward-only.
begin;

create table public.atletas_operacionais (
  atleta_id uuid primary key,
  assessoria_id uuid not null,
  telefone text check (
    telefone is null
    or (char_length(btrim(telefone)) <= 32 and telefone ~ '^[0-9+().\-\s]+$')
  ),
  observacoes_internas text check (
    observacoes_internas is null
    or char_length(btrim(observacoes_internas)) <= 1000
  ),
  objetivo text check (
    objetivo is null
    or char_length(btrim(objetivo)) <= 240
  ),
  nivel text check (
    nivel is null
    or nivel in ('iniciante', 'intermediario', 'avancado')
  ),
  data_nascimento date check (
    data_nascimento is null
    or (
      data_nascimento <= current_date
      and data_nascimento >= (current_date - interval '120 years')::date
    )
  ),
  contato_emergencia_nome text check (
    contato_emergencia_nome is null
    or char_length(btrim(contato_emergencia_nome)) <= 120
  ),
  contato_emergencia_telefone text check (
    contato_emergencia_telefone is null
    or (
      char_length(btrim(contato_emergencia_telefone)) <= 32
      and contato_emergencia_telefone ~ '^[0-9+().\-\s]+$'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint atletas_operacionais_atleta_fkey
    foreign key (assessoria_id, atleta_id)
    references public.atletas (assessoria_id, id)
    on delete cascade
);

create index atletas_operacionais_assessoria_idx
  on public.atletas_operacionais (assessoria_id, atleta_id);

create trigger set_atletas_operacionais_updated_at
before update on public.atletas_operacionais
for each row execute function private.set_updated_at();

alter table public.atletas_operacionais enable row level security;
alter table public.atletas_operacionais force row level security;

create policy atletas_operacionais_select_trainer
on public.atletas_operacionais
for select
to authenticated
using (private.is_treinador(assessoria_id));

create policy atletas_operacionais_insert_trainer
on public.atletas_operacionais
for insert
to authenticated
with check (
  private.is_treinador(assessoria_id)
  and exists (
    select 1
    from public.atletas as athlete
    where athlete.assessoria_id = atletas_operacionais.assessoria_id
      and athlete.id = atletas_operacionais.atleta_id
      and athlete.treinador_id = (select auth.uid())
  )
);

create policy atletas_operacionais_update_trainer
on public.atletas_operacionais
for update
to authenticated
using (
  private.is_treinador(assessoria_id)
  and exists (
    select 1
    from public.atletas as athlete
    where athlete.assessoria_id = atletas_operacionais.assessoria_id
      and athlete.id = atletas_operacionais.atleta_id
      and athlete.treinador_id = (select auth.uid())
  )
)
with check (
  private.is_treinador(assessoria_id)
  and exists (
    select 1
    from public.atletas as athlete
    where athlete.assessoria_id = atletas_operacionais.assessoria_id
      and athlete.id = atletas_operacionais.atleta_id
      and athlete.treinador_id = (select auth.uid())
  )
);

revoke all on table public.atletas_operacionais from public, anon, authenticated;

grant select on table public.atletas_operacionais to authenticated;
grant insert (
  atleta_id,
  assessoria_id,
  telefone,
  observacoes_internas,
  objetivo,
  nivel,
  data_nascimento,
  contato_emergencia_nome,
  contato_emergencia_telefone
) on table public.atletas_operacionais to authenticated;
grant update (
  telefone,
  observacoes_internas,
  objetivo,
  nivel,
  data_nascimento,
  contato_emergencia_nome,
  contato_emergencia_telefone
) on table public.atletas_operacionais to authenticated;

commit;
