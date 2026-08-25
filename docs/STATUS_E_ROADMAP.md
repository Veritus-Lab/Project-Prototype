# FLERNK — Status, continuidade e roadmap

> Atualizado em 25 de agosto de 2026. Este documento é a fonte canônica para o estado atual do projeto, o trabalho concluído, as pendências e os próximos passos. Valide informações operacionais com Git, testes e Supabase antes de alterar ambientes compartilhados.

## 1. Resumo executivo

O FLERNK está sendo migrado de um protótipo em HTML, CSS, JavaScript, Express e SQLite para uma aplicação SaaS em Next.js, TypeScript e Supabase.

A Etapa 1 foi planejada como uma fatia vertical completa: landing page, cadastro real do treinador, autenticação, separação entre treinador e atleta, dashboards iniciais, convites seguros, isolamento multi-tenant e documentação operacional.

Estado atual:

- Tasks 1 a 5 concluídas e revisadas;
- banco multi-tenant aplicado no Supabase remoto;
- migration local e remota alinhada em `202608180001`;
- 65 testes pgTAP de RLS aprovados local e remotamente em 19/08/2026;
- branch `main` saneada no GitHub até `540cffb`, sem banco SQLite rastreado e com o legado restrito a `legacy/`;
- branch de Etapa 1 publicada no GitHub até `68fdfe6`;
- Task 6 concluída e publicada em 24/08/2026 (38/38 testes, typecheck, lint sem warnings e build aprovados);
- Task 7 concluída e publicada em 24/08/2026 (59/59 testes, typecheck, lint e build aprovados);
- Task 8 concluída e publicada em 24/08/2026 (71/71 testes, typecheck, lint e build aprovados);
- Task 9 concluída localmente em 25/08/2026 com documentação final, suíte técnica verde, hotfix de Server Actions publicado e QA manual validado pelo usuário; roteiro Alfa/Beta formal e pgTAP desta rodada seguem pendentes por dependerem de ambiente operacional/Docker.

## 2. Fontes de verdade

| Papel | Documento ou código | Responsabilidade |
| --- | --- | --- |
| Visão e escopo | `docs/superpowers/specs/2026-08-18-etapa-1-migracao-nextjs-supabase-design.md` | Objetivos e decisões de produto da Etapa 1. |
| Plano | `docs/superpowers/plans/2026-08-18-etapa-1-migracao-nextjs-supabase.md` | Nove tasks e critérios de aceite. |
| Status | `docs/STATUS_E_ROADMAP.md` | Entregas, pendências, riscos e próximos passos. |
| Setup do banco | `docs/SETUP_SUPABASE.md` | Ambiente, migrations, Auth, RLS e diagnóstico. |
| Arquitetura | `docs/ARQUITETURA.md` | Módulos, fluxos e fronteiras da aplicação. |
| Segurança | `docs/SEGURANCA.md` | RLS, papéis, convites, segredos e operação segura. |
| Operação | `docs/OPERACAO.md` | Comandos, diagnóstico e publicação. |
| Checklist | `docs/checklists/etapa-1-acceptance.md` | Evidência de aceite funcional, visual e técnica. |
| Operação básica | `README.md` | Requisitos, instalação e comandos. |
| Contrato do banco | `supabase/migrations/202608180001_initial_schema.sql` | Schema, funções, grants e policies. |
| Isolamento | `supabase/tests/rls_isolation.sql` | Testes reais das regras de segurança. |

Os arquivos em `legacy/` são referência histórica e não fazem parte do runtime Next.js. Não devem ser apagados enquanto a migração visual e funcional não estiver concluída.

## 3. Estado dos ambientes

### GitHub

- Repositório: `https://github.com/Veritus-Lab/Project-Prototype`
- Branch publicada: `feat/nextjs-supabase-etapa-1`
- Último commit de aplicação validado: HEAD atual de `feat/nextjs-supabase-etapa-1`.
- A branch ainda não foi mesclada em `main`.

### Worktree local

- Caminho atual: `.worktrees/task-6-recovered`
- Branch: `feat/nextjs-supabase-etapa-1`
- HEAD local e remoto em 24/08/2026: validar com `git rev-parse --short HEAD` e `git rev-parse --short @{u}`.
- O servidor local de QA sobe com `npm run dev -- -p 3000` e fica disponível em `http://localhost:3000`.

### Supabase

- Projeto vinculado: `flernk-dev`
- Project ref: `hrmyqrekasuqhiqmqske`
- Migration local e remota confirmada em 21/08/2026: `202608180001`
- Nenhuma chave `service_role`, senha de banco ou token da CLI foi versionado.
- `.env.local` contém somente configuração pública e permanece ignorado pelo Git.

## 4. O que foi implementado

### Task 1 — Base Next.js e legado — concluída

- Protótipo anterior preservado em `legacy/`.
- Aplicação principal migrada para Next.js App Router e TypeScript.
- React, Tailwind CSS, Vitest, Testing Library, lint, typecheck e build configurados.
- Logo disponibilizada em `public/`.
- Scripts `dev`, `build`, `lint`, `typecheck` e `test` formalizados.
- Faixa do Node restringida para versões compatíveis com os testes.

Principais commits: `8c9c5fc` até `9dedf53`.

### Task 2 — Design system e landing page — concluída

- Componentes compartilhados `Button`, `Input`, `Card`, `Badge` e `Brand`.
- Landing reconstruída no padrão visual FLERNK.
- Tokens principais: amarelo `#E2FF00`, hover `#C8E200`, fundo `#0A0C0E`, superfícies `#14171A` e `#1A1E23`, borda `#23272D` e texto `#F3F4F6`.
- CTAs direcionam treinador para `/cadastro` e atleta para `/login`.
- Melhorias de semântica e acessibilidade.

Principais commits: `798467a`, `4c1ab4e` e `7167de6`.

### Task 3 — Supabase e ambiente — concluída

- Clientes Supabase para navegador e servidor.
- Renovação de sessão com a convenção atual `proxy.ts` do Next.js.
- Variáveis públicas validadas com Zod.
- Suporte a publishable keys e chaves anon JWT legadas válidas.
- `.env.example` sem segredos e `.env.local` ignorado.

Principais commits: `90606ed` e `c1a7dd6`.

### Task 4 — Banco multi-tenant e RLS — concluída

Foram criados:

- enums `papel_usuario`, `status_convite` e `origem_treino`;
- tabelas `assessorias`, `profiles`, `treinadores`, `atletas`, `convites_atletas`, `treinos` e `treinos_atletas`;
- funções `bootstrap_treinador`, `validar_convite` e `aceitar_convite`;
- helpers privados, triggers, constraints, índices, policies e grants mínimos;
- tipos TypeScript em `src/types/database.ts`.

Regras implementadas:

- treinador e atleta pertencem a uma assessoria;
- atleta entra somente por convite;
- FKs compostas e RLS bloqueiam vínculos cross-tenant;
- somente SHA-256 do convite é armazenado;
- validação pública não expõe e-mail completo, tenant ou hash;
- aceite bloqueia e revalida a linha antes da mutação;
- funções `SECURITY DEFINER` usam `search_path` restrito;
- fixtures pgTAP usam `BEGIN`/`ROLLBACK`.

Evidência de 19/08/2026:

- banco local recriado e migration reaplicada;
- pgTAP local: 65/65;
- migration aplicada ao remoto após dry-run autorizado;
- pgTAP remoto: 65/65;
- migration alinhada em `202608180001`.

Principais commits: `551ca07`, `dffa2b2`, `d8a8129` e `32fddc2`.

### Task 5 — Cadastro do treinador — concluída

- Cadastro real com nome, assessoria, e-mail e senha forte.
- Senha com pelo menos oito caracteres, uma letra e um número.
- `signUpTrainer` usa Supabase Auth e metadata fixa `papel=treinador`.
- Trigger cria assessoria, profile e treinador atomicamente.
- Server Action retorna erros estruturados e mensagens seguras.
- Falhas de configuração, rede e cliente são tratadas.
- Formulário com `useActionState`, labels, autocomplete e estados acessíveis.
- Tela `/confirmar-email` e callback `/auth/callback`.
- Redirect baseado em `NEXT_PUBLIC_SITE_URL`, evitando host arbitrário.
- Estado seguro para link inválido ou expirado.
- Ambiente local exige confirmação de e-mail.
- Contraste das bordas de controles elevado para pelo menos 3:1.

Evidência registrada:

- testes focados: 11/11;
- suíte completa no commit estável: 28/28;
- typecheck e build aprovados;
- revisão independente aprovada após uma rodada de correção.

O envio real de e-mail ainda requer QA no projeto hospedado. Confirmar **Authentication → Providers → Email → Confirm email** e `/auth/callback` nas Redirect URLs.

Principais commits: `eb77d22`, `6084ce2`, `3304063`, `6a4f2c2` e `575e61a`.

## 5. O que falta na Etapa 1

### Task 6 — Login, sessão e dashboards — concluída

Implementação concluída e publicada em 24/08/2026 sobre os testes RED existentes:

- `src/lib/auth/session.ts`: `requireUser()` com `auth.getUser()` + `profiles` (a autoridade é sempre o profile persistido, nunca metadata) e `requireRole()` com redirecionamento cruzado entre dashboards; anônimo vai para `/login`; usuário autenticado sem profile falha com mensagem segura.
- `src/lib/services/auth.service.ts`: `signIn()` com `signInWithPassword` e tradução de erros (credenciais inválidas, e-mail não confirmado), e `signOut()` tolerante a falhas.
- `src/lib/validators/auth.ts`: `signInSchema` (e-mail + senha, sem campo de papel).
- `src/app/(auth)/login/`: página, `signInAction` (decide o destino pelo profile após o login, redirect fora do catch) e formulário com preferência visual Atleta/Treinador em `radiogroup` sem `name` (nada é submetido; suporte a setas do teclado).
- `src/app/(dashboard)/`: layout protegido com sidebar responsiva (itens sem funcionalidade ficam inertes por design), header com papel e logout via `signOutAction`; páginas `/treinador` e `/atleta` com `requireRole`.
- `src/lib/demo/dashboard.ts`: dados demo centralizados dos dois dashboards, a substituir por repositórios Supabase na Etapa 2.

Evidência de 24/08/2026:

- suíte completa: 38/38 em 12 arquivos;
- `npm run typecheck` aprovado;
- `npm run lint` aprovado sem warnings;
- `npm run build` aprovado no worktree oficial da Task 6;
- `vitest.config.ts` estabilizado no Windows com `pool: "threads"` e `fileParallelism: false`.

Observações restantes:

- QA manual do fluxo real (cadastro → confirmação de e-mail → login → dashboard) no projeto hospedado;
- considerar redirect de `/login` quando já autenticado (não implementado nesta etapa).

### Task 7 — Convites do treinador — concluída

- Token criptográfico URL-safe com 32 bytes e hash SHA-256 hexadecimal.
- Validade de sete dias calculada no domínio.
- Estados de convite centralizados: ativo, expirado, aceito e revogado.
- Service restrito a `requireRole("treinador")`.
- Criação normaliza e-mail, revoga convite ativo duplicado na mesma assessoria e insere somente o hash.
- Link bruto `/convite/<token>` é retornado apenas na resposta de criação.
- Revogação atualiza somente convites da assessoria do treinador autenticado.
- Listagem não seleciona nem renderiza `token_hash`.
- Painel `/treinador/convites` com formulário, link recém-gerado copiável, lista compacta, status e ação de revogar.
- Testes de token, service, actions, página e componentes.

Evidência de 24/08/2026:

- suíte completa: 59/59 em 18 arquivos;
- `npm run typecheck` aprovado;
- `npm run lint` aprovado sem warnings;
- `npm run build` aprovado, incluindo a rota `/treinador/convites`.

### Task 8 — Cadastro exclusivo do atleta — concluída

- Rota pública `/convite/[token]`.
- Hash SHA-256 do token antes das RPCs.
- Inspeção pública via `validar_convite`, expondo somente e-mail mascarado, nome da assessoria e estado.
- Estados tratados: inválido, expirado, revogado, usado e ativo.
- Cadastro de atleta por convite com metadata `papel=atleta`.
- Aceite atômico via RPC `aceitar_convite`.
- Erro específico para e-mail divergente do convite.
- Redirecionamento para `/atleta` após aceite.
- Estados inválidos exibem página definitiva sem formulário.
- Testes de service, action, formulário e página.

Evidência de 24/08/2026:

- suíte completa: 71/71 em 22 arquivos;
- `npm run typecheck` aprovado;
- `npm run lint` aprovado sem warnings;
- `npm run build` aprovado, incluindo a rota `/convite/[token]`.

### Task 9 — Validação e documentação — concluída localmente

- Testes, lint, typecheck e build executados e aprovados.
- Documentação final atualizada em README, setup, arquitetura, segurança, operação, status e checklist.
- Smoke HTTP local aprovado em `http://localhost:3000`:
  - `/`, `/cadastro`, `/login` e `/convite/token-invalido-para-smoke`: 200.
  - `/treinador`, `/atleta` e `/treinador/convites`: 307 para autenticação.
- QA manual validado pelo usuário em 25/08/2026 no servidor local.
- Hotfix pós-QA publicado em `68fdfe6` para manter módulos `"use server"` exportando apenas funções async, conforme exigência do Next.js 16.
- pgTAP local desta rodada bloqueado porque Docker Desktop/Linux engine não estava disponível.
- pgTAP remoto, roteiro real Alfa/Beta e confirmação de e-mail hospedada não foram executados para evitar uso/mutação remota sem autorização operacional explícita.
- QA visual/manual local validado antes de organizar PR para `main`.
- Pull Request e merge em `main` devem ocorrer somente após aprovação.

## 6. Pendências técnicas conhecidas

- Ampliar pgTAP para INSERT, UPDATE e DELETE cross-tenant negativos.
- Testar aceite com e-mail divergente, convite expirado/revogado e hash desconhecido não vazio.
- Revisar possível duplicidade de `treinadores_assessoria_idx`.
- Alinhar limites do validator aos 120 caracteres do banco.
- Ampliar testes de acessibilidade dos estados de erro e carregamento.

## 7. Regras que não podem regredir

- Nunca versionar `service_role`, senha do banco, token da CLI ou segredo.
- Nunca usar metadata como autoridade depois do bootstrap.
- Papel e tenant reais vêm de `profiles`.
- Cadastro aberto é exclusivo de treinador.
- Atleta entra apenas por convite válido, não expirado, revogado ou usado.
- Componentes React não fazem mutações diretamente no Supabase.
- Formulários chamam Server Actions, que validam e delegam a services.
- Tabelas de negócio permanecem isoladas por tenant e protegidas por RLS.
- Migration remota é forward-only; correção exige nova migration.
- `legacy/` permanece até a migração terminar.
- Commit RED não é entrega estável.

## 8. Próximos passos imediatos

1. Rodar gate curto pós-validação.
2. Abrir Pull Request para `main`.
3. Aprovar e mesclar em `main` somente após revisão.
4. Com Docker ativo, rodar pgTAP local em uma rodada operacional futura.
5. Com autorização operacional, executar roteiro formal Alfa/Beta no Supabase hospedado.

Comandos principais:

```powershell
npm install
npm test -- --maxWorkers=1
npm run lint
npm run typecheck
npm run build
```

Banco local, com Docker em execução:

```powershell
npx supabase start
npx supabase db reset --local --no-seed
npx supabase test db --local supabase/tests/rls_isolation.sql
```

Nunca executar `db reset` no projeto remoto.

## 9. Roadmap futuro após a Etapa 1

Esta seção é uma proposta e precisa de priorização comercial e aprovação do cliente.

### Etapa 2 — Operação da assessoria

- CRUD de atletas e avaliações;
- criação, biblioteca e atribuição de treinos;
- calendário real de treinador e atleta;
- registro de execução e percepção de esforço;
- evolução de distância, ritmo, frequência cardíaca e aderência;
- comunicação, documentos e anexos;
- configurações de assessoria, perfil e marca;
- troca dos dados demo por repositories Supabase.

### Etapa 3 — Integrações e automação

- importação de atividades de relógios e aplicativos;
- integrações possíveis com Strava, Garmin, COROS e similares;
- notificações por e-mail, WhatsApp ou push;
- envio automático de convites e lembretes;
- relatórios periódicos;
- recomendações assistidas por IA, sempre revisadas pelo treinador;
- filas e processamento assíncrono.

### Etapa 4 — Comercial, financeiro e escala

- planos, cobrança recorrente e gestão financeira;
- limites por plano e onboarding comercial;
- administração interna da plataforma;
- métricas, logs, alertas e auditoria;
- backups e recuperação;
- ambientes de desenvolvimento, homologação e produção;
- CI/CD e previews por Pull Request;
- política de privacidade, termos e LGPD;
- testes de carga, segurança e recuperação de desastre.

## 10. Definição de conclusão da Etapa 1

A Etapa 1 somente estará concluída quando:

- Tasks 6, 7, 8 e 9 estiverem implementadas e revisadas;
- confirmação real do treinador funcionar;
- login redirecionar pelo papel persistido;
- treinador gerar e revogar convite;
- atleta aceitar um convite válido uma única vez;
- dashboards estiverem protegidos;
- isolamento Alfa/Beta for demonstrado com usuários reais;
- testes, lint, typecheck e build estiverem verdes;
- QA desktop/mobile não apresentar erros críticos;
- documentação estiver atualizada;
- branch estiver aprovada para merge em `main`.
