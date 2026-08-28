create table public.assinaturas_atletas (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, atleta_id uuid not null,
  valor_centavos integer not null check (valor_centavos >= 0), moeda char(3) not null default 'BRL',
  periodicidade text not null check (periodicidade in ('mensal','trimestral','semestral','anual')),
  dia_vencimento integer not null check (dia_vencimento between 1 and 31), metodo_previsto text,
  status text not null default 'ativa' check (status in ('ativa','suspensa','isenta','cancelada')),
  inicio_em date not null, fim_em date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint assinaturas_atletas_atleta_fkey foreign key (assessoria_id, atleta_id) references public.atletas (assessoria_id, id),
  constraint assinaturas_atletas_assessoria_id_key unique (assessoria_id, id),
  constraint assinaturas_atletas_datas_check check (fim_em is null or fim_em >= inicio_em)
);
create table public.cobrancas (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, assinatura_id uuid not null, atleta_id uuid not null,
  valor_centavos integer not null check (valor_centavos >= 0), moeda char(3) not null default 'BRL', vencimento_em date not null,
  status text not null default 'aberta' check (status in ('aberta','paga','vencida','cancelada','isenta')),
  paga_em timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint cobrancas_assinatura_fkey foreign key (assessoria_id, assinatura_id) references public.assinaturas_atletas (assessoria_id, id),
  constraint cobrancas_atleta_fkey foreign key (assessoria_id, atleta_id) references public.atletas (assessoria_id, id),
  constraint cobrancas_assessoria_id_key unique (assessoria_id, id)
);
create table public.eventos_financeiros (
  id uuid primary key default gen_random_uuid(), assessoria_id uuid not null, cobranca_id uuid, assinatura_id uuid, atleta_id uuid not null, ator_id uuid not null,
  tipo text not null, detalhes jsonb not null default '{}'::jsonb check (jsonb_typeof(detalhes) = 'object'), created_at timestamptz not null default now(),
  constraint eventos_financeiros_cobranca_fkey foreign key (assessoria_id, cobranca_id) references public.cobrancas (assessoria_id, id),
  constraint eventos_financeiros_assinatura_fkey foreign key (assessoria_id, assinatura_id) references public.assinaturas_atletas (assessoria_id, id),
  constraint eventos_financeiros_atleta_fkey foreign key (assessoria_id, atleta_id) references public.atletas (assessoria_id, id)
);
create index cobrancas_assessoria_vencimento_status_idx on public.cobrancas (assessoria_id, vencimento_em, status);
create index assinaturas_atletas_assessoria_atleta_idx on public.assinaturas_atletas (assessoria_id, atleta_id);
create index eventos_financeiros_assessoria_atleta_idx on public.eventos_financeiros (assessoria_id, atleta_id, created_at desc);
alter table public.assinaturas_atletas enable row level security; alter table public.assinaturas_atletas force row level security;
alter table public.cobrancas enable row level security; alter table public.cobrancas force row level security;
alter table public.eventos_financeiros enable row level security; alter table public.eventos_financeiros force row level security;
create policy assinaturas_atletas_trainer on public.assinaturas_atletas for all to authenticated using (private.is_treinador(assessoria_id)) with check (private.is_treinador(assessoria_id));
create policy cobrancas_trainer on public.cobrancas for all to authenticated using (private.is_treinador(assessoria_id)) with check (private.is_treinador(assessoria_id));
create policy eventos_financeiros_trainer_select on public.eventos_financeiros for select to authenticated using (private.is_treinador(assessoria_id));
create policy eventos_financeiros_trainer_insert on public.eventos_financeiros for insert to authenticated with check (private.is_treinador(assessoria_id) and ator_id = (select auth.uid()));
revoke all on public.assinaturas_atletas, public.cobrancas, public.eventos_financeiros from public, anon, authenticated;
grant select, insert, update, delete on public.assinaturas_atletas, public.cobrancas to authenticated;
grant select, insert on public.eventos_financeiros to authenticated;
