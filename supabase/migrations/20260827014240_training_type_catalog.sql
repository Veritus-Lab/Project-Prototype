-- Task 16: global running training type catalog. Forward-only.
begin;

create table public.tipos_treino_catalogo (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (
    codigo ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'
    and char_length(codigo) between 2 and 80
  ),
  nome text not null unique check (char_length(btrim(nome)) between 2 and 120),
  objetivo text not null check (char_length(btrim(objetivo)) between 8 and 240),
  descricao text not null check (char_length(btrim(descricao)) between 8 and 500),
  estrutura_schema jsonb not null check (
    jsonb_typeof(estrutura_schema) = 'object'
    and estrutura_schema ? 'blocos'
    and jsonb_typeof(estrutura_schema -> 'blocos') = 'array'
    and jsonb_array_length(estrutura_schema -> 'blocos') between 1 and 8
  ),
  alerta text not null check (char_length(btrim(alerta)) between 8 and 500),
  ativo boolean not null default true,
  ordem integer not null check (ordem between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tipos_treino_catalogo_ordem_idx
  on public.tipos_treino_catalogo (ordem, nome)
  where ativo;

create trigger set_tipos_treino_catalogo_updated_at
before update on public.tipos_treino_catalogo
for each row execute function private.set_updated_at();

alter table public.tipos_treino_catalogo enable row level security;
alter table public.tipos_treino_catalogo force row level security;

create policy tipos_treino_catalogo_select_authenticated
on public.tipos_treino_catalogo
for select
to authenticated
using (ativo);

revoke all on table public.tipos_treino_catalogo from public, anon, authenticated;
grant select on table public.tipos_treino_catalogo to authenticated;

insert into public.tipos_treino_catalogo (
  codigo,
  nome,
  objetivo,
  descricao,
  estrutura_schema,
  alerta,
  ordem
) values
  (
    'corrida_facil',
    'Corrida fácil',
    'Construir base aeróbica com conforto e volume progressivo.',
    'Corrida contínua em intensidade leve, com conversa confortável e controle de esforço.',
    $$ {"blocos":[{"tipo":"principal","titulo":"Corrida fácil","campos":["duracaoMinutos","distanciaMetros","rpe","ritmoAlvo","terreno"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'Reduza ou interrompa se houver dor aguda, tontura ou mal-estar incomum.',
    10
  ),
  (
    'regenerativo',
    'Corrida regenerativa',
    'Favorecer recuperação ativa após treino forte ou prova.',
    'Corrida curta e muito leve, orientada por sensação de recuperação e sem cobrança de ritmo.',
    $$ {"blocos":[{"tipo":"principal","titulo":"Corrida regenerativa","campos":["duracaoMinutos","distanciaMetros","rpe"],"obrigatorios":["duracaoMinutos","rpe"]}]} $$::jsonb,
    'Mantenha intensidade muito leve e encerre se a dor ou fadiga piorar durante a sessão.',
    20
  ),
  (
    'longao',
    'Longão',
    'Desenvolver resistência aeróbica e tolerância muscular.',
    'Sessão contínua mais longa, com atenção a terreno, hidratação e possível progressão final.',
    $$ {"blocos":[{"tipo":"principal","titulo":"Longão","campos":["duracaoMinutos","distanciaMetros","rpe","ritmoAlvo","terreno"],"obrigatorios":["duracaoMinutos"]},{"tipo":"recuperacao","titulo":"Hidratação planejada","campos":["instrucoes"],"obrigatorios":[]}]} $$::jsonb,
    'Não aumente volume ou progressão final diante de dor, calor excessivo ou fadiga fora do habitual.',
    30
  ),
  (
    'tempo_limiar',
    'Tempo/limiar',
    'Sustentar esforço moderadamente forte com controle técnico.',
    'Blocos contínuos ou repetidos em intensidade controlada, separados por recuperação definida.',
    $$ {"blocos":[{"tipo":"aquecimento","titulo":"Aquecimento","campos":["duracaoMinutos","rpe"],"obrigatorios":["duracaoMinutos"]},{"tipo":"principal","titulo":"Bloco de tempo/limiar","campos":["duracaoMinutos","distanciaMetros","repeticoes","recuperacaoSegundos","rpe","ritmoAlvo"],"obrigatorios":["duracaoMinutos","rpe"]},{"tipo":"desaquecimento","titulo":"Desaquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'Ajuste ou interrompa se não conseguir manter técnica, respiração controlada ou ausência de dor.',
    40
  ),
  (
    'intervalado',
    'Intervalado VO2/speed',
    'Trabalhar velocidade e potência aeróbica com recuperações estruturadas.',
    'Repetições curtas ou médias em ritmo alvo, com recuperação suficiente para preservar a qualidade.',
    $$ {"blocos":[{"tipo":"aquecimento","titulo":"Aquecimento","campos":["duracaoMinutos","rpe"],"obrigatorios":["duracaoMinutos"]},{"tipo":"principal","titulo":"Repetições","campos":["distanciaMetros","duracaoMinutos","repeticoes","recuperacaoSegundos","ritmoAlvo","rpe"],"obrigatorios":["repeticoes","recuperacaoSegundos"]},{"tipo":"desaquecimento","titulo":"Desaquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'Não sacrifique técnica para cumprir ritmo; pare em caso de dor aguda, tontura ou instabilidade.',
    50
  ),
  (
    'subidas',
    'Subidas',
    'Desenvolver força específica, técnica e potência em inclinação.',
    'Repetições em subida com recuperação completa, orientadas por postura e controle de esforço.',
    $$ {"blocos":[{"tipo":"aquecimento","titulo":"Aquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]},{"tipo":"principal","titulo":"Repetições em subida","campos":["duracaoMinutos","repeticoes","recuperacaoSegundos","inclinacaoPercebida","rpe"],"obrigatorios":["repeticoes","recuperacaoSegundos"]},{"tipo":"desaquecimento","titulo":"Desaquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'Evite terreno instável e não use subidas intensas em retorno recente de lesão sem orientação profissional.',
    60
  ),
  (
    'fartlek',
    'Fartlek',
    'Variar ritmo de forma flexível com foco em percepção de esforço.',
    'Alternância de trechos leves e fortes, definida por tempo, distância ou referências simples de terreno.',
    $$ {"blocos":[{"tipo":"aquecimento","titulo":"Aquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]},{"tipo":"principal","titulo":"Variações de ritmo","campos":["duracaoMinutos","distanciaMetros","repeticoes","recuperacaoSegundos","rpe","terreno"],"obrigatorios":["duracaoMinutos"]},{"tipo":"desaquecimento","titulo":"Desaquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'A liberdade de ritmo não substitui controle: reduza intensidade se houver dor, fadiga incomum ou perda técnica.',
    70
  ),
  (
    'progressivo',
    'Progressivo',
    'Praticar controle de intensidade e final progressivamente mais forte.',
    'Sessão dividida em fases de ritmo crescente, com cada fase descrita de modo claro e mensurável.',
    $$ {"blocos":[{"tipo":"principal","titulo":"Fases progressivas","campos":["duracaoMinutos","distanciaMetros","repeticoes","rpe","ritmoAlvo"],"obrigatorios":["duracaoMinutos","rpe"]}]} $$::jsonb,
    'Não transforme progressivo em sprint final; mantenha margem de controle e encerre se surgir dor.',
    80
  ),
  (
    'ritmo_prova',
    'Ritmo de prova',
    'Construir especificidade para uma prova-alvo definida.',
    'Blocos no ritmo planejado para 5K, 10K, 21K ou 42K, com objetivo e recuperação explícitos.',
    $$ {"blocos":[{"tipo":"aquecimento","titulo":"Aquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]},{"tipo":"principal","titulo":"Ritmo de prova","campos":["distanciaMetros","duracaoMinutos","repeticoes","recuperacaoSegundos","ritmoAlvo","provaAlvo","rpe"],"obrigatorios":["ritmoAlvo","provaAlvo"]},{"tipo":"desaquecimento","titulo":"Desaquecimento","campos":["duracaoMinutos"],"obrigatorios":["duracaoMinutos"]}]} $$::jsonb,
    'Escolha objetivo compatível com o momento do atleta; não force ritmo de prova com dor ou fadiga excessiva.',
    90
  ),
  (
    'tecnica_strides',
    'Técnica/educativos/strides',
    'Aprimorar coordenação, economia e mecânica de corrida.',
    'Educativos e acelerações curtas com recuperação completa, priorizando leveza e qualidade do movimento.',
    $$ {"blocos":[{"tipo":"tecnica","titulo":"Educativos e strides","campos":["educativo","distanciaMetros","duracaoMinutos","repeticoes","recuperacaoSegundos","instrucoes"],"obrigatorios":["educativo","repeticoes"]}]} $$::jsonb,
    'Interrompa se houver desconforto muscular agudo, alteração de passada ou fadiga que prejudique a técnica.',
    100
  );

commit;
