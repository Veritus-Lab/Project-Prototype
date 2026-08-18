# FLERNK Etapa 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o prototipo FLERNK para uma fatia vertical funcional em Next.js e Supabase, cobrindo cadastro do treinador, assessoria multi-tenant, autenticacao, convite seguro e entrada inicial do atleta.

**Architecture:** A raiz sera uma aplicacao Next.js App Router; o prototipo anterior ficara em `legacy/`. Server Actions chamarao services validados por Zod, e o Supabase aplicara Auth e RLS multi-tenant. A UI compartilhara tokens e componentes do design system FLERNK.

**Tech Stack:** Next.js 15+, React 19+, TypeScript 5+, Tailwind CSS 4+, Supabase JS/SSR, Zod, Vitest, Testing Library e Lucide React.

**Spec:** `docs/superpowers/specs/2026-08-18-etapa-1-migracao-nextjs-supabase-design.md`

## Global Constraints

- Preservar o prototipo atual em `legacy/`; nao apagar nem reverter mudancas existentes.
- Usar Inter, amarelo `#E2FF00`, hover `#C8E200`, fundo `#0A0C0E`, superficie `#14171A`, superficie elevada `#1A1E23`, borda `#23272D` e texto `#F3F4F6`.
- Toda tabela de negocio deve conter `assessoria_id` e ter RLS ativa desde a migration inicial.
- Componentes React nao podem realizar mutacoes diretamente no Supabase; formularios usam Server Actions e services.
- Cadastro aberto somente para treinador; atleta entra exclusivamente por convite de uso unico, vinculado ao e-mail, revogavel e valido por sete dias.
- Nunca expor chave secreta, `service_role`, senha do banco ou token bruto persistido.
- Manter a documentacao de instalacao, arquitetura, seguranca e operacao atualizada junto com a implementacao.

---

### Task 1: Preservar o legado e criar a base Next.js

**Files:**
- Move: `index.html`, `landing.html`, `server.js`, `athlete-dashboard.js`, `athlete-dashboard.css`, `iniciar.bat`, `Project p.zip`, `CONTINUIDADE_IA.md`, `assets/` -> `legacy/`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `public/flernk-logo.jpg`
- Create: `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/test/setup.ts`
- Modify: `package.json`, `package-lock.json`, `.gitignore`, `README.md`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Produces: Next.js App Router executavel por `npm run dev`; aliases `@/*`; scripts `dev`, `build`, `lint`, `typecheck`, `test`.

- [ ] **Step 1: Mover os arquivos do prototipo para `legacy/` e copiar a logo para `public/`**

Use movimentos literais no PowerShell, preservando os arquivos e o historico. Verifique antes que cada origem existe e que cada destino fica dentro da raiz do repositorio.

- [ ] **Step 2: Escrever o teste inicial da pagina raiz**

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

it("renders the FLERNK product name", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { name: /flernk/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: Instalar dependencias e executar o teste para confirmar falha**

Run: `npm install next@latest react@latest react-dom@latest @supabase/ssr @supabase/supabase-js zod lucide-react && npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next vitest jsdom @testing-library/react @testing-library/jest-dom`

Run: `npm test -- src/app/page.test.tsx`

Expected: FAIL porque a nova pagina ainda nao existe.

- [ ] **Step 4: Criar a configuracao minima e a pagina raiz**

`src/app/page.tsx` deve exportar um Server Component com `<h1>FLERNK</h1>`. `layout.tsx` usa `next/font/google` para Inter, define metadata e importa `globals.css`. `globals.css` define os tokens globais e estilos de foco.

- [ ] **Step 5: Verificar teste, tipos e build**

Run: `npm test -- src/app/page.test.tsx && npm run typecheck && npm run build`

Expected: PASS, zero erros de tipo e build concluido.

- [ ] **Step 6: Commit**

```bash
git add legacy public src package.json package-lock.json next.config.ts postcss.config.mjs tsconfig.json vitest.config.ts .gitignore README.md
git commit -m "chore: migrate project shell to nextjs"
```

### Task 2: Criar o design system e migrar a landing page

**Files:**
- Create: `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`
- Create: `src/components/shared/brand.tsx`
- Create: `src/components/marketing/header.tsx`, `hero.tsx`, `features.tsx`, `audiences.tsx`, `footer.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`
- Test: `src/components/ui/button.test.tsx`, `src/app/page.test.tsx`

**Interfaces:**
- Produces: `Button`, `Input`, `Card`, `Badge`, `Brand`; CTA hrefs `/cadastro` e `/login`; variants `primary`, `secondary`, `ghost`.

- [ ] **Step 1: Escrever testes de variante e navegacao**

```tsx
it("uses the primary brand style", () => {
  render(<Button>Entrar</Button>);
  expect(screen.getByRole("button")).toHaveClass("bg-brand");
});

it("links athlete and coach calls to action", () => {
  render(<HomePage />);
  expect(screen.getByRole("link", { name: /sou treinador/i })).toHaveAttribute("href", "/cadastro");
  expect(screen.getByRole("link", { name: /sou atleta/i })).toHaveAttribute("href", "/login");
});
```

- [ ] **Step 2: Executar os testes para confirmar falha**

Run: `npm test -- src/components/ui/button.test.tsx src/app/page.test.tsx`

Expected: FAIL por componentes e CTAs ausentes.

- [ ] **Step 3: Implementar componentes e composicao da landing**

Use `className` simples e tokens CSS, `next/image` para a logo, Lucide para icones e as mensagens aprovadas na landing legada. Mantenha a marca e o produto no primeiro viewport; evite dependencias CDN.

- [ ] **Step 4: Verificar testes e acessibilidade estatica**

Run: `npm test -- src/components/ui/button.test.tsx src/app/page.test.tsx && npm run lint`

Expected: PASS e zero erros.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components
git commit -m "feat: add FLERNK design system and landing"
```

### Task 3: Configurar clientes Supabase e ambiente

**Files:**
- Create: `.env.example`, `.env.local`
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- Create: `src/middleware.ts`
- Test: `src/lib/env.test.ts`

**Interfaces:**
- Produces: `getPublicEnv(): { supabaseUrl: string; supabasePublishableKey: string }`; `createBrowserClient()`; `createServerClient()`; `updateSession(request: NextRequest)`.

- [ ] **Step 1: Escrever teste de validacao de ambiente**

```ts
it("rejects an invalid Supabase URL", () => {
  expect(() => getPublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: "invalid",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
  })).toThrow(/URL do Supabase/i);
});
```

- [ ] **Step 2: Executar o teste para confirmar falha**

Run: `npm test -- src/lib/env.test.ts`

Expected: FAIL porque `getPublicEnv` nao existe.

- [ ] **Step 3: Implementar validacao e clients SSR**

Use Zod para exigir URL HTTPS e chave iniciada por `sb_publishable_` ou JWT anon. `.env.local` recebe a URL e chave publishable fornecidas; `.env.example` contem nomes e exemplos sem credenciais reais. O middleware renova cookies apenas e nao decide papel.

- [ ] **Step 4: Verificar teste e segredo ignorado**

Run: `npm test -- src/lib/env.test.ts && git check-ignore .env.local`

Expected: PASS e `.env.local` listado como ignorado.

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore src/lib src/middleware.ts
git commit -m "feat: configure Supabase SSR clients"
```

### Task 4: Criar migration multi-tenant com RLS

**Files:**
- Create: `supabase/migrations/202608180001_initial_schema.sql`
- Create: `supabase/tests/rls_isolation.sql`
- Create: `src/types/database.ts`
- Modify: `docs/SETUP_SUPABASE.md`

**Interfaces:**
- Produces: enums `papel_usuario`, `status_convite`, `origem_treino`; tabelas `assessorias`, `profiles`, `treinadores`, `atletas`, `convites_atletas`, `treinos`, `treinos_atletas`; RPCs `bootstrap_treinador`, `validar_convite`, `aceitar_convite`.

- [ ] **Step 1: Escrever o teste SQL de isolamento antes das policies**

O teste cria duas assessorias e dois usuarios de teste, assume cada JWT e confirma que um usuario nao le `profiles`, `convites_atletas`, `treinos` ou `treinos_atletas` da outra assessoria. Use transacao com rollback.

- [ ] **Step 2: Criar schema, constraints e indices**

Inclua `assessoria_id uuid not null` nas tabelas de negocio, FKs, indices compostos, `token_hash text unique`, `expira_em`, `usado_em`, `revogado_em`, e check para convite nao ter estados conflitantes.

- [ ] **Step 3: Criar trigger de bootstrap do treinador e funcoes de convite**

`bootstrap_treinador()` le metadata apenas quando `papel = treinador`, cria tenant/perfil/treinador atomicamente e fixa `search_path = public, auth`. `validar_convite(hash text)` retorna somente e-mail mascarado, nome da assessoria e estado. `aceitar_convite(hash text, user_id uuid, nome text)` bloqueia a linha, revalida prazo/estado/e-mail e cria perfil/atleta antes de marcar uso.

- [ ] **Step 4: Habilitar RLS e criar policies por papel/tenant**

Revogue acesso publico as tabelas. Conceda leitura do proprio perfil; treinador administra dados da propria assessoria; atleta le apenas sua extensao e seus vinculos. Restrinja execucao das RPCs aos papeis necessarios.

- [ ] **Step 5: Aplicar no SQL Editor e executar teste de isolamento**

Run no Supabase SQL Editor: migration completa e depois `supabase/tests/rls_isolation.sql`.

Expected: todos os asserts passam e a transacao termina com rollback.

- [ ] **Step 6: Commit**

```bash
git add supabase src/types/database.ts docs/SETUP_SUPABASE.md
git commit -m "feat: add multi-tenant Supabase schema and RLS"
```

### Task 5: Implementar cadastro e confirmacao do treinador

**Files:**
- Create: `src/lib/validators/auth.ts`
- Create: `src/lib/services/auth.service.ts`
- Create: `src/app/(auth)/cadastro/actions.ts`, `page.tsx`
- Create: `src/app/(auth)/confirmar-email/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/components/auth/auth-shell.tsx`, `signup-form.tsx`
- Test: `src/lib/validators/auth.test.ts`, `src/components/auth/signup-form.test.tsx`

**Interfaces:**
- Produces: `trainerSignupSchema`; `signUpTrainer(input): Promise<ServiceResult<{ email: string }>>`; `signUpTrainerAction(previousState, formData)`.

- [ ] **Step 1: Escrever testes de validacao**

```ts
it("requires a strong trainer password", () => {
  const result = trainerSignupSchema.safeParse({
    nome: "Rodrigo Sousa", assessoria: "FLERNK Running",
    email: "rodrigo@example.com", senha: "123456",
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Executar os testes para confirmar falha**

Run: `npm test -- src/lib/validators/auth.test.ts`

Expected: FAIL por schema ausente.

- [ ] **Step 3: Implementar schema, service e action**

A senha exige no minimo oito caracteres, uma letra e um numero. O service chama `auth.signUp` com `emailRedirectTo=/auth/callback`, metadata `nome`, `assessoria_nome`, `papel=treinador`, e traduz erros conhecidos para portugues.

- [ ] **Step 4: Implementar telas com estados acessiveis**

Use `useActionState`, labels explicitos, autocomplete e aviso de confirmacao. Nunca indique se um e-mail pertence a outra assessoria alem da mensagem generica de conta existente.

- [ ] **Step 5: Verificar testes, tipos e fluxo manual de e-mail**

Run: `npm test -- src/lib/validators/auth.test.ts src/components/auth/signup-form.test.tsx && npm run typecheck`

Expected: PASS. No navegador, cadastro redireciona para `/confirmar-email?email=...`.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/auth src/lib/services src/lib/validators
git commit -m "feat: add trainer signup and email confirmation"
```

### Task 6: Implementar login, sessao e autorizacao por papel

**Files:**
- Create: `src/app/(auth)/login/actions.ts`, `page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/lib/auth/session.ts`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/treinador/page.tsx`
- Create: `src/app/(dashboard)/atleta/page.tsx`
- Test: `src/lib/auth/session.test.ts`, `src/components/auth/login-form.test.tsx`

**Interfaces:**
- Produces: `requireUser(): Promise<AuthenticatedProfile>`; `requireRole(role: "treinador" | "atleta")`; `signInAction`; `signOutAction`.

- [ ] **Step 1: Escrever testes de redirecionamento por papel**

Teste que treinador recebe `/treinador`, atleta recebe `/atleta` e usuario sem profile recebe erro de configuracao, usando client Supabase mockado.

- [ ] **Step 2: Executar testes para confirmar falha**

Run: `npm test -- src/lib/auth/session.test.ts src/components/auth/login-form.test.tsx`

Expected: FAIL por helpers ausentes.

- [ ] **Step 3: Implementar login e helpers de sessao**

`requireUser` chama `auth.getUser`, busca `profiles` por `id` e retorna `{ id, email, nome, papel, assessoriaId }`. `requireRole` redireciona anonimo para `/login` e papel incorreto para o painel correspondente.

- [ ] **Step 4: Implementar shells iniciais dos dashboards**

Crie sidebar responsiva, header, logout e conteudo inicial. Reutilize `Brand`, `Card`, `Button` e tokens globais. Nao migre funcionalidades fora da Etapa 1.

- [ ] **Step 5: Verificar testes e rotas protegidas**

Run: `npm test -- src/lib/auth/session.test.ts src/components/auth/login-form.test.tsx && npm run typecheck`

Expected: PASS; acesso anonimo aos dashboards redireciona para login.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/auth src/components/dashboard src/lib/auth
git commit -m "feat: add role-based authentication and dashboards"
```

### Task 7: Implementar geracao e revogacao de convites

**Files:**
- Create: `src/lib/invitations/token.ts`
- Create: `src/lib/validators/invitation.ts`
- Create: `src/lib/services/invitation.service.ts`
- Create: `src/app/(dashboard)/treinador/convites/actions.ts`, `page.tsx`
- Create: `src/components/dashboard/invitation-form.tsx`, `invitation-list.tsx`
- Test: `src/lib/invitations/token.test.ts`, `src/lib/services/invitation.service.test.ts`

**Interfaces:**
- Produces: `createInvitationToken(): { token: string; hash: string }`; `getInvitationState(invite, now): "active" | "expired" | "used" | "revoked"`; `createInvitation(email)`; `revokeInvitation(id)`.

- [ ] **Step 1: Escrever testes do dominio do token**

```ts
it("creates a URL-safe token and SHA-256 hash", () => {
  const result = createInvitationToken();
  expect(result.token).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.hash).not.toContain(result.token);
});
```

Inclua casos de expiracao em sete dias, revogacao e uso unico.

- [ ] **Step 2: Executar testes para confirmar falha**

Run: `npm test -- src/lib/invitations/token.test.ts src/lib/services/invitation.service.test.ts`

Expected: FAIL por funcoes ausentes.

- [ ] **Step 3: Implementar token, validacao e service**

Use `crypto.randomBytes(32).toString("base64url")` e `createHash("sha256")`. O service exige treinador, normaliza e-mail, revoga duplicata ativa do mesmo e-mail, insere hash e `expira_em = now + 7 dias`, retornando o link bruto apenas nessa resposta.

- [ ] **Step 4: Implementar painel de convites**

Inclua formulario, botao de copiar com feedback, tabela compacta com status e acao de revogar. Nao renderize tokens antigos; mostre apenas o link recem-gerado.

- [ ] **Step 5: Verificar testes e fluxo manual**

Run: `npm test -- src/lib/invitations/token.test.ts src/lib/services/invitation.service.test.ts && npm run typecheck`

Expected: PASS; treinador cria e revoga convite da propria assessoria.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/dashboard src/lib/invitations src/lib/services src/lib/validators
git commit -m "feat: add secure athlete invitation links"
```

### Task 8: Implementar aceite do convite e cadastro do atleta

**Files:**
- Create: `src/app/(auth)/convite/[token]/actions.ts`, `page.tsx`
- Create: `src/components/auth/invitation-signup-form.tsx`
- Modify: `src/lib/services/auth.service.ts`, `src/lib/services/invitation.service.ts`
- Test: `src/lib/services/invitation-acceptance.test.ts`, `src/components/auth/invitation-signup-form.test.tsx`

**Interfaces:**
- Produces: `inspectInvitation(token): Promise<PublicInvitation>`; `acceptInvitation(input): Promise<ServiceResult<void>>`; `PublicInvitation = { maskedEmail: string; assessoriaNome: string; state: InvitationState }`.

- [ ] **Step 1: Escrever testes de convite valido e invalido**

Cubra token desconhecido, expirado, revogado, usado, e-mail divergente e aceite valido. Confirme que a resposta publica nunca contem `token_hash` nem `assessoria_id`.

- [ ] **Step 2: Executar testes para confirmar falha**

Run: `npm test -- src/lib/services/invitation-acceptance.test.ts`

Expected: FAIL por services ausentes.

- [ ] **Step 3: Implementar inspecao e aceite atomico**

Hash do token e chamada as RPCs. O cadastro Supabase usa o e-mail fixado pelo convite e metadata `papel=atleta`; a RPC de aceite valida o usuario autenticado e o e-mail antes de criar `profiles` e `atletas`.

- [ ] **Step 4: Implementar pagina e formulario**

Mostre nome da assessoria e e-mail mascarado. Para estados invalidos, mostre pagina definitiva sem formulario. Para sucesso, redirecione a `/atleta`.

- [ ] **Step 5: Verificar testes e reutilizacao bloqueada**

Run: `npm test -- src/lib/services/invitation-acceptance.test.ts src/components/auth/invitation-signup-form.test.tsx && npm run typecheck`

Expected: PASS; segunda tentativa com o mesmo token retorna estado `used`.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/auth src/lib/services
git commit -m "feat: add invitation-only athlete signup"
```

### Task 9: Validar a fatia vertical e documentar a Etapa 1

**Files:**
- Create: `docs/ARQUITETURA.md`, `docs/SEGURANCA.md`, `docs/OPERACAO.md`
- Modify: `README.md`, `docs/SETUP_SUPABASE.md`
- Create: `docs/checklists/etapa-1-acceptance.md`

**Interfaces:**
- Consumes: todos os fluxos e comandos das tasks anteriores.
- Produces: documentacao operacional e evidencia de aceite da Etapa 1.

- [ ] **Step 1: Executar a suite completa**

Run: `npm test && npm run lint && npm run typecheck && npm run build`

Expected: zero falhas e build de producao concluido.

- [ ] **Step 2: Executar o roteiro multi-tenant**

Crie `Assessoria Alfa` e `Assessoria Beta`, um treinador em cada uma e um atleta convidado por cada treinador. Confirme que nenhum usuario le convites, profiles ou registros da outra assessoria. Registre cada resultado no checklist.

- [ ] **Step 3: Verificar a experiencia com ECC**

No Chrome DevTools, teste landing, cadastro, login, confirmacao, dashboards e convite em 1440x900 e 390x844. Confirme ausencia de overflow, sobreposicao, console errors e requisicoes 4xx/5xx inesperadas. Capture evidencias das telas principais.

- [ ] **Step 4: Escrever documentacao completa da etapa**

`README.md` cobre instalacao e comandos; `SETUP_SUPABASE.md` cobre criacao, Auth URL Configuration, aplicacao da migration e teste RLS; `ARQUITETURA.md` cobre modulos e fluxos; `SEGURANCA.md` cobre RLS, tokens, roles e segredos; `OPERACAO.md` cobre diagnostico, revogacao e recuperacao.

- [ ] **Step 5: Verificacao final de documentacao e diff**

Run: `rg -n "TBD|TODO|localhost:3000/app|Express|SQLite" README.md docs src && git diff --check && git status --short`

Expected: nenhum placeholder; referencias a Express/SQLite apenas no contexto de `legacy/`; diff sem erros de whitespace.

- [ ] **Step 6: Commit**

```bash
git add README.md docs
git commit -m "docs: document FLERNK stage one"
```
