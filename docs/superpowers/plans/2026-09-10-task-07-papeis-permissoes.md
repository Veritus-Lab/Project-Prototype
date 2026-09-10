# Task 07 — Papéis e permissões Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar autorização de sócio, professor, aluno e anônimo no banco e no servidor, expondo ao professor somente o enum financeiro agregado do aluno autorizado.

**Architecture:** A migration aditiva converte o modelo-alvo da Task 06 em uma camada acessível por RLS: funções privadas resolvem membro ativo e aluno autenticado; grants mínimos e políticas separam equipe, aluno e anônimo. O servidor consulta a associação persistida em `team_members`/`students`, nunca metadados da sessão, e um endpoint de status usa uma RPC limitada que só devolve o enum. O mapeamento de contas reais continua fora desta task, bloqueado pela allowlist da Task 02.

**Tech Stack:** Next.js 16 App Router, `@supabase/ssr`, Supabase Postgres/RLS, pgTAP, Vitest, TypeScript.

**Spec:** `docs/MVP_FLERNK_GESTAO.md`, `docs/TASK_04_CONTRATO_TECNICO.md`, `docs/TASKS_MVP_FLERNK.md`, `docs/SKILLS_E_TESTES_MVP_FLERNK.md`.

## Global Constraints

- FLERNK é uma única operação de produto; `assessoria_id` permanece como fronteira interna de ownership.
- Dois sócios têm acesso administrativo completo; professor só recebe o estado `em_dia`, `pendente`, `nao_configurado` ou `indisponivel`; aluno só lê seus próprios dados.
- Professor não recebe leitura direta em cobrança, checkout, pagamento, liquidação, estorno, disputa, categoria, despesa, receita, caixa, integrações, mensagens financeiras ou auditoria.
- Não confiar em `user_metadata`, papel, `assessoria_id` ou aluno enviado pelo navegador. A origem é `auth.uid()` e relações persistidas.
- Tabelas expostas mantêm RLS habilitada/forçada; grants e políticas mudam juntos. `service_role` fica somente no servidor.
- Nenhuma migration, seed, conta, pagamento, mensagem ou alteração é aplicada ao Supabase remoto nesta task.
- Não criar a conversão de dados reais sem UUIDs aprovados e allowlist explícita da Task 02.

---

### Task 1: Contrato de sessão por papel

**Files:**
- Modify: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`
- Modify: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Produces `FlernkRole = "socio" | "professor" | "aluno"`.
- Produces `requireRole(...roles: readonly FlernkRole[]): Promise<SessionUser>`.
- `SessionUser` inclui `role`, `teamMemberId | null` e `studentId | null`, derivados de consultas persistidas.

- [ ] **Step 1: Write failing session tests**

```ts
it("uses an active team membership instead of profile metadata", async () => {
  await expect(requireRole("socio")).resolves.toMatchObject({ role: "socio" });
});

it("rejects a professor from a socio-only route", async () => {
  await expect(requireRole("socio")).rejects.toThrow("NEXT_REDIRECT:/treinador");
});

it("does not retain a removed team membership", async () => {
  await expect(requireUser()).rejects.toThrow(missingProfileError);
});
```

- [ ] **Step 2: Run tests to verify RED**

Run: `./node_modules/.bin/vitest.cmd run src/lib/auth/session.test.ts --maxWorkers=1`

Expected: failure because `socio`, `professor`, `aluno` and active membership resolution do not yet exist.

- [ ] **Step 3: Implement the minimal persisted role resolver**

```ts
export type FlernkRole = "socio" | "professor" | "aluno";

export async function requireRole(...roles: readonly FlernkRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(destinationForRole(user.role));
  return user;
}
```

`requireUser` must query `profiles` for identity, active `team_members` for `socio`/`professor`, and `students` by `auth_user_id` for `aluno`. It must reject absent/inactive associations and cannot fall back to caller-controlled fields.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `./node_modules/.bin/vitest.cmd run src/lib/auth/session.test.ts --maxWorkers=1`

Expected: all session tests pass.

- [ ] **Step 5: Update the dashboard layout to consume `FlernkRole`**

Replace legacy labels/navigation types with the new role values while preserving current routes as compatibility destinations (`/treinador` for professor/sócio and `/atleta` for aluno).

- [ ] **Step 6: Commit**

```powershell
git add src/lib/auth/session.ts src/lib/auth/session.test.ts 'src/app/(dashboard)/layout.tsx'
git commit -m "feat: resolve FLERNK roles from persisted memberships"
```

### Task 2: Banco, grants e políticas RLS

**Files:**
- Create: `supabase/migrations/<generated>_task_07_role_authorization.sql`
- Create: `supabase/tests/task_07_authorization.sql`
- Modify: `scripts/run-pgtap.ts`
- Modify: `scripts/generate-mvp-foundation-types.mjs` only if the migration adds enum/table/function types represented by the generator

**Interfaces:**
- Produces private helpers `private.is_active_socio(uuid)`, `private.is_active_professor(uuid)`, `private.current_student_id(uuid)` and `private.is_student_owner(uuid, uuid)`.
- Produces `public.get_student_financial_status(uuid)` returning only `public.student_financial_status`.
- Grants target tables only to `authenticated`; no target table grant for `anon`.

- [ ] **Step 1: Write failing pgTAP authorization tests**

```sql
select results_eq(
  $$select public.get_student_financial_status('...student-a...')::text$$,
  array['nao_configurado'],
  'professor receives only the aggregate enum for a student in the same assessoria'
);
select throws_ok($$select amount_cents from public.charges$$, '42501', null,
  'professor cannot read financial details');
select is_empty($$select id from public.students where id = '...student-b...'$$,
  'student A cannot read student B');
```

The fixture must create an assessoria, a sócio, professor, aluno A, aluno B, each matching `auth.users`, `profiles`, `team_members` or `students`, then set `request.jwt.claim.sub` before each authenticated query.

- [ ] **Step 2: Run database test to verify RED**

Run: `npm run test:db`

Expected: Task 07 policy file or RPC is absent, so authorization assertions fail before implementation.

- [ ] **Step 3: Create an additive migration through the Supabase CLI**

Run: `npx supabase migration new task_07_role_authorization`

Implement in the generated file:

```sql
create type public.student_financial_status as enum (
  'em_dia', 'pendente', 'nao_configurado', 'indisponivel'
);

create function private.is_active_socio(tenant_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.team_members tm
    where tm.assessoria_id = tenant_id
      and tm.profile_id = (select auth.uid())
      and tm.role = 'socio' and tm.status = 'active'
  )
$$;
```

Every private `security definer` function fixes `search_path`, is schema-qualified, has EXECUTE revoked from `public`, `anon` and `authenticated`, and has no client grant. The public RPC validates professor/sócio membership and student ownership internally, calls only private helpers, returns the enum alone, and grants EXECUTE only to `authenticated`.

Create operation-specific policies for all Task 06 tables: sócio has tenant CRUD where the domain permits it; professor can read operational tables but never direct financial tables; aluno can read only own student/enrollment/class/attendance/subscription/charge/checkout/payment/contact data, with no client mutation of commercial/financial facts. Task-specific write policies remain absent until the responsible task.

- [ ] **Step 4: Run database test to verify GREEN**

Run: `npm run test:db`

Expected: legacy compatibility suite, Task 06 suite, existing RLS suite and Task 07 allow/deny assertions all pass on the local disposable stack.

- [ ] **Step 5: Regenerate and check TypeScript database contract**

Run: `node scripts/generate-mvp-foundation-types.mjs && node scripts/generate-mvp-foundation-types.mjs --check`

Expected: generated file contains `student_financial_status`; check command exits 0.

- [ ] **Step 6: Commit**

```powershell
git add supabase/migrations supabase/tests scripts/run-pgtap.ts src/types/mvp-database.generated.ts src/types/database.ts
git commit -m "feat: enforce FLERNK role policies in the database"
```

### Task 3: Servidor e endpoint de estado financeiro do professor

**Files:**
- Create: `src/lib/services/student-financial-status.service.ts`
- Create: `src/lib/services/student-financial-status.service.test.ts`
- Create: `src/app/api/v1/professor/students/[studentId]/financial-status/route.ts`
- Create: `src/app/api/v1/professor/students/[studentId]/financial-status/route.test.ts`

**Interfaces:**
- Produces `getStudentFinancialStatus(studentId: string): Promise<{ data: { status: StudentFinancialStatus } } | { error: "forbidden" | "unavailable" }>`.
- Produces `GET` response `{ data: { status } }`, `401` without session, `403` for aluno or cross-tenant target, and `503` only for internal unavailability.

- [ ] **Step 1: Write failing service and route tests**

```ts
it("returns only status for a professor", async () => {
  await expect(getStudentFinancialStatus("student-a")).resolves.toEqual({
    data: { status: "pendente" },
  });
});

it("does not serialize charge ids, amounts or dates", async () => {
  const response = await GET(request, { params: Promise.resolve({ studentId: "student-a" }) });
  expect(await response.json()).toEqual({ data: { status: "em_dia" } });
});
```

- [ ] **Step 2: Run focused tests to verify RED**

Run: `./node_modules/.bin/vitest.cmd run src/lib/services/student-financial-status.service.test.ts src/app/api/v1/professor/students/[studentId]/financial-status/route.test.ts --maxWorkers=1`

Expected: import/module failure because the service and route do not exist.

- [ ] **Step 3: Implement server-only authorization boundary**

The service calls `requireRole("socio", "professor")`, invokes `public.get_student_financial_status` with only `studentId`, validates the enum against a local readonly list and maps database failures to a generic unavailable result. The route awaits `params`, uses the service and never forwards error objects, SQL messages, IDs, values or dates.

- [ ] **Step 4: Run focused tests to verify GREEN**

Run: `./node_modules/.bin/vitest.cmd run src/lib/services/student-financial-status.service.test.ts src/app/api/v1/professor/students/[studentId]/financial-status/route.test.ts --maxWorkers=1`

Expected: status-only success and every 401/403/503 negative case pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/services/student-financial-status.service.ts src/lib/services/student-financial-status.service.test.ts src/app/api/v1/professor/students/[studentId]/financial-status
git commit -m "feat: expose professor financial status safely"
```

### Task 4: QA-C evidence and handoff

**Files:**
- Create: `docs/testing/mvp-task-07.md`
- Create: `docs/handoffs/MVP_TASK_07_HANDOFF.md`
- Modify: `docs/TASKS_MVP_FLERNK.md`

- [ ] **Step 1: Request independent security/code review**

Provide the reviewer with the Task 07 acceptance criteria, migration, RLS test, session/service/route diff, base SHA and head SHA. The reviewer must report PASSOU/FALHOU/BLOQUEADO and distinguish static review from executed evidence.

- [ ] **Step 2: Resolve every critical or important finding**

Add a reproduction test first for every confirmed finding; re-run focused checks after each correction.

- [ ] **Step 3: Run full verification**

```powershell
npm test -- --maxWorkers=1
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:db
```

Expected: all commands exit 0. `test:db` remains local/CI-only and does not use the remote project.

- [ ] **Step 4: Record actual evidence and limits**

Document commands, exit codes, test counts, CI URL, reviewer conclusions, preview response, and the explicit limitation that real FLERNK identity/role data was not migrated without Task 02 approval.

- [ ] **Step 5: Commit and push**

```powershell
git add docs/TASKS_MVP_FLERNK.md docs/testing/mvp-task-07.md docs/handoffs/MVP_TASK_07_HANDOFF.md
git commit -m "docs: close Task 07 authorization"
git push origin codex/mvp-flernk
```

## Plan self-review

- Cobertura: a matriz banco/servidor, professor sem detalhes financeiros, isolamento aluno A/B, anônimo sem acesso, sessão sem associação ativa, RLS e grants, endpoint com payload mínimo, testes negativos e gate QA-C estão mapeados.
- Dependências: a resolução de sessão alimenta o serviço; a RPC é criada antes do serviço; o pgTAP valida a migration antes da liberação do endpoint.
- Limites: criação/remoção de sócios, convite e bloqueio do bootstrap antigo pertencem à Task 08; políticas de mutação comercial, turma, falta e financeiro permanecem nas tasks responsáveis.
