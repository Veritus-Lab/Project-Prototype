-- Task 15: global running support exercise catalog. Forward-only.
begin;

create table public.exercicios_catalogo (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (char_length(btrim(nome)) between 2 and 120),
  categoria text not null check (
    categoria in ('forca', 'mobilidade', 'core', 'pliometria', 'tecnica')
  ),
  nivel text not null check (
    nivel in ('iniciante', 'intermediario', 'avancado')
  ),
  descricao_curta text not null check (
    char_length(btrim(descricao_curta)) between 8 and 240
  ),
  instrucoes text not null check (
    char_length(btrim(instrucoes)) between 8 and 1200
  ),
  alerta text not null check (
    char_length(btrim(alerta)) between 8 and 500
  ),
  ativo boolean not null default true,
  ordem integer not null check (ordem between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercicios_catalogo_categoria_ordem_idx
  on public.exercicios_catalogo (categoria, ordem, nome)
  where ativo;

create trigger set_exercicios_catalogo_updated_at
before update on public.exercicios_catalogo
for each row execute function private.set_updated_at();

alter table public.exercicios_catalogo enable row level security;
alter table public.exercicios_catalogo force row level security;

create policy exercicios_catalogo_select_authenticated
on public.exercicios_catalogo
for select
to authenticated
using (ativo);

revoke all on table public.exercicios_catalogo from public, anon, authenticated;
grant select on table public.exercicios_catalogo to authenticated;

insert into public.exercicios_catalogo (
  nome,
  categoria,
  nivel,
  descricao_curta,
  instrucoes,
  alerta,
  ordem
) values
  (
    'Agachamento',
    'forca',
    'iniciante',
    'Fortalece membros inferiores para suporte na corrida.',
    'Execute com pés firmes, tronco estável e amplitude confortável. Priorize controle na descida e alinhamento dos joelhos.',
    'Interrompa em caso de dor aguda, tontura ou desconforto incomum e procure orientação profissional.',
    10
  ),
  (
    'Afundo/passada',
    'forca',
    'intermediario',
    'Trabalha força unilateral e controle de quadril.',
    'Dê um passo à frente ou para trás, mantenha tronco estável e desça com controle sem perder o alinhamento do joelho.',
    'Evite aumentar carga ou amplitude se houver dor no joelho, quadril ou tornozelo.',
    20
  ),
  (
    'Levantamento terra romeno/hinge',
    'forca',
    'intermediario',
    'Desenvolve cadeia posterior e padrão de dobradiça de quadril.',
    'Incline o tronco a partir do quadril com coluna neutra, joelhos levemente flexionados e movimento controlado.',
    'Não force amplitude se perder a postura neutra ou sentir dor lombar.',
    30
  ),
  (
    'Elevação de panturrilha',
    'forca',
    'iniciante',
    'Fortalece panturrilhas e tornozelos para suporte ao impacto.',
    'Suba e desça de forma lenta, mantendo apoio equilibrado no antepé. Use suporte externo se precisar de estabilidade.',
    'Reduza volume em caso de dor no tendão de Aquiles, panturrilha ou pé.',
    40
  ),
  (
    'Ponte de glúteo/hip thrust',
    'forca',
    'iniciante',
    'Ativa glúteos e contribui para estabilidade pélvica.',
    'Eleve o quadril com controle, mantendo costelas baixas e pés apoiados. Pause brevemente no topo sem hiperextender a lombar.',
    'Interrompa se houver dor lombar ou desconforto irradiado.',
    50
  ),
  (
    'Caminhada lateral com elástico',
    'forca',
    'iniciante',
    'Estimula estabilidade lateral de quadril.',
    'Mantenha leve flexão de joelhos e quadris, passos curtos e tensão constante no elástico.',
    'Use resistência leve no início e pare se houver dor no quadril, joelho ou tornozelo.',
    60
  ),
  (
    'Step-up',
    'forca',
    'intermediario',
    'Trabalha força unilateral com transferência para subidas.',
    'Suba em uma caixa ou degrau estável, empurrando o apoio principal e controlando a descida.',
    'Escolha altura baixa a moderada e interrompa se houver instabilidade ou dor articular.',
    70
  ),
  (
    'Prancha frontal',
    'core',
    'iniciante',
    'Desenvolve estabilidade de tronco para a corrida.',
    'Mantenha alinhamento entre ombros, quadris e tornozelos sem prender a respiração.',
    'Finalize a série se perder alinhamento, sentir dor lombar ou desconforto incomum.',
    80
  ),
  (
    'Prancha lateral',
    'core',
    'intermediario',
    'Fortalece estabilidade lateral de tronco e quadril.',
    'Apoie antebraço e pés ou joelhos, mantendo corpo alinhado e respiração contínua.',
    'Use variação com joelhos apoiados se houver desconforto no ombro ou lombar.',
    90
  ),
  (
    'Dead bug',
    'core',
    'iniciante',
    'Treina controle de tronco com movimento alternado de braços e pernas.',
    'Mantenha lombar estável no chão e mova membros opostos de forma lenta, sem prender a respiração.',
    'Reduza amplitude se houver arqueamento lombar ou dor.',
    100
  ),
  (
    'Saltitos/pogos',
    'pliometria',
    'intermediario',
    'Introduz rigidez elástica e contato rápido com o solo.',
    'Faça saltitos baixos, postura alta e contatos rápidos, priorizando leveza e controle.',
    'Evite em dor atual, retorno recente de lesão ou fadiga alta sem liberação profissional.',
    110
  ),
  (
    'Saltos pliométricos simples',
    'pliometria',
    'avancado',
    'Desenvolve potência e coordenação para impactos controlados.',
    'Execute poucos saltos com aterrissagem silenciosa, joelhos alinhados e recuperação suficiente entre repetições.',
    'Não use como exercício inicial para atletas com dor, histórico recente de lesão ou baixa tolerância a impacto.',
    120
  ),
  (
    'Mobilidade de tornozelo',
    'mobilidade',
    'iniciante',
    'Melhora amplitude controlada para passada e absorção de impacto.',
    'Movimente o joelho à frente sobre o pé sem tirar o calcanhar do chão, mantendo controle e respiração.',
    'Evite forçar amplitude com dor, pinçamento ou inchaço.',
    130
  ),
  (
    'Mobilidade de quadril',
    'mobilidade',
    'iniciante',
    'Apoia controle de passada e liberdade de movimento do quadril.',
    'Use movimentos lentos e progressivos, mantendo tronco estável e amplitude confortável.',
    'Não force posições finais se houver dor, formigamento ou sensação de bloqueio.',
    140
  ),
  (
    'Fortalecimento intrínseco do pé',
    'tecnica',
    'iniciante',
    'Estimula controle do arco do pé e percepção de apoio.',
    'Faça contrações leves do arco, movimentos de dedos e apoios controlados, priorizando qualidade.',
    'Evite volume excessivo se houver dor plantar, câimbras persistentes ou irritação no pé.',
    150
  );

commit;
