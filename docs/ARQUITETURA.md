# Arquitetura da Etapa 1

## Visão Geral

A Etapa 1 entrega uma fatia vertical do FLERNK em Next.js App Router, TypeScript e Supabase. O runtime principal fica em `src/`; o prototipo anterior permanece em `legacy/` apenas como referencia historica.

## Modulos Principais

- `src/app/`: rotas, layouts, Server Actions e paginas do App Router.
- `src/components/`: componentes de UI, marketing, autenticacao e dashboard.
- `src/lib/services/`: regras de aplicacao que conversam com Supabase.
- `src/lib/auth/`: leitura de sessao, papel e tenant persistidos.
- `src/lib/invitations/`: token, hash e estado de convite.
- `src/lib/validators/`: schemas Zod para entradas de formulario.
- `src/lib/supabase/`: clientes browser/server e proxy de sessao.
- `src/types/database.ts`: contrato TypeScript gerado a partir do schema Supabase.
- `supabase/migrations/`: schema, policies, triggers e RPCs.
- `supabase/tests/`: pgTAP de isolamento e grants.

## Fluxos

### Cadastro do treinador

1. `/cadastro` coleta nome, assessoria, e-mail e senha.
2. Server Action valida com Zod e chama `signUpTrainer`.
3. Supabase Auth cria o usuario com metadata minima.
4. Trigger `bootstrap_treinador` cria assessoria, profile e treinador.
5. Confirmacao de e-mail retorna por `/auth/callback`.

### Login e dashboards

1. `/login` autentica por e-mail e senha.
2. `requireUser()` busca `auth.getUser()` e `profiles`.
3. `requireRole()` redireciona pelo papel persistido em `profiles`.
4. `/treinador`, `/treinador/convites` e `/atleta` usam layout protegido.

### Convites

1. Treinador cria convite em `/treinador/convites`.
2. A aplicacao gera token bruto URL-safe e persiste apenas SHA-256.
3. Convite ativo duplicado para o mesmo e-mail na assessoria e revogado antes do novo insert.
4. O link bruto e exibido apenas na resposta da criacao.
5. A listagem nao seleciona nem renderiza `token_hash`.

### Aceite do atleta

1. `/convite/[token]` calcula o hash e chama `validar_convite`.
2. A pagina publica mostra somente assessoria, e-mail mascarado e estado.
3. Estados invalidos exibem mensagem definitiva sem formulario.
4. Convite ativo permite cadastro do atleta.
5. `acceptInvitation` cria usuario Auth com metadata `papel=atleta` e chama `aceitar_convite`.
6. A RPC valida sessao, e-mail, prazo e estado antes de criar `profiles` e `atletas`.

## Dados Demo

Dashboards usam dados centralizados em `src/lib/demo/dashboard.ts`. Eles devem ser substituidos por repositories Supabase na Etapa 2.
