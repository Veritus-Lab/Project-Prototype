# FLERNK — Status, continuidade e roadmap

> Atualizado em 21 de agosto de 2026. Este documento é a fonte canônica para o estado atual do projeto, o trabalho concluído, as pendências e os próximos passos. Valide informações operacionais com Git, testes e Supabase antes de alterar ambientes compartilhados.

## 1. Resumo executivo

O FLERNK está sendo migrado de um protótipo em HTML, CSS, JavaScript, Express e SQLite para uma aplicação SaaS em Next.js, TypeScript e Supabase.

A Etapa 1 foi planejada como uma fatia vertical completa: landing page, cadastro real do treinador, autenticação, separação entre treinador e atleta, dashboards iniciais, convites seguros, isolamento multi-tenant e documentação operacional.

Estado atual:

- Tasks 1 a 5 concluídas e revisadas;
- banco multi-tenant aplicado no Supabase remoto;
- migration local e remota alinhada em `202608180001`;
- 65 testes pgTAP de RLS aprovados local e remotamente em 19/08/2026;
- branch estável publicada no GitHub até o commit `575e61a`;
- Task 6 iniciada localmente em TDD, ainda no estágio RED;
- Tasks 7, 8 e 9 ainda não implementadas.

## 2. Fontes de verdade

| Papel | Documento ou código | Responsabilidade |
| --- | --- | --- |
| Visão e escopo | `docs/superpowers/specs/2026-08-18-etapa-1-migracao-nextjs-supabase-design.md` | Objetivos e decisões de produto da Etapa 1. |
| Plano | `docs/superpowers/plans/2026-08-18-etapa-1-migracao-nextjs-supabase.md` | Nove tasks e critérios de aceite. |
| Status | `docs/STATUS_E_ROADMAP.md` | Entregas, pendências, riscos e próximos passos. |
| Setup do banco | `docs/SETUP_SUPABASE.md` | Ambiente, migrations, Auth, RLS e diagnóstico. |
| Operação básica | `README.md` | Requisitos, instalação e comandos. |
| Contrato do banco | `supabase/migrations/202608180001_initial_schema.sql` | Schema, funções, grants e policies. |
| Isolamento | `supabase/tests/rls_isolation.sql` | Testes reais das regras de segurança. |

Os arquivos em `legacy/` são referência histórica e não fazem parte do runtime Next.js. Não devem ser apagados enquanto a migração visual e funcional não estiver concluída.

## 3. Estado dos ambientes

### GitHub

- Repositório: `https://github.com/Veritus-Lab/Project-Prototype`
- Branch publicada: `feat/nextjs-supabase-etapa-1`
- Commit remoto estável confirmado em 21/08/2026: `575e61a189cf084db56061f86f0be182a04cfb6c`
- A branch ainda não foi mesclada em `main`.

### Worktree local

- Caminho: `Project p/Project p/.worktrees/feat-nextjs-supabase-etapa-1`
- Branch: `feat/nextjs-supabase-etapa-1`
- HEAD local em 21/08/2026: `34894e6`
- O HEAD local está um commit à frente do remoto.
- O commit adicional é deliberadamente RED e contém somente testes iniciais da Task 6.
- Não publicar `34894e6` como entrega estável antes de implementar e revisar a Task 6.

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

### Task 6 — Login, sessão e dashboards — em andamento, RED

Já existe localmente:

- teste de `requireUser()`;
- teste de `requireRole()`;
- casos de treinador, atleta, anônimo e usuário sem profile;
- teste da preferência visual Atleta/Treinador;
- commit local `34894e6` com os testes.

O teste focado executado em 21/08/2026 falhou como esperado porque ainda faltam:

- `src/lib/auth/session.ts`;
- `src/components/auth/login-form.tsx`;
- actions e página de login;
- layout protegido;
- páginas dos dashboards.

Próxima implementação:

1. Criar `requireUser()` com `auth.getUser()` e `profiles`.
2. Criar `requireRole()` usando somente `profiles.papel` como autoridade.
3. Criar `signInAction` e `signOutAction`.
4. Criar `/login` com preferência visual Atleta/Treinador.
5. Não usar essa preferência como autorização; o banco decide o destino.
6. Redirecionar treinador para `/treinador`, atleta para `/atleta` e anônimo para `/login`.
7. Criar layout protegido, sidebar responsiva, header e logout.
8. Criar dashboards iniciais com dados demo centralizados.
9. Manter botões laterais sem funcionalidade fora do escopo da apresentação.
10. Executar GREEN, typecheck, suíte, build e revisão independente.
11. Publicar o novo HEAD somente após aprovação.

### Task 7 — Convites do treinador — não iniciada

- Token criptográfico URL-safe e hash SHA-256.
- Validade de sete dias, revogação e uso único.
- Service restrito a treinador autenticado.
- Revogação de convite ativo duplicado para o mesmo e-mail.
- Painel `/treinador/convites` com formulário, lista, status e cópia.
- Link bruto exibido apenas logo após a criação.
- Testes de token, estados e service.

### Task 8 — Cadastro exclusivo do atleta — não iniciada

- Rota `/convite/[token]`.
- Hash antes das RPCs.
- Inspeção pública com somente e-mail mascarado, assessoria e estado.
- Estados desconhecido, expirado, revogado e usado.
- Cadastro com e-mail fixado pelo convite e metadata `papel=atleta`.
- Aceite atômico pela RPC `aceitar_convite`.
- Redirecionamento para `/atleta`.
- Bloqueio de reutilização do token.
- Testes do service e formulário.

### Task 9 — Validação e documentação — não iniciada

- Executar testes, lint, typecheck e build.
- Roteiro real com Assessoria Alfa e Assessoria Beta.
- Validar isolamento entre usuários reais de teste.
- QA de cadastro, confirmação, login, convite, revogação e aceite.
- QA visual em `1440x900` e `390x844`.
- Verificar console, overflow, sobreposição e respostas 4xx/5xx.
- Finalizar arquitetura, segurança, operação e checklist de aceite.
- Fazer revisão ampla, Pull Request e merge somente após aprovação.

## 6. Pendências técnicas conhecidas

- Ampliar pgTAP para INSERT, UPDATE e DELETE cross-tenant negativos.
- Testar aceite com e-mail divergente, convite expirado/revogado e hash desconhecido não vazio.
- Revisar possível duplicidade de `treinadores_assessoria_idx`.
- Alinhar limites do validator aos 120 caracteres do banco.
- Ampliar testes de acessibilidade dos estados de erro e carregamento.
- Corrigir warning preexistente em `postcss.config.mjs`.
- Investigar a inicialização lenta dos workers Vitest no Windows.
- Usar `--maxWorkers=1` enquanto o timeout paralelo persistir.

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

1. Trabalhar no worktree `feat-nextjs-supabase-etapa-1`.
2. Confirmar HEAD local `34894e6` e remoto `575e61a`.
3. Não apagar os testes RED da Task 6.
4. Implementar a Task 6 até o GREEN e revisar.
5. Fazer push apenas do estado aprovado.
6. Implementar Tasks 7 e 8 em TDD.
7. Executar Task 9 e QA real.
8. Abrir Pull Request para `main`.

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
