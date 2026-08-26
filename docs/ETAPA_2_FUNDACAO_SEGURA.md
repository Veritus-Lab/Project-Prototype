# Etapa 2 — Fundação Segura

> Criado em 25/08/2026 como entrega da Task 12. Este documento define a fundação técnica antes das migrations da Etapa 2. Nenhuma tabela nova deve ser criada remotamente sem migration forward-only, revisão de RLS e teste pgTAP correspondente.

## Objetivo da Task 12

Preparar a base segura para implementar operação real da assessoria: detalhe/edição de atletas, biblioteca de exercícios, modelos de treino, criação e atribuição de treinos, calendário, execução pelo atleta, financeiro de assinaturas e preparação para WhatsApp.

Esta task não aplica schema novo. Ela fecha:

- ERD alvo da Etapa 2.
- Matriz RLS por entidade.
- Classificação de dados sensíveis.
- Sequência de migrations forward-only.
- Plano pgTAP mínimo por migration.

## Princípios Invioláveis

- `profiles` continua sendo a autoridade de papel e tenant.
- `auth.users.raw_user_meta_data` nunca decide autorização depois do bootstrap.
- Toda tabela de negócio precisa de RLS habilitada e forçada.
- Toda tabela tenant-scoped deve ter caminho verificável até `assessoria_id`.
- FKs compostas por `(assessoria_id, id)` devem bloquear vínculos cross-tenant.
- Componentes React não escrevem direto no Supabase.
- Server Actions validam input com Zod e chamam services.
- Dados financeiros, telefone, observações internas e mensagens exigem minimização e auditoria.
- WhatsApp só pode enviar mensagem com opt-in, templates controlados e limite de frequência.
- Correções em banco remoto são sempre novas migrations, nunca edição de migration já aplicada.

## ERD Alvo

### Núcleo Existente

```text
assessorias
  └─ profiles
       ├─ treinadores
       └─ atletas

treinadores ── convites_atletas
treinadores ── treinos ── treinos_atletas ── atletas
```

### Expansão Etapa 2

```text
assessorias
  ├─ atletas
  │    ├─ atletas_operacionais
  │    ├─ assinaturas_atletas
  │    │    └─ cobrancas
  │    │         └─ eventos_financeiros
  │    ├─ preferencias_comunicacao
  │    │    └─ lembretes_cobranca
  │    └─ treinos_atletas
  │         └─ execucoes_treino
  │
  ├─ treinadores
  │    ├─ modelos_treino
  │    │    └─ blocos_modelo_treino
  │    └─ treinos
  │         └─ blocos_treino
  │
  └─ exercicios_assessoria (futuro)

exercicios_catalogo
tipos_treino_catalogo
```

## Entidades Planejadas

### `atletas_operacionais`

Perfil operacional editado pelo treinador, separado de `profiles`.

Campos propostos:

- `assessoria_id uuid not null`
- `atleta_id uuid primary key`
- `telefone text null`
- `objetivo text null`
- `nivel text null check (nivel in ('iniciante', 'intermediario', 'avancado'))`
- `data_nascimento date null`
- `contato_emergencia_nome text null`
- `contato_emergencia_telefone text null`
- `observacoes_internas text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK composta `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.

### `exercicios_catalogo`

Catálogo global inicial de exercícios de apoio à corrida.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `nome text not null`
- `categoria text not null check (categoria in ('forca', 'mobilidade', 'core', 'pliometria', 'tecnica'))`
- `nivel text not null check (nivel in ('iniciante', 'intermediario', 'avancado'))`
- `descricao_curta text not null`
- `instrucoes text not null`
- `alerta text null`
- `ativo boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Decisão:

- Catálogo global pode ser lido por usuários autenticados.
- Escrita só por migration/seed nesta fase.
- Customização por assessoria fica para `exercicios_assessoria` futura.

### `tipos_treino_catalogo`

Catálogo global dos tipos de treino de corrida.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `codigo text not null unique`
- `nome text not null`
- `objetivo text not null`
- `estrutura_schema jsonb not null`
- `ativo boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Tipos iniciais:

- `corrida_facil`
- `regenerativo`
- `longao`
- `tempo_limiar`
- `intervalado`
- `subidas`
- `fartlek`
- `progressivo`
- `ritmo_prova`
- `tecnica_strides`

### `modelos_treino`

Modelo reutilizável criado pelo treinador.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `treinador_id uuid not null`
- `tipo_treino_id uuid null`
- `titulo text not null`
- `descricao text null`
- `nivel text null`
- `ativo boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, treinador_id)` para `treinadores(assessoria_id, id)`.
- FK `tipo_treino_id` para `tipos_treino_catalogo(id)`.
- Unique tenant-first `(assessoria_id, id)`.

### `blocos_modelo_treino`

Blocos estruturados de um modelo.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `modelo_treino_id uuid not null`
- `ordem integer not null check (ordem > 0)`
- `tipo_bloco text not null`
- `titulo text not null`
- `descricao text null`
- `duracao_minutos integer null check (duracao_minutos between 1 and 600)`
- `distancia_metros integer null check (distancia_metros between 1 and 100000)`
- `intensidade text null`
- `estrutura jsonb not null default '{}'::jsonb check (jsonb_typeof(estrutura) = 'object')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, modelo_treino_id)` para `modelos_treino(assessoria_id, id)`.
- Unique `(modelo_treino_id, ordem)`.

### `blocos_treino`

Blocos do treino real já criado.

Campos propostos:

- Mesmo formato de `blocos_modelo_treino`.
- FK `(assessoria_id, treino_id)` para `treinos(assessoria_id, id)`.
- Unique `(treino_id, ordem)`.

Decisão:

- A coluna `treinos.estrutura` existente permanece durante a transição.
- Task 17 pode escrever nos dois formatos se necessário.
- Remoção de `estrutura` só em fase contract futura, se os blocos normalizados estiverem estáveis.

### Expansão de `treinos_atletas`

Campos futuros propostos:

- `agendado_para timestamptz null`
- `timezone text null`
- `observacao_treinador text null`

Decisão:

- Adicionar como nullable.
- Não mover o calendário para tabela separada até existir necessidade real de recorrência complexa.

### `execucoes_treino`

Registro de execução pelo atleta.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `treino_atleta_id uuid not null`
- `atleta_id uuid not null`
- `status text not null check (status in ('em_andamento', 'concluido', 'cancelado'))`
- `rpe integer null check (rpe between 1 and 10)`
- `duracao_real_minutos integer null check (duracao_real_minutos between 1 and 1440)`
- `distancia_real_metros integer null check (distancia_real_metros between 1 and 200000)`
- `observacao_atleta text null`
- `registrado_em timestamptz not null default now()`
- `created_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, treino_atleta_id)` para `treinos_atletas(assessoria_id, id)`.
- FK `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.

### `assinaturas_atletas`

Assinatura/mensalidade do atleta.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `atleta_id uuid not null`
- `valor_centavos integer not null check (valor_centavos >= 0)`
- `moeda char(3) not null default 'BRL'`
- `periodicidade text not null check (periodicidade in ('mensal', 'trimestral', 'semestral', 'anual'))`
- `dia_vencimento integer not null check (dia_vencimento between 1 and 31)`
- `metodo_previsto text null`
- `status text not null check (status in ('ativa', 'suspensa', 'isenta', 'cancelada'))`
- `inicio_em date not null`
- `fim_em date null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.

### `cobrancas`

Cobranças geradas a partir de assinatura.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `assinatura_id uuid not null`
- `atleta_id uuid not null`
- `valor_centavos integer not null check (valor_centavos >= 0)`
- `moeda char(3) not null default 'BRL'`
- `vencimento_em date not null`
- `status text not null check (status in ('aberta', 'paga', 'vencida', 'cancelada', 'isenta'))`
- `paga_em timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, assinatura_id)` para `assinaturas_atletas(assessoria_id, id)`.
- FK `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.

### `eventos_financeiros`

Auditoria append-only do financeiro.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `cobranca_id uuid null`
- `assinatura_id uuid null`
- `atleta_id uuid not null`
- `ator_id uuid not null`
- `tipo text not null`
- `detalhes jsonb not null default '{}'::jsonb check (jsonb_typeof(detalhes) = 'object')`
- `created_at timestamptz not null default now()`

Decisão:

- Sem `updated_at`.
- Sem policy de update/delete para clientes.
- Inserts devem ocorrer por server action/service e, futuramente, por função controlada.

### `preferencias_comunicacao`

Consentimentos e canais por atleta.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `atleta_id uuid not null`
- `whatsapp_telefone text null`
- `whatsapp_opt_in boolean not null default false`
- `whatsapp_opt_in_em timestamptz null`
- `whatsapp_opt_out_em timestamptz null`
- `cobranca_whatsapp boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.
- Unique `(assessoria_id, atleta_id)`.

### `lembretes_cobranca`

Fila lógica de lembretes financeiros, sem provider na Task 22.

Campos propostos:

- `id uuid primary key default gen_random_uuid()`
- `assessoria_id uuid not null`
- `cobranca_id uuid not null`
- `atleta_id uuid not null`
- `canal text not null check (canal in ('whatsapp'))`
- `status text not null check (status in ('pendente', 'bloqueado', 'enviado', 'falhou', 'cancelado'))`
- `programado_para timestamptz not null`
- `template_codigo text not null`
- `tentativas integer not null default 0 check (tentativas >= 0)`
- `ultimo_erro text null`
- `provider_message_id text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Relacionamentos:

- FK `(assessoria_id, cobranca_id)` para `cobrancas(assessoria_id, id)`.
- FK `(assessoria_id, atleta_id)` para `atletas(assessoria_id, id)`.

## Matriz RLS

| Entidade | Anon | Atleta | Treinador | Observação |
| --- | --- | --- | --- | --- |
| `atletas_operacionais` | Sem acesso | Select do próprio registro sem `observacoes_internas`, se necessário via view futura | Select/insert/update na própria assessoria | Grant por coluna deve proteger observações internas |
| `exercicios_catalogo` | Sem acesso | Select ativos | Select ativos | Insert/update/delete sem grant para clientes |
| `tipos_treino_catalogo` | Sem acesso | Select ativos | Select ativos | Catalogo global read-only |
| `modelos_treino` | Sem acesso | Sem acesso | CRUD na própria assessoria | `treinador_id = auth.uid()` no insert |
| `blocos_modelo_treino` | Sem acesso | Sem acesso | CRUD via modelo da própria assessoria | FK composta impede cross-tenant |
| `blocos_treino` | Sem acesso | Select se treino atribuído ao atleta | CRUD em treinos da própria assessoria | Athlete nunca altera bloco |
| `treinos_atletas` expandida | Sem acesso | Select/update limitado ao próprio vínculo | CRUD na própria assessoria | Update de atleta limitado a status/campos de execução existentes |
| `execucoes_treino` | Sem acesso | Insert/select do próprio treino atribuído | Select da própria assessoria | Update/delete bloqueados inicialmente |
| `assinaturas_atletas` | Sem acesso | Sem acesso na primeira versão | CRUD treinador na própria assessoria | Dados financeiros não entram no painel atleta até decisão de produto |
| `cobrancas` | Sem acesso | Sem acesso na primeira versão | CRUD treinador na própria assessoria | Gateway futuro deve usar adapter seguro |
| `eventos_financeiros` | Sem acesso | Sem acesso | Select/insert na própria assessoria | Append-only, sem update/delete |
| `preferencias_comunicacao` | Sem acesso | Select/update do próprio opt-out | CRUD treinador na própria assessoria | Opt-out do atleta deve ser respeitado sempre |
| `lembretes_cobranca` | Sem acesso | Sem acesso | Select/insert/update operacional na própria assessoria | Envio real só via provider adapter |

## Grants por Coluna

- Evitar `grant all`.
- `observacoes_internas` não deve ser concedida a atleta.
- `token_hash`, provider tokens e identificadores sensíveis de webhook nunca devem ser selecionáveis.
- Dados financeiros não devem aparecer para atleta sem uma decisão explícita de produto.
- Append-only significa sem grant de `update`/`delete`, não apenas policy negando acesso.

## Classificação de Dados

| Dado | Classe | Regras |
| --- | --- | --- |
| Nome e e-mail | Pessoal | Já existem em Auth/Profile; minimizar cópia |
| Telefone | Pessoal sensível operacional | Validar formato, não logar completo, uso com consentimento |
| Observações internas | Sensível | Visível somente para treinador; sem dados médicos detalhados nesta etapa |
| Objetivo e nível | Operacional | Pode orientar treino, mas não substituir avaliação profissional |
| Data de nascimento | Pessoal | Opcional, evitar cálculo público de idade sem necessidade |
| Contato de emergência | Pessoal sensível | Opcional; não exibir fora do contexto do treinador |
| Treinos e execuções | Saúde/rotina esportiva | Proteger por tenant e vínculo do atleta |
| RPE, distância e duração | Saúde/rotina esportiva | Não expor para outros atletas; logs sem payload completo |
| Valor, vencimento e status financeiro | Financeiro sensível | Treinador apenas; audit trail obrigatório |
| Eventos financeiros | Auditoria sensível | Append-only; detalhes mínimos |
| WhatsApp opt-in/out | Consentimento | Histórico preservado; opt-out sempre bloqueia envio |
| Provider message id | Integração | Não é segredo, mas não precisa aparecer para atleta |
| Provider token/webhook secret | Segredo | Somente env var; nunca no banco público nem repo |

## Sequência de Migrations

### Migration 1 — Perfil operacional do atleta

- Criar `atletas_operacionais`.
- Habilitar e forçar RLS.
- Grants por coluna.
- Policies trainer CRUD tenant-scoped.
- Policy/view futura para atleta sem observações internas, se produto exigir.
- Criar trigger `updated_at`.

### Migration 2 — Catálogos globais

- Criar `exercicios_catalogo`.
- Criar `tipos_treino_catalogo`.
- Habilitar e forçar RLS.
- Grants de select para authenticated.
- Sem grants de insert/update/delete para authenticated.
- Seed dos exercícios e tipos de treino em migration separada de data/seed.

### Migration 3 — Modelos e blocos

- Criar `modelos_treino`.
- Criar `blocos_modelo_treino`.
- Habilitar e forçar RLS.
- Criar índices tenant-first.
- Policies CRUD para treinador.
- Sem acesso de atleta.

### Migration 4 — Blocos normalizados de treino

- Criar `blocos_treino`.
- Manter `treinos.estrutura` sem remover.
- Policies: treinador CRUD; atleta select apenas se treino atribuído.
- App pode continuar lendo `treinos.estrutura` até Task 17 estabilizar.

### Migration 5 — Agendamento e execução

- Adicionar campos nullable em `treinos_atletas`: `agendado_para`, `timezone`, `observacao_treinador`.
- Criar `execucoes_treino`.
- Policies para atleta inserir execução própria e treinador ler por assessoria.
- Separar alterações de dados/backfill caso exista produção com volume.

### Migration 6 — Financeiro básico

- Criar `assinaturas_atletas`.
- Criar `cobrancas`.
- Criar `eventos_financeiros`.
- Habilitar e forçar RLS em todas.
- Events append-only sem update/delete grants.
- Índices por `assessoria_id`, `atleta_id`, `vencimento_em` e `status`.

### Migration 7 — Comunicação e WhatsApp-ready

- Criar `preferencias_comunicacao`.
- Criar `lembretes_cobranca`.
- Habilitar e forçar RLS.
- Policies de opt-out próprio para atleta.
- Nenhuma credencial de WhatsApp no banco.
- Adapter/provider fica fora do schema público e usa env var.

## Plano pgTAP

Cada migration que cria tabela deve adicionar ou atualizar teste em `supabase/tests/rls_isolation.sql` ou criar arquivo dedicado quando o teste ficar grande demais.

### Checks obrigatórios por tabela

- RLS habilitada e forçada.
- `anon` sem privilégio de tabela.
- Grants mínimos para `authenticated`.
- Treinador Alfa não vê dados Beta.
- Treinador Beta não vê dados Alfa.
- Atleta não vê dados de outro atleta da mesma assessoria.
- Atleta não vê dados de outra assessoria.
- Inserts cross-tenant falham por FK composta e/ou RLS.
- Updates cross-tenant falham.
- Colunas sensíveis sem privilégio de select quando aplicável.

### Checks específicos

- `eventos_financeiros`: update/delete devem falhar.
- `preferencias_comunicacao`: atleta consegue desativar opt-out próprio, mas não ativar cobrança de terceiros.
- `lembretes_cobranca`: lembrete não pode ser criado se cobrança/atleta não pertencem à mesma assessoria.
- `blocos_treino`: atleta lê apenas blocos de treino atribuído.
- `exercicios_catalogo` e `tipos_treino_catalogo`: authenticated lê ativos; authenticated não escreve.

## Gate Antes da Task 13

- Este documento precisa estar commitado.
- `docs/ARQUITETURA.md` e `docs/SEGURANCA.md` devem apontar para esta fundação.
- Nenhuma migration da Etapa 2 deve existir sem matriz RLS correspondente.
- A primeira migration da Etapa 2 deve ser pequena, revisável e acompanhada de pgTAP.
