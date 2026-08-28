alter table public.assessorias
  add column timezone text not null default 'America/Sao_Paulo';

alter table public.treinos_atletas
  add column agendado_para timestamptz,
  add column timezone text,
  add column observacao_treinador text;

alter table public.treinos_atletas
  drop constraint treinos_atletas_treino_atleta_key,
  add constraint treinos_atletas_treino_atleta_agendamento_key
    unique (treino_id, atleta_id, agendado_para),
  add constraint treinos_atletas_agendamento_timezone_check
    check (
      (agendado_para is null and timezone is null)
      or (agendado_para is not null and timezone is not null)
    );

create unique index treinos_atletas_treino_atleta_sem_agendamento_key
  on public.treinos_atletas (treino_id, atleta_id)
  where agendado_para is null;

create index treinos_atletas_assessoria_agendado_para_idx
  on public.treinos_atletas (assessoria_id, agendado_para)
  where agendado_para is not null;

grant select (timezone) on table public.assessorias to authenticated;
grant update (agendado_para, timezone, observacao_treinador)
  on table public.treinos_atletas to authenticated;
