create table public.tenis_atletas (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, atleta_id uuid not null,
  nome text not null check (char_length(trim(nome)) between 1 and 100), inicio_em date,
  quilometragem_inicial_metros integer not null default 0 check (quilometragem_inicial_metros >= 0),
  limite_rodagem_metros integer check (limite_rodagem_metros > 0), ativo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint tenis_atletas_atleta_fkey foreign key (assessoria_id, atleta_id) references public.atletas (assessoria_id, id),
  constraint tenis_atletas_assessoria_id_key unique (assessoria_id, id)
);

alter table public.execucoes_treino
  add constraint execucoes_treino_assessoria_id_key unique (assessoria_id, id);

create table public.tenis_execucoes (
  assessoria_id uuid not null, tenis_id uuid not null, execucao_treino_id uuid not null, created_at timestamptz not null default now(),
  primary key (execucao_treino_id),
  constraint tenis_execucoes_tenis_fkey foreign key (assessoria_id, tenis_id) references public.tenis_atletas (assessoria_id, id),
  constraint tenis_execucoes_execucao_fkey foreign key (assessoria_id, execucao_treino_id) references public.execucoes_treino (assessoria_id, id)
);
alter table public.tenis_atletas enable row level security; alter table public.tenis_atletas force row level security;
alter table public.tenis_execucoes enable row level security; alter table public.tenis_execucoes force row level security;
create policy tenis_atletas_own_or_trainer on public.tenis_atletas for select to authenticated using (atleta_id=(select auth.uid()) or private.is_treinador(assessoria_id));
create policy tenis_atletas_own_write on public.tenis_atletas for all to authenticated using (atleta_id=(select auth.uid())) with check (atleta_id=(select auth.uid()));
create policy tenis_execucoes_own_or_trainer on public.tenis_execucoes for select to authenticated using (exists (select 1 from public.tenis_atletas t where t.id=tenis_id and t.assessoria_id=tenis_execucoes.assessoria_id and (t.atleta_id=(select auth.uid()) or private.is_treinador(t.assessoria_id))));
create policy tenis_execucoes_own_write on public.tenis_execucoes for all to authenticated using (exists (select 1 from public.tenis_atletas t where t.id=tenis_id and t.assessoria_id=tenis_execucoes.assessoria_id and t.atleta_id=(select auth.uid()))) with check (exists (select 1 from public.tenis_atletas t join public.execucoes_treino e on e.id=tenis_execucoes.execucao_treino_id and e.assessoria_id=tenis_execucoes.assessoria_id where t.id=tenis_execucoes.tenis_id and t.assessoria_id=tenis_execucoes.assessoria_id and t.atleta_id=(select auth.uid()) and e.atleta_id=(select auth.uid()) and e.status='concluido'));
grant select, insert, update, delete on public.tenis_atletas, public.tenis_execucoes to authenticated;
