alter table public.treinos_atletas add constraint treinos_atletas_assessoria_id_key unique (assessoria_id, id);
create table public.execucoes_treino (
 id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, treino_atleta_id uuid not null, atleta_id uuid not null,
 status text not null check (status in ('em_andamento','concluido','cancelado')), rpe integer check (rpe between 1 and 10),
 duracao_real_minutos integer check (duracao_real_minutos between 1 and 1440), distancia_real_metros integer check (distancia_real_metros between 1 and 200000),
 observacao_atleta text check (char_length(observacao_atleta) <= 500), desconforto_regiao text check (desconforto_regiao in ('pe','tornozelo','panturrilha','joelho','coxa','quadril','lombar','outro')), desconforto_intensidade integer check (desconforto_intensidade between 1 and 10),
 registrado_em timestamptz not null default now(), created_at timestamptz not null default now(),
 constraint execucoes_treino_assignment_fkey foreign key (assessoria_id, treino_atleta_id) references public.treinos_atletas (assessoria_id, id) on delete cascade,
 constraint execucoes_treino_atleta_fkey foreign key (assessoria_id, atleta_id) references public.atletas (assessoria_id, id) on delete cascade,
 constraint execucoes_treino_unica_por_atribuicao unique (treino_atleta_id),
 constraint execucoes_treino_desconforto_check check ((desconforto_regiao is null and desconforto_intensidade is null) or (desconforto_regiao is not null and desconforto_intensidade is not null))
);
create index execucoes_treino_assessoria_atleta_registrado_idx on public.execucoes_treino (assessoria_id, atleta_id, registrado_em desc);
alter table public.execucoes_treino enable row level security;
alter table public.execucoes_treino force row level security;
create policy execucoes_treino_select_own_or_assigned_trainer on public.execucoes_treino for select to authenticated using (atleta_id = (select auth.uid()) or exists (select 1 from public.atletas where atletas.assessoria_id = execucoes_treino.assessoria_id and atletas.id = execucoes_treino.atleta_id and atletas.treinador_id = (select auth.uid())));
create policy execucoes_treino_insert_own on public.execucoes_treino for insert to authenticated with check (atleta_id = (select auth.uid()) and exists (select 1 from public.treinos_atletas where treinos_atletas.assessoria_id = execucoes_treino.assessoria_id and treinos_atletas.id = execucoes_treino.treino_atleta_id and treinos_atletas.atleta_id = (select auth.uid())));
revoke all on table public.execucoes_treino from public, anon, authenticated;
grant select on table public.execucoes_treino to authenticated;
grant insert (assessoria_id, treino_atleta_id, atleta_id, status, rpe, duracao_real_minutos, distancia_real_metros, observacao_atleta, desconforto_regiao, desconforto_intensidade) on table public.execucoes_treino to authenticated;;
